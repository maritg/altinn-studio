using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using Altinn.Platform.Storage.Client;
using Altinn.Platform.Storage.IntegrationTest.Fixtures;
using Altinn.Platform.Storage.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Storage.Interface.Clients;
using Storage.Interface.Models;
using Xunit;

namespace Altinn.Platform.Storage.IntegrationTest
{
    /// <summary>
    ///  Tests dataservice REST api.
    /// </summary>
    public class InstanceStorageTests : IClassFixture<PlatformStorageFixture>, IDisposable
    {
        private readonly PlatformStorageFixture fixture;
        private readonly HttpClient client;
        private InstanceClient storageClient;
        private string instanceId;
        private readonly string testOrg = "tests";
        private string testAppId = "tests/sailor";
        private readonly int testInstanceOwnerId = 500;
        private readonly string elementType = "default";

        private readonly string versionPrefix = "/storage/api/v1";

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceStorageTests"/> class.
        /// </summary>
        /// <param name="fixture">the fixture object which talks to the SUT (System Under Test)</param>
        public InstanceStorageTests(PlatformStorageFixture fixture)
        {
            this.fixture = fixture;
            this.client = this.fixture.Client;
            this.storageClient = new InstanceClient(this.client);

            CreateTestApplication();
        }

        /// <summary>
        /// Make sure repository is cleaned after the tests is run.
        /// </summary>
        public void Dispose()
        {
            string requestUri = $"{versionPrefix}/instances?org={testOrg}";            

            HttpResponseMessage response = client.GetAsync(requestUri).Result;
            string content = response.Content.ReadAsStringAsync().Result;

            if (response.StatusCode == HttpStatusCode.OK)
            {
                List<Instance> instances = JsonConvert.DeserializeObject<List<Instance>>(content);

                foreach (Instance instance in instances)
                {
                    string url = $"{versionPrefix}/instances/{instance.Id}";

                    if (instance.Data != null)
                    {
                        foreach (DataElement element in instance.Data)
                        {
                            string filename = element.StorageUrl;
                            string dataUrl = "/data/" + element.Id;

                            string dataDeleteUrl = url + dataUrl;

                            client.DeleteAsync(dataDeleteUrl);
                        }
                    }

                    string instanceUrl = $"{versionPrefix}/instances/{instance.Id}?hard=true";
                    client.DeleteAsync(instanceUrl);
                }
            }

            DeleteApplicationMetadata();
        }

        /// <summary>
        /// Creates an instance of a service and asks then asks the service to get the instance. Checks if returned object has
        /// same values as object which was sent in.
        /// </summary>
        [Fact]
        public async void CreateInstanceReturnsNewIdAndNextGetReturnsSameId()
        {           
            Instance instanceData = new Instance
            {
                AppId = testAppId,
                InstanceOwnerId = testInstanceOwnerId.ToString(),
            };

            string url = $"{versionPrefix}/instances?appId={testAppId}";         

            HttpResponseMessage postResponse = await client.PostAsync(url, instanceData.AsJson());

            postResponse.EnsureSuccessStatusCode();
            string instanceJson = await postResponse.Content.ReadAsStringAsync();
            Instance createdInstance = JsonConvert.DeserializeObject<Instance>(instanceJson);

            instanceId = createdInstance.Id;
            Assert.NotNull(instanceId);

            HttpResponseMessage getResponse = await client.GetAsync($"{versionPrefix}/instances/{instanceId}");

            getResponse.EnsureSuccessStatusCode();

            string json = await getResponse.Content.ReadAsStringAsync();
            Instance actual = JsonConvert.DeserializeObject<Instance>(json);

            Assert.Equal(createdInstance.Id, actual.Id);

            Assert.Equal(testInstanceOwnerId.ToString(), actual.InstanceOwnerId);
            Assert.Equal(testAppId, actual.AppId);
        }

        /// <summary>
        ///  Checks that the GET returns a proper encoding.
        /// </summary>
        [Fact]
        public async void GetInstancesAndCheckEncoding()
        {
            await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string url = $"{versionPrefix}/instances/{testInstanceOwnerId}";
            HttpResponseMessage response = await client.GetAsync(url);

            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
        }

        /// <summary>
        ///  Checks that the GET returns an instance owners codes
        /// </summary>
        [Fact]
        public async void GetInstancesForInstanceOwner()
        {
            await storageClient.PostInstances(testAppId, testInstanceOwnerId);
            await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string url = $"{versionPrefix}/instances/{testInstanceOwnerId}";
            HttpResponseMessage response = await client.GetAsync(url);

            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();
            List<Instance> instances = JsonConvert.DeserializeObject<List<Instance>>(json);

            Assert.Equal(2, instances.Count);
        }

        /// <summary>
        ///  Checks that multiple instances can be returned with org query param.
        /// </summary>
        [Fact]
        public async void GetInstancesForOrg()
        {
            await storageClient.PostInstances(testAppId, testInstanceOwnerId);
            await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string url = $"{versionPrefix}/instances?org={testOrg}";
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();
            List<Instance> instances = JsonConvert.DeserializeObject<List<Instance>>(json);

            Assert.Equal(2, instances.Count);
        }

        /// <summary>
        ///  Checks that multiple instances can be returned with query param.
        /// </summary>
        [Fact]
        public async void GetInstancesWithContinuationTokenAndHAL()
        {
            Instance instance1 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);
            Instance instance2 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string url = $"{versionPrefix}/instances?appId={testAppId}&size=1";

            client.DefaultRequestHeaders.Add("Accept", "application/hal+json");

            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            string contentType = response.Content.Headers.ContentType.ToString();

            Assert.Contains("application/hal+json", contentType);

            string jsonString = await response.Content.ReadAsStringAsync();
            JObject jsonObject = JObject.Parse(jsonString);
            var result = jsonObject["_embedded"]["instances"];

            List<Instance> instances = result.ToObject<List<Instance>>();
            Assert.Single(instances);

            var nextUrl = jsonObject["_links"]["next"]["href"].ToString();

            HttpResponseMessage response2 = await client.GetAsync(nextUrl);
            response2.EnsureSuccessStatusCode();

            string jsonString2 = await response2.Content.ReadAsStringAsync();
            JObject jsonObject2 = JObject.Parse(jsonString2);

            var result2 = jsonObject2["_embedded"]["instances"];
            List<Instance> instances2 = result2.ToObject<List<Instance>>();
            Assert.Single(instances2);          

            var nextUrl2 = jsonObject2["_links"]["next"];
            Assert.Null(nextUrl2);
        }

        /// <summary>
        ///  Checks that multiple instances can be returned with org query param.
        /// </summary>
        [Fact]
        public async void GetInstancesAsJson()
        {
            Instance instance1 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);
            Instance instance2 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string url = $"{versionPrefix}/instances?appId={testAppId}";

            client.DefaultRequestHeaders.Add("Accept", "application/json");

            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            string contentType = response.Content.Headers.ContentType.ToString();

            Assert.Contains("application/json", contentType);

            string jsonString = await response.Content.ReadAsStringAsync();

            Assert.True(true);
        }

        /// <summary>
        /// Store a json file.
        /// </summary>
        [Fact]
        public async void StoreAForm()
        {
            object jsonContent = new
            {
                universe = 42,
                årsjul = 365,
                text = "Fem flotte åer er bedre en to ærlige øl!",
            };

            // create instance
            Instance newInstance = await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string requestUri = $"{versionPrefix}/instances/{newInstance.Id}/data?elementType={elementType}";

            // post the file
            HttpResponseMessage postResponse = await client.PostAsync(requestUri, jsonContent.AsJson());

            postResponse.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Store a binary file.
        /// </summary>
        [Fact]
        public async void StoreABinaryFile()
        {
            string applicationId = testAppId;
            int instanceOwnerId = testInstanceOwnerId;

            Instance instance = await storageClient.PostInstances(applicationId, instanceOwnerId);
            string requestUri = $"{versionPrefix}/instances/{instance.Id}/data?elementType={elementType}";
            
            using (Stream input = File.OpenRead("data/binary_file.pdf"))
            {
                HttpContent fileStreamContent = new StreamContent(input);

                using (MultipartFormDataContent formData = new MultipartFormDataContent())
                {
                    formData.Add(fileStreamContent, elementType, "binary_file.pdf");
                    HttpResponseMessage response = await client.PostAsync(requestUri, formData);

                    response.EnsureSuccessStatusCode();
                }
            }
        }

        private Application CreateTestApplication()
        {
            ApplicationClient appClient = new ApplicationClient(client);

            try
            {
                Application existingApp = appClient.GetApplication(testAppId);
                return existingApp;
            }
            catch (Exception)
            {
                // do nothing.
            }

            LanguageString title = new LanguageString
            {
                { "nb", "Testapplikasjon" },
                { "en", "Test application" }
            };

            return appClient.CreateApplication(testAppId, title);
        }

        private Application DeleteApplicationMetadata()
        {
            ApplicationClient appClient = new ApplicationClient(client);

            Application existingApp = appClient.DeleteApplication(testAppId);

            return existingApp;
        }

        /// <summary>
        /// Read a binary file.
        /// </summary>
        [Fact]
        public async void GetABinaryFile()
        {
            string applicationId = testAppId;
            int instanceOwnerId = testInstanceOwnerId;

            Instance instance = await storageClient.PostInstances(applicationId, instanceOwnerId);           

            Instance instance2 = await storageClient.PostDataReadFromFile(instance.Id, "binary_file.pdf", "application/pdf");
            
            string dataId = instance2.Data.Find(m => m.ElementType.Equals("default")).Id;

            string requestUri = $"{versionPrefix}/instances/{instance2.Id}/data/{dataId}";
            
            using (HttpResponseMessage response = await client.GetAsync(requestUri, HttpCompletionOption.ResponseHeadersRead))
            {
                if (response.IsSuccessStatusCode)
                {
                    using (Stream remoteStream = await response.Content.ReadAsStreamAsync())
                    using (var output = File.Create("test.pdf"))
                    {
                        await remoteStream.CopyToAsync(output);
                    }
                }
            }
        }

        /// <summary>
        ///  update an existing data file.
        /// </summary>
        [Fact]
        public async void UpdateDataFile()
        {
            string applicationId = testAppId;
            int instanceOwnerId = testInstanceOwnerId;

            Instance instance = await storageClient.PostInstances(applicationId, instanceOwnerId);
            
            instance = await storageClient.PostDataReadFromFile(instance.Id, "binary_file.pdf", "application/pdf");
            
            string dataId = instance.Data.Find(m => m.ElementType.Equals("default")).Id;

            string requestUri = $"{versionPrefix}/instances/{instance.Id}/data/{dataId}";
            
            string dataFile = "image.png";

            using (Stream input = File.OpenRead($"data/{dataFile}"))
            {
                HttpContent fileStreamContent = new StreamContent(input);

                using (MultipartFormDataContent dataContent = new MultipartFormDataContent())
                {
                    dataContent.Add(fileStreamContent, elementType, dataFile);
                    HttpResponseMessage response = client.PutAsync(requestUri, dataContent).Result;

                    response.EnsureSuccessStatusCode();
                }
            }
        }

        /// <summary>
        /// create two instances and check if they can be fetched for a given application owner.
        /// </summary>
        [Fact]
        public async void QueryInstancesOnApplicationOwnerId()
        {
            Instance i1 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);
            Instance i2 = await storageClient.PostInstances(testAppId, testInstanceOwnerId);

            string requestUri = $"{versionPrefix}/instances?org={testOrg}";            

            HttpResponseMessage response = await client.GetAsync(requestUri);

            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();
            List<Instance> instances = JsonConvert.DeserializeObject<List<Instance>>(json);

            Assert.Equal(2, instances.Count);            
        }
    }
}
