using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Entities;

namespace WorkoutTracker.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Workout> Workouts { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
