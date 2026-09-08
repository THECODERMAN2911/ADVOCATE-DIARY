namespace AdvocateDiary.Application.Common.Interfaces;

public record CheckoutSession(string Reference, string RedirectUrl);

/// <summary>Payment gateway abstraction. A stub now; swap for PayU / Stripe implementations later.</summary>
public interface IPaymentGateway
{
    string Name { get; }
    Task<CheckoutSession> CreateCheckoutAsync(decimal amount, string description, string returnUrl, CancellationToken ct = default);
}
