namespace AdvocateDiary.Application.Cases;

public record CaseListItemDto(
    int Id, string CaseNumber, string Title, string? PartyName,
    DateTime? NextDate, bool IsStarred, bool IsActive);

public record CaseDetailDto(
    int Id, string CaseNumber, string Title, string? Defendant,
    int? CourtId, int? CaseTypeId, int? CaseStageId, int? AppearingLawyerId,
    DateTime? FilingDate, DateTime? PreviousDate, DateTime? NextDate,
    string? PartyName, string? PartyAddress, int? PartyZip,
    string? PartyPhone, string? PartyPhone2, string? PartyEmail, string? OppositeLawyer,
    decimal FeeAgreed, decimal FeeBalance, string? Tags, string? Remarks,
    bool SmsOptIn, bool EmailOptIn, bool IsStarred, bool IsActive);

public record CaseSaveRequest(
    string CaseNumber, string Title, string? Defendant,
    int? CourtId, int? CaseTypeId, int? CaseStageId, int? AppearingLawyerId,
    DateTime? FilingDate, DateTime? PreviousDate, DateTime? NextDate,
    string? PartyName, string? PartyAddress, int? PartyZip,
    string? PartyPhone, string? PartyPhone2, string? PartyEmail, string? OppositeLawyer,
    decimal FeeAgreed, decimal FeeBalance, string? Tags, string? Remarks,
    bool SmsOptIn, bool EmailOptIn);

public record CaseHistoryDto(int Id, DateTime HearingDate, string? Notes);

public record AddNoteRequest(DateTime HearingDate, string? Notes);

public enum CaseFilter { Active, Archived, Starred }
