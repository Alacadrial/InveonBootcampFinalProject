using Inveon.Services.FavouritesAPI.Models.Dto;
using Inveon.Services.FavouritesAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inveon.Services.FavouritesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavouritesController : ControllerBase
    {
        private readonly IFavouriteRepository _repository;
        protected ResponseDto _response;
        public FavouritesController(IFavouriteRepository repository)
        {
            _repository = repository;
            _response = new ResponseDto();
        }

        [HttpGet]
        [Authorize]
        public async Task<object> GetFavourites()
        {
            try
            {
                string userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                List<FavouriteDto> favourites = await _repository.GetFavouritesByUserId(userId);
                _response.Result = favourites;
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost]
        [Authorize]
        public async Task<object> AddFavourite([FromBody] FavouriteDto dto)
        {
            try
            {
                string userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                if (userId != dto.UserId)
                    throw new Exception("Mismatch of the authenticated user and the ID from the DTO.");
                await _repository.AddFavouriteForUser(dto);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpDelete]
        [Authorize]
        public async Task<object> RemoveFavourite([FromBody] int favouriteId)
        {
            try
            {
                string userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                await _repository.RemoveFavouriteForUser(userId, favouriteId);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }
    }
}
