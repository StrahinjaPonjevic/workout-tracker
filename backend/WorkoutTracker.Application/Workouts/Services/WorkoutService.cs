using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Application.Common.Interfaces;
using WorkoutTracker.Application.Workouts.DTOs;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Domain.Entities;
using WorkoutTracker.Domain.Enums;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class WorkoutService : IWorkoutService
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public WorkoutService(IApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        private Guid GetCurrentUserId()
        {
            return _currentUserService.UserId ?? throw new UnauthorizedAccessException("Korisnik nije autentifikovan");
        }

        private static void ValidateWorkoutParameters(int duration, int difficulty, int fatigue)
        {
            if (duration <= 0)
            {
                throw new ArgumentException("Trajanje treninga mora biti vece od 0 minuta.");
            }

            if (difficulty < 1 || difficulty > 10)
            {
                throw new ArgumentOutOfRangeException(nameof(difficulty), "Tezina treninga mora biti izmedju 1 i 10.");
            }

            if(fatigue < 1 || fatigue > 10)
            {
                throw new ArgumentOutOfRangeException(nameof(fatigue), "Nivo umora mora biti izmedju 1 i 10");
            }
        }

        public async Task<WorkoutDto> CreateAsync(CreateWorkoutDto dto, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();
            ValidateWorkoutParameters(dto.DurationMinutes, dto.Difficulty, dto.Fatigue);

            var workout = new Workout
            {
                UserId = currentUserId,
                ExerciseType = dto.ExerciseType,
                DurationMinutes = dto.DurationMinutes,
                CaloriesBurned = dto.CaloriesBurned,
                Difficulty = dto.Difficulty,
                Fatigue = dto.Fatigue,
                Notes = dto.Notes,
                WorkoutDate = DateTime.SpecifyKind(dto.WorkoutDate, DateTimeKind.Utc)
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            return new WorkoutDto(
                workout.Id,
                workout.ExerciseType,
                workout.DurationMinutes,
                workout.CaloriesBurned,
                workout.Difficulty,
                workout.Fatigue,
                workout.Notes,
                workout.WorkoutDate,
                workout.CreatedAt
                );
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();

            var workout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == currentUserId, ct);

            if (workout == null) return false;

            _context.Workouts.Remove(workout);
            _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<IEnumerable<WorkoutDto>> GetAllAsync(CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();

            return await _context.Workouts
                .AsNoTracking()
                .Where(w => w.UserId == currentUserId)
                .OrderByDescending(w => w.WorkoutDate)
                .Select(w => new WorkoutDto(
                    w.Id,
                    w.ExerciseType,
                    w.DurationMinutes,
                    w.CaloriesBurned,
                    w.Difficulty,
                    w.Fatigue,
                    w.Notes,
                    w.WorkoutDate,
                    w.CreatedAt
                    )).ToListAsync(ct);
        }

        public async Task<WorkoutDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();

            var workout = await _context.Workouts
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == currentUserId, ct);

            if (workout == null) return null;

            return new WorkoutDto(
                workout.Id,
                workout.ExerciseType,
                workout.DurationMinutes,
                workout.CaloriesBurned,
                workout.Difficulty,
                workout.Fatigue,
                workout.Notes,
                workout.WorkoutDate,
                workout.CreatedAt
                );
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateWorkoutDto dto, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();

            var workout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == currentUserId);

            if (workout == null) return false;
            ValidateWorkoutParameters(dto.DurationMinutes, dto.Difficulty, dto.Fatigue);

            workout.ExerciseType = dto.ExerciseType;
            workout.DurationMinutes = dto.DurationMinutes;
            workout.Difficulty = dto.Difficulty;
            workout.Fatigue = dto.Fatigue;
            workout.Notes = dto.Notes;
            workout.WorkoutDate = DateTime.SpecifyKind(dto.WorkoutDate, DateTimeKind.Utc);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
