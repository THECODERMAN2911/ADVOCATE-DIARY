using AdvocateDiary.Application.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Subscription plans (Phase 6). Public — used by the pricing page.</summary>
[ApiController]
[Route("api/v1/[controller]")]
public class PlansController : ControllerBase
{
    private readonly IBillingService _billing;
    public PlansController(IBillingService billing) => _billing = billing;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PlanDto>>> List(CancellationToken ct)
        => Ok(await _billing.ListPlansAsync(ct));
}

/// <summary>Firm subscription + checkout (Phase 6).</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly IBillingService _billing;
    public SubscriptionController(IBillingService billing) => _billing = billing;

    [HttpGet]
    public async Task<ActionResult<SubscriptionDto>> Current(CancellationToken ct)
        => Ok(await _billing.GetSubscriptionAsync(ct));

    [HttpPost("checkout")]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<ActionResult<CheckoutResponse>> Checkout(CheckoutRequest request, CancellationToken ct)
    {
        try { return Ok(await _billing.CheckoutAsync(request, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    /// <summary>Called by the payment return/webhook to mark paid and activate the licence.</summary>
    [HttpPost("confirm")]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<ActionResult<SubscriptionDto>> Confirm(ConfirmRequest request, CancellationToken ct)
    {
        try { return Ok(await _billing.ConfirmAsync(request, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
