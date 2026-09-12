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

        private static void ValidateWorkoutParameters(ExerciseType exerciseType, int duration, int caloriesBurned, int difficulty, int fatigue, string? notes, DateTime workoutDate)
        {
            if (!Enum.IsDefined(typeof(ExerciseType), exerciseType))
            {
                throw new ArgumentException("Nevalidna vrsta vezbe.");
            }

            if (duration <= 0)
            {
                throw new ArgumentException("Trajanje treninga mora biti vece od 0 minuta.");
            }

            if (caloriesBurned < 0)
            {
                throw new ArgumentException("Potrosene kalorije ne mogu biti negativne.");
            }

            if (difficulty < 1 || difficulty > 10)
            {
                throw new ArgumentOutOfRangeException(nameof(difficulty), "Tezina treninga mora biti izmedju 1 i 10.");
            }

            if (fatigue < 1 || fatigue > 10)
            {
                throw new ArgumentOutOfRangeException(nameof(fatigue), "Nivo umora mora biti izmedju 1 i 10.");
            }

            if (notes?.Length > 500)
            {
                throw new ArgumentException("Beleske ne mogu biti duze od 500 karaktera.");
            }

            var utcDate = workoutDate.Kind == DateTimeKind.Utc
                ? workoutDate
                : DateTime.SpecifyKind(workoutDate, DateTimeKind.Utc);
            if (utcDate > DateTime.UtcNow.AddMinutes(5))
            {
                throw new ArgumentException("Datum treninga ne može biti u budućnosti.");
            }
        }

        public async Task<WorkoutDto> CreateAsync(CreateWorkoutDto dto, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();
            ValidateWorkoutParameters(dto.ExerciseType, dto.DurationMinutes, dto.CaloriesBurned, dto.Difficulty, dto.Fatigue, dto.Notes, dto.WorkoutDate);

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
            await _context.SaveChangesAsync(ct);
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
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == currentUserId, ct);

            if (workout == null) return false;
            ValidateWorkoutParameters(dto.ExerciseType, dto.DurationMinutes, dto.CaloriesBurned, dto.Difficulty, dto.Fatigue, dto.Notes, dto.WorkoutDate);

            workout.ExerciseType = dto.ExerciseType;
            workout.DurationMinutes = dto.DurationMinutes;
            workout.CaloriesBurned = dto.CaloriesBurned;
            workout.Difficulty = dto.Difficulty;
            workout.Fatigue = dto.Fatigue;
            workout.Notes = dto.Notes;
            workout.WorkoutDate = DateTime.SpecifyKind(dto.WorkoutDate, DateTimeKind.Utc);

            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<MonthlyStatsDto> GetMonthlyStatsAsync(int year, int month, CancellationToken ct)
        {
            if (month < 1 || month > 12)
                throw new ArgumentOutOfRangeException(nameof(month), "Mesec mora biti izmedju 1 i 12");

            var currentUserId = GetCurrentUserId();

            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);
            var daysInMonth = DateTime.DaysInMonth(year, month);

            var workouts = await _context.Workouts
                .AsNoTracking()
                .Where(w => w.UserId == currentUserId && w.WorkoutDate >= startDate && w.WorkoutDate < endDate)
                .ToListAsync(ct);

            var weeklyBreakdown = new List<WeeklyStatsDto>();
            int currentDay = 1;
            int weekIndex = 1;

            while (currentDay <= daysInMonth)
            {
                int endDayOfWeek = Math.Min(currentDay + 6, daysInMonth);
                var weekWorkouts = workouts
                    .Where(w => w.WorkoutDate.Day >= currentDay && w.WorkoutDate.Day <= endDayOfWeek);

                int count = weekWorkouts.Count();
                int totalDuration = weekWorkouts.Sum(w => w.DurationMinutes);
                int totalCalories = weekWorkouts.Sum(w => w.CaloriesBurned);

                double avgDifficulty = count > 0 ? Math.Round(weekWorkouts.Average(w => w.Difficulty), 1) : 0;
                double avgFatigue = count > 0 ? Math.Round(weekWorkouts.Average(w => w.Fatigue), 1) : 0;

                weeklyBreakdown.Add(new WeeklyStatsDto
                (
                    WeekNumber: weekIndex,
                    DateRange: $"{currentDay:D2}.{month:D2} - {endDayOfWeek:D2}.{month:D2}",
                    TotalWorkouts: count,
                    TotalDurationMinutes: totalDuration,
                    TotalCaloriesBurned: totalCalories,
                    AverageDifficulty: avgDifficulty,
                    AverageFatigue: avgFatigue
                ));

                currentDay += 7;
                weekIndex++;
            }

            int totalMonthWorkouts = workouts.Count;
            int totalMonthDuration = workouts.Sum(w => w.DurationMinutes);
            int totalMonthCalories = workouts.Sum(w => w.CaloriesBurned);
            double avgMonthDifficulty = totalMonthWorkouts > 0 ? Math.Round(workouts.Average(w => w.Difficulty), 1) : 0;
            double avgMonthFatigue = totalMonthWorkouts > 0 ? Math.Round(workouts.Average(w => w.Fatigue), 1) : 0;

            return new MonthlyStatsDto
            (
                Year: year,
                Month: month,
                TotalWorkouts: totalMonthWorkouts,
                TotalDurationMinutes: totalMonthDuration,
                TotalCaloriesBurned: totalMonthCalories,
                AverageDifficulty: avgMonthDifficulty,
                AverageFatigue: avgMonthFatigue,
                WeeklyBreakdown: weeklyBreakdown
            );
        }
    }
}
