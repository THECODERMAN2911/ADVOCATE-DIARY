using AdvocateDiary.Application.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>The caller's firm profile (Phase 1). Read for any user; update for FirmAdmin.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FirmController : ControllerBase
{
    private readonly IFirmService _firm;
    public FirmController(IFirmService firm) => _firm = firm;

    [HttpGet]
    public async Task<ActionResult<FirmDto>> Get(CancellationToken ct) => Ok(await _firm.GetAsync(ct));

    [HttpPut]
    [Authorize(Roles = "FirmAdmin")]
    public async Task<ActionResult<FirmDto>> Update(UpdateFirmRequest request, CancellationToken ct)
        => Ok(await _firm.UpdateAsync(request, ct));
}
