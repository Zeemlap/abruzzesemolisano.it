using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace WebApp.BusinessLogic
{
    public enum Gender
    {
        Other,
        Male,
        Female,
    }

    public class File
    {
        /////////////////////////////////////
        // MAKE SURE TO MAP ALL PROPERTIES
        /////////////////////////////////////
        public int Id { get; set; }

        public byte[] Data { get; set; }
        public string MimeType { get; set; }

        public string Name { get; set; }

        internal static File FromDataAccessModel(DataAccess.File f, bool cloneData = true)
        {
            if (f == null)
            {
                return null;
            }
            return new File()
            {
                Id = f.Id,
                Name = f.Name,
                MimeType = f.MimeType,
                Data = (f.Data != null && cloneData ? (byte[])f.Data.Clone() : f.Data),
            };
        }
    }

    public class Location
    {
        /////////////////////////////////////
        // MAKE SURE TO MAP ALL PROPERTIES
        /////////////////////////////////////


        internal static Location FromDataAccessModel(DataAccess.Location l)
        {
            if (l == null)
            {
                return null;
            }
            return new Location()
            {
                Id = l.Id,
                Name = l.Name,
                ImportanceCategory = l.ImportanceCategory,
                Latitude = l.Latitude,
                Longitude = l.Longitude,
            };
        }

        public string Name { get; set; }

        public int Id { get; set; }

        public int? ImportanceCategory { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public DataAccess.Location ToDataAccessModel(DataAccess.Location daLoc = null)
        {
            if (daLoc == null)
            {
                daLoc = new DataAccess.Location();
            }
            daLoc.Id = this.Id;
            daLoc.Name = this.Name;
            daLoc.ImportanceCategory = this.ImportanceCategory;
            daLoc.Latitude = this.Latitude;
            daLoc.Longitude = this.Longitude;
            return daLoc;
        }

    }

    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
    public class ApprovableAttribute : Attribute
    {
    }

    public class SampleMetadata
    {
        /////////////////////////////////////
        // MAKE SURE TO MAP ALL PROPERTIES
        /////////////////////////////////////
        public int Id
        {
            get;
            set;
        }

        private Gender gender;

        [Approvable]
        public Gender Gender
        {
            get
            {
                return this.gender;
            }
            set
            {
                if (gender != BusinessLogic.Gender.Male && gender != BusinessLogic.Gender.Female && gender != BusinessLogic.Gender.Other)
                {
                    throw new ArgumentOutOfRangeException();
                }
                this.gender = value;
            }
        }

        public bool IsAnonymous { get; set; }

        public int? LocationId { get; set; }

        [Approvable]
        public string MotherTongues { get; set; }

        [Approvable]
        public string Name { get; set; }

        [Approvable]
        public string OtherInformation { get; set; }

        [Approvable]
        public int SampleDataFileId { get; set; }

        [Approvable]
        public int? TranscriptionFileId { get; set; }

        [Approvable]
        public int? TranslationFileId { get; set; }

        private int? yearOfBirth;

        [Approvable]
        public int? YearOfBirth
        {
            get
            {
                return this.yearOfBirth;
            }
            set
            {
                if (value.HasValue)
                {
                    int i = (int)value;
                    if (short.MaxValue < i || i < short.MinValue)
                    {
                        throw new ArgumentOutOfRangeException();
                    }
                }
                this.yearOfBirth = value;
            }
        }



        private int? yearOfMovingToLocation0;


        [Approvable]
        public int? YearOfMovingToLocation0
        {
            get
            {
                return this.yearOfMovingToLocation0;
            }
            set
            {
                if (value.HasValue)
                {
                    int i = (int)value;
                    if (short.MaxValue < i || i < short.MinValue)
                    {
                        throw new ArgumentOutOfRangeException();
                    }
                }
                this.yearOfMovingToLocation0 = value;
            }
        }

        [Approvable]
        public bool? AlwaysLivedAtLocation0 { get; set; }

        public DateTime CreatedAt { get; set; }

        internal static SampleMetadata FromDataAccessModel(DataAccess.SampleMetadata smd)
        {
            if (smd == null)
            {
                return null;
            }
            return new SampleMetadata()
            {
                Id = smd.Id,
                IsAnonymous = smd.IsAnonymous,
                CreatedAt = smd.CreatedAt,
                LocationId = smd.LocationId,
                MotherTongues = smd.MotherTongues,
                Name = smd.Name,
                OtherInformation = smd.OtherInformation,
                SampleDataFileId = smd.SampleDataFileId,
                TranscriptionFileId = smd.TranscriptionFileId,
                TranslationFileId = smd.TranslationFileId,
                YearOfBirth = smd.YearOfBirth,
                YearOfMovingToLocation0 = smd.YearOfMovingToLocation0,
                AlwaysLivedAtLocation0 = smd.AlwaysLivedAtLocation0,
                Gender = (Gender)smd.Gender,
            };
        }

        internal DataAccess.SampleMetadata ToDataAccessModel(DataAccess.SampleMetadata daSm = null, bool setForeignKeyProperties = true)
        {
            if (daSm == null)
            {
                daSm = new DataAccess.SampleMetadata();
            }
            daSm.Id = this.Id;
            daSm.IsAnonymous = this.IsAnonymous;
            daSm.CreatedAt = this.CreatedAt;
            daSm.MotherTongues = this.MotherTongues;
            daSm.Name = this.Name;
            daSm.OtherInformation = this.OtherInformation;
            if (setForeignKeyProperties)
            {
                daSm.LocationId = this.LocationId;
                daSm.SampleDataFileId = this.SampleDataFileId;
                daSm.TranscriptionFileId = this.TranscriptionFileId;
                daSm.TranslationFileId = this.TranslationFileId;
            }
            daSm.YearOfBirth = (short?)this.YearOfBirth;
            daSm.YearOfMovingToLocation0 = (short?)this.YearOfMovingToLocation0;
            daSm.AlwaysLivedAtLocation0 = this.AlwaysLivedAtLocation0;
            daSm.Gender = (byte)(int)this.Gender;
            return daSm;
        }

        internal static PropertyInfo ToDataAccessModel(PropertyInfo propInfo)
        {
            if (propInfo == null)
            {
                throw new ArgumentNullException();
            }
            if (propInfo.DeclaringType != typeof(SampleMetadata))
            {
                throw new ArgumentException();
            }

            var daPropInfo = typeof(DataAccess.SampleMetadata)
                .GetProperty(propInfo.Name, BindingFlags.DeclaredOnly | BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic);
            return daPropInfo;
        }

        internal static PropertyInfo FromDataAccessModel(PropertyInfo daPropInfo)
        {
            if (daPropInfo == null)
            {
                throw new ArgumentNullException();
            }
            if (daPropInfo.DeclaringType != typeof(DataAccess.SampleMetadata))
            {
                throw new ArgumentException();
            }
            var propInfo = typeof(SampleMetadata)
                .GetProperty(daPropInfo.Name, BindingFlags.DeclaredOnly | BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic);
            return daPropInfo;
        }
    }
}