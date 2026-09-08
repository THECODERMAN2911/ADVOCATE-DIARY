using System.Net;
using System.Net.Mail;
using AdvocateDiary.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace AdvocateDiary.Infrastructure.Email;

/// <summary>
/// Office 365 SMTP sender. Unlike the legacy app, EnableSsl is honoured (required for :587 STARTTLS)
/// and failures propagate so the caller/NotificationService can log them.
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _s;
    public SmtpEmailSender(IOptions<EmailSettings> settings) => _s = settings.Value;

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(_s.FromEmail, _s.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(toEmail);
        if (!string.IsNullOrWhiteSpace(_s.Bcc)) message.Bcc.Add(_s.Bcc);

        using var client = new SmtpClient(_s.Host, _s.Port)
        {
            EnableSsl = _s.EnableSsl,
            Credentials = new NetworkCredential(_s.Username, _s.Password),
        };
        await client.SendMailAsync(message, ct);
    }
}
