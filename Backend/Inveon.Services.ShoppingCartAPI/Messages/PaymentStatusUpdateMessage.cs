using Inveon.MessageBus;

namespace Inveon.Services.ShoppingCartAPI.Messages
{
    public class PaymentStatusUpdateMessage : BaseMessage
    {
        public required string PaymentId { get; set; }
        public required bool Status { get; set; }
        public string Email { get; set; }
    }
}
