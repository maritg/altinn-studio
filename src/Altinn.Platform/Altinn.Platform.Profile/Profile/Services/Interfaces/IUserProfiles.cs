using System.Threading.Tasks;
using AltinnCore.ServiceLibrary.Models;

namespace Altinn.Platform.Profile.Services.Interfaces
{
    /// <summary>
    /// Interface handling methods for operations related to users
    /// </summary>
    public interface IUserProfiles
    {
        /// <summary>
        /// Method that fetches a user based on a user id
        /// </summary>
        /// <param name="userId">The user id</param>
        /// <returns></returns>
        Task<UserProfile> GetUser(int userId);
    }
}
