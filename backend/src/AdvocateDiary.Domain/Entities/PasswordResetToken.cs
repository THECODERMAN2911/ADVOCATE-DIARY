namespace AdvocateDiary.Domain.Entities;

/// <summary>One-time password-reset token (new — not in the legacy app).</summary>
public class PasswordResetToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int UserId { get; set; }
    public User? User { get; set; }

    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UsedAt { get; set; }

    public bool IsActive => UsedAt is null && DateTime.UtcNow < ExpiresAt;
}
