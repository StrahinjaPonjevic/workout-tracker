using Microsoft.EntityFrameworkCore;
using System.Reflection;
using WorkoutTracker.Application.Common.Interfaces;
using WorkoutTracker.Domain.Entities;

namespace WorkoutTracker.Infrastructure.Persistence
{
    public class WorkoutTrackerDbContext : DbContext, IApplicationDbContext
    {
        public WorkoutTrackerDbContext(DbContextOptions<WorkoutTrackerDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Workout> Workouts => Set<Workout>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
