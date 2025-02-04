using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AltinnCore.Common.Configuration;
using AltinnCore.Common.Helpers;
using AltinnCore.Common.Services.Interfaces;
using AltinnCore.ServiceLibrary.Models;
using AltinnCore.ServiceLibrary.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AltinnCore.Runtime.Controllers
{
    /// <summary>
    /// Exposes API endpoints related to authorization
    /// </summary>
    public class AuthorizationController : Controller
    {
        private readonly IAuthorization _authroization;
        private readonly ILogger _logger;
        private readonly UserHelper _userHelper;
        private readonly GeneralSettings _settings;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthorizationController"/> class
        /// </summary>
        public AuthorizationController(
                IAuthorization authorization,
                IProfile profileService,
                IRegister registerService,
                ILogger<AuthorizationController> logger,
                IOptions<GeneralSettings> settings)
        {
            _userHelper = new UserHelper(profileService, registerService, settings);
            _authroization = authorization;
            _logger = logger;
            _settings = settings.Value;
        }

        /// <summary>
        /// Gets current party by reading cookie value and validating. 
        /// </summary>
        /// <returns>Party id for selected party. If invalid, partyId for logged in user is returned.</returns>
        [HttpGet("{org}/{app}/api/authorization/parties/current")]
        public async Task<ActionResult> GetCurrentParty()
        {
            UserContext userContext = _userHelper.GetUserContext(HttpContext).Result;
            int userId = userContext.UserId;
            string cookieValue = Request.Cookies[_settings.GetAltinnPartyCookieName];
            int.TryParse(cookieValue, out int partyId);

            if (partyId != 0)
            {
                bool? isValid = await _authroization.ValidateSelectedParty(userId, partyId);

                if (isValid == true)
                {
                    return Ok(partyId);
                }
            }

            // Setting cookie to partyID of logged in user.
            Response.Cookies.Append(
            _settings.GetAltinnPartyCookieName,
            userContext.PartyId.ToString(),
            new CookieOptions
            {
                Domain = _settings.HostName
            });

            return Ok(userContext.PartyId);
        }

        /// <summary>
        /// Checks if the user can represent the selected party. 
        /// </summary>
        /// <param name="userId">The userId</param>
        /// <param name="partyId">The partyId</param>
        /// <returns>Boolean indicating if the selected party is valid.</returns>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ValidateSelectedParty(int userId, int partyId)
        {
            if (partyId == 0 || userId == 0)
            {
                return BadRequest("Both userId and partyId must be provided.");
            }

            bool? result = await _authroization.ValidateSelectedParty(userId, partyId);

            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return StatusCode(500, $"Something went wrong when trying to validate party {partyId} for user {userId}");
            }
        }
    }
}
