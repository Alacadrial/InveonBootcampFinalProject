using AutoMapper;
using Inveon.Services.ShoppingCartAPI.Models.Dto;
using Inveon.Services.ShoppingCartAPI.Models;
using Inveon.Services.ShoppingCartAPI.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Inveon.Services.ShoppingCartAPI.Repository
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _db;
        private IMapper _mapper;

        public CartRepository(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<bool> ApplyCoupon(string userId, string couponCode)
        {
            var cartFromDb = await _db.CartHeaders.FirstOrDefaultAsync(u => u.UserId == userId);
            cartFromDb.CouponCode = couponCode;
            _db.CartHeaders.Update(cartFromDb);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCart(string userId)
        {
            var cartHeaderFromDb = await _db.CartHeaders.FirstOrDefaultAsync(u => u.UserId == userId);
            if (cartHeaderFromDb != null)
            {
                _db.CartDetails
                    .RemoveRange(_db.CartDetails.Where(u => u.CartHeaderId == cartHeaderFromDb.CartHeaderId));
                _db.CartHeaders.Remove(cartHeaderFromDb);
                await _db.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<CartDto> CreateUpdateCart(CartDto cartDto)
        {
            // Changed to work with an entire list instead of single product.

            Cart cart = _mapper.Map<Cart>(cartDto);
            var cartHeaderFromDb = await _db.CartHeaders.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == cart.CartHeader.UserId);

            if (cartHeaderFromDb == null)
            {
                //create header and details
                _db.CartHeaders.Add(cart.CartHeader);
                await _db.SaveChangesAsync();
                foreach (var item in cart.CartDetails.ToList())
                {
                    var prodInDb = await _db.Products.AsNoTracking().FirstOrDefaultAsync(u => u.ProductId == item.ProductId);
                    if (prodInDb != null)
                    {
                        item.Product = null;
                    }
                    item.CartHeaderId = cart.CartHeader.CartHeaderId;
                    _db.CartDetails.Add(item);
                }                
                await _db.SaveChangesAsync();
            }
            else
            {
                //if header is not null
                var itemIds = cart.CartDetails.Select(item => item.ProductId);
                var itemsToRemove = _db.CartDetails.Where(dbItem => !itemIds.Contains(dbItem.ProductId)).ToList();

                // Again changed to make it work with list of products.
                foreach (var item in cart.CartDetails)
                {
                    // ... each microservice has its own DB and its own Context, if it does exist in our database it would cause problem as is.
                    var prodInDb = await _db.Products.AsNoTracking().FirstOrDefaultAsync(u => u.ProductId == item.ProductId);
                    if (prodInDb != null)
                    {
                        // need to make it null otherwise tries to create a new entity on products table in CartDatabase.
                        item.Product = null;
                    }
                    //check if details has same product
                    var cartDetailsFromDb = await _db.CartDetails.AsNoTracking().FirstOrDefaultAsync(
                    u => u.ProductId == item.ProductId &&
                    u.CartHeaderId == cartHeaderFromDb.CartHeaderId);
                    if (cartDetailsFromDb == null)
                    {
                        //create details
                        item.CartHeaderId = cartHeaderFromDb.CartHeaderId;
                        _db.CartDetails.Add(item);
                    }
                    else
                    {
                        //update the count / cart details
                        item.CartDetailsId = cartDetailsFromDb.CartDetailsId;
                        item.CartHeaderId = cartDetailsFromDb.CartHeaderId;
                        _db.CartDetails.Update(item);
                    }

                }
                foreach(var item in itemsToRemove)
                {
                    _db.CartDetails.Remove(item);
                }
                await _db.SaveChangesAsync();
            }
            // Filling virtual property so I can see product information on response.
            var retVal = _mapper.Map<CartDto>(cart);
            foreach (var item in retVal.CartDetails)
            {
                var product = await _db.Products.AsNoTracking().FirstAsync(u => u.ProductId == item.ProductId);
                item.Product = _mapper.Map<ProductDto>(product);
            }
            return retVal;
        }

        public async Task<CartDto> GetCartByUserId(string userId)
        {
            var cartHeaderFromDb = await _db.CartHeaders.FirstOrDefaultAsync(u => u.UserId == userId);

            // if header is null return dummy empty cart
            if (cartHeaderFromDb == null)
                return new CartDto { CartHeader = new CartHeaderDto(), CartDetails = new List<CartDetailsDto>() };
            
            Cart cart = new()
            {
                CartHeader = cartHeaderFromDb
            };

            cart.CartDetails = _db.CartDetails
                .Where(u => u.CartHeaderId == cart.CartHeader.CartHeaderId).Include(u => u.Product);

            return _mapper.Map<CartDto>(cart);
        }

        public CartDto GetCartByUserIdNonAsync(string userId)
        {
            Cart cart = new()
            {
                CartHeader = new()//_db.CartHeaders.FirstOrDefault(u => u.UserId == userId)
            };

            cart.CartDetails = _db.CartDetails
                .Where(u => u.CartHeaderId == cart.CartHeader.CartHeaderId).Include(u => u.Product);

            return _mapper.Map<CartDto>(cart);
        }


        public async Task<bool> RemoveCoupon(string userId)
        {
            var cartFromDb = await _db.CartHeaders.FirstOrDefaultAsync(u => u.UserId == userId);
            cartFromDb.CouponCode = "";
            _db.CartHeaders.Update(cartFromDb);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromCart(int cartDetailsId)
        {
            try
            {
                CartDetails cartDetails = await _db.CartDetails
                    .FirstOrDefaultAsync(u => u.CartDetailsId == cartDetailsId);
                _db.CartDetails.Remove(cartDetails);
                /*
                // This is used to remove cart entirely if it is empty, not needed so commenting out.                 
                int totalCountOfCartItems = _db.CartDetails
                    .Where(u => u.CartHeaderId == cartDetails.CartHeaderId).Count();
                if (totalCountOfCartItems == 1)
                {
                    var cartHeaderToRemove = await _db.CartHeaders
                        .FirstOrDefaultAsync(u => u.CartHeaderId == cartDetails.CartHeaderId);

                    _db.CartHeaders.Remove(cartHeaderToRemove);
                }
                */
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
    }
}
