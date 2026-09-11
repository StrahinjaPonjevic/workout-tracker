using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application.Workouts.DTOs;
using WorkoutTracker.Application.Workouts.Interfaces;

namespace WorkoutTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutsController : ControllerBase
    {
        private readonly IWorkoutService _workoutService;

        public WorkoutsController(IWorkoutService workoutService)
        {
            _workoutService = workoutService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkoutDto>>> GetAll(CancellationToken ct)
        {
            var workouts = await _workoutService.GetAllAsync(ct);
            return Ok(workouts);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<WorkoutDto>> GetById(Guid id, CancellationToken ct = default)
        {
            var workout = await _workoutService.GetByIdAsync(id, ct);
            if (workout == null)
                return NotFound(new { message = "Trening nije pronadjen." });
            return Ok(workout);
        }

        [HttpPost]
        public async Task<ActionResult<WorkoutDto>> Create([FromBody] CreateWorkoutDto dto, CancellationToken ct = default)
        {
            var createdWorkout = await _workoutService.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = createdWorkout.Id }, createdWorkout);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWorkoutDto dto, CancellationToken ct = default)
        {
            var updated = await _workoutService.UpdateAsync(id, dto, ct);
            if (!updated)
                return NotFound(new { message = "Trening nije pronadjen ili nemate pravo izmene." });
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
        {
            var deleted = await _workoutService.DeleteAsync(id, ct);
            if (!deleted)
                return NotFound(new { message = "Trening nije pronadjen ili nemate pravo brisanja." });
            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<ActionResult<MonthlyStatsDto>> GetMonthlyStats(
            [FromQuery] int year,
            [FromQuery] int month,
            CancellationToken ct)
        {
            var stats = await _workoutService.GetMonthlyStatsAsync(year, month, ct);
            return Ok(stats);
        }
    }
}
