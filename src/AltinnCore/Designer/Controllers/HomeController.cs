using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AltinnCore.Authentication.Constants;
using AltinnCore.Common.Configuration;
using AltinnCore.Common.Constants;
using AltinnCore.Common.Helpers;
using AltinnCore.Common.Models;
using AltinnCore.Common.Services.Interfaces;
using AltinnCore.RepositoryClient.Api;
using AltinnCore.RepositoryClient.CustomApi;
using AltinnCore.RepositoryClient.Model;
using AltinnCore.ServiceLibrary.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AltinnCore.Designer.Controllers
{
    /// <summary>
    /// The default MVC controller in the application
    /// </summary>
    public class HomeController : Controller
    {
        private readonly IGitea _giteaApi;
        private readonly ILogger<HomeController> _logger;
        private readonly ServiceRepositorySettings _settings;
        private readonly ISourceControl _sourceControl;

        /// <summary>
        /// Initializes a new instance of the <see cref="HomeController"/> class
        /// </summary>
        /// <param name="logger">The logger</param>
        /// <param name="repositorySettings">settings for the repository</param>
        /// <param name="giteaWrapper">the gitea wrapper</param>
        /// <param name="httpContextAccessor">the httpcontext accessor</param>
        /// <param name="sourceControl">the source control</param>
        public HomeController(ILogger<HomeController> logger, IOptions<ServiceRepositorySettings> repositorySettings, IGitea giteaWrapper, IHttpContextAccessor httpContextAccessor, ISourceControl sourceControl)
        {
            _logger = logger;
            _settings = repositorySettings.Value;
            _giteaApi = giteaWrapper;
            _sourceControl = sourceControl;
        }

        /// <summary>
        /// the default page for altinn studio when the user is not logged inn
        /// </summary>
        /// <returns>The start page</returns>
        public ActionResult StartPage()
        {
            string sessionId = Request.Cookies[_settings.GiteaCookieName];
            string userName = _giteaApi.GetUserNameFromUI().Result;

            if (string.IsNullOrEmpty(userName))
            {
                return View("StartPage");
            }

            return this.RedirectToAction("Index", "Home");
        }

        /// <summary>
        /// The default action presenting a list of available services when the user is logged in
        /// </summary>
        /// <param name="repositorySearch">the search parameter object</param>
        /// <returns>The front page</returns>
        [Authorize]
        public ActionResult Index(RepositorySearch repositorySearch)
        {
            return View();
        }

        /// <summary>
        /// View for creating new org
        /// </summary>
        /// <returns>The create org page</returns>
        [Authorize]
        public ActionResult CreateOrg()
        {
            return View();
        }

        /// <summary>
        /// Action for presenting the Not Authorized View
        /// </summary>
        /// <returns>The view telling user that user was not authorized</returns>
        public IActionResult NotAuthorized()
        {
            return View();
        }

        /// <summary>
        /// Action for presenting licensing information
        /// </summary>
        /// <returns>The Licensing view</returns>
        public IActionResult Licensing()
        {
            return View();
        }

        /// <summary>
        /// Action for presenting documentation
        /// </summary>
        /// <returns>The Doc view</returns>
        public IActionResult Docs()
        {
            return View();
        }

        /// <summary>
        /// Action for presenting information about the product
        /// </summary>
        /// <returns>The About view</returns>
        public IActionResult About()
        {
            return View();
        }

        /// <summary>
        /// Action for presenting error
        /// </summary>
        /// <returns>The Error view</returns>
        public IActionResult Error()
        {
            return View();
        }

        /// <summary>
        /// Login
        /// </summary>
        /// <returns>The login page</returns>
        public async Task<IActionResult> Login()
        {
            string userName = string.Empty;
            string goToUrl = "/";

            // Verify that user is not logged in already.
            if (!string.IsNullOrEmpty(AuthenticationHelper.GetDeveloperUserName(HttpContext)))
            {
                return LocalRedirect(goToUrl);
            }

            // Temporary catch errors until we figure out how to force this.
            try
            {
                userName = _giteaApi.GetUserNameFromUI().Result;
                if (string.IsNullOrEmpty(userName))
                {
                    return (Environment.GetEnvironmentVariable("ServiceRepositorySettings__GiteaLoginUrl") != null)
                    ? Redirect(Environment.GetEnvironmentVariable("ServiceRepositorySettings__GiteaLoginUrl"))
                    : Redirect(_settings.GiteaLoginUrl);
                }
            }
            catch (Exception ex)
            {
                return Content(ex.ToString());
            }

            _logger.LogInformation("Updating app key for " + userName);
            KeyValuePair<string, string> accessKeyValuePair = await _giteaApi.GetSessionAppKey() ?? default(KeyValuePair<string, string>);
            List<Claim> claims = new List<Claim>();
            const string Issuer = "https://altinn.no";
            if (!accessKeyValuePair.Equals(default(KeyValuePair<string, string>)))
            {
                string accessToken = accessKeyValuePair.Value;
                string accessId = accessKeyValuePair.Key;
                _logger.LogInformation("Adding key to claims: " + accessId);
                claims.Add(new Claim(AltinnCoreClaimTypes.DeveloperToken, accessToken, ClaimValueTypes.String, Issuer));
                claims.Add(new Claim(AltinnCoreClaimTypes.DeveloperTokenId, accessId, ClaimValueTypes.String, Issuer));
            }

            claims.Add(new Claim(AltinnCoreClaimTypes.Developer, userName, ClaimValueTypes.String, Issuer));
            ClaimsIdentity identity = new ClaimsIdentity("TestUserLogin");
            identity.AddClaims(claims);

            ClaimsPrincipal principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    ExpiresUtc = DateTime.UtcNow.AddMinutes(200),
                    IsPersistent = false,
                    AllowRefresh = false,
                });

            return LocalRedirect(goToUrl);
        }

        /// <summary>
        /// Logout
        /// </summary>
        /// <returns>The logout page</returns>
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return LocalRedirect("/repos/user/logout");
        }

        /// <summary>
        /// Go to app token view
        /// </summary>
        /// <returns>The app token view</returns>
        [Authorize]
        [HttpGet]
        public IActionResult AppToken()
        {
            return View();
        }

        /// <summary>
        /// Store app token for user
        /// </summary>
        /// <param name="appKey">the app key</param>
        /// <returns>redirects user</returns>
        [Authorize]
        [HttpPost]
        public IActionResult AppToken(AppKey appKey)
        {
            _sourceControl.StoreAppTokenForUser(appKey.Key);
            return Redirect("/");
        }

        /// <summary>
        /// Debug info
        /// </summary>
        /// <returns>The debug info you want</returns>
        public IActionResult Debug()
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.AppendLine("Debug info");
            stringBuilder.AppendLine("App token is: " + _sourceControl.GetAppToken());
            stringBuilder.AppendLine("App token id is " + _sourceControl.GetAppTokenId());
            stringBuilder.AppendLine("UserName from service: " + _giteaApi.GetUserNameFromUI().Result);
            return Content(stringBuilder.ToString());
        }
    }
}
