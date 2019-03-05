using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Serialization;
using AltinnCore.Common.Configuration;
using AltinnCore.Common.Models;
using AltinnCore.Common.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace AltinnCore.Common.Services.Implementation
{
    /// <summary>
    /// Service implementation for form data
    /// </summary>
    public class FormDataSI : IFormData
    {
        private readonly DataServiceSettings _settings;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="FormDataSI"/> class.
        /// </summary>
        /// <param name="repositorySettings">The service repository settings</param>
        /// <param name="httpContextAccessor">The http context accessor</param>
        /// <param name="testdataRepositorySettings">Test data repository settings</param>
        public FormDataSI(IOptions<DataServiceSettings> dataServiceSettings, IHttpContextAccessor httpContextAccessor)
        {
            _settings = dataServiceSettings.Value;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// This method gets the form data
        /// </summary>
        public string GetFormData()
        {
            using (HttpClient client = new HttpClient())
            {
                string apiUrl = "http://altinn3.no/dataserviceapi/formdataapi";
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                Task<HttpResponseMessage> response = client.GetAsync(apiUrl);

                if (response.Result.IsSuccessStatusCode)
                {
                    try
                    {
                        using (Stream stream = response.Result.Content.ReadAsStreamAsync().Result)
                        {
                            StreamReader reader = new StreamReader(stream);
                            string text = reader.ReadToEnd();
                        }
                    }
                    catch
                    {
                        return string.Empty;
                    }
                }

                return string.Empty;
            }
        }

        /// <summary>
        /// This method saves the form data
        /// </summary>
        public string SaveInstance<T>(T dataToSerialize)
        {
            using (HttpClient client = new HttpClient())
            {
                string apiUrl = "http://altinn3.no/dataserviceapi/reporteeelement";
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                try
                {
                    MemoryStream formDataStream = new MemoryStream();

                    var jsonData = JsonConvert.SerializeObject(dataToSerialize);
                    StreamWriter writer = new StreamWriter(formDataStream);
                    writer.Write(jsonData);
                    writer.Flush();
                    formDataStream.Position = 0;
                    Task<HttpResponseMessage> response = client.PostAsync(apiUrl, new StreamContent(formDataStream));
                }
                catch
                {
                    return string.Empty;
                }
                
                return string.Empty;
            }
        }

    }
}
