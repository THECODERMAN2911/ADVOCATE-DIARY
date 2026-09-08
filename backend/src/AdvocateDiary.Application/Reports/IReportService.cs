using AdvocateDiary.Application.Common.Models;

namespace AdvocateDiary.Application.Reports;

public record CaseReportRow(
    string CaseNumber, string Title, string? Party, DateTime? NextDate,
    decimal FeeAgreed, decimal FeeBalance, bool IsActive);

public interface IReportService
{
    /// <summary>Returns one database-paged slice of the report, never the entire firm data set.</summary>
    Task<PagedResult<CaseReportRow>> CasesAsync(
        bool includeArchived, int page, int pageSize, CancellationToken ct = default);

    /// <summary>Renders the cases report as an .xlsx workbook.</summary>
    Task<byte[]> CasesExcelAsync(bool includeArchived, CancellationToken ct = default);
}
