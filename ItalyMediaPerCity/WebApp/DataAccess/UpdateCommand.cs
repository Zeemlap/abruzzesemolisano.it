using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace WebApp.DataAccess
{
    public class UpdateCommandBuilder<TEntity> where TEntity : class
    {
        private DataContext dc;
        private MetaTable metaTable;
        private MetaType metaType;
        private Dictionary<string, Expression> assignExprValFromColName;
        private IQueryable<TEntity> predicateHelper;

        internal UpdateCommandBuilder(DataContext dc, MetaTable mt)
        {
            var metaType = dc.Mapping.GetMetaType(typeof(TEntity));
            this.metaTable = mt;
            this.metaType = metaType;
            this.dc = dc;
            this.assignExprValFromColName = new Dictionary<string, Expression>();
            this.predicateHelper = null;
        }

        private const char ParameterIdentifier_FirstChar = '@';

        private static bool Identifier_IsParameterIdentifier(string s)
        {
            if (s == null)
            {
                throw new ArgumentNullException();
            }
            return Identifier_IsParameterIdentifier(s, 0, s.Length);
        }
        
        private static bool Identifier_IsParameterIdentifier(string s, int s_begIdx, int s_endIdxExcl)
        {
            if (s == null)
            {
                throw new ArgumentNullException();
            }
            if (s_endIdxExcl < s_begIdx)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (s_begIdx == s_endIdxExcl)
            {
                return false;
            }
            return s[s_begIdx] == ParameterIdentifier_FirstChar;
        }

        private MetaDataMember SetCommon<TProperty>(Expression<Func<TEntity, TProperty>> propertyExpr)
        {

            var propInfo = Utilities.GetPropertyInfo(propertyExpr);
            MetaDataMember metaDataMember;
            try
            {
                metaDataMember = this.metaType.GetDataMember(propInfo);
            }
            catch (InvalidOperationException)
            {
                throw new ArgumentException();
            }
            if (Identifier_IsParameterIdentifier(metaDataMember.MappedName))
            {
                throw new ArgumentException();
            }
            if (this.assignExprValFromColName.ContainsKey(metaDataMember.MappedName))
            {
                throw new InvalidOperationException();
            }
            return metaDataMember;
        }

        public UpdateCommandBuilder<TEntity> Set<TProperty>(Expression<Func<TEntity, TProperty>> propertyExpr, TProperty value)
        {
            var metaDataMember = this.SetCommon(propertyExpr);
            this.assignExprValFromColName[metaDataMember.MappedName] = Expression.Constant(value, typeof(TProperty));
            return this;
        }

        public UpdateCommandBuilder<TEntity> Where(Expression<Func<TEntity, bool>> predicate)
        {
            this.predicateHelper = (this.predicateHelper ?? this.dc.GetTable<TEntity>()).Where(predicate);
            return this;
        }

        public UpdateCommandBuilder<TEntity> Where(Expression<Func<TEntity, int, bool>> predicate)
        {
            this.predicateHelper = (this.predicateHelper ?? this.dc.GetTable<TEntity>()).Where(predicate);
            return this;
        }

        public int Execute()
        {
            if (this.assignExprValFromColName.Count == 0)
            {
                throw new InvalidOperationException();
            }
            StringBuilder sb = new StringBuilder();
            string ct;

            var providerEx = this.dc.GetProvider();
            if (!(providerEx is Sql.SqlProviderEx))
            {
                throw new NotImplementedException();
            }
            if (this.predicateHelper != null)
            {
                var dbCommand = providerEx.GetCommand(this.predicateHelper.Expression);
                ct = dbCommand.CommandText;
                int fromClauseBeg = Sql.SqlUtilities.IndexOf_Keyword(ct, 0, ct.Length, Sql.SqlUtilities.FromKeyword);
                if (fromClauseBeg < 0)
                {
                    throw new NotImplementedException();
                }
                int whereClauseBeg = Sql.SqlUtilities.IndexOf_Keyword(ct, fromClauseBeg + 5, ct.Length, "WHERE");
                if (whereClauseBeg < 0)
                {
                    // Should never happen, because if predicateHelper != null we did at least one IQueryable.Where call.
                    throw new NotImplementedException();
                }
                sb.Append("UPDATE ");
                AppendTableAlias(sb, ct, fromClauseBeg, whereClauseBeg);
                sb.Append(Sql.SqlUtilities.SqlLineTerminator);
                this.AppendSetClauseTo(sb);
                sb.Append(Sql.SqlUtilities.SqlLineTerminator);
                sb.Append(ct, fromClauseBeg, whereClauseBeg - fromClauseBeg);
                AppendWhereClauseReplaceParameters(sb, dbCommand, whereClauseBeg, ct.Length);
            }
            else
            {
                sb.Append("UPDATE [");
                sb.Append(this.metaTable.TableName.Replace("]", "]]"));
                sb.Append(']');
                sb.Append(Sql.SqlUtilities.SqlLineTerminator);
                this.AppendSetClauseTo(sb);
                sb.Append(Sql.SqlUtilities.SqlLineTerminator);
            }
            ct = sb.ToString();
            return this.dc.ExecuteCommand(ct);
        }

        private void AppendWhereClauseReplaceParameters(StringBuilder sb, DbCommand dbCommand, int whereClause_begIdx, int whereClause_endIdxExcl)
        {
            string ct = dbCommand.CommandText;
            int i = whereClause_begIdx;
            Sql.SqlUtilities.Scan(ct, whereClause_begIdx, whereClause_endIdxExcl, (beg, endExcl, flags) =>
            {
                DbParameter dbParam;
                int ct_paramBeg = beg;
                if ((flags & Sql.ScanCallbackFlags.IsQuotedIdentifier) != 0 && Identifier_IsParameterIdentifier(ct, beg, endExcl))
                {
                    --ct_paramBeg;
                    goto appendParam1;
                }
                while (true)
                {
                    ct_paramBeg = ct.IndexOf(ParameterIdentifier_FirstChar, ct_paramBeg, endExcl - ct_paramBeg);
                    if (ct_paramBeg < 0)
                    {
                        break;
                    }
                    if (ct_paramBeg == beg || !Sql.SqlUtilities.IsIdentifierChar_NonFirst(ct[ct_paramBeg - 1]))
                    {
                        dbParam = dbCommand.Parameters.Cast<DbParameter>().Where(dbParam_i =>
                        {
                            if (!Utilities.StartsWith_Ordinal(ct, ct_paramBeg, endExcl, dbParam_i.ParameterName))
                            {
                                return false;
                            }
                            if (endExcl != dbParam_i.ParameterName.Length + ct_paramBeg && Sql.SqlUtilities.IsIdentifierChar_NonFirst(ct[ct_paramBeg + dbParam_i.ParameterName.Length]))
                            {
                                return false;
                            }
                            return true;
                        }).SingleOrDefault();
                        if (dbParam != null)
                        {
                            goto appendParam2;
                        }
                    }
                    ct_paramBeg += 2;
                    if (endExcl <= ct_paramBeg)
                    {
                        break;
                    }
                }
                return true;
            appendParam1:
                dbParam = dbCommand.Parameters.Get(ct, beg, endExcl);
                if (dbParam == null)
                {
                    throw new NotSupportedException();
                }
            appendParam2:
                if (dbParam.Direction != System.Data.ParameterDirection.Input)
                {
                    throw new NotSupportedException();
                }
                if (0 < ct_paramBeg - i)
                {
                    sb.Append(ct, i, ct_paramBeg - i);
                }
                Sql.SqlUtilities.Serialize(sb, dbParam.Value, dbParam.DbType);
                i = ct_paramBeg + dbParam.ParameterName.Length + 1;
                return true;
            });
            if (i < whereClause_endIdxExcl)
            {
                sb.Append(ct, i, whereClause_endIdxExcl);
            }
        }


        private static void AppendTableAlias(StringBuilder sb, string ct, int fromClauseBeg, int whereClauseBeg)
        {
            string identPattern = @"\[[^\]]*\](?!\])";
            var regex = new Regex(@"(?:" + identPattern + @")\s+(?:(?:as|AS|As|aS)\s+)?(" + identPattern + @")\s*$");
            Match match = regex.Match(ct, fromClauseBeg + Sql.SqlUtilities.FromKeyword.Length, whereClauseBeg - Sql.SqlUtilities.FromKeyword.Length - fromClauseBeg);
            if (!match.Success)
            {
                // SqlProvider changed (.NET version changed).
                throw new NotImplementedException();
            }
            var tableAliasCapture = match.Groups[1].Captures.Cast<Capture>().Single();
            sb.Append(ct, tableAliasCapture.Index, tableAliasCapture.Length);
        }

        private void AppendSetClauseTo(StringBuilder sb)
        {
            bool flag = false;
            sb.Append("SET ");
            foreach (var kvp in this.assignExprValFromColName)
            {
                if (flag)
                {
                    sb.Append(',');
                }
                sb.Append('[').Append(kvp.Key);
                sb.Append("]=");
                var constExpr = kvp.Value as ConstantExpression;
                if (constExpr != null)
                {
                    Sql.SqlUtilities.Serialize(sb, constExpr.Value, constExpr.Type);
                }
                else
                {
                    throw new NotImplementedException();
                }
                flag = true;
            }

        }


    }
}