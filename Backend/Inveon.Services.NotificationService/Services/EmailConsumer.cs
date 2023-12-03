using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System.Text;
using Microsoft.Extensions.Hosting;
using Inveon.Services.NotificationService.Interfaces;
using Inveon.Services.NotificationService.Dto;
using Newtonsoft.Json;

namespace Inveon.Services.OrderAPI.Messaging
{
    public class EmailConsumer : BackgroundService
    {
        private readonly EmailNotificationService _emailService;
        private IConnection _connection;
        private IModel _channel;

        public EmailConsumer(EmailNotificationService emailNotificationService)
        {
            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                UserName = "guest",
                Password = "guest"
            };
            _emailService = emailNotificationService;

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.QueueDeclare(queue: "checkoutemailnotificationqueue", false, false, false, arguments: null);
        }
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += (ch, ea) =>
            {
                var content = Encoding.UTF8.GetString(ea.Body.ToArray());
                CheckoutHeaderDto checkoutHeaderDto = JsonConvert.DeserializeObject<CheckoutHeaderDto>(content);
                HandleMessage(checkoutHeaderDto).GetAwaiter().GetResult();

                _channel.BasicAck(ea.DeliveryTag, false);
            };
            _channel.BasicConsume("checkoutemailnotificationqueue", false, consumer);

            return Task.CompletedTask;
        }

        private async Task HandleMessage(CheckoutHeaderDto checkoutHeaderDto)
        {
            await _emailService.sendNotification(checkoutHeaderDto);
        }
    }
}
