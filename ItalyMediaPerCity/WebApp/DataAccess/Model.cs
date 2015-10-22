using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.DataAccess
{
    public partial class SampleMetadata
    {

        private static Lazy<Dictionary<string, string>> FieldNameTranslations_ModelToDatabase = new Lazy<Dictionary<string, string>>(LazyThreadSafetyMode.Publication, () =>
        {
            var dict = new Dictionary<string, string>()
            {
                { "Name", "name" },
                { "Gender", "gender" },
                { "YearOfBirth", "yearOfBirth" },
                { "MotherTongues", "motherTongues" },
                { "AlwaysLivedAtLocation0", "alwaysLivedAtLocation0" },
                { "YearOfMovingToLocation0", "yearOfMovingToLocation0" },
                { "OtherInformation", "otherInformation" },
                { "LocationId", "locationId" },
                { "TranslationFileId", "translationFileId" },
                { "TranscriptionFileId", "transcriptionFileId" },
                { "SampleDataFileId", "sampleDataFileId" },
            };
            return dict;
        });
        private static Lazy<Dictionary<string, string>> FieldNameTranslations_DatabaseToModel = new Lazy<Dictionary<string, string>>(LazyThreadSafetyMode.Publication, () =>
        {
            return FieldNameTranslations_ModelToDatabase.Value.ReverseDictionary();
        });

        public static bool TryTranslateFieldName(string @in, NameTranslationDirection dir, out string @out)
        {
            if (@in == null)
            {
                throw new ArgumentNullException();
            }
            if (dir != NameTranslationDirection.ModelToDatabase && dir != NameTranslationDirection.DatabaseToModel)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (dir == NameTranslationDirection.ModelToDatabase)
            {
                return FieldNameTranslations_ModelToDatabase.Value.TryGetValue(@in, out @out);
            }
            return FieldNameTranslations_DatabaseToModel.Value.TryGetValue(@in, out @out);
        }

    }

    public enum NameTranslationDirection
    {
        ModelToDatabase,
        DatabaseToModel,
    }
}