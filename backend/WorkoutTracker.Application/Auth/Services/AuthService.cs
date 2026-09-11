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
            var normalizedEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, ct);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash)) 
            {
                throw new UnauthorizedAccessException("Pogresan Email ili lozinka");
            }

            var token = _tokenGenerator.GenerateToken(user);
            return new AuthResponseDto(user.Id, user.Username, user.Email, token);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto request, CancellationToken ct = default)
        {
            var username = request.Username?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(username) || username.Length < 3)
            {
                throw new ArgumentException("Korisnicko ime mora imati najmanje 3 karaktera.");
            }

            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@') || !request.Email.Contains('.'))
            {
                throw new ArgumentException("Email adresa nije u ispravnom formatu.");
            }

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            {
                throw new ArgumentException("Lozinka mora imati najmanje 6 karaktera.");
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail, ct);
            if(emailExists)
            {
                throw new InvalidOperationException("Korisnik sa unetom Email adresom vec postoji");
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower(), ct);
            if(usernameExists)
            {
                throw new InvalidOperationException("Korisnicko ime je vec zauzeto");
            }

            var user = new User
            {
                Username = username,
                Email = normalizedEmail,
                PasswordHash = _passwordHasher.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(ct);

            var token = _tokenGenerator.GenerateToken(user);
            return new AuthResponseDto(user.Id, user.Username, user.Email, token);
        }
    }
}
