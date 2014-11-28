using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Tour
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            /*
            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );
            */

            routes.MapRoute(
               name: "Default",
               url: "{action}/{id1}/{id2}/{id3}/{id4}/{id5}/{id6}",
               defaults: new
               {
                   controller = "Tour",
                   action = "Default",
                   id1 = UrlParameter.Optional,
                   id2 = UrlParameter.Optional,
                   id3 = UrlParameter.Optional,
                   id4 = UrlParameter.Optional,
                   id5 = UrlParameter.Optional,
                   id6 = UrlParameter.Optional
               }
           );

        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
        }
    }
}