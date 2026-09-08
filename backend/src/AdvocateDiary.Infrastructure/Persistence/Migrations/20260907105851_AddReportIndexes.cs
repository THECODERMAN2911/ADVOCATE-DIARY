using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdvocateDiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReportIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CaseNumber",
                table: "Cases",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_CaseNumber",
                table: "Cases",
                columns: new[] { "FirmId", "CaseNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Cases_FirmId_IsActive_CaseNumber",
                table: "Cases",
                columns: new[] { "FirmId", "IsActive", "CaseNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_CaseNumber",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_FirmId_IsActive_CaseNumber",
                table: "Cases");

            migrationBuilder.AlterColumn<string>(
                name: "CaseNumber",
                table: "Cases",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
