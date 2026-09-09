using WorkoutTracker.Domain.Enums;

namespace WorkoutTracker.Domain.Entities
{
    public class Workout
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId {  get; set; }

        public ExerciseType ExerciseType { get; set; }
        public int DurationMinutes { get; set; }
        public int CaloriesBurned { get; set; }

        public int Difficulty { get; set; }
        public int Fatigue { get; set; }

        public string? Notes { get; set; }
        public DateTime WorkoutDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
