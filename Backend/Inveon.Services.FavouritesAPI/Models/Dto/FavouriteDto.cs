namespace Inveon.Services.FavouritesAPI.Models.Dto
{
    public class FavouriteDto
    {
        public int FavouriteId { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public virtual ProductDto Product { get; set; }
    }
}
