namespace AdvocateDiary.Domain.Entities;

/// <summary>Rotating, revocable refresh token (new — not in the legacy app).</summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int UserId { get; set; }
    public User? User { get; set; }

    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public Guid? ReplacedByTokenId { get; set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
}
