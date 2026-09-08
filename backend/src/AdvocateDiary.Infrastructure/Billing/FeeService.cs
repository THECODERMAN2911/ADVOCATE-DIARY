using AdvocateDiary.Application.Billing;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Billing;

public class FeeService : IFeeService
{
    private readonly AppDbContext _db;
    public FeeService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<CasePaymentDto>> ListAsync(int caseId, CancellationToken ct = default)
        => await _db.CasePayments.AsNoTracking()
            .Where(p => p.CaseId == caseId)
            .OrderByDescending(p => p.PaidOn)
            .Select(p => new CasePaymentDto(p.Id, p.Amount, p.PaidOn, p.Mode, p.Notes))
            .ToListAsync(ct);

    public async Task<FeeSummaryDto> SummaryAsync(int caseId, CancellationToken ct = default)
    {
        var theCase = await _db.Cases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == caseId, ct)
            ?? throw new KeyNotFoundException();
        var received = await _db.CasePayments.Where(p => p.CaseId == caseId).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        return new FeeSummaryDto(theCase.FeeAgreed, received, theCase.FeeAgreed - received);
    }

    public async Task<CasePaymentDto> AddAsync(int caseId, AddPaymentRequest request, CancellationToken ct = default)
    {
        var theCase = await _db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct)
            ?? throw new KeyNotFoundException();

        var payment = new CasePayment
        {
            FirmId = theCase.FirmId,
            CaseId = caseId,
            Amount = request.Amount,
            PaidOn = request.PaidOn,
            Mode = request.Mode,
            Notes = request.Notes,
        };
        _db.CasePayments.Add(payment);
        await _db.SaveChangesAsync(ct);

        await RecomputeBalance(theCase, ct);
        return new CasePaymentDto(payment.Id, payment.Amount, payment.PaidOn, payment.Mode, payment.Notes);
    }

    public async Task DeleteAsync(int caseId, int paymentId, CancellationToken ct = default)
    {
        var payment = await _db.CasePayments.FirstOrDefaultAsync(p => p.Id == paymentId && p.CaseId == caseId, ct)
            ?? throw new KeyNotFoundException();
        _db.CasePayments.Remove(payment);
        await _db.SaveChangesAsync(ct);

        var theCase = await _db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct);
        if (theCase is not null) await RecomputeBalance(theCase, ct);
    }

    private async Task RecomputeBalance(Case theCase, CancellationToken ct)
    {
        var received = await _db.CasePayments.Where(p => p.CaseId == theCase.Id).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        theCase.FeeBalance = theCase.FeeAgreed - received;
        theCase.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
