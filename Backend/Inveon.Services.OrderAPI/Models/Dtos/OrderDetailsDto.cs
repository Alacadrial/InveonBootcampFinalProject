using System.ComponentModel.DataAnnotations.Schema;

namespace Inveon.Services.OrderAPI.Models.Dtos
{
    public class OrderDetailsDto
    {
        public int OrderDetailsId { get; set; }
        public int OrderHeaderId { get; set; }
        public virtual OrderHeader OrderHeader { get; set; }
        public int ProductId { get; set; }
        public int Count { get; set; }
        public string ProductName { get; set; }
        public double Price { get; set; }

        public OrderDetailsDto(OrderDetails orderDetails)
        {
            this.OrderDetailsId = orderDetails.OrderDetailsId;
            this.OrderHeaderId = orderDetails.OrderHeaderId;
            this.OrderHeader = orderDetails.OrderHeader;
            this.Price = orderDetails.Price;
            this.Count = orderDetails.Count;
            this.ProductName = orderDetails.ProductName;
            this.ProductId = orderDetails.ProductId;
        }
    }
}
