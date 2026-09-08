using AdvocateDiary.Application.Reports;
using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Infrastructure.Persistence;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Reports;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ReportService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<CaseReportRow>> CasesAsync(
        bool includeArchived, int page, int pageSize, string? query = null, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var q = _db.Cases.AsNoTracking().AsQueryable();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);
        if (!includeArchived) q = q.Where(c => c.IsActive);
        var searchText = string.IsNullOrWhiteSpace(query) ? null : query.Trim();
        if (searchText is not null)
            q = q.Where(c => c.CaseNumber.Contains(searchText)
                || c.Title.Contains(searchText)
                || (c.PartyName != null && c.PartyName.Contains(searchText)));
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(c => c.CaseNumber).ThenBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaseReportRow(c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsActive))
            .ToListAsync(ct);
        return new PagedResult<CaseReportRow>(items, page, pageSize, total);
    }

    public async Task<byte[]> CasesExcelAsync(bool includeArchived, CaseFilter? filter = null, string? query = null, CancellationToken ct = default)
    {
        // Export intentionally retrieves all matching rows. The interactive report never does.
        var q = _db.Cases.AsNoTracking().AsQueryable();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);
        q = filter switch
        {
            CaseFilter.Archived => q.Where(c => !c.IsActive),
            CaseFilter.Starred => q.Where(c => c.IsActive && c.IsStarred),
            CaseFilter.Active => q.Where(c => c.IsActive),
            _ when !includeArchived => q.Where(c => c.IsActive),
            _ => q
        };
        var searchText = string.IsNullOrWhiteSpace(query) ? null : query.Trim();
        if (searchText is not null)
            q = q.Where(c => c.CaseNumber.Contains(searchText)
                || c.Title.Contains(searchText)
                || (c.PartyName != null && c.PartyName.Contains(searchText)));
        var rows = await q.OrderBy(c => c.CaseNumber).ThenBy(c => c.Id)
            .Select(c => new CaseReportRow(c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsActive))
            .ToListAsync(ct);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Cases");

        string[] headers = { "Case No", "Title", "Party", "Next Date", "Fee Agreed", "Fee Balance", "Status" };
        for (var i = 0; i < headers.Length; i++) ws.Cell(1, i + 1).Value = headers[i];
        ws.Row(1).Style.Font.Bold = true;

        var r = 2;
        foreach (var row in rows)
        {
            ws.Cell(r, 1).Value = row.CaseNumber;
            ws.Cell(r, 2).Value = row.Title;
            ws.Cell(r, 3).Value = row.Party;
            if (row.NextDate is not null) ws.Cell(r, 4).Value = row.NextDate.Value.Date;
            ws.Cell(r, 4).Style.DateFormat.Format = "dd-MMM-yyyy";
            ws.Cell(r, 5).Value = row.FeeAgreed;
            ws.Cell(r, 6).Value = row.FeeBalance;
            ws.Cell(r, 7).Value = row.IsActive ? "Active" : "Archived";
            r++;
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> PreviousHearingsExcelAsync(string? query = null, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var q = _db.Cases.AsNoTracking().AsQueryable();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);

        q = q.Where(c => c.IsActive && c.NextDate != null && c.NextDate < today);
        var searchText = string.IsNullOrWhiteSpace(query) ? null : query.Trim();
        if (searchText is not null)
            q = q.Where(c => c.CaseNumber.Contains(searchText)
                || c.Title.Contains(searchText)
                || (c.PartyName != null && c.PartyName.Contains(searchText)));

        var rows = await q.OrderBy(c => c.NextDate).ThenBy(c => c.CaseNumber)
            .Select(c => new CaseReportRow(c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsActive))
            .ToListAsync(ct);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Previous Hearings");
        string[] headers = { "Case No", "Title", "Party", "Previous Hearing Date", "Fee Agreed", "Fee Balance", "Status" };
        for (var i = 0; i < headers.Length; i++) ws.Cell(1, i + 1).Value = headers[i];
        ws.Row(1).Style.Font.Bold = true;

        var rowNumber = 2;
        foreach (var row in rows)
        {
            ws.Cell(rowNumber, 1).Value = row.CaseNumber;
            ws.Cell(rowNumber, 2).Value = row.Title;
            ws.Cell(rowNumber, 3).Value = row.Party;
            ws.Cell(rowNumber, 4).Value = row.NextDate!.Value.Date;
            ws.Cell(rowNumber, 4).Style.DateFormat.Format = "dd-MMM-yyyy";
            ws.Cell(rowNumber, 5).Value = row.FeeAgreed;
            ws.Cell(rowNumber, 6).Value = row.FeeBalance;
            ws.Cell(rowNumber, 7).Value = "Active";
            rowNumber++;
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}
