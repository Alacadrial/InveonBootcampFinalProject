using HandlebarsDotNet;
using Inveon.Services.NotificationService.Dto;
using System.Net;
using System.Net.Mail;

namespace Inveon.Services.NotificationService.Interfaces
{
    public class EmailNotificationService : INotificationService
    {
        private readonly SmtpClient _smtpClient;
        private readonly MailAddress _mailAdress;
        private readonly string _templatePath;
        public EmailNotificationService() { 
            _smtpClient = new SmtpClient("smtp-mail.outlook.com", 587)
            {
                Port = 587,
                Credentials = new NetworkCredential(
                    Environment.GetEnvironmentVariable("INVEON_EMAIL_ENV_VARIABLE"),
                    Environment.GetEnvironmentVariable("INVEON_PASSWORD_ENV_VARIABLE")
                    ),
                EnableSsl = true,
            };
            _mailAdress = new MailAddress(Environment.GetEnvironmentVariable("INVEON_EMAIL_ENV_VARIABLE"));

            var currentDirectory = Directory.GetCurrentDirectory();
            var threeLevelsUp = Path.Combine(currentDirectory, "..", "..", "..");
            _templatePath = Path.Combine(threeLevelsUp, "templates", "PurchaseNotificationTemplate.html");
        }

        public async Task sendNotification(CheckoutHeaderDto dto)
        {
            try
            {
                var templateContent = File.ReadAllText(_templatePath);
                var template = Handlebars.Compile(templateContent);

                // Render the template with data
                var result = template(dto);

                var email = new MailMessage
                {
                    From = _mailAdress,
                    Subject = "Purchase Notification",
                    Body = result,
                    IsBodyHtml = true
                };

                email.To.Add(dto.Email);
                await _smtpClient.SendMailAsync(email);
            }
            catch(Exception err)
            {
                Console.WriteLine(err);
            }
        }
    }
}
