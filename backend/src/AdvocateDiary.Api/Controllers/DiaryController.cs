using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Diary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Diary & calendar (Phase 4): cause lists, previous cases, hearings in a date range.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DiaryController : ControllerBase
{
    private readonly IDiaryService _diary;
    public DiaryController(IDiaryService diary) => _diary = diary;

    /// <summary>Cause list for a date (defaults to today).</summary>
    [HttpGet("cause-list")]
    public async Task<ActionResult<IReadOnlyList<CaseListItemDto>>> CauseList([FromQuery] DateTime? date, CancellationToken ct)
        => Ok(await _diary.CauseListAsync(date ?? DateTime.UtcNow.Date, ct));

    /// <summary>Overdue hearings (paginated — this list has no natural upper bound over time).</summary>
    [HttpGet("previous")]
    public async Task<ActionResult<PagedResult<CaseListItemDto>>> Previous(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? query = null, CancellationToken ct = default)
        => Ok(await _diary.PreviousAsync(page, pageSize, query, ct));

    /// <summary>Hearings between from and to (inclusive) — for the calendar.</summary>
    [HttpGet("calendar")]
    public async Task<ActionResult<IReadOnlyList<CaseListItemDto>>> Calendar(
        [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct)
        => Ok(await _diary.RangeAsync(from, to, ct));
}
