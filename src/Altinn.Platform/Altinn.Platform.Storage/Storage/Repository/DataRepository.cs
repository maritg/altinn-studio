using System;
using System.IO;
using System.Threading.Tasks;
using Altinn.Platform.Storage.Configuration;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
using Microsoft.WindowsAzure.Storage.Blob;

namespace Altinn.Platform.Storage.Repository
{
    /// <summary>
    /// repository for form data
    /// </summary>
    public class DataRepository : IDataRepository
    {
        private readonly Uri _databaseUri;
        private readonly Uri _collectionUri;
        private readonly string databaseId;
        private readonly string collectionId;
        private static DocumentClient _client;
        private readonly AzureCosmosSettings _cosmosettings;
        private readonly AzureStorageConfiguration _storageConfiguration;
        private CloudBlobClient blobClient;
        private CloudBlobContainer container;

        /// <summary>
        /// Initializes a new instance of the <see cref="DataRepository"/> class
        /// </summary>
        /// <param name="cosmosettings">the configuration settings for azure cosmos database</param>
        /// <param name="storageConfiguration">the storage configuration for azure blob storage</param>
        public DataRepository(IOptions<AzureCosmosSettings> cosmosettings, IOptions<AzureStorageConfiguration> storageConfiguration)
        {
            // Retrieve configuration values from appsettings.json
            _cosmosettings = cosmosettings.Value;
            _client = new DocumentClient(new Uri(_cosmosettings.EndpointUri), _cosmosettings.PrimaryKey);
            _databaseUri = UriFactory.CreateDatabaseUri(_cosmosettings.Database);
            _collectionUri = UriFactory.CreateDocumentCollectionUri(_cosmosettings.Database, _cosmosettings.Collection);
            databaseId = _cosmosettings.Database;
            collectionId = _cosmosettings.Collection;
            _client.CreateDatabaseIfNotExistsAsync(new Database { Id = _cosmosettings.Database }).GetAwaiter().GetResult();
            _client.CreateDocumentCollectionIfNotExistsAsync(
                _databaseUri,
                new DocumentCollection { Id = _cosmosettings.Collection }).GetAwaiter().GetResult();
            _storageConfiguration = storageConfiguration.Value;

            // connect to azure blob storage
            StorageCredentials storageCredentials = new StorageCredentials(_storageConfiguration.AccountName, _storageConfiguration.AccountKey);
            CloudStorageAccount storageAccount = new CloudStorageAccount(storageCredentials, true);

            blobClient = CreateBlobClient(storageCredentials, storageAccount);
            container = blobClient.GetContainerReference(_storageConfiguration.StorageContainer);
        }

        private CloudBlobClient CreateBlobClient(StorageCredentials storageCredentials, CloudStorageAccount storageAccount)
        {
            CloudBlobClient blobClient;
            if (_storageConfiguration.AccountName.StartsWith("devstoreaccount1"))
            {
                StorageUri storageUrl = new StorageUri(new Uri(_storageConfiguration.BlobEndPoint));
                blobClient = new CloudBlobClient(storageUrl, storageCredentials);
            }
            else
            {
                blobClient = storageAccount.CreateCloudBlobClient();
            }

            return blobClient;
        }

        /// <summary>
        /// Creates a file in blob storage.
        /// </summary>
        /// <param name="fileStream">The file stream to read from</param>
        /// <param name="fileName">The file name to writ to</param>
        /// <returns></returns>
        public async Task<bool> CreateDataInStorage(Stream fileStream, string fileName)
        {
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);

            await blockBlob.UploadFromStreamAsync(fileStream);
            return await Task.FromResult(true);
        }
       
        /// <summary>
        /// Updates a file in blob storage.
        /// </summary>
        /// <param name="fileStream">the stream to update from</param>
        /// <param name="fileName">the name of the file to update</param>
        /// <returns></returns>
        public async Task<bool> UpdateDataInStorage(Stream fileStream, string fileName)
        {
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);

            await blockBlob.UploadFromStreamAsync(fileStream);
            return await Task.FromResult(true);
        }

        /// <summary>
        /// Retrieves a file as a stream from blob storage.
        /// </summary>
        /// <param name="fileName">the file to retrieve</param>
        /// <returns></returns>
        public async Task<Stream> GetDataInStorage(string fileName)
        {
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);

            var memoryStream = new MemoryStream();
            await blockBlob.DownloadToStreamAsync(memoryStream);
            memoryStream.Position = 0;
            return memoryStream;
        }

        /// <summary>
        /// Deletes a file in blob storage.
        /// </summary>
        /// <param name="fileName">the file to delete</param>
        /// <returns></returns>
        public async Task<bool> DeleteDataInStorage(string fileName)
        {           
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);

            bool result = await blockBlob.DeleteIfExistsAsync();

            return result;
        }
    }
}
