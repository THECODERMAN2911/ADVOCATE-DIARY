using AdvocateDiary.Application.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Per-case fee-received ledger (Phase 6).</summary>
[ApiController]
[Route("api/v1/cases/{caseId:int}/fees")]
[Authorize]
public class CaseFeesController : ControllerBase
{
    private readonly IFeeService _fees;
    public CaseFeesController(IFeeService fees) => _fees = fees;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CasePaymentDto>>> List(int caseId, CancellationToken ct)
        => Ok(await _fees.ListAsync(caseId, ct));

    [HttpGet("summary")]
    public async Task<ActionResult<FeeSummaryDto>> Summary(int caseId, CancellationToken ct)
    {
        try { return Ok(await _fees.SummaryAsync(caseId, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<ActionResult<CasePaymentDto>> Add(int caseId, AddPaymentRequest request, CancellationToken ct)
    {
        try { return Ok(await _fees.AddAsync(caseId, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{paymentId:int}")]
    public async Task<IActionResult> Delete(int caseId, int paymentId, CancellationToken ct)
    {
        try { await _fees.DeleteAsync(caseId, paymentId, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
