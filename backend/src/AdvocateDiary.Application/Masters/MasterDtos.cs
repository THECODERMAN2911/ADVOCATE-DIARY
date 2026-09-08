using AdvocateDiary.Domain.Entities;

namespace AdvocateDiary.Application.Masters;

public record MasterItemDto(int Id, string Name, bool IsActive);

public record MasterSaveRequest(string Name, bool IsActive);

public record LookupDto(int Id, string Name);

/// <summary>Generic CRUD over a simple firm-owned "name + active" master (Court/CaseType/CaseStage).</summary>
public interface IMasterService<T> where T : NamedMasterEntity, new()
{
    Task<IReadOnlyList<MasterItemDto>> ListAsync(bool includeInactive, CancellationToken ct = default);
    Task<MasterItemDto> CreateAsync(MasterSaveRequest request, CancellationToken ct = default);
    Task<MasterItemDto> UpdateAsync(int id, MasterSaveRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface ILookupService
{
    Task<IReadOnlyList<LookupDto>> StatesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<LookupDto>> CitiesAsync(int? stateId, CancellationToken ct = default);
    Task<IReadOnlyList<LookupDto>> SalutationsAsync(CancellationToken ct = default);
}
