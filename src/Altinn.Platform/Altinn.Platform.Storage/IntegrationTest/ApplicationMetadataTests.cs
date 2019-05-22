using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using Altinn.Platform.Storage.Client;
using Altinn.Platform.Storage.IntegrationTest.Fixtures;
using Altinn.Platform.Storage.Models;
using Newtonsoft.Json;
using Serilog;
using Serilog.Core;
using Storage.Interface.Clients;
using Xunit;

namespace Altinn.Platform.Storage.IntegrationTest
{
    /// <summary>
    /// test application controller.
    /// </summary>
    public class ApplicationMetadataTests : IClassFixture<PlatformStorageFixture>, IDisposable
    {
        private readonly PlatformStorageFixture fixture;
        private readonly HttpClient client;
        private readonly ApplicationMetadataClient applicationClient;
        private readonly string versionPrefix = "/storage/api/v1";
        private readonly string applicationOwnerId = "TEST";

        private Logger logger = new LoggerConfiguration()
            .WriteTo.Console()
            .CreateLogger();

        /// <summary>
        /// Initializes a new instance of the <see cref="ApplicationMetadataTests"/> class.
        /// </summary>
        /// <param name="fixture">the fixture object which talks to the SUT (System Under Test)</param>
        public ApplicationMetadataTests(PlatformStorageFixture fixture)
        {
            this.fixture = fixture;
            this.client = this.fixture.Client;
            this.applicationClient = new ApplicationMetadataClient(this.client);
        }

        /// <summary>
        /// Make sure repository is cleaned after the tests is run.
        /// </summary>
        public void Dispose()
        {
            string listUri = $"{versionPrefix}/applications?applicationOwnerId={applicationOwnerId}";

            HttpResponseMessage listResponse = client.GetAsync(listUri).Result;

            if (listResponse.IsSuccessStatusCode)
            {
                string json = listResponse.Content.ReadAsStringAsync().Result;
           
                List<ApplicationMetadata> applications = JsonConvert.DeserializeObject<List<ApplicationMetadata>>(json);

                foreach (ApplicationMetadata app in applications)
                {
                    string applicationId = app.Id;

                    string deleteUri = $"{versionPrefix}/applications/{applicationId}?hard=true";

                    client.DeleteAsync(deleteUri);
                }
            }
            else
            {
                string json = listResponse.Content.ReadAsStringAsync().Result;

                logger.Error(json);
            }
        }

        private ApplicationMetadata CreateApplicationMetadata(string applicationId)
        {
            ApplicationMetadata appInfo = new ApplicationMetadata()
            {
                Id = applicationId,
                VersionId = "r33",
                Title = new Dictionary<string, string>(),
                ApplicationOwnerId = applicationOwnerId,
            };

            appInfo.Title.Add("nb", "Tittel");

            return appInfo;
        }

        /// <summary>
        /// Create an application metadata object.
        /// </summary>
        [Fact]
        public async void CreateApplicationMetadataHappyDays()
        {
            string applicationId = "TEST-app20";
            string requestUri = $"{versionPrefix}/applications?applicationId={applicationId}";

            ApplicationMetadata appInfo = CreateApplicationMetadata(applicationId);

            HttpResponseMessage postResponse = await client.PostAsync(requestUri, appInfo.AsJson());

            postResponse.EnsureSuccessStatusCode();

            string content = postResponse.Content.ReadAsStringAsync().Result;

            logger.Information(content);
        }

        /// <summary>
        /// Create an applicaiton metadata object with wrong application id format.
        /// </summary>
        [Fact]
        public async void CreateApplicationWrongFormatApplicationId()
        {
            string applicationId = "TEST/app";

            string requestUri = $"{versionPrefix}/applications?applicationId={applicationId}";

            ApplicationMetadata appInfo = CreateApplicationMetadata(applicationId);

            HttpResponseMessage postResponse = await client.PostAsync(requestUri, appInfo.AsJson());

            Assert.Equal(HttpStatusCode.BadRequest, postResponse.StatusCode);
        }

        /// <summary>
        /// Soft delet an application.
        /// </summary>
        [Fact]
        public async void SoftdeleteApplication()
        {
            string applicationId = "TEST-app21";
            string requestUri = $"{versionPrefix}/applications?applicationId={applicationId}";

            ApplicationMetadata appInfo = CreateApplicationMetadata(applicationId);

            HttpResponseMessage postResponse = await client.PostAsync(requestUri, appInfo.AsJson());
            
            postResponse.EnsureSuccessStatusCode();

            string json = await postResponse.Content.ReadAsStringAsync();
            ApplicationMetadata existingApplication = JsonConvert.DeserializeObject<ApplicationMetadata>(json);

            // do the delete
            requestUri = $"{versionPrefix}/applications/{applicationId}";            
            HttpResponseMessage deleteResponse = await client.DeleteAsync(requestUri);

            deleteResponse.EnsureSuccessStatusCode();

            string content = await deleteResponse.Content.ReadAsStringAsync();
            ApplicationMetadata softDeletedApplication = JsonConvert.DeserializeObject<ApplicationMetadata>(content);

            Assert.NotEqual(softDeletedApplication.ValidTo, existingApplication.ValidTo);

            Assert.True(softDeletedApplication.ValidTo < DateTime.UtcNow);
        }

        /// <summary>
        /// Create an application, read one, update it and get it one more time.
        /// </summary>
        [Fact]
        public async void GetAndUpdateApplication()
        {
            string applicationId = "TEST-app22";

            string requestUri = $"{versionPrefix}/applications?applicationId={applicationId}";
           
            ApplicationMetadata appInfo = CreateApplicationMetadata(applicationId);

            // create one
            HttpResponseMessage postResponse = await client.PostAsync(requestUri, appInfo.AsJson());

            postResponse.EnsureSuccessStatusCode();

            requestUri = $"{versionPrefix}/applications/{applicationId}";

            // read one
            HttpResponseMessage getResponse = await client.GetAsync(requestUri);

            getResponse.EnsureSuccessStatusCode();

            string json = await getResponse.Content.ReadAsStringAsync();
            ApplicationMetadata application = JsonConvert.DeserializeObject<ApplicationMetadata>(json);                

            application.MaxSize = 2000;

            // update it
            HttpResponseMessage putResponse = await client.PutAsync(requestUri, application.AsJson());

            putResponse.EnsureSuccessStatusCode();

            // get it again
            HttpResponseMessage getResponse2 = await client.GetAsync(requestUri);

            getResponse2.EnsureSuccessStatusCode();

            string json2 = await getResponse2.Content.ReadAsStringAsync();
            ApplicationMetadata application2 = JsonConvert.DeserializeObject<ApplicationMetadata>(json2);

            Assert.Equal(application.MaxSize, application2.MaxSize);
        }       
    }
}
