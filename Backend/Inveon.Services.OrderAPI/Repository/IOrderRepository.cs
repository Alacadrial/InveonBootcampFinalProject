using Inveon.Services.OrderAPI.Models;
using Inveon.Services.OrderAPI.Models.Dtos;

namespace Inveon.Services.OrderAPI.Repository
{
    public interface IOrderRepository
    {
        Task<IEnumerable<OrderHeaderDto>> GetPaidOrders(string userId);
        Task<bool> AddOrder(OrderHeader orderHeader);
        Task UpdateOrderPaymentStatus(int orderHeaderId, bool paid);
    }
}
