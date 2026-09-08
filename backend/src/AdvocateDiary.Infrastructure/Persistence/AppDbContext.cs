using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<Firm> Firms => Set<Firm>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<CaseHistory> CaseHistories => Set<CaseHistory>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    // Masters (firm-owned)
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<CaseType> CaseTypes => Set<CaseType>();
    public DbSet<CaseStage> CaseStages => Set<CaseStage>();

    // Lookups (global reference data)
    public DbSet<State> States => Set<State>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Salutation> Salutations => Set<Salutation>();

    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();
    public DbSet<Document> Documents => Set<Document>();

    // Billing
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<License> Licenses => Set<License>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CasePayment> CasePayments => Set<CasePayment>();

    // Public (anonymous submissions — not tenant-scoped)
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Referral> Referrals => Set<Referral>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // NOTE: these must stay in sync with the "AddCoveringCasePagingIndexes" migration.
        // The paged Cases list (CaseService.ListAsync) reads via raw SQL specifically so it
        // can be served entirely from these covering indexes (INCLUDE columns) without a
        // key lookup per row. Declaring the model without the matching .IncludeProperties(...)
        // is what let a previous `dotnet ef migrations add` silently regenerate these indexes
        // WITHOUT the INCLUDE columns, which is why re-indexing didn't fix the slow load.
        b.Entity<Case>().HasIndex(c => new { c.FirmId, c.IsActive, c.NextDate, c.CaseNumber })
            .IncludeProperties(c => new { c.Id, c.Title, c.PartyName, c.IsStarred });
        b.Entity<Case>().HasIndex(c => new { c.FirmId, c.IsActive, c.CaseNumber })
            .IncludeProperties(c => new { c.Id, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsStarred });
        b.Entity<Case>().HasIndex(c => new { c.FirmId, c.CaseNumber })
            .IncludeProperties(c => new { c.Id, c.Title, c.PartyName, c.NextDate, c.FeeAgreed, c.FeeBalance, c.IsActive });
        b.Entity<Case>().Property(c => c.CaseNumber).HasMaxLength(450);
        b.Entity<Case>().HasIndex(c => new { c.FirmId, c.IsActive, c.IsStarred, c.NextDate, c.CaseNumber })
            .IncludeProperties(c => new { c.Id, c.Title, c.PartyName });
        b.Entity<Case>().HasIndex(c => new { c.FirmId, c.IsActive, c.UpdatedAt, c.CaseNumber })
            .IncludeProperties(c => new { c.Id, c.Title, c.PartyName, c.NextDate, c.IsStarred });
        b.Entity<CasePayment>().HasIndex(p => new { p.FirmId, p.Amount });
        b.Entity<CasePayment>().HasIndex(p => new { p.CaseId, p.PaidOn });
        b.Entity<Document>().HasIndex(d => new { d.CaseId, d.CreatedAt });
        b.Entity<NotificationLog>().HasIndex(n => new { n.FirmId, n.CreatedAt });
        b.Entity<Case>().Property(c => c.FeeAgreed).HasPrecision(18, 2); 
        b.Entity<Case>().Property(c => c.FeeBalance).HasPrecision(18, 2); 
        b.Entity<Plan>().Property(p => p.Price).HasPrecision(18, 2); 
        b.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2); 
        b.Entity<CasePayment>().Property(p => p.Amount).HasPrecision(18, 2); 
        b.Entity<RefreshToken>().HasIndex(t => t.TokenHash); 
        b.Entity<PasswordResetToken>().HasIndex(t => t.TokenHash);

        // Multi-tenant isolation: scope tenant entities to the caller's firm.
        b.Entity<User>().HasQueryFilter(u => _currentUser.FirmId == null || u.FirmId == _currentUser.FirmId);
        b.Entity<Case>().HasQueryFilter(c => _currentUser.FirmId == null || c.FirmId == _currentUser.FirmId);
        b.Entity<Court>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<CaseType>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<CaseStage>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<NotificationLog>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<Document>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<License>().HasQueryFilter(x => _currentUser.FirmId == null || x.FirmId == _currentUser.FirmId);
        b.Entity<Payment>().HasQueryFilter(x =>_currentUser.FirmId == null ||x.FirmId == _currentUser.FirmId); 
        b.Entity<CasePayment>().HasQueryFilter(x =>_currentUser.FirmId == null ||x.FirmId == _currentUser.FirmId);

        // Seed subscription plans so pricing/subscription work out of the box.
        var seed = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        b.Entity<Plan>().HasData(
            new Plan { Id = 1, Name = "Free Trial", Description = "15-day trial", Price = 0m, DurationDays = 15, IsActive = true, CreatedAt = seed },
            new Plan { Id = 2, Name = "Standard", Description = "Full features, 1 year", Price = 2999m, DurationDays = 365, IsActive = true, CreatedAt = seed },
            new Plan { Id = 3, Name = "Premium", Description = "1 year + priority support", Price = 4999m, DurationDays = 365, IsActive = true, CreatedAt = seed });
    }
}