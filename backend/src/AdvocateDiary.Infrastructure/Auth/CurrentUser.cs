using System.Security.Claims;
using AdvocateDiary.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace AdvocateDiary.Infrastructure.Auth;

public class CurrentUser : ICurrentUser
{
    private readonly ClaimsPrincipal? _user;
    public CurrentUser(IHttpContextAccessor accessor) => _user = accessor.HttpContext?.User;

    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;
    public int? UserId =>
        TryInt(_user?.FindFirstValue(ClaimTypes.NameIdentifier))
        ?? TryInt(_user?.FindFirstValue("sub"));
    public int? FirmId => TryInt(_user?.FindFirstValue("firmId"));
    public string? Role => _user?.FindFirstValue(ClaimTypes.Role);

    private static int? TryInt(string? v) => int.TryParse(v, out var i) ? i : null;
}
