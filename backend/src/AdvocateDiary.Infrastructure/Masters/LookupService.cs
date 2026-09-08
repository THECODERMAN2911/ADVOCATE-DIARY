using AdvocateDiary.Application.Masters;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Masters;

public class LookupService : ILookupService
{
    private readonly AppDbContext _db;
    public LookupService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<LookupDto>> StatesAsync(CancellationToken ct = default)
        => await _db.States.AsNoTracking().OrderBy(s => s.Name)
            .Select(s => new LookupDto(s.Id, s.Name)).ToListAsync(ct);

    public async Task<IReadOnlyList<LookupDto>> CitiesAsync(int? stateId, CancellationToken ct = default)
    {
        var q = _db.Cities.AsNoTracking().AsQueryable();
        if (stateId is not null) q = q.Where(c => c.StateId == stateId);
        return await q.OrderBy(c => c.Name).Select(c => new LookupDto(c.Id, c.Name)).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<LookupDto>> SalutationsAsync(CancellationToken ct = default)
        => await _db.Salutations.AsNoTracking().OrderBy(s => s.Name)
            .Select(s => new LookupDto(s.Id, s.Name)).ToListAsync(ct);
}
