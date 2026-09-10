using WorkoutTracker.Application.Auth.DTOs;

namespace WorkoutTracker.Application.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto request, CancellationToken ct = default);
        Task<AuthResponseDto> LoginAsync(LoginDto request, CancellationToken ct = default);
    }
}
