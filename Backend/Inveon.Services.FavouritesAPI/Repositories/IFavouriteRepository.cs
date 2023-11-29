using Inveon.Services.FavouritesAPI.Models.Dto;

namespace Inveon.Services.FavouritesAPI.Repositories
{
    public interface IFavouriteRepository
    {
        Task<List<FavouriteDto>> GetFavouritesByUserId(string userId);
        Task<bool> AddFavouriteForUser(FavouriteDto favouriteDto);
        Task<bool> RemoveFavouriteForUser(string userId, int favouriteId);
    }
}
