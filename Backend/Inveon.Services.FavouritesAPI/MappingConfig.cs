using AutoMapper;
using Inveon.Services.FavouritesAPI.Models;
using Inveon.Services.FavouritesAPI.Models.Dto;

namespace Inveon.Services.FavouritesAPI
{
    public class MappingConfig
    {
        public static MapperConfiguration RegisterMaps()
        {
            var mappingConfig = new MapperConfiguration(config =>
            {
                config.CreateMap<ProductDto, Product>().ReverseMap();
                config.CreateMap<FavouriteDto, Favourite>().ReverseMap();
            });

            return mappingConfig;
        }
    }
}
