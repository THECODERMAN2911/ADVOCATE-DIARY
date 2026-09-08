namespace AdvocateDiary.Application.Public;

public record ContactRequest(string Name, string Email, string? Phone, string? Subject, string Message);

public record ReferralRequest(string? FromName, string? FromEmail, string ToEmail);

public interface IPublicService
{
    Task SubmitContactAsync(ContactRequest request, CancellationToken ct = default);
    Task SubmitReferralAsync(ReferralRequest request, CancellationToken ct = default);
}
