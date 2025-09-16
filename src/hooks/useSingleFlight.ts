import { useRef, useCallback } from 'react';

/**
 * Garantit qu'une action async ne s'exécute qu'une seule fois à la fois.
 * - Ignore les clics tant que l'action n'est pas finie
 * - Renvoie la même promesse pour des invocations concurrentes
 */
export function useSingleFlight<T extends any[] = any[], R = unknown>(
  fn: (...args: T) => Promise<R>
) {
  const inFlightRef = useRef<Promise<R> | null>(null);

  return useCallback((...args: T) => {
    if (inFlightRef.current) return inFlightRef.current;
    const p = (async () => {
      try {
        return await fn(...args);
      } finally {
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = p;
    return p;
  }, [fn]);
}
