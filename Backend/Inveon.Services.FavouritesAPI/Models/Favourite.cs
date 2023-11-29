using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Inveon.Services.FavouritesAPI.Models
{
    public class Favourite
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FavouriteId { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
    }
}
