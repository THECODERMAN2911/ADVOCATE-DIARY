namespace AdvocateDiary.Application.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string FirmName,
    string FullName,
    string Email,
    string Password,
    string? Phone);

public record RefreshRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    UserSummary User);

public record UserSummary(int Id, int FirmId, string FullName, string Email, string Role);
