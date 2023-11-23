using Inveon.Services.NotificationService.Consumer;
using Inveon.Services.NotificationService.Interfaces;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;

class Program
{
    static async Task Main(string[] args)
    {
        var serviceProvider = new ServiceCollection()
            .AddScoped<EmailNotificationService>()
            .BuildServiceProvider();

        using var scope = serviceProvider.CreateScope();
        var emailNotificationService = scope.ServiceProvider.GetRequiredService<EmailNotificationService>();


        IBusControl bus = Bus.Factory.CreateUsingRabbitMq(cfg =>
        {
            Uri uri = new Uri("rabbitmq://localhost");
            cfg.Host(uri, h =>
            {
                h.Username("guest");
                h.Password("guest");
            });

            cfg.ReceiveEndpoint("checkoutqueue", ep =>
            {
                ep.Consumer(() => new PurchaseNotificationConsumer(emailNotificationService));
            });
        });

        await bus.StartAsync();

        Console.WriteLine("Notification service is listening for purchase messages. Press enter to exit.");
        Console.ReadLine();

        await bus.StopAsync();
    }
}
