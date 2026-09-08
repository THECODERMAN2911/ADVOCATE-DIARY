using AdvocateDiary.Application.Common.Models;

namespace AdvocateDiary.Application.Cases;

public interface ICaseService
{
    Task<PagedResult<CaseListItemDto>> ListAsync(
        int page, int pageSize, string? query, CaseFilter filter, CancellationToken ct = default);

    Task<CaseDetailDto?> GetAsync(int id, CancellationToken ct = default);
    Task<CaseDetailDto> CreateAsync(CaseSaveRequest request, CancellationToken ct = default);
    Task<CaseDetailDto> UpdateAsync(int id, CaseSaveRequest request, CancellationToken ct = default);

    Task SetStarredAsync(int id, bool starred, CancellationToken ct = default);
    Task SetArchivedAsync(int id, bool archived, CancellationToken ct = default);

    Task<IReadOnlyList<CaseHistoryDto>> HistoryAsync(int caseId, CancellationToken ct = default);
    Task<CaseHistoryDto> AddNoteAsync(int caseId, AddNoteRequest request, CancellationToken ct = default);
}
