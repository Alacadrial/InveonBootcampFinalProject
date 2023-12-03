using Inveon.Services.NotificationService.Consumer;
using Inveon.Services.NotificationService.Interfaces;
using Inveon.Services.OrderAPI.Messaging;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using static MassTransit.MessageHeaders;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine(Environment.GetEnvironmentVariable("INVEON_EMAIL_ENV_VARIABLE"));
        Console.WriteLine(Environment.GetEnvironmentVariable("INVEON_PASSWORD_ENV_VARIABLE"));
        await CreateHostBuilder(args).Build().RunAsync();
        Console.ReadLine();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
            Microsoft.Extensions.Hosting.Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddHostedService<EmailConsumer>();
                    services.AddScoped<EmailNotificationService>(); // Add other services if needed
                });
}
