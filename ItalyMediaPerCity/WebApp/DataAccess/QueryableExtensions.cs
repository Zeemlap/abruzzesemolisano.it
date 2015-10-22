using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.BusinessLogic
{
    public static class QueryableExtensions
    {


        public static T SingleOrDefault_Materialize<T>(this IQueryable<T> q)
        {
            var qFirst = q.Take(2).ToList();
            if (qFirst.Count == 0)
            {
                return default(T);
            }
            if (qFirst.Count == 1)
            {
                return qFirst[0];
            }
            throw new InvalidOperationException();
        }


    }
}