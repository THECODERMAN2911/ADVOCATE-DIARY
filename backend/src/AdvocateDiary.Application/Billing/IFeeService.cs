namespace AdvocateDiary.Application.Billing;

public record CasePaymentDto(int Id, decimal Amount, DateTime PaidOn, string? Mode, string? Notes);

public record AddPaymentRequest(decimal Amount, DateTime PaidOn, string? Mode, string? Notes);

public record FeeSummaryDto(decimal FeeAgreed, decimal TotalReceived, decimal Balance);

/// <summary>Per-case fee-received ledger.</summary>
public interface IFeeService
{
    Task<IReadOnlyList<CasePaymentDto>> ListAsync(int caseId, CancellationToken ct = default);
    Task<FeeSummaryDto> SummaryAsync(int caseId, CancellationToken ct = default);
    Task<CasePaymentDto> AddAsync(int caseId, AddPaymentRequest request, CancellationToken ct = default);
    Task DeleteAsync(int caseId, int paymentId, CancellationToken ct = default);
}
