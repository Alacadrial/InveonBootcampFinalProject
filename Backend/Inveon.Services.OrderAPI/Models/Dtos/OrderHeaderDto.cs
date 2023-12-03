namespace Inveon.Services.OrderAPI.Models.Dtos
{
    public class OrderHeaderDto
    {
        public int OrderHeaderId { get; set; }
        public double OrderTotal { get; set; }
        public double DiscountTotal { get; set; }
        public DateTime OrderTime { get; set; }
        public int CartTotalItems { get; set; }
        public List<OrderDetailsDto> OrderDetails { get; set; }
        public bool PaymentStatus { get; set; }

        public OrderHeaderDto(OrderHeader orderHeader)
        {
            this.OrderHeaderId = orderHeader.OrderHeaderId;
            this.OrderTotal = orderHeader.OrderTotal;
            this.DiscountTotal = orderHeader.DiscountTotal;
            this.OrderTime = orderHeader.OrderTime;
            this.CartTotalItems = orderHeader.CartTotalItems;
            this.OrderDetails = orderHeader.OrderDetails.Select(details => { return new OrderDetailsDto(details); }).ToList();
            this.PaymentStatus = orderHeader.PaymentStatus;
        }
    }
}
