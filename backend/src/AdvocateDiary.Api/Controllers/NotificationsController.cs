using AdvocateDiary.Application.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Controllers;

/// <summary>Notification delivery log (Phase 4). Firm-scoped.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;
    public NotificationsController(INotificationService notifications) => _notifications = notifications;

    [HttpGet("log")]
    public async Task<ActionResult<IReadOnlyList<NotificationLogDto>>> Log([FromQuery] int take = 100, CancellationToken ct = default)
        => Ok(await _notifications.RecentAsync(take, ct));
}
