using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>
/// Core case aggregate. Field set aligned to the real legacy Case_Mstr (reverse-engineered).
/// In the legacy DB tenancy is via LawyerID_FK → Lawyer.FirmID_FK; the modern schema carries an
/// explicit FirmId (set from the appearing lawyer's firm) for a simpler tenant query filter.
/// </summary>
public class Case : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public Firm? Firm { get; set; }

    public string CaseNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Defendant { get; set; }

    public int? CourtId { get; set; }
    public int? CaseTypeId { get; set; }
    public int? CaseStageId { get; set; }

    /// <summary>Appearing lawyer (legacy LawyerID_FK). Also determines the owning firm.</summary>
    public int? AppearingLawyerId { get; set; }
    public User? AppearingLawyer { get; set; }

    public DateTime? FilingDate { get; set; }
    public DateTime? PreviousDate { get; set; }
    public DateTime? NextDate { get; set; }

    // Party details
    public string? PartyName { get; set; }
    public string? PartyAddress { get; set; }
    public int? PartyZip { get; set; }
    public string? PartyPhone { get; set; }
    public string? PartyPhone2 { get; set; }
    public string? PartyEmail { get; set; }
    public string? OppositeLawyer { get; set; }

    public decimal FeeAgreed { get; set; }
    public decimal FeeBalance { get; set; }
    public string? Tags { get; set; }
    public string? Remarks { get; set; }

    // Notify the party on changes (legacy SMS / Email flags)
    public bool SmsOptIn { get; set; }
    public bool EmailOptIn { get; set; }

    public bool IsStarred { get; set; }
    /// <summary>Archived cases are inactive (legacy has no separate IsArchived — it uses IsActive).</summary>
    public bool IsActive { get; set; } = true;

    public ICollection<CaseHistory> History { get; set; } = new List<CaseHistory>();
}

/// <summary>Hearing / note history. Maps to legacy CaseHistory_Dtls.</summary>
public class CaseHistory : BaseEntity
{
    public int CaseId { get; set; }
    public Case? Case { get; set; }
    public DateTime HearingDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
}
