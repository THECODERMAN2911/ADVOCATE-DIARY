using AdvocateDiary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace AdvocateDiary.Infrastructure.Email;

/// <summary>
/// Placeholder email sender: logs the message instead of sending. Phase 4 replaces this with an
/// Office 365 SMTP implementation (the legacy app used smtp.office365.com:587 + STARTTLS).
/// </summary>
public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;
    public LoggingEmailSender(ILogger<LoggingEmailSender> logger) => _logger = logger;

    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        _logger.LogInformation("EMAIL (not sent — dev stub)\n  To: {To}\n  Subject: {Subject}\n  Body: {Body}",
            toEmail, subject, htmlBody);
        return Task.CompletedTask;
    }
}
