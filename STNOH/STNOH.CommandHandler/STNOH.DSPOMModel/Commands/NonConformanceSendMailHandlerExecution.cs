using System;

using NSOFT.STNOH.STNOH.DSPOMModel.Commands.Published;
using Siemens.SimaticIT.Unified.Common;
using Siemens.SimaticIT.Unified;

namespace NSOFT.STNOH.STNOH.DSPOMModel.Commands
{
    /// <summary>
    /// Class initialize
    /// </summary>
    public partial class NonConformanceSendMailHandlerShell : ICompositeCommandHandler
    {
        private IUnifiedSdkComposite platform;
        
        /// <summary>
        /// Execute
        /// </summary>
        /// <param name="unifiedSdkComposite"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public Response Execute(IUnifiedSdkComposite unifiedSdkComposite, ICommand command)
        {
            platform = unifiedSdkComposite;

            return NonConformanceSendMailHandler((NonConformanceSendMail)command);
        }

        /// <summary>
        /// Retrieve the type of the command
        /// </summary>
        public global::System.Type GetCommandType()
        {
            return typeof(NonConformanceSendMail);
        }
    }
}
