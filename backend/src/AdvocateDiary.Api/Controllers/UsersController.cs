using AdvocateDiary.Application.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Firm user management (Phase 1). FirmAdmin only; scoped to the caller's firm.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "FirmAdmin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    public UsersController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> List(CancellationToken ct)
        => Ok(await _users.ListAsync(ct));

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request, CancellationToken ct)
    {
        try { return Ok(await _users.CreateAsync(request, ct)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserDto>> Update(int id, UpdateUserRequest request, CancellationToken ct)
    {
        try { return Ok(await _users.UpdateAsync(id, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
