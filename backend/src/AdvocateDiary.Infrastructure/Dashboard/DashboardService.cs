using AdvocateDiary.Application.Dashboard;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Dashboard;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;
    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var weekEnd = today.AddDays(8);

        var active = _db.Cases.AsNoTracking().Where(c => c.IsActive);

        var todayHearings = await active.CountAsync(c => c.NextDate >= today && c.NextDate < tomorrow, ct);
        var upcoming = await active.CountAsync(c => c.NextDate >= tomorrow && c.NextDate < weekEnd, ct);
        var pending = await active.CountAsync(c => c.NextDate != null && c.NextDate < today, ct);
        var activeCount = await active.CountAsync(ct);

        var feeAgreed = await active.SumAsync(c => (decimal?)c.FeeAgreed, ct) ?? 0m;
        var received = await _db.CasePayments.AsNoTracking().SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        return new DashboardSummaryDto(
            todayHearings, upcoming, pending, activeCount,
            feeAgreed, received, feeAgreed - received);
    }
}
