using AdvocateDiary.Domain.Entities;

namespace AdvocateDiary.Application.Notifications;

public record NotificationLogDto(
    int Id, int? CaseId, string Channel, string Status, string Recipient, string? Subject, string? Error, DateTime CreatedAt);

public interface INotificationService
{
    /// <summary>Notify the party that a case's next hearing date changed, honouring the case opt-in flags.</summary>
    Task NotifyHearingChangedAsync(Case theCase, DateTime? newNextDate, CancellationToken ct = default);

    Task<IReadOnlyList<NotificationLogDto>> RecentAsync(int take = 100, CancellationToken ct = default);
}
