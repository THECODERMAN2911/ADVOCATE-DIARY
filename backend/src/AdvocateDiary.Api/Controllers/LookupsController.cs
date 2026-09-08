using AdvocateDiary.Application.Masters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Global reference lookups (states, cities, salutations). Read-only, any authenticated user.</summary>
[ApiController]
[Route("api/v1/lookups")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _lookups;
    public LookupsController(ILookupService lookups) => _lookups = lookups;

    [HttpGet("states")]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> States(CancellationToken ct)
        => Ok(await _lookups.StatesAsync(ct));

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> Cities([FromQuery] int? stateId, CancellationToken ct)
        => Ok(await _lookups.CitiesAsync(stateId, ct));

    [HttpGet("salutations")]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> Salutations(CancellationToken ct)
        => Ok(await _lookups.SalutationsAsync(ct));
}
