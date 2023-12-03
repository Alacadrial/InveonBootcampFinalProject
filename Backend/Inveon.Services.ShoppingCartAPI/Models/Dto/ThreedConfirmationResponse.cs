namespace Inveon.Services.ShoppingCartAPI.Models.Dto
{
    public class ThreedConfirmationResponse
    {
        public required string Status { get; set; }
        public string? PaymentId { get; set; }
        public string? ConversationData { get; set; }
        public long? ConversationId { get; set; }
        public string? mdStatus { get; set; }
    }
}
