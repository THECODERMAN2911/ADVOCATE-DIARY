namespace AdvocateDiary.Application.Common.Interfaces;

/// <summary>Abstraction over transactional email. Phase 4 wires this to Office 365 SMTP.</summary>
public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}
