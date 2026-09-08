using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

public enum NotificationChannel { Email = 1, Sms = 2, WhatsApp = 3 }

public enum NotificationStatus { Sent = 1, Failed = 2, Skipped = 3 }

/// <summary>Delivery record for outbound notifications (new — replaces the legacy fire-and-forget sends).</summary>
public class NotificationLog : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public int? CaseId { get; set; }
    public NotificationChannel Channel { get; set; }
    public NotificationStatus Status { get; set; }
    public string Recipient { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Error { get; set; }
}
