using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Linq;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading;

namespace WebApp.DataAccess
{
    public abstract class ProviderEx
    {
        private static readonly Type m_typeOfIProvider;
        private static volatile Func<object, Expression, DbCommand> m_iProvider_getCommandFunc;
        private static volatile Func<DataContext, object> m_dataContext_providerGetter;
        private static volatile Func<object, DbConnection> m_iProvider_getConnectionFunc;

        private object m_provider;
        private DataContext m_dataContext;

        static ProviderEx()
        {
            var typeOfIProvider = Type.GetType(typeof(System.Data.Linq.SqlClient.SqlProvider).AssemblyQualifiedName.Replace(".SqlClient.SqlProvider", ".Provider.IProvider"), false, false);
            if (typeOfIProvider == null)
            {
                throw new NotImplementedException();
            }
            m_typeOfIProvider = typeOfIProvider;
        }

        protected ProviderEx(DataContext dataContext, object provider)
        {
            if (provider == null)
            {
                throw new ArgumentNullException();
            }
            if (!m_typeOfIProvider.IsAssignableFrom(provider.GetType()))
            {
                throw new ArgumentException();
            }
            m_dataContext = dataContext;
            m_provider = provider;
        }

        public abstract void CreateIndex(string qualifiedTableName, Index index);
        public abstract void DeleteIndex(string qualifiedTableName, string indexName);
        public abstract IEnumerator<Index> GetIndices(string qualifiedTableName);

        private static Func<object, DbConnection> IProvider_GetConnectionFunc
        {
            get
            {
                if (m_iProvider_getConnectionFunc == null)
                {
                    var iProvider_connPropInfo = m_typeOfIProvider.GetProperty("Connection", BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly, null, typeof(DbConnection), Type.EmptyTypes, null);
                    MethodInfo iProvider_getConnMethodInfo;
                    if (iProvider_connPropInfo == null || (iProvider_getConnMethodInfo = iProvider_connPropInfo.GetGetMethod(true)) == null)
                    {
                        throw new MissingMethodException();
                    }

                    var p1 = Expression.Parameter(typeof(object), "a1");
                    m_iProvider_getConnectionFunc = Expression
                        .Lambda<Func<object, DbConnection>>(
                            Expression.Call(Expression.Convert(p1, m_typeOfIProvider), iProvider_getConnMethodInfo), 
                            p1)
                        .Compile();
                }
                return m_iProvider_getConnectionFunc;
            }
        }

        protected DataContext DataContext
        {
            get
            {
                return m_dataContext;
            }
        }

        public DbConnection Connection
        {
            get
            {
                return IProvider_GetConnectionFunc(this.m_provider);
            }
        }

        public DbCommand GetCommand(Expression expression)
        {
            return IProvider_GetCommandFunc(this.m_provider, expression);
        }

        private static Func<object, Expression, DbCommand> IProvider_GetCommandFunc
        {
            get
            {
                if (m_iProvider_getCommandFunc == null)
                {
                    var p1 = Expression.Parameter(typeof(object), "a1");
                    var p2 = Expression.Parameter(typeof(Expression), "a2");
                    var iProvider_getCommandMethodInfo = m_typeOfIProvider.GetMethod("GetCommand", BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly, null, new Type[] { typeof(Expression), }, null);
                    var getCommandExpr = Expression.Call(Expression.Convert(p1, m_typeOfIProvider), iProvider_getCommandMethodInfo, p2);
                    m_iProvider_getCommandFunc = Expression.Lambda<Func<object, Expression, DbCommand>>(getCommandExpr, p1, p2).Compile();
                }
                return m_iProvider_getCommandFunc;
            }
        }

        private static void DataContext_InitializeProviderGetter()
        {
            var dataContext_providerPropertyInfo = typeof(DataContext).GetProperty("Provider", BindingFlags.NonPublic | BindingFlags.DeclaredOnly | BindingFlags.Instance, null, m_typeOfIProvider, Type.EmptyTypes, null);
            MethodInfo dataContext_getProviderMethodInfo;
            if (dataContext_providerPropertyInfo == null || (dataContext_getProviderMethodInfo = dataContext_providerPropertyInfo.GetGetMethod(true)) == null || dataContext_getProviderMethodInfo.IsVirtual)
            {
                throw new NotImplementedException();
            }
            var p1 = Expression.Parameter(typeof(DataContext), "a1");
            var dataContext_providerGetter = Expression.Lambda<Func<DataContext, object>>(
                Expression.Call(p1, dataContext_getProviderMethodInfo), p1).Compile();
            m_dataContext_providerGetter = dataContext_providerGetter;
        }

        internal static ProviderEx FromDataContext(DataContext dc)
        {
            if (m_dataContext_providerGetter == null)
            {
                DataContext_InitializeProviderGetter();
            }
            object provider = m_dataContext_providerGetter(dc);
            ProviderEx providerEx;
            if (provider.GetType() == typeof(System.Data.Linq.SqlClient.SqlProvider))
            {
                providerEx = new Sql.SqlProviderEx(dc, provider);
            }
            else
            {
                throw new NotImplementedException();
            }
            return providerEx;
        }

    }
}
