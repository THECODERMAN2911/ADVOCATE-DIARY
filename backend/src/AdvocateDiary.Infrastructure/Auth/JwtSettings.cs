namespace AdvocateDiary.Infrastructure.Auth;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "AdvocateDiary";
    public string Audience { get; set; } = "AdvocateDiaryClient";
    public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 14;
}
