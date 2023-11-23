using Inveon.Services.NotificationService.Dto;
using MassTransit;
using Inveon.Services.NotificationService.Interfaces;

namespace Inveon.Services.NotificationService.Consumer
{
    public class PurchaseNotificationConsumer : IConsumer<CheckoutHeaderDto>
    {
        private readonly EmailNotificationService _emailNotificationService;

        public PurchaseNotificationConsumer(EmailNotificationService emailNotificationService)
        {
            _emailNotificationService = emailNotificationService;
        }

        async Task IConsumer<CheckoutHeaderDto>.Consume(ConsumeContext<CheckoutHeaderDto> context)
        {
            await _emailNotificationService.sendNotification(context.Message);
        }
    }
}
