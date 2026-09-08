using AdvocateDiary.Domain.Entities;

namespace AdvocateDiary.Application.Common.Interfaces;

public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(User user);
    string CreateRefreshToken();
    string Hash(string token);
}

/// <summary>Resolves the authenticated caller (firm/user/role) from the current request.</summary>
public interface ICurrentUser
{
    int? UserId { get; }
    int? FirmId { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
