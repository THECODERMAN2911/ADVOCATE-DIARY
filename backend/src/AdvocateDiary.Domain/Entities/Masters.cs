using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Base for simple firm-owned "name + active" master/reference tables.</summary>
public abstract class NamedMasterEntity : BaseEntity, ITenantEntity
{
    public int FirmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

/// <summary>Maps legacy Court_Mstr.</summary>
public class Court : NamedMasterEntity { }

/// <summary>Maps legacy CaseType_Mstr.</summary>
public class CaseType : NamedMasterEntity { }

/// <summary>Maps legacy CaseStage_Mstr.</summary>
public class CaseStage : NamedMasterEntity { }
