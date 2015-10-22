using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Compilation;
using System.Web.Routing;

namespace WebApp
{
    public class AdminRouteHandler : IRouteHandler
    {
        private string virtualPath;
        public AdminRouteHandler(string virtualPath)
        {
            this.virtualPath = virtualPath;
        }

        public IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            var obj = 
                BuildManager.CreateInstanceFromVirtualPath(this.virtualPath, typeof(System.Web.UI.Page)) as IHttpHandler;



            return obj;
        }
    }
}