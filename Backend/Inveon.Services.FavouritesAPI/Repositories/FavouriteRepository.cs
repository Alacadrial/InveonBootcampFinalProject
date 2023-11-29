using AutoMapper;
using Inveon.Services.FavouritesAPI.DbContexts;
using Inveon.Services.FavouritesAPI.Models;
using Inveon.Services.FavouritesAPI.Models.Dto;
using Microsoft.EntityFrameworkCore;

namespace Inveon.Services.FavouritesAPI.Repositories
{
    public class FavouriteRepository : IFavouriteRepository
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public FavouriteRepository(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }
        public async Task<bool> AddFavouriteForUser(FavouriteDto favouriteDto)
        {
            var prodInDb = await _db.Products.AsNoTracking().FirstOrDefaultAsync(entity => entity.ProductId == favouriteDto.ProductId);
            if (prodInDb != null)
            {
                favouriteDto.Product = null;
            }
            var newEntry = _mapper.Map<Favourite>(favouriteDto);
            _db.Favourites.Add(newEntry);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<FavouriteDto>> GetFavouritesByUserId(string userId)
        {
            var favourites = _db.Favourites.Where(entity => entity.UserId == userId).ToList();
            var retVal = _mapper.Map<List<FavouriteDto>>(favourites);
            foreach(var fav in retVal)
            {
                fav.Product = _mapper.Map<ProductDto>(await _db.Products.AsNoTracking().FirstOrDefaultAsync(u=>u.ProductId == fav.ProductId));
            }
            return retVal;
        }   

        public async Task<bool> RemoveFavouriteForUser(string userId, int favouriteId)
        {
            var favouriteInDb = await _db.Favourites.AsNoTracking().FirstOrDefaultAsync(entity => entity.UserId == userId && entity.FavouriteId == favouriteId);
            if (favouriteInDb == null)
            {
                throw new Exception("The user does not have that item favourited so removing it resulted in error.");
            }
            _db.Favourites.Remove(favouriteInDb);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
