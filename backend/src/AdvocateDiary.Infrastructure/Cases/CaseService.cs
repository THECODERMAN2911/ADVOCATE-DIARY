using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Notifications;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Data.Common;
using System.Diagnostics;

namespace AdvocateDiary.Infrastructure.Cases;

public class CaseService : ICaseService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;
    private readonly INotificationService _notifications;
    private readonly ILogger<CaseService> _logger;

    public CaseService(
        AppDbContext db,
        ICurrentUser current,
        INotificationService notifications,
        ILogger<CaseService> logger)
    {
        _db = db;
        _current = current;
        _notifications = notifications;
        _logger = logger;
    }

    public async Task<PagedResult<CaseListItemDto>> ListAsync(
        int page,
        int pageSize,
        string? query,
        CaseFilter filter,
        CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        // This hot path intentionally uses a parameterized command rather than
        // EF's translated query. With the legacy data set, EF's paged-list query
        // can spend ~25 seconds in the provider before SQL is contacted; the
        // equivalent SQL command executes in a few milliseconds.
        var firmId = _current.FirmId ?? throw new UnauthorizedAccessException();
        var where = filter switch
        {
            CaseFilter.Archived => "[IsActive] = 0",
            CaseFilter.Starred => "[IsActive] = 1 AND [IsStarred] = 1",
            _ => "[IsActive] = 1"
        };

        query = string.IsNullOrWhiteSpace(query) ? null : query.Trim();
        if (query is not null)
            where += " AND ([CaseNumber] LIKE @search OR [Title] LIKE @search OR [PartyName] LIKE @search)";

        var orderBy = filter == CaseFilter.Archived
            ? "[UpdatedAt] DESC, [CaseNumber]"
            : "[NextDate] DESC, [CaseNumber]";

        var sw = Stopwatch.StartNew();
        _logger.LogWarning("[PERF] ListAsync START page={Page} filter={Filter}", page, filter);

        await using var connection = new SqlConnection(_db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        _logger.LogWarning("[PERF] connection.OpenAsync done at {Ms} ms", sw.ElapsedMilliseconds);

            await using var countCommand = connection.CreateCommand();
            countCommand.CommandText = $"SELECT COUNT_BIG(*) FROM [Cases] WHERE [FirmId] = @firmId AND {where}";
            AddParameter(countCommand, "@firmId", firmId);
            if (query is not null) AddParameter(countCommand, "@search", $"%{query}%");
            var total = Convert.ToInt32(await countCommand.ExecuteScalarAsync(ct));
            _logger.LogWarning("[PERF] count query done at {Ms} ms (total={Total})", sw.ElapsedMilliseconds, total);

            await using var pageCommand = connection.CreateCommand();
            pageCommand.CommandText = $"""
                SELECT [Id], [CaseNumber], [Title], [PartyName], [NextDate], [IsStarred], [IsActive]
                FROM [Cases]
                WHERE [FirmId] = @firmId AND {where}
                ORDER BY {orderBy}
                OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
                OPTION (RECOMPILE);
                """;
            AddParameter(pageCommand, "@firmId", firmId);
            AddParameter(pageCommand, "@offset", (page - 1) * pageSize);
            AddParameter(pageCommand, "@pageSize", pageSize);
            if (query is not null) AddParameter(pageCommand, "@search", $"%{query}%");

            var items = new List<CaseListItemDto>(pageSize);
            await using var reader = await pageCommand.ExecuteReaderAsync(ct);
            _logger.LogWarning("[PERF] page ExecuteReaderAsync done at {Ms} ms", sw.ElapsedMilliseconds);
            while (await reader.ReadAsync(ct))
            {
                items.Add(new CaseListItemDto(
                    reader.GetInt32(0), reader.GetString(1), reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    reader.GetBoolean(5), reader.GetBoolean(6)));
            }
            _logger.LogWarning("[PERF] row reading done at {Ms} ms ({Count} rows)", sw.ElapsedMilliseconds, items.Count);

        _logger.LogWarning("[PERF] ListAsync TOTAL {Ms} ms", sw.ElapsedMilliseconds);
        return new PagedResult<CaseListItemDto>(items, page, pageSize, total);
    }

    public async Task<CaseDetailDto?> GetAsync(
        int id,
        CancellationToken ct = default)
    {
        var c = await _db.Cases
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return c is null ? null : Map(c);
    }

    public async Task<CaseDetailDto> CreateAsync(
        CaseSaveRequest r,
        CancellationToken ct = default)
    {
        var entity = new Case
        {
            FirmId = _current.FirmId
                ?? throw new UnauthorizedAccessException(),

            AppearingLawyerId =
                r.AppearingLawyerId ?? _current.UserId,
        };

        Apply(entity, r);

        _db.Cases.Add(entity);

        await _db.SaveChangesAsync(ct);

        return Map(entity);
    }

    public async Task<CaseDetailDto> UpdateAsync(
        int id,
        CaseSaveRequest r,
        CancellationToken ct = default)
    {
        var entity = await _db.Cases
            .FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();

        var oldNextDate = entity.NextDate;

        Apply(entity, r);

        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        // Notify the party (best-effort) if the hearing date actually changed.
        if (entity.NextDate != oldNextDate)
        {
            await _notifications.NotifyHearingChangedAsync(
                entity,
                entity.NextDate,
                ct);
        }

        return Map(entity);
    }

    public async Task SetStarredAsync(
        int id,
        bool starred,
        CancellationToken ct = default)
        => await SetFlag(
            id,
            c => c.IsStarred = starred,
            ct);

    public async Task SetArchivedAsync(
        int id,
        bool archived,
        CancellationToken ct = default)
        => await SetFlag(
            id,
            c => c.IsActive = !archived,
            ct);

    public async Task<IReadOnlyList<CaseHistoryDto>> HistoryAsync(
        int caseId,
        CancellationToken ct = default)
        => await _db.CaseHistories
            .AsNoTracking()
            .Where(h =>
                h.CaseId == caseId &&
                h.IsActive)
            .OrderByDescending(h => h.HearingDate)
            .Select(h => new CaseHistoryDto(
                h.Id,
                h.HearingDate,
                h.Notes))
            .ToListAsync(ct);

    public async Task<CaseHistoryDto> AddNoteAsync(
        int caseId,
        AddNoteRequest r,
        CancellationToken ct = default)
    {
        // Ensure the case belongs to the caller's firm.
        // The tenant query filter applies here.
        _ = await _db.Cases
            .FirstOrDefaultAsync(
                c => c.Id == caseId,
                ct)
            ?? throw new KeyNotFoundException();

        var note = new CaseHistory
        {
            CaseId = caseId,
            HearingDate = r.HearingDate,
            Notes = r.Notes
        };

        _db.CaseHistories.Add(note);

        await _db.SaveChangesAsync(ct);

        return new CaseHistoryDto(
            note.Id,
            note.HearingDate,
            note.Notes);
    }

    private async Task SetFlag(
        int id,
        Action<Case> mutate,
        CancellationToken ct)
    {
        var entity = await _db.Cases
            .FirstOrDefaultAsync(
                x => x.Id == id,
                ct)
            ?? throw new KeyNotFoundException();

        mutate(entity);

        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    private static void Apply(
        Case c,
        CaseSaveRequest r)
    {
        c.CaseNumber = r.CaseNumber;
        c.Title = r.Title;
        c.Defendant = r.Defendant;

        c.CourtId = r.CourtId;
        c.CaseTypeId = r.CaseTypeId;
        c.CaseStageId = r.CaseStageId;

        if (r.AppearingLawyerId is not null)
        {
            c.AppearingLawyerId =
                r.AppearingLawyerId;
        }

        c.FilingDate = r.FilingDate;
        c.PreviousDate = r.PreviousDate;
        c.NextDate = r.NextDate;

        c.PartyName = r.PartyName;
        c.PartyAddress = r.PartyAddress;
        c.PartyZip = r.PartyZip;
        c.PartyPhone = r.PartyPhone;
        c.PartyPhone2 = r.PartyPhone2;
        c.PartyEmail = r.PartyEmail;

        c.OppositeLawyer = r.OppositeLawyer;

        c.FeeAgreed = r.FeeAgreed;
        c.FeeBalance = r.FeeBalance;

        c.Tags = r.Tags;
        c.Remarks = r.Remarks;

        c.SmsOptIn = r.SmsOptIn;
        c.EmailOptIn = r.EmailOptIn;
    }

    private static CaseDetailDto Map(Case c)
        => new(
            c.Id,
            c.CaseNumber,
            c.Title,
            c.Defendant,
            c.CourtId,
            c.CaseTypeId,
            c.CaseStageId,
            c.AppearingLawyerId,
            c.FilingDate,
            c.PreviousDate,
            c.NextDate,
            c.PartyName,
            c.PartyAddress,
            c.PartyZip,
            c.PartyPhone,
            c.PartyPhone2,
            c.PartyEmail,
            c.OppositeLawyer,
            c.FeeAgreed,
            c.FeeBalance,
            c.Tags,
            c.Remarks,
            c.SmsOptIn,
            c.EmailOptIn,
            c.IsStarred,
            c.IsActive);

    private static void AddParameter(DbCommand command, string name, object value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        command.Parameters.Add(parameter);
    }
}