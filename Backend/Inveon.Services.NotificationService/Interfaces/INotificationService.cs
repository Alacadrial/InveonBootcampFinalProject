
using HandlebarsDotNet;
using Inveon.Services.NotificationService.Dto;

namespace Inveon.Services.NotificationService.Interfaces
{
    public interface INotificationService
    {
        public Task sendNotification(CheckoutHeaderDto dto);
    }
}
