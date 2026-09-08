using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>
/// Case document metadata (new). Replaces the legacy raw filesystem listing under
/// case_files/{lawyerId}/{caseId}/ with a proper record + a storage-key indirection so the
/// physical bytes can live on disk now and in blob/object storage later.
/// </summary>
public class Document : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public int CaseId { get; set; }
    public Case? Case { get; set; }

    public string FileName { get; set; } = string.Empty;   // original name shown to users
    public string StorageKey { get; set; } = string.Empty; // opaque key in the storage backend
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int? UploadedByUserId { get; set; }
}
