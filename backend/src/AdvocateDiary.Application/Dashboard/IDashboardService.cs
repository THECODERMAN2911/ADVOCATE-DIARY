namespace AdvocateDiary.Application.Dashboard;

public record DashboardSummaryDto(
    int TodayHearings,
    int Upcoming7Days,
    int PendingDiary,
    int ActiveCases,
    decimal FeeAgreedTotal,
    decimal FeeReceivedTotal,
    decimal FeeBalanceTotal);

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default);
}
