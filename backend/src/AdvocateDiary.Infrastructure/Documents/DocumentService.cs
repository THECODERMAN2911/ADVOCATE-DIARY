using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Documents;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Documents;

public class DocumentService : IDocumentService
{
    private const long MaxBytes = 10 * 1024 * 1024; // 10 MB
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { ".pdf", ".jpg", ".jpeg", ".png" };

    private readonly AppDbContext _db;
    private readonly IFileStorage _storage;
    private readonly ICurrentUser _current;

    public DocumentService(AppDbContext db, IFileStorage storage, ICurrentUser current)
    {
        _db = db;
        _storage = storage;
        _current = current;
    }

    public async Task<IReadOnlyList<DocumentDto>> ListAsync(int caseId, CancellationToken ct = default)
        => await _db.Documents.AsNoTracking()
            .Where(d => d.CaseId == caseId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DocumentDto(d.Id, d.FileName, d.ContentType, d.SizeBytes, d.CreatedAt))
            .ToListAsync(ct);

    public async Task<DocumentDto> UploadAsync(int caseId, DocumentUpload upload, CancellationToken ct = default)
    {
        var theCase = await _db.Cases.FirstOrDefaultAsync(c => c.Id == caseId, ct)
            ?? throw new KeyNotFoundException();

        var ext = Path.GetExtension(upload.FileName);
        if (!Allowed.Contains(ext))
            throw new InvalidOperationException("Only PDF, JPG, JPEG and PNG files are allowed.");
        if (upload.Length <= 0 || upload.Length > MaxBytes)
            throw new InvalidOperationException("File must be between 1 byte and 10 MB.");

        var key = await _storage.SaveAsync(upload.Content, $"cases/{caseId}", ext, ct);

        var doc = new Document
        {
            FirmId = theCase.FirmId,
            CaseId = caseId,
            FileName = Path.GetFileName(upload.FileName),
            StorageKey = key,
            ContentType = string.IsNullOrWhiteSpace(upload.ContentType) ? "application/octet-stream" : upload.ContentType,
            SizeBytes = upload.Length,
            UploadedByUserId = _current.UserId,
        };
        _db.Documents.Add(doc);
        await _db.SaveChangesAsync(ct);
        return new DocumentDto(doc.Id, doc.FileName, doc.ContentType, doc.SizeBytes, doc.CreatedAt);
    }

    public async Task<DocumentDownload?> DownloadAsync(int documentId, CancellationToken ct = default)
    {
        var doc = await _db.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == documentId, ct);
        if (doc is null) return null;
        var stream = await _storage.OpenAsync(doc.StorageKey, ct);
        return new DocumentDownload(doc.FileName, doc.ContentType, stream);
    }

    public async Task DeleteAsync(int documentId, CancellationToken ct = default)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.Id == documentId, ct)
            ?? throw new KeyNotFoundException();
        await _storage.DeleteAsync(doc.StorageKey, ct);
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync(ct);
    }
}
