using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace WebApp.Globalization
{

    internal class BlockReaderV3_2
    {
        private const string FileName = "Globalization/Blocks-3.2.txt";

        private bool hasReadBeenCalled;
        private string[] m_specialBlockNames;

        public BlockReaderV3_2()
        {
        }

        public UnicodeBlockInfo[] Read()
        {
            if (this.hasReadBeenCalled)
            {
                throw new InvalidOperationException();
            }
            this.hasReadBeenCalled = true;
            this.m_specialBlockNames = new string[] 
            {
                "CJK Unified Ideographs Extension A",
                "CJK Unified Ideographs",
                "Hangul Syllables",
                "CJK Unified Ideographs Extension B",
            };
            string allText = Utilities.ReadAllText(FileName, true, Encoding.UTF8);
            int specialBlocks_usageFlags = 0;
            string[] lineStrings = allText.Split(new string[] { "\r\n", }, StringSplitOptions.RemoveEmptyEntries);
            var blockList = new List<UnicodeBlockInfo>();
            for (int lineNo = 0; lineNo < lineStrings.Length; ++lineNo)
            {
                var lineStr = lineStrings[lineNo];
                var valueStrs = lineStr.Split(';');
                var block = new UnicodeBlockInfo();
                ParseRange(valueStrs[0], block);
                block.Name = ParseBlockName(valueStrs[1]).ToNullIfEmpty();
                int j = this.GetSpecialBlockId(block.Name);
                if (0 <= j)
                {
                    if (31 < j)
                    {
                        throw new NotSupportedException();
                    }
                    if ((specialBlocks_usageFlags & (1 << j)) != 0)
                    {
                        throw new InvalidDataException("Data contains multiple blocks with a special block name \"" + block.Name + "\"");
                    }
                    specialBlocks_usageFlags |= (1 << j);
                    block.IsNotSupported = true;
                }
                blockList.Add(block);
            }

            if (specialBlocks_usageFlags != (m_specialBlockNames.Length == 32 ? -1 : (1 << m_specialBlockNames.Length) - 1))
            {
                throw new InvalidDataException("Data does not contain all special blocks.");
            }

            blockList.Sort((b1, b2) => b1.FirstCodePoint.CompareTo(b2.FirstCodePoint));
            return blockList.ToArray();
        }


        private static string ParseBlockName(string p)
        {
            return p.Trim();
        }

        private int GetSpecialBlockId(string blockName)
        {
            if (blockName != null)
            {
                for (int i = 0; i < m_specialBlockNames.Length; ++i)
                {
                    if (string.CompareOrdinal(blockName, m_specialBlockNames[i]) == 0)
                    {
                        return i;
                    }
                }
            }
            return -1;
        }

        private static void ParseRange(string s, UnicodeBlockInfo block)
        {
            var hexNums = s.Split(new string[] { "..", }, StringSplitOptions.None);
            if (hexNums.Length != 2)
            {
                throw new FormatException();
            }
            int min, max;
            try
            {
                min = Convert.ToInt32(hexNums[0], 16);
                max = Convert.ToInt32(hexNums[1], 16);
            }
            catch (OverflowException)
            {
                throw new FormatException();
            }
            if (min > max || 0x10FFFF < max)
            {
                throw new FormatException();
            }
            block.FirstCodePoint = new CodePoint(min);
            block.LastCodePoint = new CodePoint(max);
        }

    }

}