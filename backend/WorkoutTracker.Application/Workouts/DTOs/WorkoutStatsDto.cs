namespace WorkoutTracker.Application.Workouts.DTOs
{
    public record WeeklyStatsDto
    (
        int WeekNumber,
        string DateRange,
        int TotalWorkouts,
        int TotalDurationMinutes,
        int TotalCaloriesBurned,
        double AverageDifficulty,
        double AverageFatigue
    );

    public record MonthlyStatsDto
    (
        int Year,
        int Month,
        int TotalWorkouts,
        int TotalDurationMinutes,
        int TotalCaloriesBurned,
        double AverageDifficulty,
        double AverageFatigue,
        List<WeeklyStatsDto> WeeklyBreakdown
    );
}
