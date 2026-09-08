using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Diary;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Diary;

public class DiaryService : IDiaryService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public DiaryService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<CaseListItemDto>> CauseListAsync(DateTime date, CancellationToken ct = default)
    {
        var day = date.Date;
        var next = day.AddDays(1);
        return await Project(_db.Cases.AsNoTracking()
            .Where(c => c.IsActive && c.NextDate >= day && c.NextDate < next)).ToListAsync(ct);
    }

    public async Task<PagedResult<CaseListItemDto>> PreviousAsync(int page, int pageSize, string? query = null, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        var today = DateTime.UtcNow.Date;

        // Overdue hearings only grow over the life of a firm, so this MUST be
        // paged at the database level — never materialize the whole list.
        var q = _db.Cases.AsNoTracking();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);

        q = q.Where(c => c.IsActive && c.NextDate != null && c.NextDate < today);

        query = string.IsNullOrWhiteSpace(query) ? null : query.Trim();
        if (query is not null)
            q = q.Where(c => c.CaseNumber.Contains(query)
                || c.Title.Contains(query)
                || (c.PartyName != null && c.PartyName.Contains(query)));

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderBy(c => c.NextDate)
            .ThenBy(c => c.CaseNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaseListItemDto(c.Id, c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.IsStarred, c.IsActive))
            .ToListAsync(ct);

        return new PagedResult<CaseListItemDto>(items, page, pageSize, total);
    }

    public async Task<IReadOnlyList<CaseListItemDto>> RangeAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var start = from.Date;
        var end = to.Date.AddDays(1);
        return await Project(_db.Cases.AsNoTracking()
            .Where(c => c.IsActive && c.NextDate >= start && c.NextDate < end)
            .OrderBy(c => c.NextDate)).ToListAsync(ct);
    }

    private static IQueryable<CaseListItemDto> Project(IQueryable<Domain.Entities.Case> q)
        => q.OrderBy(c => c.NextDate)
            .Select(c => new CaseListItemDto(c.Id, c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.IsStarred, c.IsActive));
}
