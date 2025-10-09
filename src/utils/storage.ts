import { Client, Invoice } from '../types';
import { invoiceService } from './supabaseService';

export const saveClients = (clients: Client[]): void => {
  localStorage.setItem('myconfortClients', JSON.stringify(clients));
};

export const loadClients = (): Client[] => {
  const stored = localStorage.getItem('myconfortClients');
  return stored ? JSON.parse(stored) : [];
};

export const saveDraft = (invoice: Invoice): void => {
  localStorage.setItem('myconfortInvoiceDraft', JSON.stringify(invoice));
};

export const loadDraft = (): Invoice | null => {
  const stored = localStorage.getItem('myconfortInvoiceDraft');
  return stored ? JSON.parse(stored) : null;
};

export const saveClient = (client: Client): void => {
  const clients = loadClients();
  const existingIndex = clients.findIndex(
    c => c.email === client.email && c.name === client.name
  );

  if (existingIndex >= 0) {
    clients[existingIndex] = { ...clients[existingIndex], ...client };
  } else {
    clients.push({
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  }

  saveClients(clients);
};

// 📋 NOUVELLES FONCTIONS POUR LA GESTION DES FACTURES
export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem('myconfortInvoices', JSON.stringify(invoices));
};

export const loadInvoices = (): Invoice[] => {
  const stored = localStorage.getItem('myconfortInvoices');
  return stored ? JSON.parse(stored) : [];
};

export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  // 1. Sauvegarde locale (localStorage) - toujours en premier pour garantie immédiate
  const invoices = loadInvoices();
  const existingIndex = invoices.findIndex(
    inv => inv.invoiceNumber === invoice.invoiceNumber
  );

  if (existingIndex >= 0) {
    // Mettre à jour la facture existante
    invoices[existingIndex] = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Ajouter une nouvelle facture
    invoices.push({
      ...invoice,
      createdAt: new Date().toISOString(),
    });
  }

  saveInvoices(invoices);
  
  // 2. Sauvegarde Supabase (asynchrone) - pour persistance permanente
  try {
    // TODO: Adapter le format Invoice de l'app vers le format Supabase
    // Pour l'instant, on sauvegarde juste dans localStorage
    // La migration complète vers Supabase nécessite un mapping des champs
    console.log('📝 Facture sauvegardée dans localStorage:', invoice.invoiceNumber);
    console.log('⚠️ Sauvegarde Supabase: À implémenter (mapping Invoice → InvoiceInsert)');
  } catch (error) {
    console.error('❌ Erreur sauvegarde Supabase (non bloquant):', error);
    // Ne pas bloquer si Supabase échoue - localStorage est la sauvegarde principale
  }
};

export const deleteInvoice = (invoiceNumber: string): void => {
  const invoices = loadInvoices();
  const filteredInvoices = invoices.filter(
    inv => inv.invoiceNumber !== invoiceNumber
  );
  saveInvoices(filteredInvoices);
};

export const getInvoiceByNumber = (invoiceNumber: string): Invoice | null => {
  const invoices = loadInvoices();
  return invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
};

// Fonction pour nettoyer les anciennes données (optionnel)
export const cleanupOldInvoices = (daysToKeep: number = 365): void => {
  const invoices = loadInvoices();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.invoiceDate);
    return invoiceDate >= cutoffDate;
  });

  if (filteredInvoices.length !== invoices.length) {
    saveInvoices(filteredInvoices);
    console.log(
      `Nettoyage: ${invoices.length - filteredInvoices.length} factures anciennes supprimées`
    );
  }
};
