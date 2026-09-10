using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application.Auth.DTOs;
using WorkoutTracker.Application.Auth.Interfaces;

namespace WorkoutTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto request, CancellationToken ct)
        {
            try
            {
                var response = await _authService.RegisterAsync(request, ct);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto request, CancellationToken ct)
        {
            try
            {
                var response = await _authService.LoginAsync(request, ct);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
