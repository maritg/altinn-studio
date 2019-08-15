using System.Collections.Generic;

namespace Altinn.Authorization.ABAC.Xacml.JsonProfile
{
    /// <summary>
    /// The Category object corresponds to the XML <Attributes /> element. Just like the <Attributes /> element is specific to a given XACML
    /// attribute category, the Category object in JSON is specific to a given XACML attribute category.
    /// http://docs.oasis-open.org/xacml/xacml-json-http/v1.1/csprd01/xacml-json-http-v1.1-csprd01.html
    /// </summary>
    public class XacmlJsonCategory
    {
        /// <summary>
        /// Sets or gets the CategoryId.
        /// Mandatory for a Category object in the "Category" member array; otherwise, optional. See section 4.2.2.2.
        /// </summary>
        public string CategoryId { get; set; }

        /// <summary>
        /// The Id of the category, mappes to attributeId in xml version of ContextRequest 
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Optional XML conten
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// A list over all attributes for a given attribute Id mappes to the 
        /// </summary>
        public List<XacmlJsonAttribute> Attribute { get; set; }
    }
}
