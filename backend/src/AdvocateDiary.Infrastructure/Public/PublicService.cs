using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Public;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;

namespace AdvocateDiary.Infrastructure.Public;

public class PublicService : IPublicService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _email;
    private readonly string _contactInbox;

    public PublicService(AppDbContext db, IEmailSender email, IConfiguration config)
    {
        _db = db;
        _email = email;
        _contactInbox = config["Email:FromEmail"] ?? "info@advocate-diary.com";
    }

    public async Task SubmitContactAsync(ContactRequest r, CancellationToken ct = default)
    {
        _db.ContactMessages.Add(new ContactMessage
        {
            Name = r.Name, Email = r.Email, Phone = r.Phone, Subject = r.Subject, Message = r.Message,
        });
        await _db.SaveChangesAsync(ct);

        // Best-effort admin notification.
        try
        {
            await _email.SendAsync(_contactInbox, $"Contact form: {r.Subject ?? "New message"}",
                $"<p>From: {r.Name} ({r.Email}, {r.Phone})</p><p>{r.Message}</p>", ct);
        }
        catch { /* logged by the sender; never fail the submission */ }
    }

    public async Task SubmitReferralAsync(ReferralRequest r, CancellationToken ct = default)
    {
        _db.Referrals.Add(new Referral { FromName = r.FromName, FromEmail = r.FromEmail, ToEmail = r.ToEmail });
        await _db.SaveChangesAsync(ct);

        try
        {
            await _email.SendAsync(r.ToEmail, "You've been invited to Advocate Diary",
                $"<p>{r.FromName ?? "A colleague"} thinks you'd find Advocate Diary useful. " +
                "Sign up at advocate-diary.com.</p>", ct);
        }
        catch { /* best-effort */ }
    }
}
