using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web;

namespace WebApp.Globalization
{
    internal class UnicodeDataReaderV3_2
    {
        private const string FileName = "Globalization/UnicodeData-3.2.txt";

        public List<CodePointDescription> Read()
        {
            string allText = Utilities.ReadAllText(FileName, false, Encoding.ASCII);
            string[] lineStrings = allText.Split(new string[] { "\r\n", }, StringSplitOptions.RemoveEmptyEntries);
            var list = new List<CodePointDescription>();
            for (int lineNo = 0; lineNo < lineStrings.Length; ++lineNo)
            {
                var lineStr = lineStrings[lineNo];
                var valueStrs = lineStr.Split(';');
                var cpi = new CodePointDescription()
                {
                    CodePoint = new CodePoint(Convert.ToInt32(valueStrs[0], 16)),
                    Name = valueStrs[1].ToNullIfEmpty(),
                    Category = ParseCategory(valueStrs[2]),
                    IntegralValue = valueStrs[6].Length == 0 ? null : new int?(int.Parse(valueStrs[6], NumberStyles.None, NumberFormatInfo.InvariantInfo)),
                    DigitValue = valueStrs[7].Length == 0 ? null : new int?(int.Parse(valueStrs[7], NumberStyles.None, NumberFormatInfo.InvariantInfo)),
                    NumericalValue = valueStrs[8].Length == 0 ? null : new Fraction?(ParseNumericalValue(valueStrs[8])),
                };

                var block = UnicodeBlockInfo.Find(cpi.CodePoint, UnicodeVersion.V3_2);
                if (block != null && block.IsNotSupported)
                {
                    continue;
                }
                list.Add(cpi);
            }
            return list;
        }

        private static Fraction ParseNumericalValue(string s1)
        {
            int n, d;
            if (int.TryParse(s1, NumberStyles.None, NumberFormatInfo.InvariantInfo, out n))
            {
                d = 1;
                goto success;
            }
            var match = new System.Text.RegularExpressions.Regex(@"^([-\+]?[0-9]+)/([0-9]+)$").Match(s1);
            if (match.Success)
            {
                string numStr = match.Groups[1].Captures.Cast<System.Text.RegularExpressions.Capture>().Single().Value;
                string denomStr = match.Groups[2].Captures.Cast<System.Text.RegularExpressions.Capture>().Single().Value;
                bool numFlag = int.TryParse(numStr, NumberStyles.AllowLeadingSign, NumberFormatInfo.InvariantInfo, out n);
                bool denomFlag = int.TryParse(denomStr, NumberStyles.None, NumberFormatInfo.InvariantInfo, out d);
                if (numFlag && denomFlag && d != 0)
                {
                    goto success;
                }
            }
            throw new FormatException();
        success:
            return new Fraction(n, d);
        }

        private static UnicodeCategory ParseCategory(string s)
        {
            switch (s)
            {
                case "Lu": return UnicodeCategory.UppercaseLetter;
                case "Ll": return UnicodeCategory.LowercaseLetter;
                case "Lt": return UnicodeCategory.TitlecaseLetter;
                case "Lm": return UnicodeCategory.ModifierLetter;
                case "Lo": return UnicodeCategory.OtherLetter;
                case "Mn": return UnicodeCategory.NonSpacingMark;
                case "Mc": return UnicodeCategory.SpacingCombiningMark;
                case "Me": return UnicodeCategory.EnclosingMark;
                case "Nd": return UnicodeCategory.DecimalDigitNumber;
                case "Nl": return UnicodeCategory.LetterNumber;
                case "No": return UnicodeCategory.OtherNumber;
                case "Pc": return UnicodeCategory.ConnectorPunctuation;
                case "Pd": return UnicodeCategory.DashPunctuation;
                case "Ps": return UnicodeCategory.OpenPunctuation;
                case "Pe": return UnicodeCategory.ClosePunctuation;
                case "Pi": return UnicodeCategory.InitialQuotePunctuation;
                case "Pf": return UnicodeCategory.FinalQuotePunctuation;
                case "Po": return UnicodeCategory.OtherPunctuation;
                case "Sm": return UnicodeCategory.MathSymbol;
                case "Sc": return UnicodeCategory.CurrencySymbol;
                case "Sk": return UnicodeCategory.ModifierSymbol;
                case "So": return UnicodeCategory.OtherSymbol;
                case "Zs": return UnicodeCategory.SpaceSeparator;
                case "Zl": return UnicodeCategory.LineSeparator;
                case "Zp": return UnicodeCategory.ParagraphSeparator;
                case "Cc": return UnicodeCategory.Control;
                case "Cf": return UnicodeCategory.Format;
                case "Cs": return UnicodeCategory.Surrogate;
                case "Co": return UnicodeCategory.PrivateUse;
                case "Cn": return UnicodeCategory.OtherNotAssigned;
            }
            throw new FormatException();
        }
    }



}