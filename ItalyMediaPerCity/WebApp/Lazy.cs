using System;
using System.Threading;

namespace WebApp
{
    public enum LazyThreadSafetyMode
    {
        PublicationAndExecution,
        None,
        Publication,
    }

    public struct Lazy<T>
    {
        private class ExceptionBox
        {
            public Exception Exception;
        }

        private class ValueBox
        {
            public readonly T Value;

            public ValueBox(T value)
            {
                this.Value = value;
            }
        }

        private static Func<T> Sentinel = () => default(T);

        private object m_box;
        private readonly object m_threadSafetyObject;
        private volatile Func<T> m_valueFactory;

        public Lazy(LazyThreadSafetyMode mode, Func<T> valueFactory = null)
        {
            if (valueFactory == null)
            {
                throw new ArgumentNullException();
            }
            m_threadSafetyObject = CreateThreadSafetyObject(mode);
            m_valueFactory = valueFactory;
            m_box = null;
        }

        private static object CreateThreadSafetyObject(LazyThreadSafetyMode mode)
        {
            switch (mode)
            {
                case LazyThreadSafetyMode.None: return null;
                case LazyThreadSafetyMode.Publication: return Sentinel;
                case LazyThreadSafetyMode.PublicationAndExecution: return new object();
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public bool HasValue => m_box is ValueBox;

        public T Value
        {
            get
            {
                if (m_box == null)
                {
                    InitializeValue();
                }
                var valueBox = m_box as ValueBox;
                if (valueBox != null)
                {
                    return valueBox.Value;
                }
                throw ((ExceptionBox)m_box).Exception;
            }
        }

        private static LazyThreadSafetyMode GetMode(object threadSafetyObject)
        {
            if (threadSafetyObject == null)
            {
                return LazyThreadSafetyMode.None;
            }
            if (ReferenceEquals(threadSafetyObject, Sentinel))
            {
                return LazyThreadSafetyMode.Publication;
            }
            return LazyThreadSafetyMode.PublicationAndExecution;
        }

        private static ValueBox CreateValue(Func<T> valueFactory)
        {
            if (valueFactory != null)
            {
                return new ValueBox(valueFactory());
            }
            return new ValueBox((T)Activator.CreateInstance(typeof(T)));
        }
        private void InitializeValue() 
        {
            object threadSafetyObject = m_threadSafetyObject;
            LazyThreadSafetyMode mode = GetMode(threadSafetyObject);
            if (mode == LazyThreadSafetyMode.None)
            {
                m_box = CreateValue(m_valueFactory);
                return;
            }
            if (mode == LazyThreadSafetyMode.PublicationAndExecution && m_valueFactory == Sentinel)
            {
                throw new InvalidOperationException("Lazy<T>.Value called within valueFactory and thread safety mode is execution and publication.");
            }
            try
            {
                if (mode == LazyThreadSafetyMode.PublicationAndExecution)
                {
                    // Thread safety mode is execution and publication.
                    Monitor.Enter(threadSafetyObject);
                    if (m_box != null)
                    {
                        return;
                    }
                }
                Func<T> valueFactory = m_valueFactory;
                if (mode == LazyThreadSafetyMode.PublicationAndExecution)
                {
                    // Thread safety mode is execution and publication.
                    // Allow detection of recursive invocation.
                    // As an added bonus the original valueFactory now becomes eligible for garbage collection.
                    m_valueFactory = Sentinel;
                }
                Interlocked.CompareExchange(ref m_box, CreateValue(valueFactory), null);
            }
            catch (Exception ex)
            {
                if (mode == LazyThreadSafetyMode.PublicationAndExecution)
                {
                    Interlocked.CompareExchange(ref m_box, new ExceptionBox()
                    {
                        Exception = ex,
                    }, null);
                }
                throw;
            }
            finally
            {
                if (mode == LazyThreadSafetyMode.PublicationAndExecution)
                {
                    try
                    {
                        Monitor.Exit(threadSafetyObject);
                    }
                    catch (SynchronizationLockException)
                    {
                    }
                }
            }
        }


    }
}