// =============================================
// MyConfort – Types de session RAZ
// Objectif : Définir les types pour corriger l'erreur "update session"
// =============================================

export type SessionStatus = 'idle' | 'open' | 'closed';

export interface CashEvent {
  id: string;               // uuid
  type: 'sale' | 'refund' | 'note' | 'adjustment' | 'raz' | 'open' | 'close';
  at: string;               // ISO date
  payload?: Record<string, any>;
}

export interface CashSession {
  schema: 1;                // version de schéma (pour migration future)
  id: string;               // uuid de session
  openedAt: string;         // ISO
  closedAt?: string;        // ISO
  status: SessionStatus;    // 'open' | 'closed' | 'idle'
  vendorId?: string;        // vendeuse
  eventName?: string;       // "nom manifestation" (Foire, Salon…)
  floatAmount?: number;     // fond de caisse éventuel
  events: CashEvent[];      // historique
}

export type Update<T> = (prev: T) => T;

export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Codes de retour explicites pour éviter les retours "2" non parlants
export const SessionCodes = {
  OK: 'OK',
  NOT_OPEN: 'NOT_OPEN',
  INVALID: 'INVALID',
  ERROR: 'ERROR',
} as const;

export type SessionCode = typeof SessionCodes[keyof typeof SessionCodes];
