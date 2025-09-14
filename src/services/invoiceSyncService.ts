import { Invoice } from '../types';

// Configuration N8N pour la synchronisation des factures (via variables d'environnement Vite)
const N8N_SYNC_URL = import.meta.env.VITE_N8N_SYNC_URL as string | undefined;
const N8N_GET_FACTURES_URL = import.meta.env.VITE_N8N_GET_FACTURES_URL as string | undefined;

function assertUrls(): void {
  if (!N8N_SYNC_URL || !N8N_GET_FACTURES_URL) {
    const message =
      'URLs N8N manquantes: configure VITE_N8N_SYNC_URL et VITE_N8N_GET_FACTURES_URL';
    console.error(message, {
      VITE_N8N_SYNC_URL: N8N_SYNC_URL,
      VITE_N8N_GET_FACTURES_URL: N8N_GET_FACTURES_URL,
    });
    throw new Error(message);
  }
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Envoyer toutes les factures locales vers N8N pour centralisation
export const syncLocalInvoicesToCloud = async (invoices: Invoice[]): Promise<SyncResponse> => {
  try {
    assertUrls();
    console.log('🔄 Synchronisation des factures locales vers le cloud...', invoices.length);
    
    const response = await fetch(N8N_SYNC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync_invoices',
        invoices: invoices.map(invoice => ({
          ...invoice,
          device_id: getDeviceId(),
          sync_timestamp: new Date().toISOString(),
        })),
        total_count: invoices.length,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Synchronisation réussie:', result);
    
    return {
      success: true,
      message: `${invoices.length} factures synchronisées avec succès`,
      data: result
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur lors de la synchronisation:', message);
    return {
      success: false,
      message: `Erreur de synchronisation: ${message}`,
    };
  }
};

// Récupérer toutes les factures depuis N8N
export const getAllInvoicesFromCloud = async (): Promise<SyncResponse> => {
  try {
    assertUrls();
    console.log('📥 Récupération des factures depuis le cloud...');
    
    const response = await fetch(N8N_GET_FACTURES_URL!, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Factures récupérées:', result);
    
    return {
      success: true,
      message: `${result.invoices?.length || 0} factures récupérées du cloud`,
      data: result.invoices || []
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur lors de la récupération:', message);
    return {
      success: false,
      message: `Erreur de récupération: ${message}`,
    };
  }
};

// Fusionner les factures locales et distantes (éviter les doublons)
export const mergeInvoices = (localInvoices: Invoice[], cloudInvoices: Invoice[]): Invoice[] => {
  console.log('🔄 Fusion des factures...', {
    local: localInvoices.length,
    cloud: cloudInvoices.length
  });

  // Créer une Map pour éviter les doublons (clé = invoiceNumber)
  const mergedMap = new Map<string, Invoice>();

  // Ajouter d'abord les factures du cloud
  cloudInvoices.forEach(invoice => {
    mergedMap.set(invoice.invoiceNumber, invoice);
  });

  // Ajouter les factures locales (elles prennent priorité si plus récentes)
  localInvoices.forEach(localInvoice => {
    const existingInvoice = mergedMap.get(localInvoice.invoiceNumber);
    
    if (!existingInvoice) {
      // Nouvelle facture locale
      mergedMap.set(localInvoice.invoiceNumber, localInvoice);
    } else {
      // Facture existe déjà, garder la plus récente
      const localDate = new Date(localInvoice.updatedAt || localInvoice.createdAt);
      const cloudDate = new Date(existingInvoice.updatedAt || existingInvoice.createdAt);
      
      if (localDate > cloudDate) {
        mergedMap.set(localInvoice.invoiceNumber, localInvoice);
      }
    }
  });

  const merged = Array.from(mergedMap.values());
  console.log('✅ Fusion terminée:', merged.length, 'factures au total');
  
  return merged;
};

// Synchronisation complète bidirectionnelle
export const fullSyncInvoices = async (localInvoices: Invoice[]): Promise<{
  success: boolean;
  message: string;
  mergedInvoices: Invoice[];
}> => {
  try {
    console.log('🔄 Synchronisation complète démarrée...');

    // 1. Envoyer les factures locales vers le cloud
    const syncResult = await syncLocalInvoicesToCloud(localInvoices);
    if (!syncResult.success) {
      console.warn('⚠️ Échec de l\'envoi, tentative de récupération uniquement...');
    }

    // 2. Récupérer toutes les factures du cloud
    const cloudResult = await getAllInvoicesFromCloud();
    if (!cloudResult.success) {
      throw new Error(cloudResult.message);
    }

    // 3. Fusionner les données
    const mergedInvoices = mergeInvoices(localInvoices, cloudResult.data);

    console.log('🎉 Synchronisation complète réussie!');
    return {
      success: true,
      message: `Synchronisation réussie: ${mergedInvoices.length} factures disponibles`,
      mergedInvoices
    };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur lors de la synchronisation complète:', message);
    return {
      success: false,
      message: `Erreur de synchronisation: ${message}`,
      mergedInvoices: localInvoices // Retourner au moins les factures locales
    };
  }
};

// Générer un ID unique pour l'appareil
function getDeviceId(): string {
  let deviceId = localStorage.getItem('myconfort_device_id');
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('myconfort_device_id', deviceId);
  }
  
  return deviceId;
}

// Envoyer une seule facture vers N8N (pour les nouvelles factures)
export const syncSingleInvoiceToCloud = async (invoice: Invoice): Promise<SyncResponse> => {
  try {
    assertUrls();
    console.log('📤 Envoi de la facture vers le cloud:', invoice.invoiceNumber);
    
    const response = await fetch(N8N_SYNC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'single_invoice',
        invoice: {
          ...invoice,
          device_id: getDeviceId(),
          sync_timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Facture envoyée avec succès:', result);
    
    return {
      success: true,
      message: 'Facture synchronisée avec succès',
      data: result
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur lors de l\'envoi de la facture:', message);
    return {
      success: false,
      message: `Erreur d'envoi: ${message}`,
    };
  }
};
