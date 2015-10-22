using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;


namespace WebApp.Globalization
{

    public enum UnicodeVersion
    {
        V3_2,
    }

    public class UnicodeBlockInfo
    {
        internal UnicodeBlockInfo()
        {
        }

        public CodePoint FirstCodePoint
        {
            get;
            internal set;
        }

        public CodePoint LastCodePoint
        {
            get;
            internal set;
        }

        public string Name
        {
            get;
            internal set;
        }

        public bool IsNotSupported
        {
            get;
            internal set;
        }

        private static Lazy<UnicodeBlockInfo[]> BlocksV3_2 = new Lazy<UnicodeBlockInfo[]>(LazyThreadSafetyMode.PublicationAndExecution, () => new BlockReaderV3_2().Read());

        private static UnicodeBlockInfo Find(UnicodeBlockInfo[] blocks, CodePoint c)
        {
            int i = BinarySearch(blocks, c);
            if (i < 0)
            {
                i = ~i;
                --i;
            }
            var block = blocks[i];
            if (block.LastCodePoint < c)
            {
                return null;
            }
            return block;
        }

        private static int BinarySearch(UnicodeBlockInfo[] blocks, CodePoint c)
        {
            int lo, hi;
            lo = 0;
            hi = blocks.Length - 1;
            while (lo <= hi)
            {
                int mi = lo + (hi - lo) / 2;
                var blockFirstCp = blocks[mi].FirstCodePoint;
                if (blockFirstCp < c)
                {
                    lo = mi + 1;
                }
                else if (c < blockFirstCp)
                {
                    hi = mi - 1;
                }
                else
                {
                    return mi;
                }
            }
            return ~lo;
        }

        public static UnicodeBlockInfo Find(CodePoint c, UnicodeVersion version = UnicodeVersion.V3_2)
        {
            if (c == CodePoint.Null)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (version == UnicodeVersion.V3_2)
            {
                return Find(BlocksV3_2.Value, c);
            }
            throw new ArgumentOutOfRangeException();
        }


    }

    public static class GlobalizationExtensions
    {
        public static bool IsLetter(this UnicodeCategory ucat)
        {
            switch (ucat)
            {
                case UnicodeCategory.LetterNumber:
                case UnicodeCategory.LowercaseLetter:
                case UnicodeCategory.ModifierLetter:
                case UnicodeCategory.OtherLetter:
                case UnicodeCategory.TitlecaseLetter:
                case UnicodeCategory.UppercaseLetter:
                    return true;
            }
            return false;
        }
    }

    public class CodePointDescription
    {
        private static Lazy<Dictionary<CodePoint, CodePointDescription>> DescrFromCodePointV3_2 = 
            new Lazy<Dictionary<CodePoint, CodePointDescription>>(LazyThreadSafetyMode.PublicationAndExecution, () =>
        {
            var list = new UnicodeDataReaderV3_2().Read();
            var dict = new Dictionary<CodePoint, CodePointDescription>(list.Count);
            foreach (var cpd in list)
            {
                dict.Add(cpd.CodePoint, cpd);
            }
            return dict;
        });

        public CodePoint CodePoint { get; internal set; }

        public string Name { get; internal set; }

        public UnicodeCategory Category { get; internal set; }

        public int? DigitValue { get; internal set; }

        public int? IntegralValue { get; internal set; }

        public Fraction? NumericalValue { get; internal set; }

        public static CodePointDescription Find(CodePoint c, UnicodeVersion version = UnicodeVersion.V3_2)
        {
            if (c.IsNull)
            {
                throw new ArgumentNullException();
            }
            if (version == UnicodeVersion.V3_2)
            {
                CodePointDescription descr;
                DescrFromCodePointV3_2.Value.TryGetValue(c, out descr);
                return descr;
            }
            throw new ArgumentOutOfRangeException();
        }
    }

}