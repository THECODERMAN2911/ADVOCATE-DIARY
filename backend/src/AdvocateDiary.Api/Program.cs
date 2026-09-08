using System.Reflection;
using System.Text;
using AdvocateDiary.Infrastructure;
using AdvocateDiary.Infrastructure.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Infrastructure (EF Core, JWT service, auth service, current-user)
builder.Services.AddInfrastructure(builder.Configuration);

// JWT bearer authentication
var jwt = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

// CORS for the Angular dev server
const string CorsPolicy = "spa";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:4200"])
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Advocate Diary API",
        Version = "v1",
        Description = "Use **Authorize** and sign in with your email as the username to call protected endpoints."
    });
    var xml = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xml)) c.IncludeXmlComments(xml);

    // Password flow: the Authorize dialog collects username + password, calls the token endpoint,
    // and applies the returned bearer token to every request — no copy-pasting a JWT.
    var password = new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Description = "Sign in with your email address as the username.",
        Flows = new OpenApiOAuthFlows
        {
            Password = new OpenApiOAuthFlow
            {
                TokenUrl = new Uri("/api/v1/Auth/token", UriKind.Relative),
                Scopes = new Dictionary<string, string>()
            }
        },
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "OAuth2" }
    };
    c.AddSecurityDefinition("OAuth2", password);

    // Kept as an alternative for callers that already hold a token.
    var bearer = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste an existing access token.",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", bearer);

    // Two separate requirements => either scheme satisfies the request (OR, not AND).
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [password] = Array.Empty<string>() });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [bearer] = Array.Empty<string>() });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Prefills the dialog's client fields; the token endpoint has no client registration and
        // ignores them, so they only exist to satisfy the Swagger UI form.
        c.OAuthClientId("swagger-ui");
        c.OAuthAppName("Advocate Diary API");
    });
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
