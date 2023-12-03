using Inveon.Services.ShoppingCartAPI.Models.Dto;
using Inveon.Services.ShoppingCartAPI.RabbitMQSender;
using Inveon.Services.ShoppingCartAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inveon.Services.ShoppingCartAPI.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("api/cart")]
    public class CartAPIController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICouponRepository _couponRepository;
        // private readonly IMessageBus _messageBus;
        protected ResponseDto _response;
        private readonly IRabbitMQCartMessageSender _rabbitMQCartMessageSender;
        // IMessageBus messageBus,
        public CartAPIController(ICartRepository cartRepository,
            ICouponRepository couponRepository, IRabbitMQCartMessageSender rabbitMQCartMessageSender)
        {
            _cartRepository = cartRepository;
            _couponRepository = couponRepository;
            _rabbitMQCartMessageSender = rabbitMQCartMessageSender;
            //_messageBus = messageBus;
            this._response = new ResponseDto();
        }

        [HttpGet("GetCart/{userId}")]
        public async Task<object> GetCart(string userId)
        {
            try
            {
                CartDto cartDto = await _cartRepository.GetCartByUserId(userId);
                _response.Result = cartDto;
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
        public async Task<object> Post([FromBody] CartDto cartDto)
        {
            try
            {
                if (cartDto.CartHeader.CouponCode == null)
                {
                    cartDto.CartHeader.CouponCode = ""; //
                }
                CartDto model = await _cartRepository.CreateUpdateCart(cartDto);
                _response.Result = model;
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages
                     = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost("UpdateCart")]
        public async Task<object> UpdateCart(CartDto cartDto)
        {
            try
            {
                CartDto cartDt = await _cartRepository.CreateUpdateCart(cartDto);
                _response.Result = cartDt;
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost("RemoveFromCart")]
        [Authorize]
        public async Task<object> RemoveCart([FromBody] int cartDetailsId)
        {
            try
            {
                bool isSuccess = await _cartRepository.RemoveFromCart(cartDetailsId);
                _response.Result = isSuccess;
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost("ApplyCoupon")]
        public async Task<object> ApplyCoupon([FromBody] string code)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                var coupon = await _cartRepository.ApplyCoupon(userId, code);
                if (coupon != null)
                {
                    _response.IsSuccess = true;
                    _response.Result = coupon;
                }
                else
                {
                    _response.IsSuccess = false;
                    _response.ErrorMessages = new List<string>() { "Coupon not found." };
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost("RemoveCoupon")]
        public async Task<object> RemoveCoupon([FromBody] string userId)
        {
            try
            {
                bool isSuccess = await _cartRepository.RemoveCoupon(userId);
                _response.Result = isSuccess;
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
        public async Task<object> ClearUserCart()
        {
            // We don't need to pass any payload we can get the userId as such, since we are using [Authorize] property, only authenticated users can reach here
            // meaning we can get user details from System.Security.Claims and we are sure that it is not null.
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                await _cartRepository.ClearCart(userId);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }


        [HttpPost("Checkout2")]
        public async Task<object> Checkout2(CartDto cartDto)
        {
            try
            {


                if (!string.IsNullOrEmpty(cartDto.CartHeader.CouponCode))
                {
                    CouponDto coupon = await _couponRepository.GetCoupon(cartDto.CartHeader.CouponCode);

                }

                await _cartRepository.ClearCart(cartDto.CartHeader.UserId);
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
