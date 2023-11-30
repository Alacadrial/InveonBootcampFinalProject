using System.Text.Json.Serialization;

namespace Inveon.Services.Identity.Models
{
    public class TokenResponseDto
    {
        [JsonPropertyName("access_token")]
        public string Token { get; set; }
        [JsonPropertyName("expires_in")]
        public int Expiration{ get; set; }
        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }
        [JsonPropertyName("scope")] 
        public string Scope { get; set; }
    }
}
