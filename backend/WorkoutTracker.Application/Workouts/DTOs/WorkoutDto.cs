using WorkoutTracker.Domain.Enums;

namespace WorkoutTracker.Application.Workouts.DTOs
{
    public record WorkoutDto
    (
        Guid Id,
        ExerciseType ExerciseType,
        int DurationMinutes,
        int CaloriesBurned,
        int Difficulty,
        int Fatigue,
        string? Notes,
        DateTime WorkoutDate,
        DateTime CreateAt
    );
}
