using AdvocateDiary.Domain.Common;

namespace AdvocateDiary.Domain.Entities;

/// <summary>Global reference data (not firm-scoped). Maps legacy State_Mstr.</summary>
public class State : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

/// <summary>Maps legacy City_Mstr.</summary>
public class City : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int? StateId { get; set; }
}

/// <summary>Maps legacy Salutaion_Mstr (legacy spelling kept for the physical table).</summary>
public class Salutation : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}
