using AdvocateDiary.Application.Common.Interfaces;
using AdvocateDiary.Application.Identity;
using AdvocateDiary.Domain.Entities;
using AdvocateDiary.Domain.Enums;
using AdvocateDiary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdvocateDiary.Infrastructure.Identity;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public UserService(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct = default)
        => await _db.Users.AsNoTracking()
            .OrderBy(u => u.FullName)
            .Select(u => Map(u))
            .ToListAsync(ct);

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var firmId = _current.FirmId ?? throw new UnauthorizedAccessException();
        if (await _db.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == request.Email, ct))
            throw new InvalidOperationException("An account with this email already exists.");

        var user = new User
        {
            FirmId = firmId,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            Role = ParseRole(request.Role),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return Map(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new KeyNotFoundException("User not found.");
        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.Role = ParseRole(request.Role);
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Map(user);
    }

    public async Task<UserDto> GetMeAsync(CancellationToken ct = default)
    {
        var user = await CurrentUserEntity(ct);
        return Map(user);
    }

    public async Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await CurrentUserEntity(ct);
        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Map(user);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await CurrentUserEntity(ct);
        if (!SafeVerify(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    private async Task<User> CurrentUserEntity(CancellationToken ct)
    {
        var id = _current.UserId ?? throw new UnauthorizedAccessException();
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new UnauthorizedAccessException();
    }

    private static UserRole ParseRole(string role)
        => Enum.TryParse<UserRole>(role, true, out var r) ? r : UserRole.Lawyer;

    private static bool SafeVerify(string password, string hash)
    {
        try { return BCrypt.Net.BCrypt.Verify(password, hash); }
        catch (BCrypt.Net.SaltParseException) { return hash == password; }
    }

    private static UserDto Map(User u) => new(u.Id, u.FullName, u.Email, u.Phone, u.Role.ToString(), u.IsActive);
}
