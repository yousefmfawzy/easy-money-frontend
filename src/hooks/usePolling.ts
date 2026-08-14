import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling<T>(fn: () => Promise<T>, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fnRef = useRef(fn);
  fnRef.current = fn;
  
  const mounted = useRef(true);
  const hasData = useRef(false);

  const refresh = useCallback(async () => {
    try {
      if (!hasData.current) setIsLoading(true);
      const res = await fnRef.current();
      if (!mounted.current) return;
      hasData.current = true;
      setData(res);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mounted.current) return;
      // Keep existing data on error
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isPolling = true;

    const poll = async () => {
      if (document.hidden) {
        if (isPolling) {
          timerId = setTimeout(poll, 1000);
        }
        return;
      }
      
      await refresh();
      
      if (isPolling) {
        timerId = setTimeout(poll, intervalMs);
      }
    };

    poll();

    const handleVisibility = () => {
      if (!document.hidden) {
        if (timerId) clearTimeout(timerId);
        poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted.current = false;
      isPolling = false;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh, intervalMs]);

  return { data, error, isLoading, lastUpdated, refresh };
}
