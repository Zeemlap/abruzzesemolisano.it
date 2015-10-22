using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.DataAccess.Sql
{
    public class SqlIndex : Index
    {

        public new SqlIndexColumnCollection Columns
        {
            get
            {
                return (SqlIndexColumnCollection)base.Columns;
            }
            internal set
            {
                base.Columns = value;
            }
        }

        protected override void SetColumns(IndexColumnCollection value)
        {
            var s = value as SqlIndexColumnCollection;
            if (s == null)
            {
                throw new ArgumentException();
            }
            base.SetColumns(value);
        }

        public bool HasFilter { get; internal set; }

        public FilterDefinition FilterDefinition
        {
            get
            {
                if (!this.HasFilter)
                {
                    return null;
                }
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public bool IsUniqueConstraint { get; internal set; }

        public bool IsPrimaryKey { get; internal set; }
    }

    public class FilterDefinition
    {
    }

    public class SqlIndexColumnCollection : IndexColumnCollection, IList<SqlIndexColumn>
    {
        internal SqlIndexColumnCollection(IEnumerable<SqlIndexColumn> indexColumns)
            : base(indexColumns.Cast<IndexColumn>())
        {
        }

        protected override bool IsItemValid(IndexColumn item)
        {
            return item is SqlIndexColumn;
        }

        public int IndexOf(SqlIndexColumn item)
        {
            return base.IndexOf(item);
        }

        void IList<SqlIndexColumn>.Insert(int index, SqlIndexColumn item)
        {
            ((IList<IndexColumn>)this).Insert(index, item);
        }

        void IList<SqlIndexColumn>.RemoveAt(int index)
        {
            ((IList<IndexColumn>)this).RemoveAt(index);
        }

        public new SqlIndexColumn this[int index]
        {
            get
            {
                return (SqlIndexColumn)base[index];
            }
            set
            {
                base[index] = value;
            }
        }

        void ICollection<SqlIndexColumn>.Add(SqlIndexColumn item)
        {
            ((ICollection<IndexColumn>)this).Add(item);
        }

        void ICollection<SqlIndexColumn>.Clear()
        {
            ((IList<IndexColumn>)this).Clear();
        }

        public bool Contains(SqlIndexColumn item)
        {
            return base.Contains(item);
        }

        public void CopyTo(SqlIndexColumn[] array, int arrayIndex)
        {
            this.CopyTo((Array)array, arrayIndex);
        }

        protected override void CopyTo(Array array, int arrayIndex)
        {
            if (array == null)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (arrayIndex < 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (array.Rank != 1)
            {
                throw new ArgumentException();
            }
            int i = array.GetLowerBound(0);
            if (int.MaxValue - i < arrayIndex)
            {
                throw new ArgumentException();
            }
            i += arrayIndex;
            int n = this.Count;
            if (n - arrayIndex < array.Length)
            {
                throw new ArgumentException();
            }
            try
            {
                for (int j = 0; j < n; ++j)
                {
                    array.SetValue(this[j], i + j);
                }
            }
            catch (InvalidCastException)
            {
                throw new ArgumentException();
            }
        }

        bool ICollection<SqlIndexColumn>.IsReadOnly
        {
            get
            {
                return true;
            }
        }

        bool ICollection<SqlIndexColumn>.Remove(SqlIndexColumn item)
        {
            return ((ICollection<IndexColumn>)this).Remove(item);
        }

        public new IEnumerator<SqlIndexColumn> GetEnumerator()
        {
            return ((IEnumerable<IndexColumn>)this).Cast<SqlIndexColumn>().GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }
    }

    public class SqlIndexColumn : IndexColumn
    {

        public byte PartitionOrdinal { get; internal set; }

        public bool IsIncludedColumn { get; internal set; }
    }
}