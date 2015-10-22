using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web;
using WebApp.DataAccess;

namespace WebApp.BusinessLogic
{
    public class Business : BusinessBase
    {

        public bool DeleteSample(int smdId)
        {
            // We assume cascade delete to files.
            var daSmd = this.DataContext.SampleMetadatas.Where(smd_i => smd_i.Id == smdId).SingleOrDefault_Materialize();
            if (daSmd == null)
            {
                return false;
            }
            var idsOfFilesToDelete = new List<int>();
            if (daSmd.TranscriptionFileId != null)
            {
                idsOfFilesToDelete.Add((int)daSmd.TranscriptionFileId);
            }
            if (daSmd.TranslationFileId != null)
            {
                idsOfFilesToDelete.Add((int)daSmd.TranslationFileId);
            }
            idsOfFilesToDelete.Add(daSmd.SampleDataFileId);

            this.DataContext.SampleMetadatas.DeleteOnSubmit(daSmd);
            this.DataContext.SubmitChanges();
            DeleteFiles(idsOfFilesToDelete);
            return true;
        }

        private void DeleteFiles(List<int> idsOfFilesToDelete)
        {
            if (idsOfFilesToDelete == null || idsOfFilesToDelete.Count == 0)
            {
                return;
            }
            var sb = new StringBuilder();
            sb.Append("DELETE FROM [dbo].[File] WHERE [id] IN (");
            sb.Append(idsOfFilesToDelete[0]);
            int n = idsOfFilesToDelete.Count;
            for (int i = 1; i < n; ++i)
            {
                sb.Append(',');
                sb.Append(idsOfFilesToDelete[i]);
            }
            sb.Append(')');
            int deletedFileCount = this.DataContext.ExecuteCommand(sb.ToString());
            if (deletedFileCount != n)
            {
                // Files were concurrently deleted.
            }
        }

        public File GetFile(int id, bool includeData = true)
        {
            DataAccess.File daFile1;
            var daFileQ = this.DataContext.Files.Where(daFile_i => daFile_i.Id == id);
            if (includeData)
            {
                daFile1 = daFileQ.SingleOrDefault_Materialize();
            }
            else
            {
                var daFile2 = daFileQ.Select(daFile_i => new { daFile_i.MimeType, daFile_i.Id, daFile_i.Name, }).SingleOrDefault_Materialize();
                daFile1 = new DataAccess.File()
                {
                    Id = daFile2.Id,
                    Name = daFile2.Name,
                    MimeType = daFile2.MimeType,
                };
            }
            return File.FromDataAccessModel(daFile1);
        }

        public Location GetLocation(int? id = null, string name = null)
        {
            if (id == null && name == null)
            {
                throw new ArgumentException();
            }
            IQueryable<DataAccess.Location> daLocQ = this.DataContext.Locations;
            if (id != null)
            {
                int i = (int)id;
                daLocQ = daLocQ.Where(daLoc_i => daLoc_i.Id == i);
            }
            if (name != null)
            {
                daLocQ = daLocQ.Where(daLoc_i => daLoc_i.Name == name);
            }
            var daLocList = daLocQ.Take(2).ToList();
            if (daLocList.Count > 1)
            {
                throw new BusinessLogicException("corrupted database multiple locations with the same name");
            }
            if (daLocList.Count == 0)
            {
                return null;
            }
            return Location.FromDataAccessModel(daLocList[0]);
        }
        
        public void CreateLocation(Location loc)
        {
            var daLoc = loc.ToDataAccessModel();
            this.DataContext.Locations.InsertOnSubmit(daLoc);


            this.DataContext.SubmitChanges();
            
            loc.Id = daLoc.Id;
        }

        public SampleMetadata GetSampleMetadata(int id)
        {
            var daSmd = this.DataContext.SampleMetadatas.Where(daSmd_i => daSmd_i.Id == id).SingleOrDefault_Materialize();
            return SampleMetadata.FromDataAccessModel(daSmd);
        }

        public void UpdateSampleMetadata(SampleMetadata sm2)
        {
            if (sm2 == null)
            {
                throw new ArgumentNullException();
            }
            if (sm2.LocationId == null)
            {
                throw new ArgumentException();
            }
            int smId = sm2.Id;
            var daSm1 = this.DataContext.SampleMetadatas.Where(daSm_i => daSm_i.Id == smId).SingleOrDefault_Materialize();
            if (daSm1 == null)
            {
                throw new ArgumentException();
            }
            sm2.ToDataAccessModel(daSm1, false);
            this.DataContext.SubmitChanges();
            bool fUpdateLoc = daSm1.LocationId != sm2.LocationId;
            bool fUpdateTrans = daSm1.TranslationFileId != sm2.TranslationFileId;
            bool fUpdateTranscr = daSm1.TranscriptionFileId != sm2.TranscriptionFileId;
            bool fUpdateSampleData = daSm1.SampleDataFileId != sm2.SampleDataFileId;
            List<int> idsOfFilesToDelete = new List<int>();
            if (fUpdateLoc || fUpdateTrans || fUpdateTranscr || fUpdateSampleData)
            {
                var smUpdateCmd = this.DataContext.GetTable<DataAccess.SampleMetadata>().UpdateBuilder();
                if (fUpdateLoc)
                {
                    smUpdateCmd.Set(daSm_i => daSm_i.LocationId, (int)sm2.LocationId);
                }
                if (fUpdateTranscr)
                {
                    if (daSm1.TranscriptionFileId != null)
                    {
                        idsOfFilesToDelete.Add((int)daSm1.TranscriptionFileId);
                    }
                    smUpdateCmd.Set(daSm_i => daSm_i.TranscriptionFileId, sm2.TranscriptionFileId);
                }
                if (fUpdateTrans)
                {
                    if (daSm1.TranslationFileId != null)
                    {
                        idsOfFilesToDelete.Add((int)daSm1.TranslationFileId);
                    }
                    smUpdateCmd.Set(daSm_i => daSm_i.TranslationFileId, sm2.TranslationFileId);
                }
                if (fUpdateSampleData)
                {
                    idsOfFilesToDelete.Add(daSm1.SampleDataFileId);
                    smUpdateCmd.Set(daSm_i => daSm_i.SampleDataFileId, sm2.SampleDataFileId);
                }
                smUpdateCmd.Where(daSm_i => daSm_i.Id == sm2.Id);
                int i = smUpdateCmd.Execute();
                if (i != 1)
                {
                    // Record must have been concurrently deleted.
                }
            }
            DeleteFiles(idsOfFilesToDelete);
        }

        private static IQueryable<DataAccess.SampleMetadata> WhereIsSampleDataFileApproved(IQueryable<DataAccess.SampleMetadata> daSmdQ, bool? value)
        {
            if (value == null)
            {
                return daSmdQ;
            }
            if ((bool)value)
            {
                return daSmdQ.Where(daSmd_i => daSmd_i.ApprovedFields.Any(daSmdaf_i => object.Equals(daSmdaf_i.FieldName, "sampleDataFileId")));
            }
            return daSmdQ.Where(daSmd_i => !daSmd_i.ApprovedFields.Any(daSmdaf_i => object.Equals(daSmdaf_i.FieldName, "sampleDataFileId")));
        }

        public SampleMetadata[] GetSampleMetadatas(
            int? id = null,
            int? locationId = null,
            bool? isSampleDataFileApproved = null,
            bool? isLocationIdSet = null,
            bool orderByCreatedAtDescending = false,
            int offset = 0,
            int? maxRows = null)
        {
            if (offset < 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (maxRows.HasValue && (int)maxRows < 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (isLocationIdSet == null)
            {
                isLocationIdSet = locationId != null;
            }
            if (!(bool)isLocationIdSet && locationId != null)
            {
                throw new ArgumentException();
            }
            IQueryable<DataAccess.SampleMetadata> daSmdQ = this.DataContext.SampleMetadatas;
            daSmdQ = WhereIsSampleDataFileApproved(daSmdQ, isSampleDataFileApproved);
            if (id != null)
            {
                int idNonNullable = (int)id;
                daSmdQ = daSmdQ.Where(daSmd => daSmd.Id == idNonNullable);
            }
            if ((bool)isLocationIdSet)
            {
                daSmdQ = daSmdQ.Where(daSmd_i => object.Equals(daSmd_i.LocationId, locationId));
            }
            if (orderByCreatedAtDescending)
            {
                daSmdQ = daSmdQ.OrderByDescending(daSmd => daSmd.CreatedAt);
            }
            if (0 < offset)
            {
                daSmdQ = daSmdQ.Skip(offset);
            }
            if (maxRows != null)
            {
                daSmdQ = daSmdQ.Take((int)maxRows);
            }

            var daSmdList = daSmdQ.ToList();
            var bSmdArr = new SampleMetadata[daSmdList.Count];
            for (int i = 0; i < daSmdList.Count; ++i)
            {
                bSmdArr[i] = SampleMetadata.FromDataAccessModel(daSmdList[i]);
            }
            return bSmdArr;
        }

        public bool IdentifyAndAuthenticate(string username, string password)
        {
            // TODO use database and compare salted hashed password to that in the database
            switch (username)
            {
                case "admin":
                    return password == "bettina2015";
            }
            return false;
        }

        public List<string> GetApprovedSampleFields(int smdId)
        {
            var daSmdaList = this.DataContext.SampleMetadataFieldApprovals.Where(smdfa_i => smdfa_i.SampleMetadataId == smdId).ToList();
            var daSmdField_propInfoList = new List<PropertyInfo>();
            foreach (var dbFieldName_nonTrimmed in daSmdaList.Select(daSmda_i => daSmda_i.FieldName))
            {
                string modelFieldName;
                var dbFieldName = dbFieldName_nonTrimmed.TrimEnd();
                bool flag1 = DataAccess.SampleMetadata.TryTranslateFieldName(dbFieldName, NameTranslationDirection.DatabaseToModel, out modelFieldName);
                if (!flag1)
                {
                    throw new NotSupportedException();
                }

                var modelPropInfo = typeof(DataAccess.SampleMetadata).GetProperty(modelFieldName, BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance);
                if (modelPropInfo == null)
                {
                    throw new NotSupportedException();
                }
                daSmdField_propInfoList.Add(modelPropInfo);
            }
            var smdField_nameList = new List<string>();
            foreach (var daSmdField_propInfo in daSmdField_propInfoList)
            {
                var smdField_propInfo = SampleMetadata.FromDataAccessModel(daSmdField_propInfo);
                if (smdField_propInfo == null)
                {
                    throw new NotSupportedException();
                }
                smdField_nameList.Add(smdField_propInfo.Name);
            }
            return smdField_nameList;
        }

        public bool SetIsSampleFieldApproved(int smdId, string smdField_name, bool value)
        {
            if (smdField_name == null)
            {
                throw new ArgumentNullException();
            }
            var smdField_propInfo = typeof(SampleMetadata).GetProperty(smdField_name, BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.NonPublic | BindingFlags.Instance);
            if (smdField_propInfo == null)
            {
                throw new BusinessLogicException(BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName);
            }
            return SetIsSampleFieldApproved(smdId, smdField_propInfo, value);
        }

        private bool SetIsSampleFieldApproved(int smdId, PropertyInfo smdField_propInfo, bool value)
        {
            var smdField_approvableAttr = Attribute.GetCustomAttribute(smdField_propInfo, typeof(ApprovableAttribute), false);
            var smdField_isApprovable = smdField_approvableAttr != null;
            if (!smdField_isApprovable)
            {
                throw new BusinessLogicException(BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName);
            }
            var daSmdField_propInfo = SampleMetadata.ToDataAccessModel(smdField_propInfo);
            if (daSmdField_propInfo == null)
            {
                throw new BusinessLogicException(BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName);
            }
            string smdFieldName;
            if (!DataAccess.SampleMetadata.TryTranslateFieldName(daSmdField_propInfo.Name, NameTranslationDirection.ModelToDatabase, out smdFieldName))
            {
                throw new NotSupportedException();
            }
            var r = this.DataContext.SampleMetadataFieldApprovals
                .Where(smdfa_i => smdfa_i.SampleMetadataId == smdId && smdfa_i.FieldName == smdFieldName)
                .SingleOrDefault_Materialize();
            if ((r != null) == value)
            {
                // We attempted to approve a field that was already approved.
                return value;
            }
            if (value)
            {
                this.DataContext.SampleMetadataFieldApprovals.InsertOnSubmit(new DataAccess.SampleMetadataFieldApproval()
                {
                    SampleMetadataId = smdId,
                    FieldName = smdFieldName,
                });
            }
            else
            {
                this.DataContext.SampleMetadataFieldApprovals.DeleteOnSubmit(r);
            }
            this.DataContext.SubmitChanges();
            return !value;
        }

        public bool SetIsSampleFieldApproved<TField>(int smdId, Expression<Func<SampleMetadata, TField>> smdField_expr, bool value)
        {
            if (smdField_expr == null)
            {
                throw new ArgumentNullException();
            }
            var smdField_propInfo = Utilities.GetPropertyInfo(smdField_expr);
            if (smdField_propInfo.DeclaringType != typeof(SampleMetadata))
            {
                throw new BusinessLogicException(BusinessErrorCode.InvalidOrUnapprovableSampleMetadataFieldName);
            }
            return SetIsSampleFieldApproved(smdId, smdField_propInfo, value);
        }

        public File CreateFile(string name, string mimeType, System.IO.Stream data)
        {
            if (data == null || name == null || mimeType == null)
            {
                throw new ArgumentNullException();
            }
            var daFile = new DataAccess.File()
            {
                Data = Utilities.StreamToByteArray(data),
                MimeType = mimeType,
                Name = name,
            };
            this.DataContext.Files.InsertOnSubmit(daFile);
            this.DataContext.SubmitChanges();
            return File.FromDataAccessModel(daFile, false);
        }

        private bool FileExists(int id)
        {
            return 0 < this.DataContext.Files.Where(f => f.Id == id).Take(1).Count();
        }

        public void CreateSampleMetadata(SampleMetadata smd)
        {
            if (smd == null)
            {
                throw new ArgumentNullException();
            }
            var daSmd = smd.ToDataAccessModel(null, false);
            DataAccess.Location daLoc = null;
            if (smd.LocationId != null)
            {
                int locId = (int)smd.LocationId;
                daLoc = this.DataContext.Locations.Where(daSmd_i => daSmd_i.Id == locId).SingleOrDefault_Materialize();
                if (daLoc == null)
                {
                    throw new ArgumentException();
                }
            }
            if (!FileExists(smd.SampleDataFileId))
            {
                throw new ArgumentException();
            }
            if ((smd.TranscriptionFileId != null && !FileExists(smd.SampleDataFileId)) ||
                (smd.TranslationFileId != null && !FileExists(smd.SampleDataFileId)))
            {
                throw new ArgumentException();
            }


            this.DataContext.SampleMetadatas.InsertOnSubmit(daSmd);
            this.DataContext.SubmitChanges();
            smd.Id = daSmd.Id;

            var uc = this.DataContext.GetTable<DataAccess.SampleMetadata>().UpdateBuilder();
            if (smd.LocationId != null)
            {
                uc.Set(sm => sm.LocationId, (int)smd.LocationId);
            }
            if (smd.TranscriptionFileId != null)
            {
                uc.Set(sm => sm.TranscriptionFileId, smd.TranscriptionFileId);
            }
            if (smd.TranslationFileId != null)
            {
                uc.Set(sm => sm.TranslationFileId, smd.TranslationFileId);
            }
            uc.Set(sm => sm.SampleDataFileId, smd.SampleDataFileId);
            uc.Where(sm => sm.Id == smd.Id);
            int i = uc.Execute();
            if (i != 1)
            {
                // Record must have been concurrently deleted.
            }
        }

        public Location[] GetLocations(
            int? id = null, 
            string name = null)
        {
            var daLocQ = (IQueryable<DataAccess.Location>)this.DataContext.Locations;
            if (id != null)
            {
                int idNonNullable = (int)id;
                daLocQ = daLocQ.Where(daLoc_i => daLoc_i.Id == idNonNullable);
            }
            if (name != null)
            {
                daLocQ = daLocQ.Where(daLoc_i => daLoc_i.Name == name);
            }
            var daLocList = daLocQ.ToList();
            var locArr = new Location[daLocList.Count];
            for (int i = 0; i < locArr.Length; ++i)
            {
                locArr[i] = Location.FromDataAccessModel(daLocList[i]);
            }
            return locArr;
        }

        public KeyValuePair<int, int>[] GetSampleCountPerLocation(bool? isSampleDataFileApproved)
        {
            IQueryable<DataAccess.SampleMetadata> daSmdQ = this.DataContext.SampleMetadatas;
            daSmdQ = WhereIsSampleDataFileApproved(daSmdQ, isSampleDataFileApproved);
            daSmdQ = daSmdQ.Where(daSmd_i => daSmd_i.LocationId != null);
            var r = daSmdQ.GroupBy(daSmd_i => daSmd_i.LocationId)
                .Select(daSmdGroup => new { LocationId = daSmdGroup.Key, SampleCount = daSmdGroup.Count() })
                .ToList();

            return r.Select(i => new KeyValuePair<int, int>((int)i.LocationId, i.SampleCount)).ToArray();
        }

        public void UpdateLocation(Location loc)
        {
            if (loc == null)
            {
                throw new ArgumentNullException();
            }
            int locId = loc.Id;
            var daLoc = this.DataContext.Locations.Where(daLoc_i => daLoc_i.Id == locId).SingleOrDefault_Materialize();
            if (daLoc == null)
            {
                throw new ArgumentException();
            }
            // check unique name
            loc.ToDataAccessModel(daLoc);

            this.DataContext.SubmitChanges();
        }

        public void DeleteLocation(int id)
        {
            var daLoc = this.DataContext.Locations.Where(daLoc_i => daLoc_i.Id == id).SingleOrDefault_Materialize();
            if (daLoc == null)
            {
                return;
            }
            this.DataContext.Locations.DeleteOnSubmit(daLoc);
            this.DataContext.SubmitChanges();
        }
    }
}