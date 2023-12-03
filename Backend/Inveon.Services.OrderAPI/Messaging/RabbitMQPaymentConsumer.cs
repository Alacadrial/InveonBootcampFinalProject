using Inveon.Services.OrderAPI.Messages;
using Inveon.Services.OrderAPI.Repository;
using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System.Text;
using Newtonsoft.Json;
using Iyzipay.Request;
using Iyzipay.Model;
using Iyzipay;

namespace Inveon.Services.OrderAPI.Messaging
{
    public class RabbitMQPaymentConsumer : BackgroundService
    {

        private IConnection _connection;
        private IModel _channel;
        private const string ExchangeName = "DirectPaymentUpdate_Exchange";
        private const string PaymentOrderUpdateQueueName = "PaymentOrderUpdateQueueName";

        private readonly OrderRepository _orderRepository;
        string queueName = "";
        public RabbitMQPaymentConsumer(OrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                UserName = "guest",
                Password = "guest"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            //_channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct);
            _channel.QueueDeclare(PaymentOrderUpdateQueueName, false, false, false, null);
            //_channel.QueueBind(PaymentOrderUpdateQueueName, ExchangeName, "PaymentOrder");
        }
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += (ch, ea) =>
            {
                var content = Encoding.UTF8.GetString(ea.Body.ToArray());
                UpdatePaymentResultMessage updatePaymentResultMessage = JsonConvert.DeserializeObject<UpdatePaymentResultMessage>(content);
                HandleMessage(updatePaymentResultMessage).GetAwaiter().GetResult();

                _channel.BasicAck(ea.DeliveryTag, false);
            };
            _channel.BasicConsume(PaymentOrderUpdateQueueName, false, consumer);

            return Task.CompletedTask;
        }

        private async Task HandleMessage(UpdatePaymentResultMessage updatePaymentResultMessage)
        {
            try
            {
                Options options = new Options();
                options.ApiKey = "sandbox-9mPCoPiicPKZdnVSJAm6ReD1uwkWAyVh";
                options.SecretKey = "sandbox-atpAq00e0fy4jH9dpEWELEBAVrG73iXR";
                options.BaseUrl = "https://sandbox-api.iyzipay.com";

                var res = ThreedsPayment.Retrieve(new RetrievePaymentRequest
                {
                    Locale = Locale.TR.ToString(),
                    PaymentId = updatePaymentResultMessage.PaymentId.ToString(),
                }, options);

                await _orderRepository.UpdateOrderPaymentStatusByCartHeaderId(Int32.Parse(res.BasketId), updatePaymentResultMessage.Status);
                // burada aynı zamanda mail yollama işi için mesaj yollayabilirsin

                // here we will retrive payment from iyzico and update table

                //await _orderRepository.UpdateOrderPaymentStatus(updatePaymentResultMessage.OrderId,
                //    updatePaymentResultMessage.Status);
            }
            catch (Exception e)
            {
                throw;
            }
        }
    }
}
