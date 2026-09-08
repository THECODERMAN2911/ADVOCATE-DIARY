using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdvocateDiary.Infrastructure.Persistence.Migrations;

[Migration("20260908123000_AddCoveringCasePagingIndexes")]
public partial class AddCoveringCasePagingIndexes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Cases_FirmId_CaseNumber",
            table: "Cases");

        migrationBuilder.DropIndex(
            name: "IX_Cases_FirmId_IsActive_CaseNumber",
            table: "Cases");

        migrationBuilder.DropIndex(
            name: "IX_Cases_FirmId_IsActive_NextDate_CaseNumber",
            table: "Cases");

        migrationBuilder.DropIndex(
            name: "IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber",
            table: "Cases");

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "CaseNumber" })
            .Annotation("SqlServer:Include", new[] { "Id", "Title", "PartyName", "NextDate", "FeeAgreed", "FeeBalance", "IsActive" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "CaseNumber" })
            .Annotation("SqlServer:Include", new[] { "Id", "Title", "PartyName", "NextDate", "FeeAgreed", "FeeBalance", "IsStarred" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_NextDate_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "NextDate", "CaseNumber" })
            .Annotation("SqlServer:Include", new[] { "Id", "Title", "PartyName", "IsStarred" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "UpdatedAt", "CaseNumber" })
            .Annotation("SqlServer:Include", new[] { "Id", "Title", "PartyName", "NextDate", "IsStarred" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex("IX_Cases_FirmId_CaseNumber", "Cases");
        migrationBuilder.DropIndex("IX_Cases_FirmId_IsActive_CaseNumber", "Cases");
        migrationBuilder.DropIndex("IX_Cases_FirmId_IsActive_NextDate_CaseNumber", "Cases");
        migrationBuilder.DropIndex("IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber", "Cases");

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "CaseNumber" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "CaseNumber" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_NextDate_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "NextDate", "CaseNumber" });

        migrationBuilder.CreateIndex(
            name: "IX_Cases_FirmId_IsActive_UpdatedAt_CaseNumber",
            table: "Cases",
            columns: new[] { "FirmId", "IsActive", "UpdatedAt", "CaseNumber" });
    }
}