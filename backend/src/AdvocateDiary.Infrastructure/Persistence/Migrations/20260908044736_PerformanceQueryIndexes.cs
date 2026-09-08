using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdvocateDiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PerformanceQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Documents_CaseId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_IsActive_NextDate",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_CasePayments_CaseId",
                table: "CasePayments");

            migrationBuilder.DropIndex(
                name: "IX_CaseHistories_CaseId",
                table: "CaseHistories");

            migrationBuilder.AlterColumn<string>(
                name: "CaseNumber",
                table: "Cases",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_FirmId_CreatedAt",
                table: "NotificationLogs",
                columns: new[] { "FirmId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CaseId_CreatedAt",
                table: "Documents",
                columns: new[] { "CaseId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_IsActive_IsStarred_NextDate_CaseNumber",
                table: "Cases",
                columns: new[] { "FirmId", "IsActive", "IsStarred", "NextDate", "CaseNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_IsActive_NextDate_CaseNumber",
                table: "Cases",
                columns: new[] { "FirmId", "IsActive", "NextDate", "CaseNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber",
                table: "Cases",
                columns: new[] { "FirmId", "IsActive", "UpdatedAt", "CaseNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_CasePayments_CaseId_PaidOn",
                table: "CasePayments",
                columns: new[] { "CaseId", "PaidOn" });

            migrationBuilder.CreateIndex(
                name: "IX_CasePayments_FirmId_Amount",
                table: "CasePayments",
                columns: new[] { "FirmId", "Amount" });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NotificationLogs_FirmId_CreatedAt",
                table: "NotificationLogs");

            migrationBuilder.DropIndex(
                name: "IX_Documents_CaseId_CreatedAt",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_IsActive_IsStarred_NextDate_CaseNumber",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_IsActive_NextDate_CaseNumber",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_CasePayments_CaseId_PaidOn",
                table: "CasePayments");

            migrationBuilder.DropIndex(
                name: "IX_CasePayments_FirmId_Amount",
                table: "CasePayments");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CaseId",
                table: "Documents",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_IsActive_NextDate",
                table: "Cases",
                columns: new[] { "FirmId", "IsActive", "NextDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CasePayments_CaseId",
                table: "CasePayments",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseHistories_CaseId",
                table: "CaseHistories",
                column: "CaseId");
        }
    }
}
