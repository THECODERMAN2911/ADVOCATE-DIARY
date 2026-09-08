using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Tenant root. Maps to legacy Firm_Mstr.</summary>
public class Firm : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoPath { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Case> Cases { get; set; } = new List<Case>();
}
