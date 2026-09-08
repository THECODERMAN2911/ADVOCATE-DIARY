using AdvocateDiary.Application.Reports;
using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Cases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Reports & exports (Phase 7).</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private readonly IReportService _reports;
    public ReportsController(IReportService reports) => _reports = reports;

    [HttpGet("cases")]
    public async Task<ActionResult<PagedResult<CaseReportRow>>> Cases(
        [FromQuery] bool includeArchived = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? query = null,
        CancellationToken ct = default)
        => Ok(await _reports.CasesAsync(includeArchived, page, pageSize, query, ct));

    [HttpGet("cases/export")]
    public async Task<IActionResult> ExportCases(
        [FromQuery] bool includeArchived = false,
        [FromQuery] CaseFilter? filter = null,
        [FromQuery] string? query = null,
        CancellationToken ct = default)
    {
        var bytes = await _reports.CasesExcelAsync(includeArchived, filter, query, ct);
        return File(bytes, XlsxContentType, $"cases-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("previous/export")]
    public async Task<IActionResult> ExportPrevious(
        [FromQuery] string? query = null, CancellationToken ct = default)
    {
        var bytes = await _reports.PreviousHearingsExcelAsync(query, ct);
        return File(bytes, XlsxContentType, $"previous-hearings-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}
