using AdvocateDiary.Application.Common.Interfaces;

namespace AdvocateDiary.Infrastructure.Billing;

/// <summary>
/// Placeholder gateway: issues a reference and echoes a return URL so the checkout flow works
/// end-to-end. Replace with PayU / Stripe implementations of IPaymentGateway (the legacy app used
/// PayUMoney) — BillingService and the API do not change.
/// </summary>
public class StubPaymentGateway : IPaymentGateway
{
    public string Name => "Stub";

    public Task<CheckoutSession> CreateCheckoutAsync(decimal amount, string description, string returnUrl, CancellationToken ct = default)
        => Task.FromResult(new CheckoutSession(Guid.NewGuid().ToString("N"), returnUrl));
}
