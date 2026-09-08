using AdvocateDiary.Application.Auth;
using AdvocateDiary.Application.Billing;
using AdvocateDiary.Application.Cases;
using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Dashboard;
using AdvocateDiary.Application.Diary;
using AdvocateDiary.Application.Reports;
using AdvocateDiary.Application.Identity;
using AdvocateDiary.Application.Masters;
using AdvocateDiary.Application.Notifications;
using AdvocateDiary.Application.Public;
using AdvocateDiary.Infrastructure.Auth;
using AdvocateDiary.Infrastructure.Billing;
using AdvocateDiary.Infrastructure.Cases;
using AdvocateDiary.Infrastructure.Dashboard;
using AdvocateDiary.Infrastructure.Diary;
using AdvocateDiary.Infrastructure.Reports;
using AdvocateDiary.Infrastructure.Email;
using AdvocateDiary.Infrastructure.Identity;
using AdvocateDiary.Infrastructure.Masters;
using AdvocateDiary.Application.Documents;
using AdvocateDiary.Infrastructure.Documents;
using AdvocateDiary.Infrastructure.Notifications;
using AdvocateDiary.Infrastructure.Persistence;
using AdvocateDiary.Infrastructure.Public;
using AdvocateDiary.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AdvocateDiary.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<JwtSettings>(config.GetSection(JwtSettings.SectionName));
        services.Configure<EmailSettings>(config.GetSection(EmailSettings.SectionName));

        services.AddDbContext<AppDbContext>(opt =>
            opt.UseSqlServer(config.GetConnectionString("Default")));

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IFirmService, FirmService>();

        // Real Office 365 SMTP when configured (Email:Host set); otherwise a dev logging stub.
        var email = config.GetSection(EmailSettings.SectionName).Get<EmailSettings>() ?? new EmailSettings();
        if (email.IsConfigured)
            services.AddScoped<IEmailSender, SmtpEmailSender>();
        else
            services.AddSingleton<IEmailSender, LoggingEmailSender>();

        // Generic master CRUD (Court / CaseType / CaseStage) + lookups
        services.AddScoped(typeof(IMasterService<>), typeof(MasterService<>));
        services.AddScoped<ILookupService, LookupService>();
        services.AddScoped<ICaseService, CaseService>();
        services.AddScoped<IDiaryService, DiaryService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddScoped<IDocumentService, DocumentService>();

        // Billing — stub gateway now; swap for PayU/Stripe later without touching BillingService.
        services.AddScoped<IPaymentGateway, StubPaymentGateway>();
        services.AddScoped<IBillingService, BillingService>();
        services.AddScoped<IFeeService, FeeService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IPublicService, PublicService>();

        return services;
    }
}
