using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Web;

namespace WebApp
{
    public static class Utilities<T>
    {
        private class TEmptyEnumerator : IEnumerator<T>
        {
            public T Current
            {
                get { return default(T); }
            }

            public void Dispose()
            {
            }

            object System.Collections.IEnumerator.Current
            {
                get { return this.Current; }
            }

            public bool MoveNext()
            {
                return false;
            }

            public void Reset()
            {
            }
        }

        public static readonly IEnumerator<T> EmptyEnumerator = new TEmptyEnumerator();
    }

    public static class Utilities
    {
        public static string ToNullIfEmpty(this string @this)
        {
            if (@this.Length == 0)
            {
                return null;
            }
            return @this;
        }
       
        public static Dictionary<T, T> ReverseDictionary<T>(this IDictionary<T, T> d1, IEqualityComparer<T> reverseD1Comparer = null)
        {
            if (d1 == null)
            {
                throw new ArgumentNullException();
            }
            if (reverseD1Comparer == null)
            {
                var d2 = d1 as Dictionary<T, T>;
                if (d2 != null)
                {
                    reverseD1Comparer = d2.Comparer;
                }
            }
            var d3 = new Dictionary<T, T>(d1.Count, reverseD1Comparer);
            foreach (var entry in d1)
            {
                d3.Add(entry.Value, entry.Key);
            }
            return d3;
        }

        public static MemberInfo GetMemberInfo<T1, T2>(Expression<Func<T1, T2>> fieldOrPropertyExpr)
        {
            var memExpr = fieldOrPropertyExpr.Body as MemberExpression;
            if (memExpr == null)
            {
                throw new ArgumentException();
            }
            return memExpr.Member;
        }

        public static PropertyInfo GetPropertyInfo<T1, T2>(Expression<Func<T1, T2>> propertyExpr)
        {
            var propInfo = GetMemberInfo(propertyExpr) as PropertyInfo;
            if (propInfo == null)
            {
                throw new ArgumentException();
            }
            return propInfo;
        }

        public static byte[] StreamToByteArray(Stream stream)
        {
            long remainingByteCountLong = stream.Length - stream.Position;
            if (remainingByteCountLong > int.MaxValue) 
            {
                // The stream is too long.
                throw new ArgumentException();
            }
            int remainingByteCount = checked((int)remainingByteCountLong);
            byte[] byteArray = new byte[remainingByteCount];
            int offset = 0;
            while (remainingByteCount > 0)
            {
                int bytesRead = stream.Read(byteArray, offset, remainingByteCount);
                if (bytesRead == 0)
                {
                    // The stream is inconsistent.
                    throw new ArgumentException();
                }
                remainingByteCount -= bytesRead;
                offset += bytesRead;
            }
            return byteArray;
        }

        public static bool StartsWith_Ordinal(string s1, int s1_begIdx, int s1_endIdxExcl, string s2)
        {
            if (s2 == null)
            {
                throw new ArgumentNullException();
            }
            if (s1_endIdxExcl - s1_begIdx < s2.Length)
            {
                return false;
            }
            return string.CompareOrdinal(s1, s1_begIdx, s2, 0, s2.Length) == 0;
        }

        public static string ReadAllText(string fileName, bool detectEncodingFromByteOrderMarks, Encoding encoding)
        {
            FileStream fs = null;
            StreamReader sr = null;
            try
            {
                fs = new FileStream(fileName, FileMode.Open, System.Security.AccessControl.FileSystemRights.ReadData, FileShare.Read, 64 * 1024, FileOptions.SequentialScan);
                sr = new StreamReader(fs, Encoding.ASCII, true, 32 * 1024);
                return sr.ReadToEnd();
            }
            finally
            {
                if (sr != null)
                {
                    sr.Close();
                }
                else if (fs != null)
                {
                    fs.Close();
                }
            }
        }

        public static int GetBase16DigitValue(this char ch)
        {
            if ('0' <= ch && ch <= '9')
            {
                return ch - '0';
            }
            if ('a' <= ch && ch <= 'f')
            {
                return ch - 'a' + 10;
            }
            if ('A' <= ch && ch <= 'F')
            {
                return ch - 'A' + 10;
            }
            return -1;
        }

        public static void CreateProxyType<TProxyInterface>(Type sourceInterfaceType) 
        {
            if (sourceInterfaceType == null) 
            {
                throw new ArgumentNullException();
            }
            if (!sourceInterfaceType.IsInterface)
            {
                throw new ArgumentException();
            }
            var proxyInterfaceType = typeof(TProxyInterface);
            if (!proxyInterfaceType.IsInterface)
            {
                throw new ArgumentException();
            }
            if (0 < sourceInterfaceType.GetInterfaces().Length ||
                0 < proxyInterfaceType.GetInterfaces().Length)
            {
                throw new NotImplementedException();
            }

            var members = proxyInterfaceType.GetMembers(BindingFlags.DeclaredOnly | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            foreach (var member in members)
            {
                switch (member.MemberType)
                {
                    case MemberTypes.Event:
                        break;
                    case MemberTypes.Field:
                        throw new NotImplementedException();
                    case MemberTypes.Method:
                        break;
                    case MemberTypes.NestedType:
                        throw new NotImplementedException();
                    case MemberTypes.Property:

                        break;
                    case MemberTypes.TypeInfo:
                    default:
                        throw new NotImplementedException();
                }
            }

            throw new NotImplementedException();
        }
    }

    [System.Diagnostics.DebuggerDisplay("{ToString()}")]
    public struct Fraction : IComparable<Fraction>
    {
        public readonly int Numerator;
        public readonly int Denominator;

        public Fraction(int n, int d)
        {
            if (d == 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (d < 0)
            {
                if (d == int.MinValue || n == int.MinValue)
                {
                    throw new ArgumentOutOfRangeException();
                }
                d = -d;
                n = -n;
            }
            this.Numerator = n;
            this.Denominator = d;
        }

        public int CompareTo(Fraction other)
        {
            return Compare(this, other);
        }

        public static int Compare(Fraction f1, Fraction f2)
        {
            long num1 = (long)f1.Numerator * f2.Denominator;
            long num2 = (long)f1.Denominator * f2.Numerator;
            return num1.CompareTo(num2);
        }

        public override string ToString()
        {
            return string.Format(System.Globalization.NumberFormatInfo.InvariantInfo, "{0}/{1}", this.Numerator, this.Denominator);
        }
    }

}