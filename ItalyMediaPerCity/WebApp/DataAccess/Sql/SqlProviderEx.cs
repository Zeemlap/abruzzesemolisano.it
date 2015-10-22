using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Text;
using System.Web;
using WebApp.DataAccess;

namespace WebApp.DataAccess.Sql
{
    public class SqlProviderEx : ProviderEx
    {

        public SqlProviderEx(DataContext dataContext, object provider)
            : base(dataContext, provider) 
        {
        }

        private class RawIndex
        {
            public string index_name;
            public bool is_unique;
            public bool is_primary_key;
            public bool is_unique_constraint;
            public string column_name;
            public byte partition_ordinal;
            public bool is_descending_key;
            public bool is_included_column;
        }

        public override IEnumerator<Index> GetIndices(string qualifiedTableName)
        {
            if (qualifiedTableName == null)
            {
                throw new ArgumentNullException();
            }
            if (0 <= qualifiedTableName.IndexOf('.'))
            {
                throw new ArgumentException();
            }
            var indices_raw = this.DataContext.ExecuteQuery<RawIndex>(@"SELECT i.name AS index_name, i.is_unique, i.is_primary_key, 
                        i.is_unique_constraint, c.name AS column_name, 
                        ic.partition_ordinal, ic.is_descending_key, 
                        ic.is_included_column
                    FROM sys.tables t, sys.indexes i, sys.index_columns ic, sys.columns c
                    WHERE 
	                    t.schema_id = schema_id() AND 
	                    t.object_id = i.object_id AND 
	                    i.object_id = ic.object_id AND
	                    i.index_id = ic.index_id AND
	                    t.object_id = c.object_id AND
	                    ic.column_id = c.column_id AND
	                    t.name = {0}
                    ORDER BY i.name, ic.key_ordinal", qualifiedTableName);

            var indices_sql = indices_raw.GroupBy(idx_col => idx_col.index_name).Select(idx_with_cols =>
            {
                var idx_raw = idx_with_cols.First();
                var idx_sql = new SqlIndex();
                idx_sql.Name = idx_raw.index_name;
                idx_sql.IsUnique = idx_raw.is_unique;
                idx_sql.IsPrimaryKey = idx_raw.is_primary_key;
                idx_sql.IsUniqueConstraint = idx_raw.is_unique_constraint;
                idx_sql.Columns = new SqlIndexColumnCollection(idx_with_cols.Select(idx_col => new SqlIndexColumn()
                {
                    ColumnName = idx_col.column_name,
                    IsDescendingKey = idx_col.is_descending_key,
                    PartitionOrdinal = idx_col.partition_ordinal,
                    IsIncludedColumn = idx_col.is_included_column,
                }));
                return idx_sql;
            });

            return ((IEnumerable<Index>)indices_sql).GetEnumerator();
        }


        public override void CreateIndex(string qualifiedTableName, Index idx)
        {
            throw new NotImplementedException();
        }

        public override void DeleteIndex(string qualifiedTableName, string indexName)
        {
            throw new NotImplementedException();
        }
    }
}