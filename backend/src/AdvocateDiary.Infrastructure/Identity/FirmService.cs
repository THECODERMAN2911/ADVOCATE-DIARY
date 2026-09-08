using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Identity;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Identity;

public class FirmService : IFirmService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public FirmService(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<FirmDto> GetAsync(CancellationToken ct = default)
        => Map(await Current(ct));

    public async Task<FirmDto> UpdateAsync(UpdateFirmRequest request, CancellationToken ct = default)
    {
        var firm = await Current(ct);
        firm.Name = request.Name;
        firm.Address = request.Address;
        firm.City = request.City;
        firm.Phone = request.Phone;
        firm.Email = request.Email;
        firm.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Map(firm);
    }

    private async Task<Firm> Current(CancellationToken ct)
    {
        var firmId = _current.FirmId ?? throw new UnauthorizedAccessException();
        return await _db.Firms.FirstOrDefaultAsync(f => f.Id == firmId, ct)
            ?? throw new KeyNotFoundException("Firm not found.");
    }

    private static FirmDto Map(Firm f) => new(f.Id, f.Name, f.Address, f.City, f.Phone, f.Email, f.LogoPath);
}
