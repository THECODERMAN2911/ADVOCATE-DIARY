using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Models;

namespace AdvocateDiary.Application.Diary;

public interface IDiaryService
{
    /// <summary>Cause list: active cases whose next hearing falls on the given date.</summary>
    Task<IReadOnlyList<CaseListItemDto>> CauseListAsync(DateTime date, CancellationToken ct = default);

    /// <summary>Cases whose next hearing is before today (pending diary update). Paginated — this list has no upper bound over time.</summary>
    Task<PagedResult<CaseListItemDto>> PreviousAsync(int page, int pageSize, string? query = null, CancellationToken ct = default);

    /// <summary>Active cases with a next hearing in [from, to] — for the calendar view.</summary>
    Task<IReadOnlyList<CaseListItemDto>> RangeAsync(DateTime from, DateTime to, CancellationToken ct = default);
}
