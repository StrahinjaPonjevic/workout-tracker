using WorkoutTracker.Application.Workouts.DTOs;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService
    {
        Task<IEnumerable<WorkoutDto>> GetAllAsync(CancellationToken ct = default);
        Task<WorkoutDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<WorkoutDto> CreateAsync(CreateWorkoutDto dto, CancellationToken ct = default);
        Task<bool> UpdateAsync(Guid id, UpdateWorkoutDto dto, CancellationToken ct = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

        Task<MonthlyStatsDto> GetMonthlyStatsAsync(int year, int month, CancellationToken ct);
    }
}
