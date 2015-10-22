using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security;
using System.Web;
using System.Web.Security;
using WebApp.BusinessLogic;

namespace WebApp
{
    /// <summary>
    /// Summary description for DefaultHandler
    /// </summary>
    public class DefaultHandler : IHttpHandler
    {
     
        public void ProcessRequest(HttpContext context)
        {
            string action;
            if (ContainsNullKey(context.Request.QueryString) || ContainsNullKey(context.Request.Form))
            {
                throw CreateException(ErrorCode.RequestRouting_UnmappableValues_Nulls);
            }
            string queryString_action;
            bool queryString_hasOneAction = TryGetSoleValueByCaseSensitiveSimpleNameFast(context.Request.QueryString, "action", out queryString_action);
            string form_action;
            bool form_hasOneAction = TryGetSoleValueByCaseSensitiveSimpleNameFast(context.Request.Form, "action", out form_action);
            if (!(queryString_hasOneAction && form_hasOneAction) && (action = queryString_action ?? form_action) != null)
            {
            }
            else
            {
                throw CreateException(ErrorCode.RequestRouting_NoValidUnambiguousAction);
            }
            object result = null;
            bool hasResult = true;
            switch (action)
            {
                case "CreateSample":
                    result = this.CreateOrUpdateSample(context, false);
                    break;
                case "UpdateSample":
                    context.Request.EnsureIsAuthenticated();
                    result = this.CreateOrUpdateSample(context, true);
                    break;
                case "GetSampleMetadatas":
                    result = this.GetSampleMetadatas(context);
                    break;
                case "GetLocations":
                    result = this.GetLocations(context);
                    break;
                case "GetSampleCountPerLocation":
                    result = this.GetSampleCountPerLocation(context);
                    break;
                case "GetFileData":
                    this.GetFileData(context);
                    return;
                case "GetFileMetadata":
                    result = this.GetFileMetadata(context);
                    break;
                case "DeleteSample":
                    context.Request.EnsureIsAuthenticated();
                    this.DeleteSample(context);
                    hasResult = false;
                    break;
                case "GetApprovedSampleFields":
                    result = this.GetApprovedSampleFields(context);
                    break;
                case "SetIsSampleFieldApproved":
                    context.Request.EnsureIsAuthenticated();
                    result = this.SetIsSampleFieldApproved(context);
                    break;
                case "GetOrCreateLocation":
                    result = this.GetOrCreateLocation(context);
                    break;
                case "DeleteLocation":
                    context.Request.EnsureIsAuthenticated();
                    this.DeleteLocation(context);
                    hasResult = false;
                    break;
                case "UpdateLocation":
                    context.Request.EnsureIsAuthenticated();
                    result = this.UpdateLocation(context);
                    break;
                case "SignIn":
                    result = this.SignIn(context);
                    break;
                case "GetIsAuthenticated":
                    result = context.Request.GetFormAuthIdentity() != null;
                    break;
                case "SignOut":
                    this.SignOut(context);
                    hasResult = false;
                    break;
                default:
                    return;
            }
            if (hasResult)
            {
                string resultJson = JsonConvert.SerializeObject(result);
                context.Response.Write(resultJson);
                context.Response.ContentType = "application/json";
            }
            context.Response.StatusCode = 200;
        }

        private void DeleteLocation(HttpContext context)
        {
            int id = GetInt32NonNull(context.Request.QueryString, "id");
            using (var b = new Business())
            {
                b.DeleteLocation(id);
            }
        }

        private object GetFileMetadata(HttpContext context)
        {
            int fileId = GetInt32NonNull(context.Request.QueryString, "id");
            using (var b = new Business())
            {
                var obj = b.GetFile(fileId, false);
                return new
                {
                    Id = obj.Id,
                    Name = obj.Name,
                    MimeType = obj.MimeType,
                };
            }
        }

        private object GetApprovedSampleFields(HttpContext context)
        {
            int smdId = GetInt32NonNull(context.Request.QueryString, "id");
            using (var b = new Business())
            {
                var approvedFields = b.GetApprovedSampleFields(smdId);
                return approvedFields.Select(i => FieldName_BusinessToView(i));
            }
        }

        private void DeleteSample(HttpContext context)
        {
            int smdId = GetInt32NonNull(context.Request.QueryString, "id");
            using (var b = new Business())
            {
                b.DeleteSample(smdId);
            }
        }

        private object UpdateLocation(HttpContext context)
        {
            int locId = GetInt32NonNull(context.Request.QueryString, "id");
            string name = GetString(context.Request.QueryString, "name");
            double? latitude = GetDouble(context.Request.QueryString, "latitude", null, f => double.NegativeInfinity < f && f < double.PositiveInfinity);
            double? longitude = GetDouble(context.Request.QueryString, "longitude", null, f => double.NegativeInfinity < f && f < double.PositiveInfinity);
            int? impCat = GetInt32(context.Request.QueryString, "importanceCategory", null, i => 0 <= i && i <= 1);
            bool? shouldSetName = GetBoolean(context.Request.QueryString, name, null);
            if (shouldSetName == null)
            {
                if (name != null)
                {
                    shouldSetName = true;
                }
                else
                {
                    shouldSetName = false;
                }
            }
            else
            {
                if (!(bool)shouldSetName && name != null)
                {
                    throw new ArgumentException();
                }
            }
            using (var b = new Business())
            {
                var loc = b.GetLocation(id: locId);
                loc.Latitude = latitude;
                loc.Longitude = longitude;
                if (impCat != null)
                {
                    loc.ImportanceCategory = (int)impCat;
                }
                if ((bool)shouldSetName)
                {
                    loc.Name = name;
                }
                b.UpdateLocation(loc);
                return loc;
            }
        }

        private object GetLocations(HttpContext context)
        {
            bool f = GetBooleanNonNull(context.Request.QueryString, "sortNullLatLngFirst", false);
            Location[] r;
            using (var b = new Business())
            {
                r = b.GetLocations(
                    id: GetInt32(context.Request.QueryString, "id"), 
                    name: GetString(context.Request.QueryString, "name"));
            }
            if (f)
            {
                Array.Sort(r, (l1, l2) =>
                {

                    int i1 = (l1.Latitude == null || l1.Longitude == null ? 0 : 1);
                    int i2 = (l2.Latitude == null || l2.Longitude == null ? 0 : 1);

                    return i1.CompareTo(i2);
                });
            }
            return r;
        }
        
        private object GetSampleCountPerLocation(HttpContext context)
        {
            using (var b = new Business())
            {
                return b.GetSampleCountPerLocation(
                    isSampleDataFileApproved: context.Request.GetFormAuthIdentity() != null ? null : new bool?(true)
                    );
            }
        }

        private object GetOrCreateLocation(HttpContext context)
        {
            string locName = GetString(context.Request.QueryString, "name");
            using (var b = new Business())
            {
                var loc = b.GetLocation(name: locName);
                if (loc == null)
                {
                    loc = new Location();
                    loc.Name = locName;
                    loc.ImportanceCategory = 0;
                    b.CreateLocation(loc);
                }
                return loc;
            }

        }

        /*
        private static bool TryBindToAction(HttpRequest req, MethodInfo methodInfo, out object info)
        {
            var args = methodInfo.GetParameters();

            return false;
        }
        */

        private const int MaxMaxRows = 200;
        private static class Functions<T>
        {
            public static readonly Func<T, T> Identity = i => i;
        }


        private object SetIsSampleFieldApproved(HttpContext context)
        {
            if (!"post".Equals(context.Request.HttpMethod, StringComparison.OrdinalIgnoreCase))
            {
                throw new ModelBindingException();
            }
            int smdId = GetInt32NonNull(context.Request.QueryString, "id");
            string smdField_name = GetStringNonNull(context.Request.QueryString, "field");
            bool newValue = GetBooleanNonNull(context.Request.QueryString, "value");

            using (var b = new Business())
            {
                bool oldValue;
                try
                {
                    oldValue = b.SetIsSampleFieldApproved(smdId, smdField_name, newValue);
                }
                catch (BusinessLogicException ex)
                {
                    if (ex.ErrorCode == BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName)
                    {
                        return new
                        {
                            Success = false,
                            ErrorMessage = "The entity type SampleMetadata does not have a field named \"" + smdField_name + "\" or this field is not approvable.",
                        };
                    }
                    throw;
                }
                return new
                {
                    Success = true,
                    DidValueChange = oldValue != newValue,
                };
            }
        }

        private static bool TryGetString(NameValueCollection nameValueCollection, string name, out string value)
        {
            value = null;
            for (int i = 0; i < nameValueCollection.Count; ++i)
            {
                string name_i = nameValueCollection.GetKey(i);
                if (!string.Equals(name_i, name, StringComparison.Ordinal))
                {
                    continue;
                }
                string[] values = nameValueCollection.GetValues(i);
                if (values.Length != 1)
                {
                    return false;
                }
                value = values[0];
                return true;
            }
            return true;
        }

        private static T? Get<T>(NameValueCollection nameValueCollection, string name, Func<string, T> parser, T? defaultValue = null, Func<T, bool> validator = null) where T : struct
        {
            string valueAsString;
            T? value;
            if (!TryGetString(nameValueCollection, name, out valueAsString))
            {
                throw new ModelBindingException();
            }
            if (valueAsString == null)
            {
                value = defaultValue;
            }
            else
            {
                value = parser(valueAsString);
            }
            if (validator != null && value.HasValue && !validator((T)value))
            {
                throw new ModelBindingException();
            }
            return value;
        }

        private static T Get<T>(NameValueCollection nameValueCollection, string name, Func<string, T> parser, T defaultValue, Func<T, bool> validator = null) where T : class
        {
            string valueAsString;
            T value;
            if (!TryGetString(nameValueCollection, name, out valueAsString))
            {
                throw new ModelBindingException();
            }
            if (valueAsString == null)
            {
                value = defaultValue;
            }
            else
            {
                value = parser(valueAsString);
            }
            if (validator != null && !validator(value))
            {
                throw new ModelBindingException();
            }
            return value;
        }

        private static bool? GetBoolean(NameValueCollection nameValueCollection, string name, bool? defaultValue = null)
        {
            bool? value = Get<bool>(nameValueCollection, name, valueAsString =>
            {
                if ("true".Equals(valueAsString, StringComparison.Ordinal))
                {
                    return true;
                }
                if ("false".Equals(valueAsString, StringComparison.Ordinal))
                {
                    return false;
                }
                throw new ModelBindingException();
            }, defaultValue);
            return value;
        }

        private static bool GetBooleanNonNull(NameValueCollection nameValueCollection, string name, bool? defaultValue = null)
        {
            bool? value = GetBoolean(nameValueCollection, name, defaultValue);
            if (value == null)
            {
                throw new ModelBindingException();
            }
            return (bool)value;
        }

        private static int? GetInt32(NameValueCollection nameValueCollection, string name, int? defaultValue = null, Func<int, bool> validator = null)
        {
            return Get<int>(nameValueCollection, name, valueAsString =>
            {
                int value;
                if (!int.TryParse(valueAsString, NumberStyles.AllowLeadingSign, NumberFormatInfo.InvariantInfo, out value))
                {
                    throw new ModelBindingException();
                }
                return value;
            }, defaultValue, validator);
        }

        private static int GetInt32NonNull(NameValueCollection nameValueCollection, string name, int? defaultValue = null, Func<int, bool> validator = null)
        {
            int? value = GetInt32(nameValueCollection, name, defaultValue, validator);
            if (value == null)
            {
                throw new ModelBindingException();
            }
            return (int)value;
        }


        private static double? GetDouble(NameValueCollection nameValueCollection, string name, double? defaultValue = null, Func<double, bool> validator = null)
        {
            return Get<double>(nameValueCollection, name, valueAsString =>
            {
                double value;
                if (!double.TryParse(valueAsString, NumberStyles.AllowLeadingSign | NumberStyles.AllowExponent | NumberStyles.AllowDecimalPoint, NumberFormatInfo.InvariantInfo, out value))
                {
                    throw new ModelBindingException();
                }
                return value;
            }, defaultValue, validator);
        }

        private static double GetDoubleNonNull(NameValueCollection nameValueCollection, string name, double? defaultValue = null, Func<double, bool> validator = null)
        {
            double? value = GetDouble(nameValueCollection, name, defaultValue, validator);
            if (value == null)
            {
                throw new ModelBindingException();
            }
            return (double)value;
        }

        private static string GetString(NameValueCollection nameValueCollection, string name, string defaultValue = null, Func<string, bool> validator = null)
        {
            return Get<string>(nameValueCollection, name, Functions<string>.Identity, defaultValue, validator);
        }

        private static string GetStringNonNull(NameValueCollection nameValueCollection, string name, string defaultValue = null, Func<string, bool> validator = null)
        {
            string @string = Get<string>(nameValueCollection, name, Functions<string>.Identity, defaultValue, validator);
            if (@string == null)
            {
                throw new ModelBindingException();
            }
            return @string;
        }

        private object SignIn(HttpContext context)
        {
            if (!"post".Equals(context.Request.HttpMethod, StringComparison.OrdinalIgnoreCase))
            {
                throw new ModelBindingException();
            }
            string username = GetStringNonNull(context.Request.Form, "username");
            string password = GetStringNonNull(context.Request.Form, "password");
            bool rememberMe = GetBooleanNonNull(context.Request.Form, "rememberMe", false);

            bool isAuthentic;
            using (var b = new Business())
            {
                isAuthentic = b.IdentifyAndAuthenticate(username, password);
            }
            if (isAuthentic)
            {
                FormsAuthentication.SetAuthCookie(username, rememberMe);
            }
            return isAuthentic;
        }

        private void SignOut(HttpContext context)
        {
            if (!"post".Equals(context.Request.HttpMethod, StringComparison.OrdinalIgnoreCase))
            {
                throw new ModelBindingException();
            }
            FormsAuthentication.SignOut();
        }

        private object GetSampleMetadatas(HttpContext context)
        {
            
            var isAuthenticated = context.Request.GetFormAuthIdentity() != null;
            using (var b = new Business())
            {
                var smdArr = b.GetSampleMetadatas(
                    isSampleDataFileApproved: isAuthenticated ? null : new bool?(true),
                    id: GetInt32(context.Request.QueryString, "id"),
                    locationId: GetInt32(context.Request.QueryString, "locationId"),
                    orderByCreatedAtDescending: GetBooleanNonNull(context.Request.QueryString, "orderByCreatedAtDescending", false),
                    offset: GetInt32NonNull(context.Request.QueryString, "offset", 0, offset_i => (0 <= offset_i)),
                    maxRows: GetInt32(context.Request.QueryString, "maxRows", null, maxRows_i => (0 <= maxRows_i && maxRows_i <= MaxMaxRows)));
                for (int i = 0; i < smdArr.Length; ++i)
                {
                    if (smdArr[i].IsAnonymous && !isAuthenticated)
                    {
                        smdArr[i].Name = null;
                    }
                }

                return smdArr;
            }
        }


        private void GetFileData(HttpContext context)
        {
            File sdFile;
            using (var b = new Business())
            {
                sdFile = b.GetFile(
                    id: GetInt32NonNull(context.Request.QueryString, "id"));
                if (sdFile == null)
                {
                    throw new ArgumentException();
                }
            }
            context.Response.AddHeader("content-disposition", "attachment;filename=\"" + sdFile.Name + "\"");
            context.Response.ContentType = sdFile.MimeType;
            context.Response.OutputStream.Write(sdFile.Data, 0, sdFile.Data.Length);
            context.Response.StatusCode = 200;
        }

        private static HttpPostedFile GetFile(HttpRequest request, string name, bool isRequired = false)
        {
            if (name == null)
            {
                throw new ArgumentNullException();
            }
            HttpPostedFile file = null;
            for (int i = 0; i < request.Files.Count; ++i)
            {
                if (string.CompareOrdinal(name, request.Files.GetKey(i)) == 0)
                {
                    file = request.Files.Get(i);
                    break;
                }
            }
            if (file == null && isRequired)
            {
                throw new Exception();
            }
            return file;
        }

        private object CreateOrUpdateSample(HttpContext context, bool shouldExpectUpdate)
        {
            var smd = new SampleMetadata();
            int? smdId = GetInt32(context.Request.Form, "id");
            bool isUpdate = smdId != null;
            if (shouldExpectUpdate != isUpdate)
            {
                throw new UnauthorizedAccessException();
            }
            if (isUpdate)
            {
                context.Request.EnsureIsAuthenticated();
                smd.Id = (int)smdId;
            }

            HttpPostedFile sampleDataFileHttp = GetFile(context.Request, "sampleDataFileData", !isUpdate);
            string sampleDataFileName = GetString(context.Request.Form, "sampleDataFileName") ?? (sampleDataFileHttp == null ? null : sampleDataFileHttp.FileName);
            string sampleDataFileType = GetString(context.Request.Form, "sampleDataFileType") ?? (sampleDataFileHttp == null ? null : sampleDataFileHttp.ContentType);
            int? sampleDataFileId = null;
            if (isUpdate)
            {
                sampleDataFileId = GetInt32(context.Request.Form, "sampleDataFileId");
                if (sampleDataFileId != null && sampleDataFileHttp != null)
                {
                    throw new ArgumentException();
                }
                if (sampleDataFileId == null && sampleDataFileHttp == null)
                {
                    throw new ArgumentException();
                }
            }

            HttpPostedFile translationFileHttp = GetFile(context.Request, "translationFileData");
            string translationFileName = GetString(context.Request.Form, "translationFileName") ?? (translationFileHttp == null ? null : translationFileHttp.FileName);
            string translationFileType = GetString(context.Request.Form, "translationFileType") ?? (translationFileHttp == null ? null : translationFileHttp.ContentType);
            int? translationFileId = null;
            if (isUpdate)
            {
                translationFileId = GetInt32(context.Request.Form, "translationFileId");
                if (translationFileId != null && translationFileHttp != null)
                {
                    throw new ArgumentException();
                }
            }


            HttpPostedFile transcriptionFileHttp = GetFile(context.Request, "transcriptionFileData");
            string transcriptionFileName = GetString(context.Request.Form, "transcriptionFileName") ?? (transcriptionFileHttp == null ? null : transcriptionFileHttp.FileName);
            string transcriptionFileType = GetString(context.Request.Form, "transcriptionFileType") ?? (transcriptionFileHttp == null ? null : transcriptionFileHttp.ContentType);
            int? transcriptionFileId = null;
            if (isUpdate)
            {
                transcriptionFileId = GetInt32(context.Request.Form, "transcriptionFileId");
                if (transcriptionFileId != null && transcriptionFileHttp != null)
                {
                    throw new ArgumentException();
                }
            }

            smd.CreatedAt = DateTime.UtcNow;
            smd.LocationId = GetInt32NonNull(context.Request.Form, "locationId");
            smd.Name = GetStringNonNull(context.Request.Form, "name");
            smd.MotherTongues = GetString(context.Request.Form, "motherTongues");
            smd.YearOfBirth = GetInt32(context.Request.Form, "yearOfBirth", null, i => 1850 <= i && i <= DateTime.UtcNow.Year);
            smd.IsAnonymous = GetBooleanNonNull(context.Request.Form, "isAnonymous", true);
            smd.YearOfMovingToLocation0 = GetInt32(context.Request.Form, "yearOfMovingToLocation0", null, i => 1850 <= i && i <= DateTime.UtcNow.Year);
            smd.AlwaysLivedAtLocation0 = GetBoolean(context.Request.Form, "alwaysLivedAtLocation0");
            smd.OtherInformation = GetString(context.Request.Form, "otherInformation");
            smd.Gender = (Gender)Get<Gender>(context.Request.Form, "gender", s =>
            {
                switch (s)
                {
                    case "male": return Gender.Male;
                    case "female": return Gender.Female;
                    default:
                        throw new Exception();
                }
            }, (Gender?)Gender.Other);

            List<string> approvedFieldNames = null;
            List<string> unapprovedFieldNames = null;
            if (isUpdate)
            {
                approvedFieldNames = GetString(context.Request.Form, "approvedFields", "").Split(new char[] { ',', }, StringSplitOptions.RemoveEmptyEntries).Select(i => FieldName_ViewToBusiness(i)).ToList();
                unapprovedFieldNames = GetString(context.Request.Form, "unapprovedFields", "").Split(new char[] { ',', }, StringSplitOptions.RemoveEmptyEntries).Select(i => FieldName_ViewToBusiness(i)).ToList();
            }


            // PROCESS TRANSCRIPTION AND TRANSLATION AND MAKE THEM FILES!!!!
         
            using (var b = new Business())
            {
                File translationFile = null;
                if (translationFileHttp != null)
                {
                    translationFile = b.CreateFile(
                        name: translationFileName,
                        mimeType: translationFileType,
                        data: translationFileHttp.InputStream);
                }
                File transcriptionFile = null;
                if (transcriptionFileHttp != null)
                {
                    transcriptionFile = b.CreateFile(
                        name: transcriptionFileName,
                        mimeType: transcriptionFileType,
                        data: transcriptionFileHttp.InputStream);
                }
                File sampleDataFile = null;
                if (sampleDataFileHttp != null)
                {
                    sampleDataFile = b.CreateFile(
                        name: sampleDataFileName,
                        mimeType: sampleDataFileType,
                        data: sampleDataFileHttp.InputStream);
                }
                smd.TranscriptionFileId = transcriptionFileId ?? (transcriptionFile == null ? null : new int?(transcriptionFile.Id));
                smd.TranslationFileId = translationFileId ?? (translationFile == null ? null : new int?(translationFile.Id));
                smd.SampleDataFileId = sampleDataFileId ?? sampleDataFile.Id;
                if (isUpdate)
                {
                    b.UpdateSampleMetadata(smd);

                    foreach (var fieldName in approvedFieldNames)
                    {
                        b.SetIsSampleFieldApproved(smd.Id, fieldName, true);
                    }
                    foreach (var fieldName in unapprovedFieldNames)
                    {
                        b.SetIsSampleFieldApproved(smd.Id, fieldName, false);
                    }

                }
                else
                {
                    b.CreateSampleMetadata(smd);
                }
            }
            return smd;
        }

        private static string FieldName_BusinessToView(string i)
        {
            string s;
            if (!FieldNameTranslations_BusinessToView.Value.TryGetValue(i, out s))
            {
                throw new ModelBindingException();
            }
            return s;
        }

        private static Lazy<Dictionary<string, string>> FieldNameTranslations_BusinessToView = new Lazy<Dictionary<string, string>>(LazyThreadSafetyMode.Publication, () =>
        {
            return FieldNameTranslations_ViewToBusiness.Value.ReverseDictionary();
        });

        private static Lazy<Dictionary<string, string>> FieldNameTranslations_ViewToBusiness = new Lazy<Dictionary<string, string>>(LazyThreadSafetyMode.Publication, () =>
        {
            return new Dictionary<string, string>()
            {
                { "alwaysLivedAtLocation0", "AlwaysLivedAtLocation0"},
                { "yearOfMovingToLocation0", "YearOfMovingToLocation0"},
                {"yearOfBirth", "YearOfBirth"},
                {"translationFile", "TranslationFileId"},
                {"transcriptionFile", "TranscriptionFileId"},
                {"sampleDataFile", "SampleDataFileId"},
                {"otherInformation", "OtherInformation"},
                {"name", "Name"},
                {"motherTongues", "MotherTongues"},
                {"gender", "Gender"},
            };
        });

        private static string FieldName_ViewToBusiness(string i)
        {
            string s;
            if (!FieldNameTranslations_ViewToBusiness.Value.TryGetValue(i, out s))
            {
                throw new ModelBindingException();
            }
            return s;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
        private class NameObjectCollectionHelpers
        {
            public readonly Func<NameObjectCollectionBase, Hashtable> EntriesTable_Getter;
            public readonly Func<object, KeyValuePair<string, ArrayList>> EntryConverter;
            public readonly Func<NameObjectCollectionBase, object> NullKeyEntry_Getter;

            public NameObjectCollectionHelpers()
            {
                var cType = typeof(NameObjectCollectionBase);
                var cHashtableField = cType.GetField("_entriesTable", BindingFlags.DeclaredOnly | BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);
                var cParamExpr = Expression.Parameter(cType, "c");
                this.EntriesTable_Getter =
                    (Func<NameObjectCollectionBase, Hashtable>)Expression.Lambda(
                        typeof(Func<NameObjectCollectionBase, Hashtable>),
                        Expression.MakeMemberAccess(cParamExpr, cHashtableField),
                        cParamExpr)
                    .Compile();


                var cEntryType = cType.GetNestedType("NameObjectEntry", BindingFlags.DeclaredOnly | BindingFlags.NonPublic | BindingFlags.Public);
                var cEntryKeyField = cEntryType.GetField("Key", BindingFlags.DeclaredOnly | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
                var cEntryValueField = cEntryType.GetField("Value", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance);
                var ourEntryType = typeof(KeyValuePair<string, ArrayList>);
                var ourEntryConstructor = ourEntryType.GetConstructor(
                    BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly | BindingFlags.Instance,
                    null,
                    new Type[] { typeof(string), typeof(ArrayList), },
                    null);

                var cEntryExprObj = Expression.Parameter(typeof(object), "e");
                var cEntryExpr = Expression.Convert(cEntryExprObj, cEntryType);
                var cEntryKeyExpr = Expression.MakeMemberAccess(cEntryExpr, cEntryKeyField);
                var cEntryValueExprObj = Expression.MakeMemberAccess(cEntryExpr, cEntryValueField);
                var cEntryValueExpr = Expression.Convert(cEntryValueExprObj, typeof(ArrayList));
                this.EntryConverter =
                    (Func<object, KeyValuePair<string, ArrayList>>)Expression.Lambda(
                        typeof(Func<object, KeyValuePair<string, ArrayList>>),
                        Expression.New(ourEntryConstructor, cEntryKeyExpr, cEntryValueExpr),
                        cEntryExprObj)
                    .Compile();

                var cNullKeyEntryField = cType.GetField("_nullKeyEntry", BindingFlags.DeclaredOnly | BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance);
                this.NullKeyEntry_Getter =
                    (Func<NameObjectCollectionBase, object>)Expression.Lambda(
                        typeof(Func<NameObjectCollectionBase, object>),
                        Expression.MakeMemberAccess(cParamExpr, cNullKeyEntryField),
                        cParamExpr)
                    .Compile();
            }
        }


        private static Exception CreateException(ErrorCode errorCode)
        {
            return new Exception(errorCode.ToString());
        }


        private static Lazy<NameObjectCollectionHelpers> nameObjectCollectionHelpers;


        internal static bool TryGetSoleValueByCaseSensitiveSimpleNameFast(NameValueCollection @this, string name, out string value)
        {
            if (name == null)
            {
                throw new ArgumentNullException();
            }
            var h = nameObjectCollectionHelpers.Value;

            var hashtable = h.EntriesTable_Getter(@this);
            object entryObject = hashtable[name];
            KeyValuePair<string, ArrayList> entry;
            if (entryObject != null &&
                name.Equals((entry = h.EntryConverter(entryObject)).Key) &&
                entry.Value.Count == 1)
            {
                value = (string)entry.Value[0];
                return true;
            }
            value = null;
            return false;
        }

        internal static bool ContainsNullKey(NameValueCollection @this)
        {
            return nameObjectCollectionHelpers.Value.NullKeyEntry_Getter(@this) != null;
        }


    }


    public class ModelBindingException : Exception
    {
        public ModelBindingException(string message = null, Exception innerException = null)
            : base(message, innerException)
        {
        }
    }


    internal enum ErrorCode
    {
        RequestRouting_NoValidUnambiguousAction,
        RequestRouting_UnmappableValues_Nulls,
    }


    internal static class WebUtilities
    {

        public static string GetFormAuthIdentity(this HttpRequest req)
        {
            if (req == null)
            {
                throw new ArgumentNullException();
            }
            var cookie = req.Cookies[FormsAuthentication.FormsCookieName];
            if (cookie == null || string.IsNullOrEmpty(cookie.Value))
            {
                return null;
            }
            FormsAuthenticationTicket ticket; try
            {
                ticket = FormsAuthentication.Decrypt(cookie.Value);
            }
            catch (ArgumentException)
            {
                return null;
            }
            return ticket.Name.ToNullIfEmpty();
        }

        public static void EnsureIsAuthenticated(this HttpRequest req)
        {
            string username = req.GetFormAuthIdentity();
            if (username == null)
            {
                throw new UnauthorizedAccessException();
            }
        }

    }

}