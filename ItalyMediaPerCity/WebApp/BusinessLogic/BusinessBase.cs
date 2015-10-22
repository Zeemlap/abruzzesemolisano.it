using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using WebApp.DataAccess;

namespace WebApp.BusinessLogic
{
    public class BusinessBase : IDisposable
    {
        private Linq2SqlDataAccessDataContext da;
        private static volatile ConnectionStringSettings defaultConnStrSettings;

        private static ConnectionStringSettings GetDefaultConnectionStringSettings()
        {
            var connStrSettingsList = ConfigurationManager.ConnectionStrings;
            ConnectionStringSettings defaultConnStrSettings = null;
            for (int i = 0; i < connStrSettingsList.Count; ++i)
            {
                var connStrSettings = connStrSettingsList[i];
                if ("default".Equals(connStrSettings.Name, StringComparison.OrdinalIgnoreCase))
                {
                    if (defaultConnStrSettings != null)
                    {
                        throw new ConfigurationErrorsException("Multiple connection string settings with name \"default\"");
                    }
                    defaultConnStrSettings = connStrSettingsList[i];
                    if (string.IsNullOrEmpty(defaultConnStrSettings.ConnectionString))
                    {
                        throw new ConfigurationErrorsException("A connection string setting with name \"default\" has empty or null ConnectionString");
                    }
                }
            }
            if (defaultConnStrSettings == null)
            {
                throw new ConfigurationErrorsException("No connection string settings with name \"default\"");
            }
            return defaultConnStrSettings;
        }


        public static ConnectionStringSettings DefaultConnectionStringSettings
        {
            get
            {
                if (defaultConnStrSettings == null)
                {
                    defaultConnStrSettings = GetDefaultConnectionStringSettings();
                }
                return defaultConnStrSettings;
            }
        }

        protected Linq2SqlDataAccessDataContext DataContext
        {
            get
            {
                if (this.da == null)
                {
                    this.da = new Linq2SqlDataAccessDataContext(DefaultConnectionStringSettings.ConnectionString);
                }
                return this.da;
            }
        }

        public void Dispose()
        {
            if (this.da != null)
            {
                this.da.Dispose();
                this.da = null;
            }
        }
    }
}