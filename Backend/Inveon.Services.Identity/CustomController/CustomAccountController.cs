using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using Duende.IdentityServer.Stores;
using Duende.IdentityServer.Validation;
using IdentityModel;
using Inveon.Services.Identity.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inveon.Services.Identity.CustomController
{
    [ApiController]
    [AllowAnonymous]
    public class CustomAccountController : ControllerBase
    {
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IAuthenticationSchemeProvider _schemeProvider;
        private readonly IEventService _events;
        private readonly ITokenService _tokenService;
        private readonly IUserClaimsPrincipalFactory<ApplicationUser> _principalFactory;
        //private readonly IdentityServerOptions _options;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public CustomAccountController(
            IIdentityServerInteractionService interaction,
            IClientStore clientStore,
            IAuthenticationSchemeProvider schemeProvider,
            IEventService events,
            ITokenService tokenService,
            IUserClaimsPrincipalFactory<ApplicationUser> principalFactory,
            //IdentityServerOptions options,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleInManager
            )
        {
            _interaction = interaction;
            _clientStore = clientStore;
            _schemeProvider = schemeProvider;
            _events = events;
            _tokenService = tokenService;
            _principalFactory = principalFactory;
            //_options = options;
            _roleManager = roleInManager;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("/connect/register")]
        public async Task<object> RegisterCustomer([FromBody] RegisterRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest("ModelState is not valid.");

            string role = SD.Customer;
            string normalizedRoleName = role.ToUpper();

            var user = new ApplicationUser
            {
                UserName = model.Username,
                Email = model.Email,
                EmailConfirmed = true,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if(!result.Succeeded)
                return BadRequest(result.Errors.First()!.Description);


            if (!_roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
            {
                var userRole = new IdentityRole
                {
                    Name = role,
                    NormalizedName = normalizedRoleName,

                };
                await _roleManager.CreateAsync(userRole);
            }

            await _userManager.AddToRoleAsync(user, role);

            await _userManager.AddClaimsAsync(user, new Claim[]{
                        new Claim(JwtClaimTypes.Name, model.Username),
                        new Claim(JwtClaimTypes.Email, model.Email),
                        new Claim(JwtClaimTypes.FamilyName, model.FirstName),
                        new Claim(JwtClaimTypes.GivenName, model.LastName),
                        new Claim(JwtClaimTypes.WebSite, "http://"+model.Username+".com"),
                        new Claim(JwtClaimTypes.Role,"User") });

            var client = new HttpClient();
            var parameters = new Dictionary<string, string>
            {
                { "grant_type", "password" },
                { "username", model.Username },
                { "password", model.Password },
                { "client_id", "react_client" },
                { "client_secret", "react_secret" }
            };
            var response = await client.PostAsync("https://localhost:44365/connect/token", new FormUrlEncodedContent(parameters));
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadFromJsonAsync<TokenResponseDto>();
                return Ok(content);
            }
            return BadRequest("User registered but had a problem with generating token.");
        }

        [HttpPost("experimental/token/{userId}")]
        [AllowAnonymous]
        public async Task<object> GetToken(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest("No user with uid: " + userId);

            var IdentityPricipal = await _principalFactory.CreateAsync(user);
            var claimsToPass =new ClaimsIdentity(IdentityPricipal.Claims);
            claimsToPass.AddClaim(new Claim(JwtClaimTypes.AuthenticationTime, DateTime.Now.Ticks.ToString()));
            claimsToPass.AddClaim(new Claim(JwtClaimTypes.IdentityProvider, "local"));
            var tokenResult = await _tokenService.CreateAccessTokenAsync(new TokenCreationRequest
            {
                Subject = new ClaimsPrincipal(claimsToPass),
                ValidatedResources = new ResourceValidationResult
                {
                    Resources = new Resources { 
                        IdentityResources = SD.IdentityResources.ToList(),
                        ApiScopes = SD.ApiScopes.ToList()
                    }
                },
                ValidatedRequest = new ValidatedRequest
                {
                    ClientId = "react_client",
                    Client = SD.Clients.First(client => client.ClientId == "react_client"),
                    AccessTokenLifetime = 3600,
                    IssuerName = "external",
                    AccessTokenType = AccessTokenType.Reference,
                    Subject = new ClaimsPrincipal(claimsToPass),
                },
            });

            return (tokenResult != null) ? Ok(tokenResult) : BadRequest("Error while creating the token.");
        }

    }
}
