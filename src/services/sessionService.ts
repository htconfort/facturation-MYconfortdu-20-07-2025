// =============================================
// MyConfort – Service de gestion de sessions RAZ
// Objectif : Corriger l'erreur "update session" et les retours "2"
// =============================================

// TODO: Remplacer par 'uuid' une fois npm installé
import { v4 as uuid } from '../utils/uuid-temp';
import type { CashEvent, CashSession, Result, Update, SessionCode } from '../types/session';
import { SessionCodes } from '../types/session';

const STORAGE_KEY = 'myconfort.caisse.session.current';
const CHANNEL = 'session:changed'; // CustomEvent pour sync entre onglets/components

function nowISO() { 
  return new Date().toISOString(); 
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { 
    return JSON.parse(raw) as T; 
  } catch { 
    return null; 
  }
}

function emitChange(session: CashSession | null) {
  try { 
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: session })); 
  } catch {
    // Ignore les erreurs d'événements (ex: côté serveur)
  }
}

/**
 * Récupère la session actuelle depuis localStorage
 * Retourne null si pas de session ou schéma invalide
 */
export function getCurrentSession(): CashSession | null {
  const cached = safeParse<CashSession>(localStorage.getItem(STORAGE_KEY));
  if (!cached) return null;
  return cached.schema === 1 ? cached : null; // simple garde
}

/**
 * Sauvegarde la session dans localStorage et émet un événement de changement
 */
function saveSession(session: CashSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    emitChange(null);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emitChange(session);
}

/**
 * Assure qu'une session ouverte existe
 * Si pas de session ou session fermée, en crée une nouvelle
 */
export function ensureOpenSession(): Result<CashSession> {
  const current = getCurrentSession();
  if (current && current.status === 'open') {
    return { ok: true, data: current };
  }
  
  const newSession: CashSession = {
    schema: 1,
    id: uuid(),
    openedAt: nowISO(),
    status: 'open',
    events: [{ 
      id: uuid(), 
      type: 'open', 
      at: nowISO() 
    }],
  };
  
  saveSession(newSession);
  console.log('🆕 Nouvelle session ouverte:', newSession.id);
  return { ok: true, data: newSession };
}

/**
 * Ouvre une session avec des paramètres optionnels
 * API rétro-compatible
 */
export function openSessionSafe(init?: Partial<CashSession>): Result<CashSession> {
  const { ok, data } = ensureOpenSession();
  if (!ok || !data) {
    return { ok: false, error: 'Impossible d\'ouvrir la session' };
  }
  
  if (init) {
    const merged: CashSession = { ...data, ...init };
    saveSession(merged);
    return { ok: true, data: merged };
  }
  
  return { ok: true, data };
}

/**
 * Met à jour la session de manière sécurisée
 * Garantit qu'une session ouverte existe avant la mise à jour
 */
export function updateSessionSafe(updater: Update<CashSession>): Result<CashSession> {
  try {
    const ensureResult = ensureOpenSession();
    if (!ensureResult.ok || !ensureResult.data) {
      return { ok: false, error: 'Impossible d\'assurer une session ouverte' };
    }
    
    const current = ensureResult.data;
    const next = updater(structuredClone(current));
    
    if (!next || next.id !== current.id) {
      return { ok: false, error: 'updateSessionSafe: mise à jour invalide' };
    }
    
    saveSession(next);
    console.log('✅ Session mise à jour:', next.id);
    return { ok: true, data: next };
  } catch (e: any) {
    console.error('[updateSessionSafe] error', e);
    return { ok: false, error: e?.message || 'updateSessionSafe: erreur inconnue' };
  }
}

/**
 * Ajoute un événement à la session courante
 * Assure qu'une session ouverte existe
 */
export function addEventSafe(event: Omit<CashEvent, 'id' | 'at'> & { at?: string }): Result<CashSession> {
  return updateSessionSafe((prev) => {
    if (prev.status !== 'open') {
      throw new Error('La session n\'est pas ouverte');
    }
    
    const newEvent: CashEvent = {
      id: uuid(),
      at: event.at ?? nowISO(),
      type: event.type,
      payload: event.payload,
    };
    
    console.log('📝 Événement ajouté:', { type: newEvent.type, id: newEvent.id });
    
    return { 
      ...prev, 
      events: [...prev.events, newEvent] 
    };
  });
}

/**
 * Ferme la session courante
 * Idempotent - ne fait rien si déjà fermée
 */
export function closeSessionSafe(extra?: Partial<CashSession>): Result<CashSession> {
  return updateSessionSafe((prev) => {
    if (prev.status !== 'open') {
      return prev; // idempotent
    }
    
    const closedSession: CashSession = {
      ...prev,
      ...extra,
      status: 'closed',
      closedAt: nowISO(),
      events: [...prev.events, { 
        id: uuid(), 
        type: 'close', 
        at: nowISO() 
      }],
    };
    
    console.log('🔒 Session fermée:', closedSession.id);
    return closedSession;
  });
}

/**
 * Efface complètement la session
 */
export function clearSession() {
  console.log('🧹 Session effacée');
  saveSession(null);
}

/**
 * Ajoute un événement avec gestion d'erreur simplifiée
 * Retourne des codes explicites au lieu de "2"
 */
export function tryAddEvent(event: Omit<CashEvent, 'id' | 'at'> & { at?: string }): { 
  code: SessionCode; 
  session?: CashSession; 
  message?: string 
} {
  const res = addEventSafe(event);
  if (res.ok && res.data) {
    return { code: SessionCodes.OK, session: res.data };
  }
  return { 
    code: SessionCodes.ERROR, 
    message: res.error ?? 'Erreur inconnue lors de l\'ajout d\'événement' 
  };
}

/**
 * Vérifie l'état de la session
 */
export function getSessionStatus(): { 
  code: SessionCode; 
  session?: CashSession; 
  message?: string 
} {
  const session = getCurrentSession();
  if (!session) {
    return { code: SessionCodes.NOT_OPEN, message: 'Aucune session' };
  }
  if (session.status !== 'open') {
    return { code: SessionCodes.NOT_OPEN, session, message: 'Session fermée' };
  }
  return { code: SessionCodes.OK, session };
}

/**
 * Diagnostique pour débugger les problèmes
 */
export function debugSession(): void {
  const session = getCurrentSession();
  console.group('🔍 Debug Session');
  console.log('Session actuelle:', session);
  console.log('localStorage:', localStorage.getItem(STORAGE_KEY));
  console.log('Statut:', session?.status);
  console.log('Nombre d\'événements:', session?.events?.length || 0);
  console.groupEnd();
}
