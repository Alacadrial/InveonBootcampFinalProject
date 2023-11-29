using Inveon.Services.FavouritesAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace Inveon.Services.FavouritesAPI.DbContexts
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Favourite> Favourites { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Favourite>()
                .HasIndex(f => new { f.UserId, f.ProductId })
                .IsUnique();
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
