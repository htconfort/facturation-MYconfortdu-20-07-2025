import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '../types';
import { loadInvoices, saveInvoices } from '../utils/storage';
import { fullSyncInvoices, syncSingleInvoiceToCloud, SyncResponse } from '../services/invoiceSyncService';

interface UseSyncInvoicesResult {
  invoices: Invoice[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: string;
  error: string | null;
  // Actions
  syncNow: () => Promise<void>;
  addInvoiceAndSync: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceNumber: string) => void;
  refreshInvoices: () => void;
}

export const useSyncInvoices = (): UseSyncInvoicesResult => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState('Non synchronisé');
  const [error, setError] = useState<string | null>(null);

  // Charger les factures locales au démarrage
  const loadLocalInvoices = useCallback(() => {
    try {
      setIsLoading(true);
      const localInvoices = loadInvoices();
      setInvoices(localInvoices);
      console.log('📄 Factures locales chargées:', localInvoices.length);
    } catch (err) {
      console.error('❌ Erreur chargement factures locales:', err);
      setError('Erreur lors du chargement des factures locales');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronisation complète
  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      setSyncStatus('Synchronisation en cours...');
      setError(null);

      const localInvoices = loadInvoices();
      const result = await fullSyncInvoices(localInvoices);

      if (result.success) {
        // Sauvegarder les factures fusionnées localement
        saveInvoices(result.mergedInvoices);
        setInvoices(result.mergedInvoices);
        setLastSyncTime(new Date());
        setSyncStatus(`✅ ${result.message}`);
        console.log('🎉 Synchronisation terminée avec succès');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Erreur de synchronisation:', err);
      setError(`Erreur: ${err.message}`);
      setSyncStatus('❌ Échec de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Ajouter une facture et la synchroniser immédiatement
  const addInvoiceAndSync = useCallback(async (newInvoice: Invoice) => {
    try {
      // 1. Sauvegarder localement d'abord
      const currentInvoices = loadInvoices();
      const updatedInvoices = [...currentInvoices, newInvoice];
      saveInvoices(updatedInvoices);
      setInvoices(updatedInvoices);

      console.log('💾 Facture sauvegardée localement:', newInvoice.invoiceNumber);

      // 2. Synchroniser vers le cloud en arrière-plan
      setSyncStatus('Envoi vers le cloud...');
      const syncResult = await syncSingleInvoiceToCloud(newInvoice);
      
      if (syncResult.success) {
        setSyncStatus(`✅ Facture ${newInvoice.invoiceNumber} synchronisée`);
        setLastSyncTime(new Date());
      } else {
        console.warn('⚠️ Échec synchronisation cloud:', syncResult.message);
        setSyncStatus(`⚠️ Sauvée localement uniquement`);
      }
    } catch (err) {
      console.error('❌ Erreur ajout facture:', err);
      setError(`Erreur lors de l'ajout: ${err.message}`);
    }
  }, []);

  // Supprimer une facture
  const deleteInvoice = useCallback((invoiceNumber: string) => {
    try {
      const currentInvoices = loadInvoices();
      const filteredInvoices = currentInvoices.filter(
        inv => inv.invoiceNumber !== invoiceNumber
      );
      saveInvoices(filteredInvoices);
      setInvoices(filteredInvoices);
      
      console.log('🗑️ Facture supprimée:', invoiceNumber);
      setSyncStatus('Facture supprimée - synchronisation recommandée');
    } catch (err) {
      console.error('❌ Erreur suppression facture:', err);
      setError(`Erreur lors de la suppression: ${err.message}`);
    }
  }, []);

  // Actualiser les factures (recharge depuis localStorage)
  const refreshInvoices = useCallback(() => {
    loadLocalInvoices();
  }, [loadLocalInvoices]);

  // Synchronisation automatique au montage du composant
  useEffect(() => {
    let mounted = true;
    
    const initializeAndSync = async () => {
      // Charger d'abord les factures locales
      loadLocalInvoices();
      
      // Attendre un peu puis synchroniser automatiquement
      setTimeout(async () => {
        if (mounted) {
          console.log('🔄 Synchronisation automatique démarrée...');
          await syncNow();
        }
      }, 1000);
    };

    initializeAndSync();

    return () => {
      mounted = false;
    };
  }, [loadLocalInvoices, syncNow]);

  // Synchronisation automatique périodique (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing) {
        console.log('🔄 Synchronisation automatique périodique...');
        syncNow();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isSyncing, syncNow]);

  return {
    invoices,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error,
    syncNow,
    addInvoiceAndSync,
    deleteInvoice,
    refreshInvoices,
  };
};
