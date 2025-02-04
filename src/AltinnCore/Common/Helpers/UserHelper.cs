using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AltinnCore.Authentication.Constants;
using AltinnCore.Common.Configuration;
using AltinnCore.Common.Constants;
using AltinnCore.Common.Services.Interfaces;
using AltinnCore.RepositoryClient.Model;
using AltinnCore.ServiceLibrary.Models;
using AltinnCore.ServiceLibrary.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace AltinnCore.Common.Helpers
{
    /// <summary>
    /// The helper for user functionality
    /// </summary>
    public class UserHelper
    {
        private readonly IProfile _profileService;
        private readonly IRegister _registerService;
        private readonly GeneralSettings _settings;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserHelper"/> class
        /// </summary>
        /// <param name="profileService">The ProfileService (defined in Startup.cs)</param>
        /// <param name="registerService">The RegisterService (defined in Startup.cs)</param>
        /// <param name="settings">The general settings</param>
        public UserHelper(IProfile profileService, IRegister registerService, IOptions<GeneralSettings> settings)
        {
            _profileService = profileService;
            _registerService = registerService;
            _settings = settings.Value;
        }

        /// <summary>
        /// Returns the user context
        /// </summary>
        /// <param name="context">The HttpContext</param>
        /// <returns>The UserContext</returns>
        public async Task<UserContext> GetUserContext(HttpContext context)
        {
            UserContext userContext = new UserContext() { User = context.User };

            foreach (Claim claim in context.User.Claims)
            {
                if (claim.Type.Equals(AltinnCoreClaimTypes.UserName))
                {
                    userContext.UserName = claim.Value;
                }

                if (claim.Type.Equals(AltinnCoreClaimTypes.UserId))
                {
                    userContext.UserId = Convert.ToInt32(claim.Value);
                }

                if (claim.Type.Equals(AltinnCoreClaimTypes.PartyID))
                {
                    userContext.PartyId = Convert.ToInt32(claim.Value);
                }

                if (claim.Type.Equals(AltinnCoreClaimTypes.AuthenticationLevel))
                {
                    userContext.AuthenticationLevel = Convert.ToInt32(claim.Value);
                }
            }

            UserProfile userProfile = await _profileService.GetUserProfile(userContext.UserId);
            userContext.UserParty = await _registerService.GetParty(userProfile.PartyId);

            if (context.Request.Cookies[_settings.GetAltinnPartyCookieName] != null)
            {
                userContext.PartyId = Convert.ToInt32(context.Request.Cookies[_settings.GetAltinnPartyCookieName]);
            }

            userContext.Party = await _registerService.GetParty(userContext.PartyId);
            return userContext;
        }

        /// <summary>
        /// Returns the user context for a given user and party Id
        /// </summary>
        /// <param name="context">The HttpContext</param>
        /// <param name="userId">The user id</param>
        /// <param name="partyId">The party id</param>
        /// <returns>The UserContext</returns>
        public async Task<UserContext> CreateUserContextBasedOnUserAndParty(HttpContext context, int userId, int partyId)
        {
            UserContext userContext = new UserContext() { User = context.User };
            userContext.UserId = userId;
            userContext.PartyId = partyId;
            userContext.Party = await _registerService.GetParty(userContext.PartyId);

            // userContext.UserParty = await _registerService.GetParty(userContext.PartyId); // this userPartyId is not available at this point.
            return userContext;
        }
    }
}
