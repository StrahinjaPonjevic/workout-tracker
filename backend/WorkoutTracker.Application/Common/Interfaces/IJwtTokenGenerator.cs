using WorkoutTracker.Domain.Entities;

namespace WorkoutTracker.Application.Common.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
