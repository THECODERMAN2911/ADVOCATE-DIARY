using AdvocateDiary.Application.Masters;
using AdvocateDiary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>
/// Generic CRUD base for firm-owned masters. Read for any authenticated user; mutations for FirmAdmin.
/// Concrete closed subclasses below are what ASP.NET Core discovers as controllers.
/// </summary>
[ApiController]
[Authorize]
public abstract class MasterControllerBase<T> : ControllerBase where T : NamedMasterEntity, new()
{
    private readonly IMasterService<T> _svc;
    protected MasterControllerBase(IMasterService<T> svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MasterItemDto>>> List(
        [FromQuery] bool includeInactive = false, CancellationToken ct = default)
        => Ok(await _svc.ListAsync(includeInactive, ct));

    [HttpPost]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<ActionResult<MasterItemDto>> Create(MasterSaveRequest request, CancellationToken ct)
        => Ok(await _svc.CreateAsync(request, ct));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<ActionResult<MasterItemDto>> Update(int id, MasterSaveRequest request, CancellationToken ct)
    {
        try { return Ok(await _svc.UpdateAsync(id, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try { await _svc.DeleteAsync(id, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}

[Route("api/v1/courts")]
public class CourtsController : MasterControllerBase<Court>
{
    public CourtsController(IMasterService<Court> svc) : base(svc) { }
}

[Route("api/v1/case-types")]
public class CaseTypesController : MasterControllerBase<CaseType>
{
    public CaseTypesController(IMasterService<CaseType> svc) : base(svc) { }
}

[Route("api/v1/case-stages")]
public class CaseStagesController : MasterControllerBase<CaseStage>
{
    public CaseStagesController(IMasterService<CaseStage> svc) : base(svc) { }
}
