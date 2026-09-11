using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using WorkoutTracker.Application.Common.Interfaces;

namespace WorkoutTracker.Infrastructure.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(userIdClaim, out var parseId) ? parseId : null;
            }
        }
    }
}
