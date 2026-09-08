using AdvocateDiary.Application.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Current user's own profile (Phase 1). Any authenticated user.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly IUserService _users;
    public MeController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<ActionResult<UserDto>> Get(CancellationToken ct) => Ok(await _users.GetMeAsync(ct));

    [HttpPut]
    public async Task<ActionResult<UserDto>> Update(UpdateProfileRequest request, CancellationToken ct)
        => Ok(await _users.UpdateProfileAsync(request, ct));

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        try { await _users.ChangePasswordAsync(request, ct); return NoContent(); }
        catch (UnauthorizedAccessException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
