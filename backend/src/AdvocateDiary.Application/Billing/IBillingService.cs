namespace AdvocateDiary.Application.Billing;

public record PlanDto(int Id, string Name, string? Description, decimal Price, int DurationDays);

public record SubscriptionDto(
    bool HasSubscription, string? PlanName, DateTime? StartDate, DateTime? EndDate, bool IsActive, int? DaysRemaining);

public record CheckoutRequest(int PlanId);
public record CheckoutResponse(int PaymentId, string Gateway, string RedirectUrl);
public record ConfirmRequest(int PaymentId);

public interface IBillingService
{
    Task<IReadOnlyList<PlanDto>> ListPlansAsync(CancellationToken ct = default);
    Task<SubscriptionDto> GetSubscriptionAsync(CancellationToken ct = default);

    /// <summary>Creates a pending payment and returns a gateway redirect URL.</summary>
    Task<CheckoutResponse> CheckoutAsync(CheckoutRequest request, CancellationToken ct = default);

    /// <summary>Marks the payment paid and activates/extends the firm's licence (called by the return/webhook).</summary>
    Task<SubscriptionDto> ConfirmAsync(ConfirmRequest request, CancellationToken ct = default);
}
