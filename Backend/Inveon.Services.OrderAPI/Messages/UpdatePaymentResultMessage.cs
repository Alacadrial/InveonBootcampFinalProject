namespace Inveon.Services.OrderAPI.Messages
{
    public class UpdatePaymentResultMessage
    {
        public int PaymentId { get; set; }
        public bool Status { get; set; }
        public string Email { get; set; }
    }
}
