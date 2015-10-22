using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Threading;
using System.Web;

namespace WebApp.DataAccess
{
    public class Index
    {
        public string Name { get; internal set; }

        public bool IsUnique { get; internal set; }

        private IndexColumnCollection columns;

        public IndexColumnCollection Columns
        {
            get
            {
                return this.columns;
            }
            internal set
            {
                this.SetColumns(value);
            }
        }

        protected virtual void SetColumns(IndexColumnCollection value)
        {
            this.columns = value;
        }
    }

    public abstract class IndexColumnCollection : IList<IndexColumn>, System.Collections.IList
    {
        private IndexColumn[] m_items;
        private volatile object m_syncRoot;

        protected IndexColumnCollection(IEnumerable<IndexColumn> items)
        {
            if (items == null)
            {
                throw new ArgumentNullException();
            }
            if (items.Contains(null))
            {
                throw new ArgumentException();
            }
            this.m_items = items.ToArray();
        }

        public int IndexOf(IndexColumn item)
        {
            return Array.IndexOf(this.m_items, item, 0);
        }

        void IList<IndexColumn>.Insert(int index, IndexColumn item)
        {
            throw new NotSupportedException();
        }

        void IList<IndexColumn>.RemoveAt(int index)
        {
            throw new NotSupportedException();
        }

        private void CheckIndex(int index)
        {
            if (!(0 <= index && index < this.m_items.Length))
            {
                throw new ArgumentOutOfRangeException();
            }
        }

        public IndexColumn this[int index]
        {
            get
            {
                this.CheckIndex(index);
                return this.m_items[index];
            }
            set
            {
                throw new NotSupportedException();
            }
        }

        void ICollection<IndexColumn>.Add(IndexColumn item)
        {
            throw new NotSupportedException();
        }

        void ICollection<IndexColumn>.Clear()
        {
            throw new NotSupportedException();
        }

        public bool Contains(IndexColumn item)
        {
            return 0 <= this.IndexOf(item);
        }

        public void CopyTo(IndexColumn[] array, int arrayIndex)
        {
            this.CopyTo((Array)array, arrayIndex);
        }

        public int Count
        {
            get
            {
                return this.m_items.Length;
            }
        }

        bool ICollection<IndexColumn>.IsReadOnly
        {
            get
            {
                return true;
            }
        }

        bool ICollection<IndexColumn>.Remove(IndexColumn item)
        {
            throw new NotSupportedException();
        }

        protected virtual bool IsItemValid(IndexColumn item)
        {
            return item != null;
        }

        public IEnumerator<IndexColumn> GetEnumerator()
        {
            return ((IEnumerable<IndexColumn>)this.m_items).GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }

        protected virtual void CopyTo(Array array, int arrayIndex)
        {
            try
            {
                Array.Copy(this.m_items, 0, array, arrayIndex, this.m_items.Length);
                return;
            }
            catch (ArrayTypeMismatchException)
            {
            }
            catch (RankException)
            {
            }
            throw new ArgumentException();
        }

        int System.Collections.IList.Add(object value)
        {
            throw new NotSupportedException();
        }

        void System.Collections.IList.Clear()
        {
            throw new NotSupportedException();
        }

        bool System.Collections.IList.Contains(object value)
        {
            var ic = value as IndexColumn;
            return this.IsItemValid(ic) && this.Contains(ic);
        }

        int System.Collections.IList.IndexOf(object value)
        {
            var ic = value as IndexColumn;
            return this.IsItemValid(ic) ? this.IndexOf(ic) : -1;
        }

        void System.Collections.IList.Insert(int index, object value)
        {
            throw new NotSupportedException();
        }

        bool System.Collections.IList.IsFixedSize
        {
            get { return true; }
        }

        bool System.Collections.IList.IsReadOnly
        {
            get { return true; }
        }

        void System.Collections.IList.Remove(object value)
        {
            throw new NotSupportedException();
        }

        void System.Collections.IList.RemoveAt(int index)
        {
            throw new NotSupportedException();
        }

        object System.Collections.IList.this[int index]
        {
            get
            {
                this.CheckIndex(index);
                return this.m_items[index];
            }
            set
            {
                throw new NotSupportedException();
            }
        }

        void System.Collections.ICollection.CopyTo(Array array, int arrayIndex)
        {
            this.CopyTo(array, arrayIndex);
        }

        bool System.Collections.ICollection.IsSynchronized
        {
            get { return true; }
        }

        object System.Collections.ICollection.SyncRoot
        {
            get
            {
                object syncRoot = m_syncRoot;
                if (syncRoot == null)
                {
                    syncRoot = new object();
                    #pragma warning disable 420
                    if (null != Interlocked.CompareExchange(ref m_syncRoot, syncRoot, null))
                    {
                        syncRoot = m_syncRoot;
                    }
                    #pragma warning restore 420
                }
                return syncRoot;
            }
        }
    }

    public class IndexColumn
    {
        public string ColumnName { get; internal set; }

        public bool IsDescendingKey { get; internal set; }
    }

    public class IndexCollection<TEntity> : IEnumerable<Index> where TEntity : class
    {

        internal IndexCollection(DataContext dataContext)
        {
            if (dataContext == null)
            {
                throw new ArgumentNullException();
            }
            this.DataContext = dataContext;
        }

        private DataContext DataContext
        {
            get;
            set;
        }

        public IEnumerator<Index> GetEnumerator()
        {
            var t = this.DataContext.Mapping.GetTable(typeof(TEntity));
            if (t == null)
            {
                throw new Exception();
            }
            return this.DataContext.GetProvider().GetIndices(t.TableName);
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }

        public struct Enumerator : IEnumerator<Index>
        {
            private Index[] array;
            private int i;
            private int n;
            private Index current;

            internal Enumerator(Index[] snapshot, int n)
            {
                this.array = snapshot;
                this.i = 0;
                this.n = n;
                this.current = null;
            }

            public Index Current
            {
                get { return this.current; }
            }

            public void Dispose()
            {
            }

            object System.Collections.IEnumerator.Current
            {
                get { return this.Current; }
            }

            public bool MoveNext()
            {
                if (this.i < this.n)
                {
                    this.current = this.array[this.i++];
                    return true;
                }
                this.current = null;
                return false;
            }

            public void Reset()
            {
                this.i = 0;
                this.current = null;
            }
        }
    }
}