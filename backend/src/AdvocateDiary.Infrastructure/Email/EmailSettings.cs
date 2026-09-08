namespace AdvocateDiary.Infrastructure.Email;

public class EmailSettings
{
    public const string SectionName = "Email";
    public string? Host { get; set; }          // e.g. smtp.office365.com
    public int Port { get; set; } = 587;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public bool EnableSsl { get; set; } = true; // Office 365 :587 requires STARTTLS
    public string FromEmail { get; set; } = "info@advocate-diary.com";
    public string FromName { get; set; } = "Advocate Diary";
    public string? Bcc { get; set; } // optional archive/monitoring address (legacy fromEmailBCC)

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host);
}
