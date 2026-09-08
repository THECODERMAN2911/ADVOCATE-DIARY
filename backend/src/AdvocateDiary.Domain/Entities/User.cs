using AdvocateDiary.Domain.Common;
using AdvocateDiary.Domain.Enums;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Login identity (a lawyer/staff user). Maps to legacy Lawyer_Mstr.</summary>
public class User : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public Firm? Firm { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }

    /// <summary>BCrypt hash. The legacy app stored plaintext passwords — migrate to hashes on first login.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Lawyer;
    public bool IsActive { get; set; } = true;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
