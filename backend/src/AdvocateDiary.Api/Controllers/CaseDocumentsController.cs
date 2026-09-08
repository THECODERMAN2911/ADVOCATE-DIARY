using AdvocateDiary.Application.Documents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Case documents (Phase 5): upload / list / download / delete via IFileStorage.</summary>
[ApiController]
[Route("api/v1/cases/{caseId:int}/documents")]
[Authorize]
public class CaseDocumentsController : ControllerBase
{
    private readonly IDocumentService _docs;
    public CaseDocumentsController(IDocumentService docs) => _docs = docs;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DocumentDto>>> List(int caseId, CancellationToken ct)
        => Ok(await _docs.ListAsync(caseId, ct));

    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<DocumentDto>> Upload(int caseId, IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });
        try
        {
            await using var stream = file.OpenReadStream();
            var dto = await _docs.UploadAsync(caseId,
                new DocumentUpload(file.FileName, file.ContentType, file.Length, stream), ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{docId:int}/download")]
    public async Task<IActionResult> Download(int docId, CancellationToken ct)
    {
        var file = await _docs.DownloadAsync(docId, ct);
        return file is null ? NotFound() : File(file.Content, file.ContentType, file.FileName);
    }

    [HttpDelete("{docId:int}")]
    public async Task<IActionResult> Delete(int docId, CancellationToken ct)
    {
        try { await _docs.DeleteAsync(docId, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
