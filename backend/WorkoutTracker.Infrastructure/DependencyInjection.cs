using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorkoutTracker.Application.Auth.Interfaces;
using WorkoutTracker.Application.Auth.Services;
using WorkoutTracker.Application.Common.Interfaces;
using WorkoutTracker.Infrastructure.Identity;
using WorkoutTracker.Infrastructure.Persistence;

namespace WorkoutTracker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<WorkoutTrackerDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(WorkoutTrackerDbContext).Assembly.FullName)));

            services.AddScoped<IApplicationDbContext>(provider => 
                provider.GetRequiredService<WorkoutTrackerDbContext>());


            services.AddSingleton<IPasswordHasher, PasswordHasher>();
            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IAuthService, AuthService>();

            var secret = configuration["JwtSettings:Secret"]!;
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                };
            });

            return services;
        }
    }
}
