using Inveon.Services.OrderAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inveon.Services.OrderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;

        public OrderController(IOrderRepository orderRepository) 
        { 
            _orderRepository = orderRepository;
        }

        [HttpGet]
        [Route("paymentcompleted")]
        [Authorize]
        public async Task<object> GetPaidOrders()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            return await _orderRepository.GetPaidOrders(userId);
        }
    }
}
