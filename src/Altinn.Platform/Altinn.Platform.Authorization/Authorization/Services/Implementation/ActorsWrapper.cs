using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Altinn.Platform.Authorization.Clients;
using Altinn.Platform.Authorization.Configuration;
using Altinn.Platform.Authorization.Services.Interface;
using Common.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Altinn.Platform.Authorization.Services.Implementation
{
    /// <summary>
    /// Wrapper for the actors api
    /// </summary>
    public class ActorsWrapper : IActor
    {
        private readonly GeneralSettings _generalSettings;
        private readonly ILogger _logger;
        private readonly ActorClient _actorClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActorsWrapper"/> class
        /// </summary>
        /// <param name="generalSettings">the general settings</param>
        /// <param name="logger">the logger</param>
        /// <param name="actorClient">the client handler for actor api</param>
        public ActorsWrapper(IOptions<GeneralSettings> generalSettings, ILogger<ActorsWrapper> logger, ActorClient actorClient)
        {
            _generalSettings = generalSettings.Value;
            _logger = logger;
            _actorClient = actorClient;
        }

        /// <inheritdoc />
        public async Task<List<Actor>> GetActors(int userId)
        {            
            List<Actor> actorList;
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                "api/movies");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));

            using (var response = await _actorClient.Client.SendAsync(
                                            request,
                                            HttpCompletionOption.ResponseHeadersRead))
            {
                string actorDataList = await response.Content.ReadAsStringAsync();
                response.EnsureSuccessStatusCode();
                actorList = JsonConvert.DeserializeObject<List<Actor>>(actorDataList);
            }

            return actorList;
        }
    }
}
