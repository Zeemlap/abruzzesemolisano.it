using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using WebApp.Globalization;

namespace WebApp.DataAccess.Sql
{

    internal enum ScanCallbackFlags
    {
        IsQuotedIdentifier = 1,
        IsQuotedIdentifier_ContainsRightSquareBrackets = 2,
    }

    internal delegate bool ScanCallback(int beg, int endExcl, ScanCallbackFlags flags);


    public static class SqlUtilities
    {
        public const int DefaultCompatibilityLevel = 100;
        public static readonly string FromKeyword = "FROM";
        public static readonly string SqlLineTerminator = "\r\n";
        public const UnicodeVersion Identifier_UnicodeVersion = UnicodeVersion.V3_2;

        [Flags]
        private enum KeywordFlags
        {
            
        }
 
        //https://msdn.microsoft.com/en-us/library/ms189822(v=sql.105).aspx
        //var trSets = [].map.call($("#mainBody table:not(.alert table)"),function(t){return [].slice.call(t.tBodies[0].childNodes,0);});
        //var trSetsUnion = [].concat.apply([], trSets);
        //var tdSets = [].map.call(trSetsUnion,function(t){return [].slice.call(t.childNodes,0);});
        //var tdSetsUnion = [].concat.apply([], tdSets);
        //var keywords1 = tdSetsUnion.map(function(t){return t.innerText.trim();});
        //var keywords2=keywords1.filter(function(t){return 0<t.length;});
        //var keywordSet={};keywords2.forEach(function(kw){keywordSet[kw]=1;});
        //var keywords3=Object.getOwnPropertyNames(keywordSet);
        //var csArrayExpr="new string[] { " + keywords3.map(function(t){return "\""+t+"\"";}).join(", ") + ", };";
        //csArrayExpr;

        public static bool IsKeyword(string s, int compatibilityLevel = DefaultCompatibilityLevel)
        {
            if (s == null)
            {
                throw new ArgumentNullException();
            }
            if (compatibilityLevel != DefaultCompatibilityLevel)
            {
                throw new NotImplementedException();
            }
            if (m_flagsFromKeyword == null)
            {
                InitializeKeywordFlags();
            }
            return m_flagsFromKeyword.ContainsKey(s);
        }

        private static void InitializeKeywordFlags()
        {
            var keywordArray = new string[] { "PRIVILEGES", "OPTION", "LIKE_REGEX", "METHOD", "REVOKE", "MAP", "ELSE", "ALLOCATE", "CROSS", "COLLATION", "TO", "BROWSE", "PRIMARY", "BREAK", "ALL", "FREETEXTTABLE", "READ", "RIGHT", "INCLUDE", "CONTAINSTABLE", "DEPTH", "INTERSECT", "CREATE", "MERGE", "USER", "FORTRAN", "XMLBINARY", "CONVERT", "REGR_R2", "NEXT", "VALUE", "CONTINUE", "ROLLUP", "OCCURRENCES_REGEX", "PARTITION", "UNIQUE", "NCHAR", "DESTROY", "FOREIGN", "NCLOB", "COALESCE", "AND", "REGR_SXY", "DISTRIBUTED", "RANGE", "DAY", "END-EXEC", "BACKUP", "SQL", "TIMESTAMP", "CURRENT_USER", "IGNORE", "BINARY", "COLLECT", "RELEASE", "BIT_LENGTH", "SQLEXCEPTION", "ARRAY", "CASCADED", "XMLAGG", "UNDER", "PERCENTILE_DISC", "CONDITION", "LIKE", "DESCRIPTOR", "VAR_POP", "PRESERVE", "TREAT", "CLOSE", "INSERT", "OF", "INTO", "REGR_SYY", "EXTERNAL", "SYSTEM", "LOAD", "PROCEDURE", "COVAR_SAMP", "WIDTH_BUCKET", "DEFERRABLE", "ATOMIC", "THEN", "PATH", "FILE", "RECURSIVE", "FULL", "DATA", "REGR_SXX", "XMLPARSE", "CALLED", "DECLARE", "REGR_AVGY", "XMLTABLE", "READTEXT", "COMPLETION", "RELATIVE", "WITHIN", "WITH", "SCOPE", "ORDER", "IDENTITYCOL", "PERCENT", "PERCENTILE_CONT", "IS", "GRANT", "LOCATOR", "STATEMENT", "WITHOUT", "BULK", "OPENDATASOURCE", "CALL", "ISOLATION", "CAST", "SECTION", "ROLE", "DEFAULT", "TSEQUAL", "GROUPING", "WORK", "REVERT", "FETCH", "INT", "VARCHAR", "DOMAIN", "CURRENT_TRANSFORM_GROUP_FOR_TYPE", "INTEGER", "INOUT", "AUTHORIZATION", "JOIN", "RECONFIGURE", "GLOBAL", "TIMEZONE_HOUR", "TRAILING", "ACTION", "UNNEST", "LINENO", "PIVOT", "XMLPI", "DETERMINISTIC", "PREORDER", "GOTO", "DOUBLE", "EVERY", "UNKNOWN", "SUBSTRING", "INSENSITIVE", "INDICATOR", "PREPARE", "MONTH", FromKeyword, "INTERSECTION", "CHARACTER", "SMALLINT", "USING", "TRANSLATE", "XMLATTRIBUTES", "SHUTDOWN", "LEVEL", "IN", "VIEW", "SQLERROR", "SPECIFIC", "NUMERIC", "MODIFY", "CURRENT_CATALOG", "BEFORE", "POSITION_REGEX", "CYCLE", "OPEN", "AFTER", "TRANSLATE_REGEX", "YEAR", "TRAN", "CHAR_LENGTH", "VARIABLE", "DUMP", "AVG", "DROP", "RESULT", "PARAMETERS", "UESCAPE", "DELETE", "CONTAINS", "SYSTEM_USER", "ASYMMETRIC", "EXTRACT", "DISK", "FREE", "DIAGNOSTICS", "WHENEVER", "CURRENT_PATH", "GENERAL", "PRINT", "SELECT", "ON", "NATIONAL", "FOUND", "CONNECTION", "STDDEV_SAMP", "ROLLBACK", "REFERENCES", "ALIAS", "CURRENT_ROLE", "WHERE", "INTERVAL", "OPENXML", "OLD", "OVERLAY", "XMLSERIALIZE", "OPENQUERY", "ALTER", "PASCAL", "ROWS", "REFERENCING", "SPACE", "RESTORE", "CONSTRAINTS", "TRIM", "SIZE", "CONNECT", "DENY", "XMLTEXT", "CURRENT_TIME", "REF", "ROWCOUNT", "CONSTRUCTOR", "TRIGGER", "CLASS", "DEFERRED", "HOUR", "EXCEPTION", "XMLCONCAT", "CORRESPONDING", "SQLCA", "TABLESAMPLE", "MAX", "GET", "XMLELEMENT", "COMMIT", "MODULE", "VARYING", "HOLDLOCK", "DECIMAL", "CURSOR", "MULTISET", "WHILE", "XMLCAST", "FOR", "OVERLAPS", "LATERAL", "ITERATE", "HOST", "ROUTINE", "FUSION", "FALSE", "LN", "TIME", "SQLCODE", "XMLITERATE", "MEMBER", "NOT", "MOD", "POSTFIX", "USE", "CUBE", "DATABASE", "NATURAL", "XMLQUERY", "THAN", "BEGIN", "KILL", "TEXTSIZE", "ELEMENT", "SQLWARNING", "INITIALIZE", "UPDATETEXT", "TRUNCATE", "REGR_AVGX", "LIMIT", "SAVE", "INITIALLY", "ADD", "ROW", "FULLTEXTTABLE", "SETUSER", "UPDATE", "WRITE", "STATE", "CURRENT", "EXIT", "OBJECT", "PERCENT_RANK", "ESCAPE", "PARTIAL", "WRITETEXT", "CURRENT_TIMESTAMP", "FIRST", "OR", "LEADING", "DATE", "LARGE", "TRANSACTION", "CHARACTER_LENGTH", "TEMPORARY", "SUM", "XMLCOMMENT", "EXCEPT", "OUTER", "DICTIONARY", "OFFSETS", "NONCLUSTERED", "AGGREGATE", "HAVING", "ERRLVL", "SPECIFICTYPE", "STATIC", "COUNT", "DESCRIBE", "SIMILAR", "PUBLIC", "ANY", "SCHEMA", "OUT", "NOCHECK", "DBCC", "LANGUAGE", "CARDINALITY", "CURRENT_DEFAULT_TRANSFORM_GROUP", "SOME", "IMMEDIATE", "MINUTE", "WINDOW", "IF", "DYNAMIC", "INDEX", "PRECISION", "USAGE", "OVER", "BOTH", "OFF", "FREETEXT", "ABSOLUTE", "LESS", "STATISTICS", "PREFIX", "OPERATION", "LOCALTIME", "ASSERTION", "NO", "BETWEEN", "CUME_DIST", "REGR_INTERCEPT", "EQUALS", "GROUP", "CHECK", "IDENTITY", "FILLFACTOR", "SENSITIVE", "NULLIF", "ONLY", "FUNCTION", "CHECKPOINT", "SYMMETRIC", "RETURN", "PLAN", "NEW", "TRUE", "LOCALTIMESTAMP", "WHEN", "PRIOR", "MODIFIES", "STRUCTURE", "END", "RAISERROR", "ADA", "SEQUENCE", "REAL", "EACH", "REGR_COUNT", "REPLICATION", "INNER", "CURRENT_DATE", "DISCONNECT", "UPPER", "OPENROWSET", "CORR", "FILTER", "XMLNAMESPACES", "TRANSLATION", "ZONE", "DISTINCT", "DEREF", "CONSTRAINT", "START", "EXISTS", "COVAR_POP", "NAMES", "SUBMULTISET", "COLUMN", "RULE", "BOOLEAN", "BY", "FLOAT", "ASC", "TABLE", "OCTET_LENGTH", "DESTRUCTOR", "ADMIN", "TOP", "ASENSITIVE", "AT", "SCROLL", "HOLD", "PROC", "GO", "CURRENT_SCHEMA", "WAITFOR", "EXEC", "TERMINATE", "SETS", "NULL", "LOWER", "POSITION", "ORDINALITY", "BIT", "SUBSTRING_REGEX", "CLUSTERED", "BLOB", "UNPIVOT", "ARE", "MATCH", "COMPUTE", "XMLVALIDATE", "LOCAL", "IDENTITY_INSERT", "KEY", "CHAR", "OUTPUT", "RETURNS", "CLOB", "XMLDOCUMENT", "SESSION", "NONE", "EXECUTE", "PAD", "SET", "VALUES", "PARAMETER", "XMLFOREST", "REGR_SLOPE", "DESC", "TIMEZONE_MINUTE", "STDDEV_POP", "DEALLOCATE", "SECOND", "BREADTH", "NORMALIZE", "SESSION_USER", "RESTRICT", "VAR_SAMP", "CATALOG", "MIN", "UNION", "DEC", "LAST", "ROWGUIDCOL", "SAVEPOINT", "COLLATE", "INPUT", "SEARCH", "XMLEXISTS", "LEFT", "SECURITYAUDIT", "CASCADE", "CASE", "READS", "SQLSTATE", "AS", }; 
            var flagsFromKeyword = new Dictionary<string, KeywordFlags>(StringComparer.OrdinalIgnoreCase);
            foreach (var keyword in keywordArray)
            {
                flagsFromKeyword.Add(keyword, (KeywordFlags)0);
            }
            m_flagsFromKeyword = flagsFromKeyword;
        }

        private static volatile Dictionary<string, KeywordFlags> m_flagsFromKeyword;



        // Let ct_i be the ct.Substring(ct_idx, ct_n).
        // ct_i and name both contain right square brackets.
        // Let name_i be name.Replace("]", "]]").
        // Returns true iff string.CompareOrdinal(ct_i, name_i) == 0.
        private static bool IndexOf_DelimitedIdentifier_UncommonEquals(string ct, int ct_begIdx, int ct_endIdxExcl, string name)
        {
            return string.CompareOrdinal(ct.Substring(ct_begIdx, ct_endIdxExcl - ct_begIdx), name.Replace("]", "]]")) == 0;
        }

        public static bool HasIdentifierGrammar(string s)
        {
            return HasIdentifierGrammar(s, 0);
        }

        public static bool HasIdentifierGrammar(string s, int s_begIdx)
        {
            if (s == null)
            {
                throw new ArgumentNullException();
            }
            return HasIdentifierGrammar(s, s_begIdx, s.Length);
        }

        public static bool HasIdentifierGrammar(string s, int s_begIdx, int s_endIdxExcl)
        {
            if (s == null)
            {
                throw new ArgumentNullException();
            }
            if (s_begIdx < 0 || s_endIdxExcl < s_begIdx || s.Length < s_endIdxExcl)
            {
                throw new ArgumentOutOfRangeException();
            }
            unsafe
            {
                fixed (char* s_firstChar_ptr = s)
                {
                    char* ci = s_firstChar_ptr + s_begIdx;
                    // There is a null character at the end of every string, abuse this and do not check for empty string.
                    if (!IsIdentifierChar_First(*ci))
                    {
                        return false;
                    }
                    char* ci_endExcl = s_firstChar_ptr + s_endIdxExcl;
                    while (++ci < ci_endExcl)
                    {
                        if (!IsIdentifierChar_NonFirst(*ci))
                        {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }

        // https://msdn.microsoft.com/en-us/library/ms175874.aspx

        public static bool IsIdentifierChar_First(char c)
        {
            return IsIdentifierChar_First(new CodePoint(c));
        }
        public static bool IsIdentifierChar_First(CodePoint c)
        {
            if (c.IsNull)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cv = c.Value;
            if (cv < 128)
            {
                if ('A' <= cv && cv <= 'Z')
                {
                    return true;
                }
                if ('a' <= cv && cv <= 'z')
                {
                    return true;
                }
                return cv == '_' || cv == '@' || cv == '#';
            }
            return Identifier_GetUnicodeCategory(c).IsLetter();
        }

        private static UnicodeCategory Identifier_GetUnicodeCategory(CodePoint c)
        {
            throw new NotImplementedException();
            var descr = CodePointDescription.Find(c, Identifier_UnicodeVersion);
            if (descr == null)
            {
                var blockInfo = UnicodeBlockInfo.Find(c, Identifier_UnicodeVersion);
                if (blockInfo.IsNotSupported)
                {
                    throw new NotSupportedException();
                }
                return (UnicodeCategory)(-1);
            }
            return descr.Category;
        }

        public static bool IsIdentifierChar_NonFirst(char ch)
        {
            return IsIdentifierChar_NonFirst(new CodePoint(ch));
        }

        public static bool IsIdentifierChar_NonFirst(CodePoint c)
        {
            if (c.IsNull)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cv = c.Value;
            if (cv < 128)
            {
                if ('A' <= cv && cv <= 'Z')
                {
                    return true;
                }
                if ('a' <= cv && cv <= 'z')
                {
                    return true;
                }
                if ('0' <= cv && cv <= '9')
                {
                    return true;
                }
                return cv == '_' || cv == '@' || cv == '#' || cv == '$';
            }
            var uc = Identifier_GetUnicodeCategory(c);
            return uc == UnicodeCategory.DecimalDigitNumber || uc.IsLetter();
        }


        internal static void Scan(string ct, int ct_begIdx, int ct_endIdxExcl, ScanCallback scanCallback)
        {
            if (ct == null)
            {
                throw new ArgumentNullException();
            }
            int iLast = ct_begIdx;
            while (true)
            {
                int i = ct.IndexOf('[', iLast, ct_endIdxExcl - iLast);
                if (i < 0)
                {
                    break;
                }
                if (!scanCallback(iLast, i, 0))
                {
                    return;
                }
                int ii = i + 1;
                ScanCallbackFlags flags = 0;
                while (true)
                {
                    ii = ct.IndexOf(']', ii, ct_endIdxExcl - ii);
                    if (ii < 0)
                    {
                        throw new ArgumentException();
                    }
                    if (ii + 1 == ct.Length || ct[ii + 1] != ']')
                    {
                        break;
                    }
                    flags |= ScanCallbackFlags.IsQuotedIdentifier_ContainsRightSquareBrackets;
                }
                if (!scanCallback(i + 1, ii, flags | ScanCallbackFlags.IsQuotedIdentifier))
                {
                    return;
                }
                iLast = ii + 1;
            }
            scanCallback(iLast, ct.Length, 0);
        }

        public static int IndexOf_IdentifierWithSquareQuotes(string ct, int ct_begIdx, int ct_endIdxExcl, string squareQuotedIdent)
        {
            if (squareQuotedIdent == null)
            {
                throw new ArgumentNullException();
            }
            int i = -1;
            bool nameHasRightSquareBrackets = 0 <= squareQuotedIdent.IndexOf(']');
            if (nameHasRightSquareBrackets)
            {
                Scan(ct, ct_begIdx, ct_endIdxExcl, (beg, endExcl, flags) =>
                {
                    if ((flags & ScanCallbackFlags.IsQuotedIdentifier_ContainsRightSquareBrackets) == 0)
                    {
                        return true;
                    }
                    if (squareQuotedIdent.Length < endExcl - beg + 1 && IndexOf_DelimitedIdentifier_UncommonEquals(ct, beg, endExcl, squareQuotedIdent))
                    {
                        i = beg;
                        return false;
                    }
                    return true;
                });
            }
            else
            {
                Scan(ct, ct_begIdx, ct_endIdxExcl, (beg, endExcl, flags) =>
                {
                    if ((flags & ScanCallbackFlags.IsQuotedIdentifier_ContainsRightSquareBrackets) != 0)
                    {
                        return true;
                    }
                    if (squareQuotedIdent.Length == endExcl - beg + 1 && string.CompareOrdinal(ct, beg, squareQuotedIdent, 0, endExcl - beg + 1) == 0)
                    {
                        i = beg;
                        return false;
                    }
                    return true;
                });
            }
            return i;
        }

        // Token must be an identifier that does not need quoting or a keyword.
       
        public static int IndexOf_Keyword(string ct, int ct_begIdx, int ct_endIdxExcl, string keyword, int compatibilityLevel = DefaultCompatibilityLevel)
        {
            if (!IsKeyword(keyword, compatibilityLevel))
            {
                throw new ArgumentException();
            }
            int ii = -1;
            Scan(ct, ct_begIdx, ct_endIdxExcl, (beg, endExcl, flags) =>
            {
                if ((flags & ScanCallbackFlags.IsQuotedIdentifier) != 0)
                {
                    return true;
                }
                int i = beg;
                while (true)
                {
                    i = ct.IndexOf(keyword, i, endExcl - i, StringComparison.OrdinalIgnoreCase);
                    if (i < 0)
                    {
                        break;
                    }
                    if (i == beg || !IsIdentifierChar_NonFirst(ct[i - 1])) 
                    {
                        if (i + keyword.Length == endExcl || !IsIdentifierChar_NonFirst(ct[i + keyword.Length]))
                        {
                            ii = i;
                            return false;
                        }
                    }
                    i += keyword.Length + 1;
                    if (endExcl <= i)
                    {
                        break;
                    }
                }
                return true;
            });
            return ii;
        }


        public static int IndexOf_Identifier(string ct, int ct_begIdx, int ct_endIdxExcl, string identifier)
        {
            throw new NotImplementedException();
        }


        public static void Serialize(System.Text.StringBuilder sb, object value, Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException();
            }
            bool isNullable = false;
            if (type.IsValueType)
            {
                if (type.IsGenericType)
                {
                    if (type.IsGenericTypeDefinition)
                    {
                        throw new ArgumentException();
                    }
                    if (type.GetGenericTypeDefinition() == typeof(Nullable<>))
                    {
                        isNullable = true;
                        type = type.GetGenericArguments()[0];
                    }
                }
            }
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Int32:
                case TypeCode.Int16:
                case TypeCode.Int64:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                    if (value == null)
                    {
                        if (!isNullable)
                        {
                            throw new ArgumentException();
                        }
                        sb.Append("NULL");
                    }
                    else
                    {
                        if (value.GetType() != type)
                        {
                            throw new ArgumentException();
                        }
                        sb.Append(((IFormattable)value).ToString(null, NumberFormatInfo.InvariantInfo));
                    }
                    break;
                default:
                    throw new NotImplementedException();
            }
        }

        public static void Serialize(System.Text.StringBuilder sb, object value, System.Data.DbType dbType)
        {
            Type type;
            switch (dbType)
            {
                case System.Data.DbType.UInt16:
                    type = typeof(ushort);
                    break;
                case System.Data.DbType.UInt32:
                    type = typeof(uint);
                    break;
                case System.Data.DbType.UInt64:
                    type = typeof(ulong);
                    break;
                case System.Data.DbType.Int16:
                    type = typeof(short);
                    break;
                case System.Data.DbType.Int32:
                    type = typeof(int);
                    break;
                case System.Data.DbType.Int64:
                    type = typeof(long);
                    break;
                default:
                    throw new NotImplementedException();
            }
            Serialize(sb, value, type);
        }

    }
}