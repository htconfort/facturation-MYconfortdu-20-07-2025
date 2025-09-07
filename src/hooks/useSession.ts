// =============================================
// MyConfort – Hook useSession pour React
// Objectif : Gérer l'état de session avec synchronisation automatique
// =============================================

import { useEffect, useState, useCallback } from 'react';
import type { CashSession } from '../types/session';
import { getCurrentSession, ensureOpenSession } from '../services/sessionService';

/**
 * Hook React pour gérer l'état de session
 * - Assure qu'une session ouverte existe au montage
 * - Synchronise automatiquement entre composants et onglets
 * - Fournit une fonction refresh pour forcer la synchronisation
 */
export function useSession() {
  const [session, setSession] = useState<CashSession | null>(() => getCurrentSession());

  useEffect(() => {
    // Assure qu'une session existe dès le montage
    const { data } = ensureOpenSession();
    setSession(data ?? null);
  }, []);

  useEffect(() => {
    // Écoute les changements de session (synchronisation entre composants)
    const onChange = (e: Event) => {
      // @ts-ignore - CustomEvent detail
      setSession((e as CustomEvent).detail ?? getCurrentSession());
    };
    
    // Écoute les changements localStorage (synchronisation entre onglets)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'myconfort.caisse.session.current') {
        setSession(getCurrentSession());
      }
    };
    
    window.addEventListener('session:changed', onChange as any);
    window.addEventListener('storage', onStorage);
    
    return () => {
      window.removeEventListener('session:changed', onChange as any);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const refresh = useCallback(() => {
    setSession(getCurrentSession());
  }, []);

  return { session, refresh } as const;
}

/**
 * Hook simplifié qui retourne seulement l'état ouvert/fermé
 */
export function useSessionStatus() {
  const { session } = useSession();
  return {
    isOpen: session?.status === 'open',
    isClosed: session?.status === 'closed',
    hasSession: !!session,
    sessionId: session?.id,
  };
}
