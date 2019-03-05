using System;
using System.Collections.Generic;
using System.Text;

namespace AltinnCore.Common.Services.Interfaces
{
    /// <summary>
    /// Interface for handling form data related operations
    /// </summary>
    public interface IFormData
    {
        /// <summary>
        /// Gets the form data
        /// </summary>
        string GetFormData();

        /// <summary>
        /// Stores the form data
        /// </summary>
        string SaveInstance<T>(T dataToSerialize);
    }
}
