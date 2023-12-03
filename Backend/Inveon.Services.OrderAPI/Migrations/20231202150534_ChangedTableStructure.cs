using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inveon.Services.OrderAPI.Migrations
{
    /// <inheritdoc />
    public partial class ChangedTableStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CartHeaderId",
                table: "OrderHeaders",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CartHeaderId",
                table: "OrderHeaders");
        }
    }
}
