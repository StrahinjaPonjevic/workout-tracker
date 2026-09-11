using WorkoutTracker.Domain.Enums;

namespace WorkoutTracker.Application.Workouts.DTOs
{
    public record UpdateWorkoutDto
    (
        ExerciseType ExerciseType,
        int DurationMinutes,
        int CaloriesBurned,
        int Difficulty,
        int Fatigue,
        string? Notes,
        DateTime WorkoutDate
    );
}
