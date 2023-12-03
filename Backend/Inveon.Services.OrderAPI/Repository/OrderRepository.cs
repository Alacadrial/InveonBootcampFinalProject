using Inveon.Services.OrderAPI.DbContexts;
using Inveon.Services.OrderAPI.Models;
using Inveon.Services.OrderAPI.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Inveon.Services.OrderAPI.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbContext;

        public OrderRepository(DbContextOptions<ApplicationDbContext> dbContext)
        {
            _dbContext = dbContext;
        }


        public async Task<IEnumerable<OrderHeaderDto>> GetPaidOrders(string userId)
        {
            await using var _db = new ApplicationDbContext(_dbContext);
            return _db.OrderHeaders.Where(u => u.UserId == userId && u.PaymentStatus == true).Select(orderHeader => new OrderHeaderDto(orderHeader)).ToList();
        }

        public async Task<bool> AddOrder(OrderHeader orderHeader)
        {
            if (orderHeader.CouponCode == null)
            {
                orderHeader.CouponCode = "";
            }
            await using var _db = new ApplicationDbContext(_dbContext);
            _db.OrderHeaders.Add(orderHeader);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task UpdateOrderPaymentStatus(int orderHeaderId, bool paid)
        {
            await using var _db = new ApplicationDbContext(_dbContext);
            var orderHeaderFromDb = await _db.OrderHeaders.FirstOrDefaultAsync(u => u.OrderHeaderId == orderHeaderId);
            if (orderHeaderFromDb != null)
            {
                orderHeaderFromDb.PaymentStatus = paid;
                await _db.SaveChangesAsync();
            }
        }

        public async Task UpdateOrderPaymentStatusByCartHeaderId(int cartHeaderId, bool paid)
        {
            await using var _db = new ApplicationDbContext(_dbContext);
            var ordered = _db.OrderHeaders.OrderBy(u => u.CartHeaderId);
            var orderHeaderFromDb = await ordered.FirstOrDefaultAsync(u => u.CartHeaderId == cartHeaderId);
            if (orderHeaderFromDb != null)
            {
                orderHeaderFromDb.PaymentStatus = paid;
                await _db.SaveChangesAsync();
            }
        }
    }
}
