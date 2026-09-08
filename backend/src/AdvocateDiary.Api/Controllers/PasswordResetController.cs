using AdvocateDiary.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Forgot / reset password (Phase 1). Lives under /auth alongside AuthController.</summary>
[ApiController]
[Route("api/v1/auth")]
public class PasswordResetController : ControllerBase
{
    private readonly IAuthService _auth;
    public PasswordResetController(IAuthService auth) => _auth = auth;

    [AllowAnonymous]
    [HttpPost("forgot")]
    public async Task<IActionResult> Forgot(ForgotPasswordRequest request, CancellationToken ct)
    {
        await _auth.ForgotPasswordAsync(request, ct);
        return Accepted(new { message = "If the email exists, a reset link has been sent." });
    }

    [AllowAnonymous]
    [HttpPost("reset")]
    public async Task<IActionResult> Reset(ResetPasswordRequest request, CancellationToken ct)
    {
        try { await _auth.ResetPasswordAsync(request, ct); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
