namespace AdvocateDiary.Application.Identity;

public record UserDto(int Id, string FullName, string Email, string? Phone, string Role, bool IsActive);

public record CreateUserRequest(string FullName, string Email, string? Phone, string Role, string Password);

public record UpdateUserRequest(string FullName, string? Phone, string Role, bool IsActive);

public record UpdateProfileRequest(string FullName, string? Phone);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record FirmDto(int Id, string Name, string? Address, string? City, string? Phone, string? Email, string? LogoPath);

public record UpdateFirmRequest(string Name, string? Address, string? City, string? Phone, string? Email);
