using HandlebarsDotNet;
using Inveon.Services.NotificationService.Dto;
using System.Net;
using System.Net.Mail;

namespace Inveon.Services.NotificationService.Interfaces
{
    public class EmailNotificationService : INotificationService
    {
        private readonly SmtpClient _smtpClient;

        public EmailNotificationService() { 
            _smtpClient = new SmtpClient("your-smtp-server.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("your-username", "your-password"),
                EnableSsl = true,
            };
        }

        public async Task sendNotification(CheckoutHeaderDto dto)
        {

            var templatePath = ".\\Templates\\PurchaseNotificationTemplate.html";
            var templateContent = File.ReadAllText(templatePath);
            var template = Handlebars.Compile(templateContent);

            // Render the template with data
            var result = template(dto);

            var email = new MailMessage
            {
                From = new MailAddress("your@email.com"),
                Subject = "Purchase Notification",
                Body = result,
                IsBodyHtml = true
            };

            email.To.Add(dto.Email);

            await _smtpClient.SendMailAsync(email);
        }
    }
}
