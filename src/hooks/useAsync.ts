import { useState, useCallback, useRef, useEffect } from 'react';

export function useAsync<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async (...args: Args) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      if (mounted.current) setData(res);
      return res;
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [fn]);
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, run, reset };
}
