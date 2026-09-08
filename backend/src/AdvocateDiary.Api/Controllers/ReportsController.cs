using AdvocateDiary.Application.Reports;
using AdvocateDiary.Application.Common.Models;
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
        CancellationToken ct = default)
        => Ok(await _reports.CasesAsync(includeArchived, page, pageSize, ct));

    [HttpGet("cases/export")]
    public async Task<IActionResult> ExportCases([FromQuery] bool includeArchived = false, CancellationToken ct = default)
    {
        var bytes = await _reports.CasesExcelAsync(includeArchived, ct);
        return File(bytes, XlsxContentType, $"cases-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}
