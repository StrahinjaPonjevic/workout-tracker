using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Application.Auth.DTOs;
using WorkoutTracker.Application.Auth.Interfaces;
using WorkoutTracker.Application.Common.Interfaces;
using WorkoutTracker.Domain.Entities;

namespace WorkoutTracker.Application.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _tokenGenerator;

        public AuthService(
            IApplicationDbContext context,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator tokenGenerator)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto request, CancellationToken ct = default)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash)) 
            {
                throw new UnauthorizedAccessException("Pogresan Email ili lozinka");
            }

            var token = _tokenGenerator.GenerateToken(user);
            return new AuthResponseDto(user.Id, user.Username, user.Email, token);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto request, CancellationToken ct = default)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email, ct);
            if(emailExists)
            {
                throw new InvalidOperationException("Korisnik sa unetom Email adresom vec postoji");
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username, ct);
            if(usernameExists)
            {
                throw new InvalidOperationException("Korisnicno ime je vec zauzeto");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(ct);

            var token = _tokenGenerator.GenerateToken(user);
            return new AuthResponseDto(user.Id, user.Username, user.Email, token);
        }
    }
}
