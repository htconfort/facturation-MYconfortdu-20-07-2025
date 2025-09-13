import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { fullSyncInvoices } from '../services/invoiceSyncService';
import { loadInvoices, saveInvoices } from '../utils/storage';

interface InvoicesSyncTabProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onInvoicesUpdated: (invoices: Invoice[]) => void;
}

export const InvoicesSyncTab: React.FC<InvoicesSyncTabProps> = ({
  isOpen,
  onClose,
  invoices,
  onInvoicesUpdated,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState('Non synchronisé');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lastSync = localStorage.getItem('myconfort_last_sync');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
      setSyncStatus(`Dernière synchro: ${new Date(lastSync).toLocaleString('fr-FR')}`);
    }
  }, []);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setError(null);
    setSyncStatus('Synchronisation en cours...');
    
    try {
      const local = loadInvoices();
      const result = await fullSyncInvoices(local);
      
      if (result.success) {
        saveInvoices(result.mergedInvoices);
        onInvoicesUpdated(result.mergedInvoices);
        setLastSyncTime(new Date());
        setSyncStatus(`✅ ${result.message}`);
        localStorage.setItem('myconfort_last_sync', new Date().toISOString());
      } else {
        throw new Error(result.message || 'Échec de la synchronisation');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue');
      setSyncStatus('❌ Échec de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='🔄 Synchronisation des Factures'
      maxWidth='max-w-2xl'
    >
      <div className='space-y-6'>
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>État de la synchronisation</h3>
          <div className='space-y-2'>
            <div className='text-sm text-gray-600'>
              <strong>Factures locales:</strong> {invoices.length}
            </div>
            <div className='text-sm text-gray-600'>
              <strong>Dernière synchro:</strong> {lastSyncTime ? lastSyncTime.toLocaleString('fr-FR') : 'Jamais'}
            </div>
            <div className='text-sm text-gray-600'>
              <strong>Statut:</strong> {syncStatus}
            </div>
          </div>
        </div>

        <div className='flex justify-center'>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 disabled:hover:scale-100 ${
              isSyncing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className='w-5 h-5 animate-spin' />
            ) : (
              <Cloud className='w-5 h-5' />
            )}
            <span>
              {isSyncing ? 'Synchronisation...' : 'Synchroniser toutes les factures'}
            </span>
          </button>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-5 h-5 text-red-600' />
              <span className='text-red-800 font-medium'>Erreur de synchronisation</span>
            </div>
            <p className='text-red-700 text-sm mt-2'>{error}</p>
          </div>
        )}

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-semibold text-blue-800 mb-2'>Comment ça marche ?</h4>
          <ul className='text-blue-700 text-sm space-y-1'>
            <li>• Envoie vos factures locales vers le cloud</li>
            <li>• Récupère toutes les factures du point de vente</li>
            <li>• Fusionne intelligemment (sans doublons)</li>
            <li>• Met à jour la liste automatiquement</li>
          </ul>
        </div>

        <div className='flex justify-center'>
          <button
            onClick={onClose}
            className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
