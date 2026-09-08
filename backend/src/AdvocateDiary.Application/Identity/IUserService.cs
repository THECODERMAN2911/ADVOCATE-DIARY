namespace AdvocateDiary.Application.Identity;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct = default);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken ct = default);
    Task<UserDto> GetMeAsync(CancellationToken ct = default);
    Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken ct = default);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken ct = default);
}

public interface IFirmService
{
    Task<FirmDto> GetAsync(CancellationToken ct = default);
    Task<FirmDto> UpdateAsync(UpdateFirmRequest request, CancellationToken ct = default);
}
