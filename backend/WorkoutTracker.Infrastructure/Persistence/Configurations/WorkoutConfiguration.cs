using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkoutTracker.Domain.Entities;

namespace WorkoutTracker.Infrastructure.Persistence.Configurations
{
    public class WorkoutConfiguration : IEntityTypeConfiguration<Workout>
    {
        public void Configure(EntityTypeBuilder<Workout> builder)
        {
            builder.ToTable("workouts");
            builder.HasKey(w => w.Id);

            builder.Property(w => w.ExerciseType)
                .IsRequired();

            builder.Property(w => w.DurationMinutes)
                .IsRequired();

            builder.Property(w => w.CaloriesBurned)
                .IsRequired();

            builder.Property(w => w.Difficulty)
                .IsRequired();

            builder.Property(w => w.Fatigue)
                .IsRequired();

            builder.Property(w => w.Notes)
                .HasMaxLength(100);

            builder.Property(w => w.WorkoutDate)
                .IsRequired();

            builder.HasIndex(w => new { w.UserId, w.WorkoutDate });
        }
    }
}
