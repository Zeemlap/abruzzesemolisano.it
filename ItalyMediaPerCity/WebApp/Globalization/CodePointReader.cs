using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace WebApp.Globalization
{
    public struct CodePointReader
    {
        private StreamReader streamReader;
        private bool throwOnInvalidUtf16;
        private int codeUnitBuffer;

        public CodePointReader(StreamReader streamReader, bool throwOnInvalidUtf16 = false)
        {
            if (streamReader == null)
            {
                throw new ArgumentNullException();
            }
            this.streamReader = streamReader;
            this.throwOnInvalidUtf16 = throwOnInvalidUtf16;
            this.codeUnitBuffer = -1;
        }

        public CodePoint Next()
        {
            int cp;
            if (this.codeUnitBuffer < 0)
            {
                cp = this.streamReader.Read();
                if (cp == -1)
                {
                    return CodePoint.Null;
                }
            }
            else
            {
                cp = this.codeUnitBuffer;
                this.codeUnitBuffer = -1;
            }
            if (cp >= 0xD800 && cp <= 0xDFFF)
            {
                if (cp >= 0xDC00)
                {
                    goto invalidUtf16;
                }
                int t = this.streamReader.Read();
                if (t < 0)
                {
                    goto invalidUtf16;
                }
                if (t < 0xDC00 || t > 0xDFFF)
                {
                    this.codeUnitBuffer = t;
                    goto invalidUtf16;
                }
                cp = (((cp - 0xD800) << 10) | (t - 0xDC00)) + 0x10000; 
            }
            return new CodePoint(cp);
        invalidUtf16:
            if (this.throwOnInvalidUtf16)
            {
                throw new InvalidDataException("The underlying StreamReader contains invalid UTF-16.");
            }
            return new CodePoint(cp);
        }
    }
}
