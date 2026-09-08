using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Masters;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Masters;

public class MasterService<T> : IMasterService<T> where T : NamedMasterEntity, new()
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public MasterService(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<IReadOnlyList<MasterItemDto>> ListAsync(bool includeInactive, CancellationToken ct = default)
    {
        var q = _db.Set<T>().AsNoTracking().AsQueryable();
        if (!includeInactive) q = q.Where(x => x.IsActive);
        return await q.OrderBy(x => x.Name)
            .Select(x => new MasterItemDto(x.Id, x.Name, x.IsActive))
            .ToListAsync(ct);
    }

    public async Task<MasterItemDto> CreateAsync(MasterSaveRequest request, CancellationToken ct = default)
    {
        var entity = new T
        {
            FirmId = _current.FirmId ?? throw new UnauthorizedAccessException(),
            Name = request.Name.Trim(),
            IsActive = request.IsActive
        };
        _db.Set<T>().Add(entity);
        await _db.SaveChangesAsync(ct);
        return new MasterItemDto(entity.Id, entity.Name, entity.IsActive);
    }

    public async Task<MasterItemDto> UpdateAsync(int id, MasterSaveRequest request, CancellationToken ct = default)
    {
        var entity = await _db.Set<T>().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        entity.Name = request.Name.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new MasterItemDto(entity.Id, entity.Name, entity.IsActive);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Set<T>().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        // Soft delete to preserve references from existing cases.
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
