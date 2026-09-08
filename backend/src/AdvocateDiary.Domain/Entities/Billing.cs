using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Subscription plan (global). Maps legacy Plan_Mstr.</summary>
public class Plan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationDays { get; set; } = 365;
    public bool IsActive { get; set; } = true;
}

/// <summary>A firm's active subscription. Maps legacy License_Mstr.</summary>
public class License : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public int PlanId { get; set; }
    public Plan? Plan { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public enum PaymentStatus { Pending = 1, Paid = 2, Failed = 3 }

/// <summary>A subscription payment attempt (new — supports the checkout flow).</summary>
public class Payment : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public int PlanId { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? Gateway { get; set; }
    public string? GatewayReference { get; set; }
}

/// <summary>Per-case fee-received ledger entry. Maps legacy CasePayment_Dtls.</summary>
public class CasePayment : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public int CaseId { get; set; }
    public Case? Case { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidOn { get; set; }
    public string? Mode { get; set; }
    public string? Notes { get; set; }
}
