using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Linq;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Web;

namespace WebApp.DataAccess
{
    public struct DbConnectionUsageScope : IDisposable
    {
        private DbConnection conn;

        internal DbConnectionUsageScope(DbConnection conn)
        {
            this.conn = conn;
        }

        public void Dispose()
        {
            if (this.conn != null)
            {
                this.conn.Dispose();
                this.conn = null;
            }
        }
    }

    public static class CommonUtilities
    {

        public static DbParameter Get(this DbParameterCollection p, string pn, int pn_begIdx, int pn_endIdxExcl)
        {
            int i = p.IndexOf(pn, pn_begIdx, pn_endIdxExcl);
            if (i < 0)
            {
                return null;
            }
            return p[i];
        }

        public static int IndexOf(this DbParameterCollection p, string pn, int pn_begIdx, int pn_endIdxExcl)
        {
            if (p == null || pn == null)
            {
                throw new ArgumentNullException();
            }
            for (int i = 0; i < p.Count; ++i)
            {
                int pn_len = pn_endIdxExcl - pn_begIdx;
                var pn_i = p[i].ParameterName;
                if (pn_len == pn_i.Length && string.CompareOrdinal(pn, pn_begIdx, pn_i, 0, pn_len) == 0)
                {
                    return i;
                }
            }
            return -1;
        }

        public static ProviderEx GetProvider(this DataContext @this)
        {
            return ProviderEx.FromDataContext(@this);
        }

        public static DbConnectionUsageScope OpenScope(this DbConnection @this)
        {
            if (@this == null)
            {
                throw new ArgumentNullException();
            }
            switch (@this.State)
            {
                case System.Data.ConnectionState.Closed:
                    return new DbConnectionUsageScope(@this);
                case System.Data.ConnectionState.Open:
                    return new DbConnectionUsageScope(null);
                default:
                    throw new InvalidOperationException();
            }
        }

        public static UpdateCommandBuilder<TEntity> UpdateBuilder<TEntity>(this Table<TEntity> @this) where TEntity : class
        {
            if (@this == null)
            {
                throw new ArgumentNullException();
            }
            var mt = @this.Context.Mapping.GetTable(typeof(TEntity));
            if (mt == null)
            {
                throw new NotImplementedException();
            }
            return new UpdateCommandBuilder<TEntity>(@this.Context, mt);
        }

        public static IndexCollection<TEntity> GetIndices<TEntity>(this Table<TEntity> @this) where TEntity : class
        {
            if (@this == null)
            {
                throw new ArgumentException();
            }
            return new IndexCollection<TEntity>(@this.Context);

        }

    }
}