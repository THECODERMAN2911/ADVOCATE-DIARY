using AdvocateDiary.Application.Billing;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AdvocateDiary.Infrastructure.Billing;

public class BillingService : IBillingService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;
    private readonly IPaymentGateway _gateway;
    private readonly string _frontendUrl;

    public BillingService(AppDbContext db, ICurrentUser current, IPaymentGateway gateway, IConfiguration config)
    {
        _db = db;
        _current = current;
        _gateway = gateway;
        _frontendUrl = config["App:FrontendUrl"] ?? "http://localhost:4200";
    }

    public async Task<IReadOnlyList<PlanDto>> ListPlansAsync(CancellationToken ct = default)
        => await _db.Plans.AsNoTracking().Where(p => p.IsActive).OrderBy(p => p.Price)
            .Select(p => new PlanDto(p.Id, p.Name, p.Description, p.Price, p.DurationDays))
            .ToListAsync(ct);

    public async Task<SubscriptionDto> GetSubscriptionAsync(CancellationToken ct = default)
    {
        var lic = await _db.Licenses.AsNoTracking().Include(l => l.Plan)
            .Where(l => l.IsActive)
            .OrderByDescending(l => l.EndDate)
            .FirstOrDefaultAsync(ct);

        if (lic is null) return new SubscriptionDto(false, null, null, null, false, null);

        var active = lic.EndDate >= DateTime.UtcNow.Date;
        var daysLeft = (int)Math.Max(0, (lic.EndDate - DateTime.UtcNow.Date).TotalDays);
        return new SubscriptionDto(true, lic.Plan?.Name, lic.StartDate, lic.EndDate, active, daysLeft);
    }

    public async Task<CheckoutResponse> CheckoutAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        var firmId = _current.FirmId ?? throw new UnauthorizedAccessException();
        var plan = await _db.Plans.FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive, ct)
            ?? throw new KeyNotFoundException("Plan not found.");

        var session = await _gateway.CreateCheckoutAsync(
            plan.Price, $"Advocate Diary — {plan.Name}", $"{_frontendUrl}/subscription", ct);

        var payment = new Payment
        {
            FirmId = firmId,
            PlanId = plan.Id,
            Amount = plan.Price,
            Status = PaymentStatus.Pending,
            Gateway = _gateway.Name,
            GatewayReference = session.Reference,
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        return new CheckoutResponse(payment.Id, _gateway.Name, session.RedirectUrl);
    }

    public async Task<SubscriptionDto> ConfirmAsync(ConfirmRequest request, CancellationToken ct = default)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == request.PaymentId, ct)
            ?? throw new KeyNotFoundException("Payment not found.");
        if (payment.Status == PaymentStatus.Paid) return await GetSubscriptionAsync(ct);

        var plan = await _db.Plans.FirstOrDefaultAsync(p => p.Id == payment.PlanId, ct)
            ?? throw new KeyNotFoundException("Plan not found.");

        payment.Status = PaymentStatus.Paid;

        // Extend from the later of today or the current licence end.
        var existing = await _db.Licenses.Where(l => l.IsActive).OrderByDescending(l => l.EndDate).FirstOrDefaultAsync(ct);
        var start = existing is not null && existing.EndDate > DateTime.UtcNow.Date ? existing.EndDate : DateTime.UtcNow.Date;
        if (existing is not null) existing.IsActive = false;

        _db.Licenses.Add(new License
        {
            FirmId = payment.FirmId,
            PlanId = plan.Id,
            StartDate = DateTime.UtcNow.Date,
            EndDate = start.AddDays(plan.DurationDays),
            IsActive = true,
        });
        await _db.SaveChangesAsync(ct);
        return await GetSubscriptionAsync(ct);
    }
}
