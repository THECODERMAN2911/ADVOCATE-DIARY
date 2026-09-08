using AdvocateDiary.Application.Reports;
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
        bool includeArchived, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var q = _db.Cases.AsNoTracking().AsQueryable();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);
        if (!includeArchived) q = q.Where(c => c.IsActive);
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(c => c.CaseNumber).ThenBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaseReportRow(c.CaseNumber, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsActive))
            .ToListAsync(ct);
        return new PagedResult<CaseReportRow>(items, page, pageSize, total);
    }

    public async Task<byte[]> CasesExcelAsync(bool includeArchived, CancellationToken ct = default)
    {
        // Export intentionally retrieves all matching rows. The interactive report never does.
        var q = _db.Cases.AsNoTracking().AsQueryable();
        if (_currentUser.FirmId is int firmId)
            q = q.IgnoreQueryFilters().Where(c => c.FirmId == firmId);
        if (!includeArchived) q = q.Where(c => c.IsActive);
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
}
