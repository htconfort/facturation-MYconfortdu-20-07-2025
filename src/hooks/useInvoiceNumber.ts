import { useRef } from 'react';
import { generateInvoiceNumber } from '../utils/calculations';

/**
 * 🔢 Hook pour gérer la numérotation des factures
 * Utilise un ID de session unique pour éviter les multiples générations
 */
export const useInvoiceNumber = () => {
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const invoiceNumberRef = useRef<string | null>(null);
  
  // Générer le numéro seulement si pas encore fait pour cette session
  if (invoiceNumberRef.current === null) {
    invoiceNumberRef.current = generateInvoiceNumber(sessionIdRef.current);
    console.log('🎯 Numéro facture unique généré avec session:', sessionIdRef.current, '→', invoiceNumberRef.current);
  }
  
  return invoiceNumberRef.current;
};

/**
 * 🆕 Générer un nouveau numéro de facture avec un nouvel ID de session
 * À utiliser explicitement pour les nouvelles factures
 */
export const generateNewInvoiceNumber = (): string => {
  const newSessionId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newNumber = generateInvoiceNumber(newSessionId);
  console.log('🆕 Nouvelle facture créée avec session:', newSessionId, '→', newNumber);
  return newNumber;
};
