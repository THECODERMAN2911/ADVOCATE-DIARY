using AdvocateDiary.Application.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Public marketing endpoints (Phase 8): contact form + referrals. Anonymous.</summary>
[ApiController]
[Route("api/v1")]
[AllowAnonymous]
public class PublicController : ControllerBase
{
    private readonly IPublicService _public;
    public PublicController(IPublicService pub) => _public = pub;

    [HttpPost("contact")]
    public async Task<IActionResult> Contact(ContactRequest request, CancellationToken ct)
    {
        await _public.SubmitContactAsync(request, ct);
        return Accepted(new { message = "Thanks — we'll get back to you shortly." });
    }

    [HttpPost("referrals")]
    public async Task<IActionResult> Refer(ReferralRequest request, CancellationToken ct)
    {
        await _public.SubmitReferralAsync(request, ct);
        return Accepted(new { message = "Invitation sent." });
    }
}
