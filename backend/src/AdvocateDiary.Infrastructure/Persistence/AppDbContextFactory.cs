using AdvocateDiary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AdvocateDiary.Infrastructure.Persistence;

/// <summary>
/// Design-time factory so `dotnet ef migrations` can build the model from the Infrastructure project
/// alone (no need to run the API). The connection string here is only used for design-time scaffolding
/// of migrations; the real one comes from configuration at runtime.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=lpc:localhost;Database=adiary_dev;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True",
                sql => sql.CommandTimeout(300))
            .Options;
        return new AppDbContext(options, new DesignTimeCurrentUser());
    }

    private sealed class DesignTimeCurrentUser : ICurrentUser
    {
        public int? UserId => null;
        public int? FirmId => null;
        public string? Role => null;
        public bool IsAuthenticated => false;
    }
}
