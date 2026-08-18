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
    // Only the newest poll chain may reschedule. Without this, a visibility
    // change while a fetch is in flight leaves two chains running in parallel
    // and doubles the request rate against the camp screen's backend.
    let generation = 0;

    const poll = async (myGeneration: number) => {
      if (!isPolling || myGeneration !== generation) return;

      if (document.hidden) {
        timerId = setTimeout(() => poll(myGeneration), 1000);
        return;
      }

      await refresh();

      if (!isPolling || myGeneration !== generation) return;
      timerId = setTimeout(() => poll(myGeneration), intervalMs);
    };

    poll(generation);

    const handleVisibility = () => {
      if (!document.hidden) {
        if (timerId) clearTimeout(timerId);
        // Retire any in-flight chain so it cannot reschedule alongside this one.
        generation += 1;
        poll(generation);
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
