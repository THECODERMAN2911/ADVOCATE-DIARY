namespace AdvocateDiary.Application.Common.Interfaces;

/// <summary>Physical byte storage, abstracted so the backend can be local disk now and blob/S3 later.</summary>
public interface IFileStorage
{
    /// <summary>Persists the content and returns an opaque storage key.</summary>
    Task<string> SaveAsync(Stream content, string keyPrefix, string extension, CancellationToken ct = default);

    Task<Stream> OpenAsync(string storageKey, CancellationToken ct = default);

    Task DeleteAsync(string storageKey, CancellationToken ct = default);
}
