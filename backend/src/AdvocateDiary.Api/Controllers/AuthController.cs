using AdvocateDiary.Api.Contracts;
using AdvocateDiary.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>
    /// OAuth2 token endpoint. Backs the Swagger UI "Authorize" dialog so credentials can be
    /// exchanged for a bearer token in place, without pasting a JWT by hand.
    /// </summary>
    /// <remarks>
    /// Supports <c>grant_type=password</c> (username = the user's email address) and
    /// <c>grant_type=refresh_token</c>. Accepts form-urlencoded input per RFC 6749.
    /// </remarks>
    [AllowAnonymous]
    [HttpPost("token")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(TokenErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Token([FromForm] TokenRequest request, CancellationToken ct)
    {
        try
        {
            AuthResponse result;
            switch (request.GrantType)
            {
                case "password":
                    if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                        return BadRequest(new TokenErrorResponse("invalid_request", "username and password are required."));
                    result = await _auth.LoginAsync(new LoginRequest(request.Username, request.Password), ct);
                    break;

                case "refresh_token":
                    if (string.IsNullOrWhiteSpace(request.RefreshToken))
                        return BadRequest(new TokenErrorResponse("invalid_request", "refresh_token is required."));
                    result = await _auth.RefreshAsync(new RefreshRequest(request.RefreshToken), ct);
                    break;

                default:
                    return BadRequest(new TokenErrorResponse(
                        "unsupported_grant_type", $"grant_type '{request.GrantType}' is not supported."));
            }

            var expiresIn = (int)Math.Max(0, (result.AccessTokenExpiresAt - DateTime.UtcNow).TotalSeconds);
            return Ok(new TokenResponse(result.AccessToken, "Bearer", expiresIn, result.RefreshToken));
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new TokenErrorResponse("invalid_grant", ex.Message));
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        try { return Ok(await _auth.LoginAsync(request, ct)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        try { return Ok(await _auth.RegisterAsync(request, ct)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request, CancellationToken ct)
    {
        try { return Ok(await _auth.RefreshAsync(request, ct)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken ct)
    {
        await _auth.LogoutAsync(request.RefreshToken, ct);
        return NoContent();
    }
}
