using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApp.BusinessLogic
{
    public class BusinessLogicException : Exception
    {
        public BusinessLogicException(string message)
            : base(message)
        {
        }

        public BusinessLogicException(BusinessErrorCode errorCode)
            : base(MessageFromErrorCode(errorCode))
        {
            this.ErrorCode = errorCode;
        }

        private static string MessageFromErrorCode(BusinessErrorCode errorCode)
        {
            switch (errorCode)
            {
                case BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName:
                    return "";
            }
            return errorCode.ToString();
        }

        public BusinessErrorCode ErrorCode { get; private set; }
    }
}
