namespace AdvocateDiary.Application.Documents;

public record DocumentDto(int Id, string FileName, string ContentType, long SizeBytes, DateTime CreatedAt);

public record DocumentUpload(string FileName, string ContentType, long Length, Stream Content);

public record DocumentDownload(string FileName, string ContentType, Stream Content);

public interface IDocumentService
{
    Task<IReadOnlyList<DocumentDto>> ListAsync(int caseId, CancellationToken ct = default);
    Task<DocumentDto> UploadAsync(int caseId, DocumentUpload upload, CancellationToken ct = default);
    Task<DocumentDownload?> DownloadAsync(int documentId, CancellationToken ct = default);
    Task DeleteAsync(int documentId, CancellationToken ct = default);
}
