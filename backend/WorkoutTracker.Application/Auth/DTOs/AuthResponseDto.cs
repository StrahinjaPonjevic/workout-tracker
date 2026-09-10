namespace WorkoutTracker.Application.Auth.DTOs
{
    public record AuthResponseDto(Guid UserId, string Username, string Email, string Token);
}
