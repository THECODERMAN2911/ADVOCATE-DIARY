using AdvocateDiary.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AdvocateDiary.Infrastructure.Storage;

/// <summary>Stores bytes under a configured root folder. Swap for a blob/S3 implementation later.</summary>
public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(IConfiguration config)
    {
        _root = config["Storage:RootPath"] ?? Path.Combine(AppContext.BaseDirectory, "storage");
        Directory.CreateDirectory(_root);
    }

    public async Task<string> SaveAsync(Stream content, string keyPrefix, string extension, CancellationToken ct = default)
    {
        var key = $"{keyPrefix}/{Guid.NewGuid():N}{extension}".Replace('\\', '/');
        var full = ResolveInsideRoot(key);
        Directory.CreateDirectory(Path.GetDirectoryName(full)!);
        await using var fs = new FileStream(full, FileMode.CreateNew, FileAccess.Write);
        await content.CopyToAsync(fs, ct);
        return key;
    }

    public Task<Stream> OpenAsync(string storageKey, CancellationToken ct = default)
    {
        var full = ResolveInsideRoot(storageKey);
        Stream stream = new FileStream(full, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        var full = ResolveInsideRoot(storageKey);
        if (File.Exists(full)) File.Delete(full);
        return Task.CompletedTask;
    }

    /// <summary>Resolves a key to an absolute path and guards against path traversal outside the root.</summary>
    private string ResolveInsideRoot(string key)
    {
        var full = Path.GetFullPath(Path.Combine(_root, key));
        var rootFull = Path.GetFullPath(_root);
        if (!full.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Invalid storage key.");
        return full;
    }
}
