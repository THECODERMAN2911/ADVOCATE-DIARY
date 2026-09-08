using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Contact-us submission (public). Maps legacy Contact_MST.</summary>
public class ContactMessage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>Refer-a-friend record (public). Maps legacy RefFriend / RefFriends.</summary>
public class Referral : BaseEntity
{
    public string? FromName { get; set; }
    public string? FromEmail { get; set; }
    public string ToEmail { get; set; } = string.Empty;
}
