using AdvocateDiary.Application.Common.Models;
using AdvocateDiary.Application.Cases;

namespace AdvocateDiary.Application.Reports;

public record CaseReportRow(
    string CaseNumber, string Title, string? Party, DateTime? NextDate,
    decimal FeeAgreed, decimal FeeBalance, bool IsActive);

public interface IReportService
{
    /// <summary>Returns one database-paged slice of the report, never the entire firm data set.</summary>
    Task<PagedResult<CaseReportRow>> CasesAsync(
        bool includeArchived, int page, int pageSize, string? query = null, CancellationToken ct = default);

    /// <summary>Renders the cases report as an .xlsx workbook.</summary>
    Task<byte[]> CasesExcelAsync(bool includeArchived, CaseFilter? filter = null, string? query = null, CancellationToken ct = default);

    /// <summary>Renders overdue active hearings as an .xlsx workbook.</summary>
    Task<byte[]> PreviousHearingsExcelAsync(string? query = null, CancellationToken ct = default);
}
