using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Altinn.Platform.Storage.Models;
using Newtonsoft.Json;
using Storage.Interface.Clients;
using Storage.Interface.Models;

namespace Altinn.Platform.Storage.Client
{
    /// <summary>
    /// Client for managing application metadata.
    /// </summary>
    public class ApplicationClient
    {
        private readonly HttpClient client;
        private readonly string endpointUri;
        private readonly string resourcePrefix = "storage/api/v1/applications";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="client">the http client to use</param>
        /// <param name="enpointUrl">the url of the endpoint</param>
        public ApplicationClient(HttpClient client, string enpointUrl = "")
        {
            this.client = client;
            this.endpointUri = enpointUrl;
        }

        /// <summary>
        /// Creates and stores an application with an appId and a title.
        /// </summary>
        /// <param name="appId">the application id, e.g. test/app42</param>
        /// <param name="title">the title of the application</param>
        /// <returns></returns>
        public Application CreateApplication(string appId, LanguageString title)
        {
            Application application = new Application
            {
                Id = appId,
                Title = title,
                ElementTypes = new List<ElementType>()
            };

            ElementType defaultElementType = new ElementType
            {
                Id = "default",
                AllowedContentType = new List<string>() { "application/xml" }
            };

            application.ElementTypes.Add(defaultElementType);

            return CreateApplication(application) ;                     
        }

        /// <summary>
        /// Stores application from an application instance.
        /// </summary>
        /// <param name="application">the application to store</param>
        /// <returns></returns>
        public Application CreateApplication(Application application)
        {
            string url = $"{endpointUri}/{resourcePrefix}?appId={application.Id}";

            HttpResponseMessage response = client.PostAsync(url, application.AsJson()).Result;

            if (!response.IsSuccessStatusCode)
            {
                throw new StorageClientException($"POST failed: {response.StatusCode} - {response.ReasonPhrase}");
            }
            
            string json = response.Content.ReadAsStringAsync().Result;
            Application result = JsonConvert.DeserializeObject<Application>(json);

            return result;
        }

        /// <summary>
        /// Updates and application
        /// </summary>
        /// <param name="application">the application that should be updated</param>
        /// <returns>the updated application</returns>
        public Application UpdateApplication(Application application)
        {
            string applicationId = application.Id;

            string url = $"{endpointUri}/{resourcePrefix}/{applicationId}";

            HttpResponseMessage response = client.PutAsync(url, application.AsJson()).Result;

            if (!response.IsSuccessStatusCode)
            {
                throw new StorageClientException($"PUT failed: {response.StatusCode} - {response.ReasonPhrase}");
            }
            
            string json = response.Content.ReadAsStringAsync().Result;        
            Application result = JsonConvert.DeserializeObject<Application>(json);

            return result;
        }

        /// <summary>
        /// Fetches the application with a given id.
        /// </summary>
        /// <param name="appId">the application id</param>
        /// <returns>the application object</returns>
        public Application GetApplication(string appId) 
        {
            string url = $"{endpointUri}/{resourcePrefix}/{appId}";

            HttpResponseMessage response = client.GetAsync(url).Result;

            if (!response.IsSuccessStatusCode)
            {
                throw new StorageClientException($"GET failed: {response.StatusCode} - {response.ReasonPhrase}");
            }

            string json = response.Content.ReadAsStringAsync().Result;
            Application result = JsonConvert.DeserializeObject<Application>(json);

            return result;
        }

        /// <summary>
        /// Deletes an application in storage.
        /// </summary>
        /// <param name="appId">the application ied</param>
        /// <returns>the application object that was deleted</returns>
        public Application DeleteApplication(string appId)
        {
            string url = $"{endpointUri}/{resourcePrefix}/{appId}?hard=true";

            HttpResponseMessage response = client.DeleteAsync(url).Result;

            if (!response.IsSuccessStatusCode)
            {
                throw new StorageClientException($"DELETE failed: {response.StatusCode} - {response.ReasonPhrase}");
            }
            
            string json = response.Content.ReadAsStringAsync().Result;
            Application result = JsonConvert.DeserializeObject<Application>(json);

            return result;
        }
    }
}
