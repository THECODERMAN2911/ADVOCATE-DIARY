using AdvocateDiary.Application.Auth;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Domain.Enums;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace AdvocateDiary.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly JwtSettings _settings;
    private readonly IEmailSender _email;
    private readonly string _frontendUrl;

    public AuthService(AppDbContext db, IJwtTokenService jwt, IOptions<JwtSettings> settings,
        IEmailSender email, IConfiguration config)
    {
        _db = db;
        _jwt = jwt;
        _settings = settings.Value;
        _email = email;
        _frontendUrl = config["App:FrontendUrl"] ?? "http://localhost:4200";
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        // No firm context yet, so bypass the tenant query filter.
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!VerifyPassword(user, request.Password))
            throw new UnauthorizedAccessException("Invalid credentials.");

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var exists = await _db.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == request.Email, ct);
        if (exists) throw new InvalidOperationException("An account with this email already exists.");

        var firm = new Firm { Name = request.FirmName, Email = request.Email, Phone = request.Phone };
        var user = new User
        {
            Firm = firm,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            Role = UserRole.FirmAdmin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };
        _db.Firms.Add(firm);
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var hash = _jwt.Hash(request.RefreshToken);
        var token = await _db.RefreshTokens.IgnoreQueryFilters()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

        if (token is null || !token.IsActive || token.User is null)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        token.RevokedAt = DateTime.UtcNow;            // rotate
        var response = await IssueAsync(token.User, ct);
        return response;
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = _jwt.Hash(refreshToken);
        var token = await _db.RefreshTokens.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (token is { RevokedAt: null })
        {
            token.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct);
        if (user is null) return; // do not reveal whether the account exists

        var raw = _jwt.CreateRefreshToken();
        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = _jwt.Hash(raw),
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        });
        await _db.SaveChangesAsync(ct);

        var link = $"{_frontendUrl}/reset-password?token={Uri.EscapeDataString(raw)}";
        await _email.SendAsync(user.Email, "Reset your Advocate Diary password",
            $"<p>Click the link below to reset your password (valid for 2 hours):</p><p><a href=\"{link}\">{link}</a></p>", ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var hash = _jwt.Hash(request.Token);
        var token = await _db.PasswordResetTokens.IgnoreQueryFilters()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

        if (token is null || !token.IsActive || token.User is null)
            throw new InvalidOperationException("Invalid or expired reset token.");

        token.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        token.UsedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> IssueAsync(User user, CancellationToken ct)
    {
        var (access, expiresAt) = _jwt.CreateAccessToken(user);
        var refresh = _jwt.CreateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwt.Hash(refresh),
            ExpiresAt = DateTime.UtcNow.AddDays(_settings.RefreshTokenDays)
        });
        await _db.SaveChangesAsync(ct);

        var summary = new UserSummary(user.Id, user.FirmId, user.FullName, user.Email, user.Role.ToString());
        return new AuthResponse(access, refresh, expiresAt, summary);
    }

    /// <summary>Verifies against a BCrypt hash; transparently upgrades legacy plaintext passwords.</summary>
    private bool VerifyPassword(User user, string password)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Legacy Lawyer_Mstr stored plaintext. If it matches, rehash on the fly.
            if (user.PasswordHash == password)
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                _db.SaveChanges();
                return true;
            }
            return false;
        }
    }
}
