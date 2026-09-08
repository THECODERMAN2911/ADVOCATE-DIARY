using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Case management (Phase 3). Tenant-scoped to the caller's firm.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ICaseService _cases;
    public CasesController(ICaseService cases) => _cases = cases;

    [HttpGet]
    public async Task<ActionResult<PagedResult<CaseListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? query = null,
        [FromQuery] CaseFilter filter = CaseFilter.Active,
        CancellationToken ct = default)
        => Ok(await _cases.ListAsync(page, pageSize, query, filter, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CaseDetailDto>> Get(int id, CancellationToken ct)
    {
        var c = await _cases.GetAsync(id, ct);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpPost]
    public async Task<ActionResult<CaseDetailDto>> Create(CaseSaveRequest request, CancellationToken ct)
        => Ok(await _cases.CreateAsync(request, ct));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CaseDetailDto>> Update(int id, CaseSaveRequest request, CancellationToken ct)
    {
        try { return Ok(await _cases.UpdateAsync(id, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPut("{id:int}/star")]
    public async Task<IActionResult> Star(int id, [FromQuery] bool value = true, CancellationToken ct = default)
    {
        try { await _cases.SetStarredAsync(id, value, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPut("{id:int}/archive")]
    public async Task<IActionResult> Archive(int id, [FromQuery] bool value = true, CancellationToken ct = default)
    {
        try { await _cases.SetArchivedAsync(id, value, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("{id:int}/notes")]
    public async Task<ActionResult<IReadOnlyList<CaseHistoryDto>>> History(int id, CancellationToken ct)
        => Ok(await _cases.HistoryAsync(id, ct));

    [HttpPost("{id:int}/notes")]
    public async Task<ActionResult<CaseHistoryDto>> AddNote(int id, AddNoteRequest request, CancellationToken ct)
    {
        try { return Ok(await _cases.AddNoteAsync(id, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
