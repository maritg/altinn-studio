using Newtonsoft.Json;

namespace Altinn.Platform.Storage.Models
{
    /// <summary>
    /// A subscription hook uses an existing T2 service to evaluate if the instanceOwnerId can instantiate the app.
    /// </summary>
    public class SubscriptionHook
    {

        /// <summary>
        /// The service code
        /// </summary>
        [JsonProperty(PropertyName = "serviceCode")]
        public string ServiceCode { get; set; }

        /// <summary>
        ///  The edition code
        /// </summary>
        [JsonProperty(PropertyName = "editionCode")]
        public string EditionCode { get; set; }
    }
}
