namespace AdvocateDiary.Domain.Common;

/// <summary>Base for all persisted entities.</summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Marks an entity as owned by a Firm (tenant). A global query filter scopes it to the caller's firm.</summary>
public interface ITenantEntity
{
    int FirmId { get; set; }
}
