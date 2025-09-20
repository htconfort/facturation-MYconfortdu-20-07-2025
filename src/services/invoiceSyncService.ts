import { Invoice } from '../types';
import { WebhookUrlHelper } from '../utils/webhookUrlHelper';

// Utiliser systématiquement le proxy Netlify `/api/n8n/*` via l'utilitaire centralisé
function getSyncUrlOrThrow(): string {
  // Endpoint principal de push côté n8n
  return WebhookUrlHelper.getWebhookUrl('webhook/facture-universelle');
}

function getPullUrlOrThrow(): string {
  // Endpoint de récupération (pull) si exposé côté n8n
  return WebhookUrlHelper.getWebhookUrl('webhook/sync/invoices');
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Envoyer toutes les factures locales vers N8N pour centralisation
export const syncLocalInvoicesToCloud = async (invoices: Invoice[]): Promise<SyncResponse> => {
  try {
    const syncUrl = getSyncUrlOrThrow();
    console.log('🔄 Synchronisation des factures locales vers le cloud...', invoices.length);
    
    const response = await fetch(syncUrl, {
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
    const getUrl = getPullUrlOrThrow();
    console.log('📥 Récupération des factures depuis le cloud...');
    
    const response = await fetch(getUrl, {
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

    // 3. Normaliser les factures cloud au format de l'app
    const normalizedCloudInvoices: Invoice[] = (Array.isArray(cloudResult.data)
      ? cloudResult.data
      : [])
      .map((inv: any) => normalizeCloudInvoice(inv))
      .filter(Boolean) as unknown as Invoice[];

    // 4. Fusionner les données
    const mergedInvoices = mergeInvoices(localInvoices, normalizedCloudInvoices);

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

// Normalise une facture venant du workflow N8N (client imbriqué, champs différents)
function normalizeCloudInvoice(raw: any): Invoice | null {
  if (!raw) return null;
  const client = raw.client || {};
  const invoiceNumber: string = String(raw.invoiceNumber || raw.id || '').trim();
  if (!invoiceNumber) return null;

  const invoiceDate: string = String(raw.invoiceDate || raw.createdAt || new Date().toISOString()).slice(0, 10);

  const montantTTC: number = Number(raw.totalTTC ?? raw.total_ttc ?? 0);
  const montantHT: number = Number(raw.totalHT ?? raw.total_ht ?? 0);
  const montantTVA: number = Number(raw.montantTVA ?? raw.vat ?? 0);
  const acompte: number = Number(raw.deposit ?? raw.acompte ?? 0);
  const montantRestant: number = Number(raw.remaining ?? raw.montant_restant ?? 0);

  const createdAt: string = String(raw.createdAt || invoiceDate);
  const updatedAt: string = String(raw.lastUpdate || raw.updatedAt || createdAt);

  const out: Invoice = {
    invoiceNumber,
    invoiceDate,
    eventLocation: String(raw.eventLocation || ''),
    clientName: String(raw.clientName || client.name || ''),
    clientEmail: String(raw.clientEmail || client.email || ''),
    clientPhone: String(raw.clientPhone || client.phone || ''),
    clientAddress: String(raw.clientAddress || client.address || ''),
    clientAddressLine2: String(client.addressLine2 || ''),
    clientPostalCode: String(raw.clientPostalCode || client.postalCode || ''),
    clientCity: String(raw.clientCity || client.city || ''),
    clientHousingType: String(raw.clientHousingType || client.housingType || ''),
    clientDoorCode: String(raw.clientDoorCode || client.doorCode || ''),
    clientSiret: String(raw.clientSiret || ''),
    products: Array.isArray(raw.products) ? raw.products : [],
    montantHT,
    montantTTC,
    montantTVA,
    montantRemise: Number(raw.montantRemise ?? 0),
    taxRate: Number(raw.taxRate ?? 20),
    paymentMethod: String(raw.paymentMethod || ''),
    montantAcompte: acompte,
    depositPaymentMethod: String(raw.depositPaymentMethod || ''),
    montantRestant,
    deliveryMethod: String(raw.deliveryMethod || ''),
    deliveryAddress: String(raw.deliveryAddress || ''),
    deliveryNotes: String(raw.deliveryNotes || ''),
    signature: String(raw.signature || ''),
    isSigned: Boolean(raw.isSigned || false),
    signatureDate: raw.signatureDate ? String(raw.signatureDate) : undefined,
    invoiceNotes: String(raw.invoiceNotes || ''),
    advisorName: String(raw.advisor || raw.advisorName || ''),
    termsAccepted: Boolean(raw.termsAccepted || false),
    nombreChequesAVenir: Number(raw.nombreChequesAVenir ?? 0),
    createdAt,
    updatedAt,
  };

  return out;
}

// Envoyer une seule facture vers N8N (pour les nouvelles factures)
export const syncSingleInvoiceToCloud = async (invoice: Invoice): Promise<SyncResponse> => {
  try {
    const syncUrl = getSyncUrlOrThrow();
    console.log('📤 Envoi de la facture vers le cloud:', invoice.invoiceNumber);
    
    const response = await fetch(syncUrl, {
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
