using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace WebApp.Globalization
{
    public struct CodePoint : IEquatable<CodePoint>, IComparable<CodePoint>, IComparable
    {
        private const uint ValueMask = 0xFFFFFF;
        private const uint IsNotNullMask = 0x80000000;
        private const uint CategoryCacheMask = 0x7F000000;
        private const int CategoryCacheOffset = 24;

        private static Lazy<Func<int, UnicodeCategory>> getUnicodeCategoryFuncLazy = new Lazy<Func<int, UnicodeCategory>>(LazyThreadSafetyMode.PublicationAndExecution, () =>
        {
            var underlyingValueField = typeof(UnicodeCategory)
              .GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly)
              .Single();
            if (underlyingValueField.FieldType != typeof(int))
            {
                throw new MissingMethodException();
            }
            var enumDeclaredUniqueUnderlyingValues = typeof(UnicodeCategory)
                .GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly)
                .Where(fi => fi.FieldType == typeof(UnicodeCategory))
                .Select(fi => fi.GetValue(null))
                .Cast<IConvertible>()
                .Select(v => v.ToInt32(null))
                .Distinct()
                .OrderBy(v => v)
                .ToArray();

            if (enumDeclaredUniqueUnderlyingValues[0] != 0)
            {
                throw new Exception();
            }
            if (enumDeclaredUniqueUnderlyingValues[enumDeclaredUniqueUnderlyingValues.Length - 1] + 1 > (int)(CategoryCacheMask >> CategoryCacheOffset))
            {
                throw new Exception();
            }
            var getUnicodeCategoryMethodInfo = typeof(CharUnicodeInfo)
                .GetMethod("InternalGetUnicodeCategory", BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.DeclaredOnly, null, new Type[] { typeof(int), }, null);

            var cpParamExpr = Expression.Parameter(typeof(int), "a1");
            var getUnicodeCategoryFunc = Expression.Lambda<Func<int, UnicodeCategory>>(Expression.Call(getUnicodeCategoryMethodInfo, cpParamExpr), cpParamExpr).Compile();
            return getUnicodeCategoryFunc;
        });

        private uint packedData;

        public CodePoint(char ch)
        {
            this.packedData = ch | IsNotNullMask;
        }

        public CodePoint(int value)
        {
            if (value < 0 || value > 0x10FFFF)
            {
                throw new ArgumentOutOfRangeException();
            }
            this.packedData = (uint)value | IsNotNullMask;
        }

        public bool IsNull
        {
            get
            {
                return (this.packedData & IsNotNullMask) == 0;
            }
        }

        public UnicodeCategory GetCategory()
        {
            if (this.IsNull)
            {
                throw new InvalidOperationException();
            }
            int cachedCategory = (int)((this.packedData & CategoryCacheMask) >> CategoryCacheOffset) - 1;
            if (cachedCategory == -1)
            {
                return this.InitializeCategoryCacheAndGetCategory();
            }
            return (UnicodeCategory)cachedCategory;
        }

        private UnicodeCategory InitializeCategoryCacheAndGetCategory()
        {
            var uc = getUnicodeCategoryFuncLazy.Value((int)(this.packedData & ValueMask));
            this.packedData = (this.packedData & ~CategoryCacheMask) | (uint)(((int)uc + 1) << CategoryCacheOffset); 
            return uc;
        }

        public int Value
        {
            get
            {
                if (this.IsNull)
                {
                    return -1;
                }
                return (int)(this.packedData & ValueMask);
            }
        }

        public int GetBase16DigitValue()
        {
            int v;
            v = (int)(this.packedData & (ValueMask | IsNotNullMask));
            if (v > 0xFFFF)
            {
                return -1;
            }
            return ((char)v).GetBase16DigitValue();
        }

        public static CodePoint Null
        {
            get
            {
                return new CodePoint();
            }
        }

        public override bool Equals(object obj)
        {
            return obj is CodePoint && this.Equals((CodePoint)obj);
        }

        public override int GetHashCode()
        {
            return unchecked((int)(this.packedData & (IsNotNullMask | ValueMask)));
        }

        public bool Equals(CodePoint other)
        {
            return this == other;
        }

        public static bool operator ==(CodePoint l, CodePoint r)
        {
            return (l.packedData & (IsNotNullMask | ValueMask)) == (r.packedData & (IsNotNullMask | ValueMask));
        }

        public static bool operator !=(CodePoint l, CodePoint r)
        {
            return !(l == r);
        }

        public static bool operator <(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) < 0;
        }
        public static bool operator <=(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) <= 0;
        }

        public static bool operator >(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) > 0;
        }
        public static bool operator >=(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) >= 0;
        }

        public int CompareTo(CodePoint other)
        {
            return this.Value.CompareTo(other.Value);
        }

        int IComparable.CompareTo(object obj)
        {
            if (obj is CodePoint)
            {
                return this.CompareTo((CodePoint)obj);
            }
            if (obj == null)
            {
                return this.CompareTo(CodePoint.Null);
            }
            throw new ArgumentException();
        }
    }
}
