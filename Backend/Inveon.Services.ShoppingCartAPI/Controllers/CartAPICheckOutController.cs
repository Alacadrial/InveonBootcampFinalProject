using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Iyzipay.Request;
using Iyzipay.Model;
using Iyzipay;
using Inveon.Services.ShoppingCartAPI.Messages;
using Inveon.Services.ShoppingCartAPI.RabbitMQSender;
using Inveon.Services.ShoppingCartAPI.Repository;
using Inveon.Services.ShoppingCartAPI.Models.Dto;
using System.Security.Claims;
using Newtonsoft.Json;
using Azure;
using HandlebarsDotNet;

namespace Inveon.Service.ShoppingCartAPI.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("api/cartc")]
    public class CartAPICheckOutController : ControllerBase
    {

        private readonly ICartRepository _cartRepository;
        private readonly ICouponRepository _couponRepository;
        // private readonly IMessageBus _messageBus;
        protected ResponseDto _response;
        private readonly IRabbitMQCartMessageSender _rabbitMQCartMessageSender;
        private readonly Options _options;
        // IMessageBus messageBus,
        public CartAPICheckOutController(ICartRepository cartRepository,
            ICouponRepository couponRepository, IRabbitMQCartMessageSender rabbitMQCartMessageSender)
        {
            _cartRepository = cartRepository;
            _couponRepository = couponRepository;
            _rabbitMQCartMessageSender = rabbitMQCartMessageSender;
            //_messageBus = messageBus;
            this._response = new ResponseDto();
            _options = new Options
            {
                ApiKey = "sandbox-9mPCoPiicPKZdnVSJAm6ReD1uwkWAyVh",
                SecretKey = "sandbox-atpAq00e0fy4jH9dpEWELEBAVrG73iXR",
                BaseUrl = "https://sandbox-api.iyzipay.com",
            };
        }


        [HttpPost]
        [Authorize]
        public async Task<object> Checkout([FromBody] CheckoutHeaderDto checkoutHeader)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)!.Value;
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
                checkoutHeader.UserId = userId;
                checkoutHeader.Email = email;

                CartDto cartDto = await _cartRepository.GetCartByUserId(userId);
                if (cartDto == null || (cartDto != null && !cartDto.CartDetails.Any()))
                {
                    return BadRequest("Cart is empty.");
                }
                checkoutHeader.OrderTotal = cartDto.CartDetails.Sum(details => (details.Product.Price*details.Count));
                if (!string.IsNullOrEmpty(cartDto.CartHeader.CouponCode))
                {
                    CouponDto coupon = await _couponRepository.GetCoupon(checkoutHeader.CouponCode);
                    if (coupon.CouponCode != null)
                    {
                        checkoutHeader.DiscountTotal = checkoutHeader.OrderTotal * ( (100 - coupon.DiscountAmount) / 100 );
                    }
                }
                else
                {
                    checkoutHeader.DiscountTotal = checkoutHeader.OrderTotal;
                }
                checkoutHeader.CartDetails = cartDto.CartDetails;
                checkoutHeader.CartHeaderId = cartDto.CartHeader.CartHeaderId;

                if (checkoutHeader.ThreeD)
                {
                    ThreedsInitialize init = ThreeDInitiliaze(checkoutHeader);
                    if (init.Status.ToLower() == "success")
                    {
                        _rabbitMQCartMessageSender.SendMessage(checkoutHeader, "checkoutqueue");
                        return Ok(init);
                    }
                    else
                    {
                        return BadRequest(init.ErrorMessage);
                    }
                }
                else
                {
                    Payment payment = MakePayment(checkoutHeader);
                    if (payment.Status.ToLower() == "success")
                    {
                        checkoutHeader.PaymentMade = true;
                        _rabbitMQCartMessageSender.SendMessage(checkoutHeader, "checkoutqueue");
                        _rabbitMQCartMessageSender.SendMessage(checkoutHeader, "emailcheckoutnotificationqueue");
                        await _cartRepository.ClearCart(userId);
                        return Ok();
                    }
                    else
                    {
                        return BadRequest(payment.ErrorMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }


        [HttpPost]
        [Route("threedcallback")]
        public async Task<object> ThreeDCallback([FromForm] ThreedConfirmationResponse response)
        {
            var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "templates", "callback-template.html");
            var templateContent = System.IO.File.ReadAllText(templatePath);
            var template = Handlebars.Compile(templateContent);

            if (response.Status.ToLower() == "success")
            {
                CreateThreedsPaymentRequest request = new CreateThreedsPaymentRequest
                {
                    PaymentId = response.PaymentId,
                    ConversationId = response.ConversationId.ToString(),
                    Locale = Locale.TR.ToString(),
                    ConversationData = response.ConversationData,
                };
                ThreedsPayment payment = ThreedsPayment.Create(request, _options);
                if(payment.Status.ToLower() == "success")
                {
                    var payload = new { success = "3DSUCCESS", errorMessage = "" };
                    var responseHtml = template(payload);
                    // update payment status
                    _rabbitMQCartMessageSender.SendMessage(new PaymentStatusUpdateMessage { PaymentId = payment.PaymentId, Status = true }, "PaymentOrderUpdateQueueName");
                    return Content(responseHtml, "text/html");
                }
                else
                {
                    var payload = new { success = "3DFAIL", errorMessage = payment.ErrorMessage };
                    var responseHtml = template(payload);
                    return Content(responseHtml, "text/html");
                }
            }
            else
            {
                var payload = new { success = "3DFAIL", errorMessage = "Failed 3D Secure." };
                var responseHtml = template(payload);
                return Content(responseHtml, "text/html");
            }
        }


        private Payment MakePayment(CheckoutHeaderDto checkoutHeaderDto)
        { 
            CreatePaymentRequest request = createRequestFromCheckoutDto(checkoutHeaderDto);
            return Payment.Create(request, _options);
        }


        private ThreedsInitialize ThreeDInitiliaze(CheckoutHeaderDto checkoutHeaderDto)
        {
            CreatePaymentRequest request = createRequestFromCheckoutDto(checkoutHeaderDto);
            request.CallbackUrl = "https://localhost:5050/api/cartc/threedcallback"; // endpoint for when 3D success or failure hit.
            return ThreedsInitialize.Create(request, _options);
        }

        private CreatePaymentRequest createRequestFromCheckoutDto (CheckoutHeaderDto checkoutHeaderDto) 
        {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = new Random().Next(111111111, 999999999).ToString();
            request.Currency = Currency.TRY.ToString();
            request.Installment = 1;
            request.BasketId = checkoutHeaderDto.CartHeaderId.ToString();
            request.PaymentChannel = PaymentChannel.WEB.ToString();
            request.PaymentGroup = PaymentGroup.PRODUCT.ToString();

            PaymentCard paymentCard = new PaymentCard();
            paymentCard.CardHolderName = checkoutHeaderDto.CartHeaderId.ToString();
            paymentCard.CardNumber = checkoutHeaderDto.CardNumber;
            paymentCard.ExpireMonth = checkoutHeaderDto.ExpiryMonth;
            paymentCard.ExpireYear = checkoutHeaderDto.ExpiryYear;
            paymentCard.Cvc = checkoutHeaderDto.CVV;
            paymentCard.RegisterCard = 0;
            paymentCard.CardAlias = "Inveon";
            request.PaymentCard = paymentCard;

            Buyer buyer = new Buyer();
            buyer.Id = checkoutHeaderDto.UserId;
            buyer.Name = checkoutHeaderDto.FirstName;
            buyer.Surname = checkoutHeaderDto.FirstName;
            buyer.GsmNumber = checkoutHeaderDto.Phone;
            buyer.Email = checkoutHeaderDto.Email;
            buyer.IdentityNumber = "74300864791";
            buyer.LastLoginDate = "2015-10-05 12:43:35";
            buyer.RegistrationDate = "2013-04-21 15:12:09";
            buyer.RegistrationAddress = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1";
            buyer.Ip = "85.34.78.112";
            buyer.City = "Istanbul";
            buyer.Country = "Turkey";
            buyer.ZipCode = "34732";
            request.Buyer = buyer;

            Address shippingAddress = new Address();
            shippingAddress.ContactName = $"{checkoutHeaderDto.FirstName} {checkoutHeaderDto.LastName}";
            shippingAddress.City = checkoutHeaderDto.Country; ;
            shippingAddress.Country = checkoutHeaderDto.City;
            shippingAddress.Description = checkoutHeaderDto.Address;
            shippingAddress.ZipCode = checkoutHeaderDto.ZipCode.ToString();
            request.ShippingAddress = shippingAddress;

            Address billingAddress = new Address();
            billingAddress.ContactName = $"{checkoutHeaderDto.FirstName} {checkoutHeaderDto.LastName}";
            billingAddress.City = checkoutHeaderDto.Country;
            billingAddress.Country = checkoutHeaderDto.City;
            billingAddress.Description = checkoutHeaderDto.Address;
            billingAddress.ZipCode = checkoutHeaderDto.ZipCode.ToString();
            request.BillingAddress = billingAddress;

            List<BasketItem> basketItems = checkoutHeaderDto.CartDetails.Select(details =>
            {
                BasketItem basketItem = new BasketItem();
                basketItem.Id = details.ProductId.ToString();
                basketItem.Name = details.Product.Name;
                basketItem.Category1 = details.Product.CategoryName;
                basketItem.Price = (details.Product.Price*details.Count).ToString();
                basketItem.ItemType = BasketItemType.PHYSICAL.ToString();
                return basketItem;
            }).ToList();

            request.BasketItems = basketItems;
            request.Price = checkoutHeaderDto.OrderTotal.ToString();
            request.PaidPrice = checkoutHeaderDto.DiscountTotal.ToString();
            return request;
        }
    }
}
