namespace Altinn.Platform.Storage.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;
    using Altinn.Platform.Storage.Helpers;
    using Altinn.Platform.Storage.Models;
    using Altinn.Platform.Storage.Repository;
    using global::Storage.Interface.Models;
    using Microsoft.AspNetCore.Http.Features;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Azure.Documents;
    using Microsoft.Extensions.Logging;
    using Microsoft.Net.Http.Headers;
    using Newtonsoft.Json;

    /// <summary>
    /// Handles operations for the application instance resource
    /// </summary>
    [Route("storage/api/v1/instances")]
    [ApiController]
    public class InstancesController : Controller
    {
        // private static readonly FormOptions _defaultFormOptions = new FormOptions(); // Added by TK
        private readonly IDataRepository _dataRepository;
        private readonly IInstanceRepository _instanceRepository;
        private readonly IApplicationRepository _applicationRepository;
        private readonly ILogger logger;
        private static readonly FormOptions _defaultFormOptions = new FormOptions();

        /// <summary>
        /// Initializes a new instance of the <see cref="InstancesController"/> class
        /// </summary>
        /// <param name="instanceRepository">the instance repository handler</param>
        /// <param name="applicationRepository">the application repository handler</param>
        /// <param name="logger">the logger</param>
        public InstancesController(
            IInstanceRepository instanceRepository,
            IApplicationRepository applicationRepository,
            ILogger<InstancesController> logger)
        {
            _instanceRepository = instanceRepository;
            _applicationRepository = applicationRepository;
            this.logger = logger;
        }

        /// <summary>
        /// Gets all instances for a given instance owner.
        /// </summary>
        /// <param name="instanceOwnerId">the instance owner id</param>
        /// <returns>list of instances</returns>
        [HttpGet("{instanceOwnerId:int}")]
        public async Task<ActionResult> GetInstanceOwners(int instanceOwnerId)
        {
            List<Instance> result = await _instanceRepository.GetInstancesOfInstanceOwner(instanceOwnerId);
            if (result == null || result.Count == 0)
            {
                return NotFound($"Did not find any instances for instanceOwnerId={instanceOwnerId}");
            }

            return Ok(result);
        }

        /// <summary>
        /// Get all instances for a given org or appId. Only one parameter at the time.
        /// </summary>
        /// <param name="org">application owner</param>
        /// <param name="appId">application id</param>
        /// <returns>list of all instances for given instanceowner</returns>
        /// <!-- GET /instances?org=tdd or GET /instances?appId=tdd/app2 -->
        [HttpGet]
        public async Task<ActionResult> GetMany(string org, string appId)
        {
            if (!string.IsNullOrEmpty(org))
            {
                List<Instance> result = await _instanceRepository.GetInstancesOfOrg(org);
                if (result == null || result.Count == 0)
                {
                    return NotFound($"Did not find any instances for application owner (org)={org}");
                }

                return Ok(result);
            }
            else if (!string.IsNullOrEmpty(appId))
            {                
                List<Instance> result = await _instanceRepository.GetInstancesOfApplication(appId);
                if (result == null || result.Count == 0)
                {
                    return NotFound($"Did not find any instances for applicationId={appId}");
                }

                return Ok(result);
            }

            return BadRequest("Unable to perform query");
        }

        /// <summary>
        /// Gets an instance for a given instance id.
        /// </summary>
        /// <param name="instanceOwnerId">instance owner id.</param>
        /// <param name="instanceGuid">the guid of the instance.</param>
        /// <returns>an instance.</returns>
        [HttpGet("{instanceOwnerId:int}/{instanceGuid:guid}")]
        public async Task<ActionResult> Get(int instanceOwnerId, Guid instanceGuid)
        {
            string instanceId = $"{instanceOwnerId}/{instanceGuid}";

            Instance result;
            try
            {
                result = await _instanceRepository.GetOne(instanceId, instanceOwnerId);

                return Ok(result);
            }
            catch (Exception e)
            {
                return NotFound($"Unable to find instance {instanceId}: {e}");
            }
        }

        /// <summary>
        /// Inserts new instance into the instance collection. 
        /// </summary>
        /// <param name="appId">the applicationid</param>
        /// <param name="instanceOwnerId">instance owner id</param>
        /* /// <param name="instanceTemplate">The instance template to base the new instance on</param> */
        /// <returns>instance object</returns>
        /// <!-- POST /instances?appId={appId}&instanceOwnerId={instanceOwnerId} -->
        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<ActionResult> Post(string appId, int instanceOwnerId)
        {
            DateTime creationTime = DateTime.UtcNow;

            Instance instanceTemplate = null;
            Stream theStream = null;
            string contentType = null;
            string contentFileName = null;
            long fileSize = 0;

            // Check if request has content type multipart.
            if (MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
            {
                // Get the boundary.
                MediaTypeHeaderValue mediaType = MediaTypeHeaderValue.Parse(Request.ContentType);
                string boundary = MultipartRequestHelper.GetBoundary(mediaType, _defaultFormOptions.MultipartBoundaryLengthLimit);
                
                // Read the first part of the Multipart content.
                MultipartReader reader = new MultipartReader(boundary, Request.Body);
                MultipartSection section = reader.ReadNextSectionAsync().Result;
                
                // While the MultipartSection has content.
                while (section != null)
                {
                    bool hasContentDispositionHeader =
                        ContentDispositionHeaderValue.
                        TryParse(section.ContentDisposition, out ContentDispositionHeaderValue contentDisposition);

                    if (hasContentDispositionHeader)
                    {
                        // FLYTT denne til utenfor løkken, instance skal alltid være med. Deretter iterer gjennom de andre elementene i multipart-en.
                        if (section.ContentDisposition.ToString().Contains("instance")
                            && section.ContentType.ToString().Contains("application/json"))
                        {
                            instanceTemplate = JsonConvert.DeserializeObject<Instance>(await section.ReadAsStringAsync());
                        }

                        if (section.ContentDisposition.ToString().Contains("default")
                            && section.ContentType.ToString().Contains("application/xml"))
                        {
                            string body = await section.ReadAsStringAsync();
                            try
                            {
                                contentFileName = contentDisposition.FileName.ToString();
                                fileSize = contentDisposition.Size ?? 0;

                                string dataId = Guid.NewGuid().ToString();

                                string dataLink = $"storage/api/v1/instances/{instanceTemplate.Id}/data/{dataId}";

                                // create new data element, store data in blob
                                DataElement newData = new DataElement
                                {
                                    // update data record
                                    Id = dataId,
                                    ElementType = elementType,
                                    ContentType = contentType,
                                    CreatedBy = User.Identity.Name,
                                    CreatedDateTime = creationTime,
                                    FileName = contentFileName ?? $"{dataId}.xml",
                                    LastChangedBy = User.Identity.Name,
                                    LastChangedDateTime = creationTime,

                                    DataLinks = new ResourceLinks()
                                    {
                                        Apps = dataLink,
                                    },

                                    FileSize = fileSize,
                                };

                                // store file as blob
                                await _dataRepository.CreateDataInStorage(section.ReadAsStringAsync(), newData.StorageUrl);

                                // update instance
                                Instance result = await _instanceRepository.Update(instance);

                                return Ok(result);
                            }
                            catch (Exception e)
                            {
                                return StatusCode(500, $"Unable to create instance data in storage: {e}");
                            }

                            // Save XML to Blob Storage.
                        }
                    }

                    // Drains any remaining section body that has not been consumed and
                    // reads the headers for the next section.
                    section = await reader.ReadNextSectionAsync();
                }

                /*
                theStream = section.Body;
                contentType = section.ContentType;

                bool hasContentDisposition = ContentDispositionHeaderValue.TryParse(
                    section.ContentDisposition, out ContentDispositionHeaderValue contentDisposition);

                if (hasContentDisposition)
                {
                    contentFileName = contentDisposition.FileName.ToString();
                }

                // For å kjøre en loop med evt flere filer å lagre i databasen:
                // while (reader.ReadNextSectionAsync() != null)

                // Check if multipart content is "instance" and ContentType is "application/json".
                if (section.ContentDisposition.ToString().Contains("instance")
                    && section.ContentType.ToString().Contains("application/json"))
                {
                    instanceTemplate = JsonConvert.DeserializeObject<Instance>(section.Body.ToString());

                }

                // Check if multipart content is "default" and ContentType is "application/xml".
                if (section.ContentDisposition.ToString().Contains("default")
                    && section.ContentType.Contains("application/xml"))
                {
                    // Upload XML file to Blob Storage
                    section.Body
                }*/
            }

            if (instanceTemplate == null && instanceOwnerId == 0)
            {
                return BadRequest("Missing parameter values: instanceOwnerId must be set");
            }
            else if (instanceOwnerId == 0 && (instanceTemplate != null && string.IsNullOrEmpty(instanceTemplate.InstanceOwnerId))) 
            {
                return BadRequest("Missing parameter values: instanceOwnerId must be set");
            }

            if (instanceOwnerId == 0 && instanceTemplate != null)
            {
                instanceOwnerId = int.Parse(instanceTemplate.InstanceOwnerId);
            }

            if (instanceTemplate == null)
            {
                instanceTemplate = new Instance();
            }

            // TODO - also check instanceOwnerLookup!!

            // check if metadata exists
            Application appInfo;
            try
            {
                appInfo = GetApplicationInformation(appId);
            }
            catch (DocumentClientException dce)
            {
                if (dce.Error.Code.Equals("NotFound"))
                {
                    return NotFound($"Did not find application with appId={appId}");
                }
                else
                {
                    return StatusCode(500, $"Document database error: {dce}");
                }
            }
            catch (Exception e) 
            {
                return StatusCode(500, $"Unable to perform request: {e}");
            }

            DateTime creationTime = DateTime.UtcNow;

            string org = appInfo.Org;

            Instance createdInstance = new Instance()
            {
                InstanceOwnerId = instanceOwnerId.ToString(),
                CreatedBy = User.Identity.Name,
                CreatedDateTime = creationTime,
                LastChangedBy = User.Identity.Name,
                LastChangedDateTime = creationTime,
                AppId = appId,
                Org = org,

                VisibleDateTime = instanceTemplate.VisibleDateTime,
                DueDateTime = instanceTemplate.DueDateTime,
                Labels = instanceTemplate.Labels,
                PresentationField = instanceTemplate.PresentationField,

                Workflow = new WorkflowState { CurrentStep = "FormFilling", IsComplete = false },
                InstanceState = new InstanceState { IsArchived = false, IsDeleted = false, IsMarkedForHardDelete = false },                
            };

            try
            {
                Instance result = await _instanceRepository.Create(createdInstance);
                return Ok(result);
            }
            catch (Exception e)
            {
                logger.LogError($"Unable to create {appId} instance for {instanceOwnerId} due to {e}");
                return StatusCode(500, $"Unable to create {appId} instance for {instanceOwnerId} due to {e}");
            }
        }

        /// <summary>
        /// Updates an instance
        /// </summary>
        /// <param name="instanceOwnerId">instance owner</param>
        /// <param name="instanceGuid">instance id</param>
        /// <param name="instance">instance</param>
        /// <returns></returns>        
        [HttpPut("{instanceOwnerId:int}/{instanceGuid:guid}")]
        public async Task<ActionResult> Put(int instanceOwnerId, Guid instanceGuid, [FromBody] Instance instance)
        {
            string instanceId = $"{instanceOwnerId}/{instanceGuid}";

            Instance existingInstance;
            try
            {
                existingInstance = await _instanceRepository.GetOne(instanceId, instanceOwnerId);
            }
            catch (Exception e)
            {
                string message = $"Unable to find instance {instanceId} to update: {e}";
                logger.LogError(message);

                return NotFound(message);
            }

            existingInstance.AppOwnerState = instance.AppOwnerState;
            existingInstance.Workflow = instance.Workflow;
            existingInstance.InstanceState = instance.InstanceState;

            existingInstance.PresentationField = instance.PresentationField;
            existingInstance.DueDateTime = instance.DueDateTime;
            existingInstance.VisibleDateTime = instance.VisibleDateTime;
            existingInstance.Labels = instance.Labels;

            existingInstance.LastChangedBy = User.Identity.Name;
            existingInstance.LastChangedDateTime = DateTime.UtcNow;

            Instance result;
            try
            {
                result = await _instanceRepository.Update(existingInstance);
            }
            catch (Exception e) 
            {
                return StatusCode(500, $"Unable to update instance object {instanceId}: {e.Message}");
            }            

            return Ok(result);
        }

        /// <summary>
        /// Delete an instance
        /// </summary>
        /// <param name="instanceGuid">instance id</param>
        /// <param name="instanceOwnerId">instance owner</param>
        /// <param name="hard">if true hard delete will take place</param>
        /// <returns>updated instance object</returns>
        /// DELETE /instances/{instanceId}?instanceOwnerId={instanceOwnerId}
        [HttpDelete("{instanceOwnerId:int}/{instanceGuid:guid}")]
        public async Task<ActionResult> Delete(Guid instanceGuid, int instanceOwnerId, bool? hard)
        {
            string instanceId = $"{instanceOwnerId}/{instanceGuid}";

            Instance instance;
            try
            {
                instance = await _instanceRepository.GetOne(instanceId, instanceOwnerId);
            }
            catch (DocumentClientException dce)
            {
                if (dce.Error.Code.Equals("NotFound"))
                {
                    return NotFound($"Didn't find the object that should be deleted with instanceId={instanceId}");
                }

                return StatusCode(500, $"Unknown database exception in delete: {dce}");
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Unknown exception in delete: {e}");
            }

            if (hard.HasValue && hard == true)
            {
                try
                {
                    await _instanceRepository.Delete(instance);

                    return Ok(true);                    
                }
                catch (Exception e)
                {
                    return StatusCode(500, $"Unknown exception in delete: {e}");
                }
            }
            else
            {
                instance.InstanceState.IsDeleted = true;
                instance.LastChangedBy = User.Identity.Name;
                instance.LastChangedDateTime = DateTime.UtcNow;

                try
                {
                    Instance softDeletedInstance = await _instanceRepository.Update(instance);
                    
                    return Ok(softDeletedInstance);                    
                }
                catch (Exception e)
                {
                    return StatusCode(500, $"Unknown exception in delete: {e}");
                }
            }
        }

        private Application GetApplicationInformation(string appId)
        {
            string org = appId.Split("/")[0];

            Application application = _applicationRepository.FindOne(appId, org).Result;

            return application;
        }
    }
}
