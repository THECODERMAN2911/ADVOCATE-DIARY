using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Notifications;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Notifications;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _email;

    public NotificationService(AppDbContext db, IEmailSender email)
    {
        _db = db;
        _email = email;
    }

    public async Task NotifyHearingChangedAsync(Case c, DateTime? newNextDate, CancellationToken ct = default)
    {
        var when = newNextDate?.ToString("dd MMM yyyy") ?? "—";
        var subject = $"Next hearing date updated — {c.CaseNumber}";
        var body = $"<p>Dear {c.PartyName},</p><p>The next hearing date for your case " +
                   $"<b>{c.CaseNumber}</b> ({c.Title}) is now <b>{when}</b>.</p>";

        if (c.EmailOptIn && !string.IsNullOrWhiteSpace(c.PartyEmail))
            await SendEmailAsync(c, subject, body, ct);

        if (c.SmsOptIn && !string.IsNullOrWhiteSpace(c.PartyPhone))
            Log(c, NotificationChannel.Sms, NotificationStatus.Skipped, c.PartyPhone!, subject,
                "SMS gateway not configured yet (Phase 4 backlog).");

        await _db.SaveChangesAsync(ct);
    }

    private async Task SendEmailAsync(Case c, string subject, string body, CancellationToken ct)
    {
        try
        {
            await _email.SendAsync(c.PartyEmail!, subject, body, ct);
            Log(c, NotificationChannel.Email, NotificationStatus.Sent, c.PartyEmail!, subject, null);
        }
        catch (Exception ex)
        {
            Log(c, NotificationChannel.Email, NotificationStatus.Failed, c.PartyEmail!, subject, ex.Message);
        }
    }

    private void Log(Case c, NotificationChannel channel, NotificationStatus status, string recipient, string subject, string? error)
        => _db.NotificationLogs.Add(new NotificationLog
        {
            FirmId = c.FirmId,
            CaseId = c.Id,
            Channel = channel,
            Status = status,
            Recipient = recipient,
            Subject = subject,
            Error = error,
        });

    public async Task<IReadOnlyList<NotificationLogDto>> RecentAsync(int take = 100, CancellationToken ct = default)
        => await _db.NotificationLogs.AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .Select(n => new NotificationLogDto(
                n.Id, n.CaseId, n.Channel.ToString(), n.Status.ToString(), n.Recipient, n.Subject, n.Error, n.CreatedAt))
            .ToListAsync(ct);
}
