import { create } from 'zustand';

export type WizardStep = 'facture' | 'client' | 'produits' | 'paiement' | 'livraison' | 'signature' | 'recap';

interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  siret?: string;
  housingType?: string;
  doorCode?: string;
}

interface Produit {
  id: string;
  designation: string;
  category?: string;
  qty: number;
  priceTTC: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  isPickupOnSite?: boolean; // true = emporter, false = à livrer
}

interface PaymentData {
  method: 'Carte Bleue' | 'Espèces' | 'Virement' | 'Chèque' | 'Chèques (3 fois)' | 'Chèque à venir' | 'Acompte' | '';
  depositRate?: number; // %
  depositAmount?: number;
  depositPaymentMethod?: 'Carte Bleue' | 'Espèces' | 'Chèque' | ''; // Mode de règlement de l'acompte
  remainingAmount?: number;
  note?: string;
  nombreChequesAVenir?: number;
  nombreFoisAlma?: number; // Nombre de fois pour Alma (2, 3, ou 4)
  // 💳 Mollie payment state
  paymentStatus?: 'idle' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentId?: string;
  orderId?: string;
  checkoutUrl?: string;
  paymentError?: string;
}

interface LivraisonData {
  deliveryMethod?: string;
  deliveryNotes?: string;
  deliveryAddress?: string;
}

interface SignatureData {
  dataUrl?: string;
  timestamp?: string;
}

interface WizardState {
  step: WizardStep;
  
  // Informations facture
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation: string;
  
  client: ClientData;
  produits: Produit[];
  paiement: PaymentData;
  livraison: LivraisonData;
  signature: SignatureData;
  signatureDataUrl?: string; // image de la signature - LEGACY
  invoiceNotes?: string;
  advisorName?: string;
  termsAccepted: boolean;
  
  // Actions
  setStep: (s: WizardStep) => void;
  setInvoiceData: (data: { invoiceNumber?: string; invoiceDate?: string; eventLocation?: string }) => void;
  updateClient: (p: Partial<ClientData>) => void;
  addProduit: (p: Produit) => void;
  updateProduit: (id: string, p: Partial<Produit>) => void;
  removeProduit: (id: string) => void;
  updatePaiement: (p: Partial<PaymentData>) => void;
  updateLivraison: (p: Partial<LivraisonData>) => void;
  updateSignature: (s: Partial<SignatureData>) => void;
  setSignature: (dataUrl?: string) => void; // LEGACY
  updateInvoiceNotes: (notes: string) => void;
  updateAdvisorName: (name: string) => void;
  setTermsAccepted: (accepted: boolean) => void;
  reset: () => void;
  
  // Synchronisation avec l'état principal
  syncFromMainInvoice: (invoice: any) => void;
  syncToMainInvoice: () => any;

  // 💳 Actions pour le paiement Mollie
  setPaymentStatus: (status: PaymentData['paymentStatus']) => void;
  setPaymentData: (data: { paymentId?: string; orderId?: string; checkoutUrl?: string; paymentError?: string }) => void;
  clearPaymentData: () => void;
}

export const useInvoiceWizard = create<WizardState>((set, get) => ({
  step: 'facture',
  
  // Informations facture - valeurs par défaut
  invoiceNumber: '',
  invoiceDate: '',
  eventLocation: '',
  
  client: { name: '' },
  produits: [],
  paiement: { method: '' },
  livraison: {},
  signature: { dataUrl: '', timestamp: '' },
  signatureDataUrl: undefined,
  invoiceNotes: '',
  advisorName: '',
  termsAccepted: false,
  
  setStep: (s) => set({ step: s }),
  
  setInvoiceData: (data) => set((state) => ({
    invoiceNumber: data.invoiceNumber ?? state.invoiceNumber,
    invoiceDate: data.invoiceDate ?? state.invoiceDate,
    eventLocation: data.eventLocation ?? state.eventLocation,
  })),
  
  updateClient: (p) => set((st) => ({ client: { ...st.client, ...p } })),
  
  addProduit: (p) => set((st) => ({ produits: [...st.produits, p] })),
  
  updateProduit: (id, p) =>
    set((st) => ({ 
      produits: st.produits.map(x => x.id === id ? { ...x, ...p } : x) 
    })),
    
  removeProduit: (id) =>
    set((st) => ({ produits: st.produits.filter(x => x.id !== id) })),
    
  updatePaiement: (p) => set((st) => ({ paiement: { ...st.paiement, ...p } })),
  
  updateLivraison: (p) => set((st) => ({ livraison: { ...st.livraison, ...p } })),
  
  updateSignature: (s) => set((st) => ({ signature: { ...st.signature, ...s } })),
  
  setSignature: (dataUrl) => set({ signatureDataUrl: dataUrl }),
  
  updateInvoiceNotes: (notes) => set({ invoiceNotes: notes }),
  
  updateAdvisorName: (name) => set({ advisorName: name }),
  
  setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
  
  reset: () => set({
    step: 'facture',
    invoiceNumber: '',
    invoiceDate: '',
    eventLocation: '',
    client: { name: '' },
    produits: [],
    paiement: { method: '' },
    livraison: {},
    signature: { dataUrl: '', timestamp: '' },
    signatureDataUrl: undefined,
    invoiceNotes: '',
    advisorName: '',
    termsAccepted: false,
  }),
  
  // Synchroniser depuis l'état principal de App.tsx
  syncFromMainInvoice: (invoice) => {
    set({
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: invoice.invoiceDate || '',
      eventLocation: invoice.eventLocation || '',
      client: {
        name: invoice.clientName || '',
        email: invoice.clientEmail || '',
        phone: invoice.clientPhone || '',
        address: invoice.clientAddress || '',
        addressLine2: invoice.clientAddressLine2 || '',
        city: invoice.clientCity || '',
        postalCode: invoice.clientPostalCode || '',
        siret: invoice.clientSiret || '',
        housingType: invoice.clientHousingType || '',
        doorCode: invoice.clientDoorCode || '',
      },
      produits: (invoice.products || []).map((p: any) => ({
        id: p.id || Math.random().toString(36),
        designation: p.designation || p.name || '',
        qty: p.quantity || p.qty || 1,
        priceTTC: p.priceTTC || p.price || 0,
        category: p.category || '',
      })),
      paiement: {
        method: invoice.paymentMethod || '',
        depositAmount: invoice.montantAcompte || 0,
        remainingAmount: invoice.montantRestant || 0,
        nombreChequesAVenir: invoice.nombreChequesAVenir || 0,
      },
      livraison: {
        deliveryMethod: invoice.deliveryMethod || '',
        deliveryNotes: invoice.deliveryNotes || '',
        deliveryAddress: invoice.deliveryAddress || '',
      },
      signatureDataUrl: invoice.signature || undefined,
      invoiceNotes: invoice.invoiceNotes || '',
      advisorName: invoice.advisorName || '',
      termsAccepted: invoice.termsAccepted || false,
    });
  },
  
  // Synchroniser vers l'état principal
  syncToMainInvoice: () => {
    const state = get();
    return {
      invoiceNumber: state.invoiceNumber,
      invoiceDate: state.invoiceDate,
      eventLocation: state.eventLocation,
      
      clientName: state.client.name,
      clientEmail: state.client.email || '',
      clientPhone: state.client.phone || '',
      clientAddress: state.client.address || '',
      clientAddressLine2: state.client.addressLine2 || '',
      clientCity: state.client.city || '',
      clientPostalCode: state.client.postalCode || '',
      clientSiret: state.client.siret || '',
      clientHousingType: state.client.housingType || '',
      clientDoorCode: state.client.doorCode || '',
      
      products: state.produits.map(p => ({
        id: p.id,
        name: p.designation, // ✅ CORRECTION: mapper designation vers name pour compatibilité N8N
        designation: p.designation, // Garder aussi designation pour compatibilité
        quantity: p.qty,
        priceTTC: p.priceTTC,
        category: p.category || '',
        // Calculer automatiquement les prix HT avec TVA 20%
        priceHT: +(p.priceTTC / 1.2).toFixed(2),
        totalHT: +(p.qty * p.priceTTC / 1.2).toFixed(2),
        totalTTC: +(p.qty * p.priceTTC).toFixed(2),
        // Champs requis par l'interface Product
        unitPrice: p.priceTTC,
        discount: 0,
        discountType: 'fixed' as const,
      })),
      
      paymentMethod: state.paiement.method,
      montantAcompte: state.paiement.depositAmount || 0,
      depositPaymentMethod: state.paiement.depositPaymentMethod || '',
      montantRestant: state.paiement.remainingAmount || 0,
      nombreChequesAVenir: state.paiement.nombreChequesAVenir || 0,
      
      deliveryMethod: state.livraison.deliveryMethod || '',
      deliveryAddress: state.livraison.deliveryAddress || '',
      deliveryNotes: state.livraison.deliveryNotes || '',
      
      signature: state.signature.dataUrl || '',
      isSigned: !!state.signature.dataUrl,
      signatureDate: state.signature.dataUrl ? state.signature.timestamp || new Date().toISOString() : undefined,
      invoiceNotes: state.invoiceNotes || '',
      advisorName: state.advisorName || '',
      termsAccepted: state.termsAccepted,
    };
  },

  // 💳 Actions pour le paiement Mollie
  setPaymentStatus: (status) =>
    set((state) => ({
      paiement: { ...state.paiement, paymentStatus: status }
    })),
    
  setPaymentData: (data) =>
    set((state) => ({
      paiement: { ...state.paiement, ...data }
    })),
    
  clearPaymentData: () =>
    set((state) => ({
      paiement: {
        ...state.paiement,
        paymentStatus: 'idle',
        paymentId: undefined,
        orderId: undefined,
        checkoutUrl: undefined,
        paymentError: undefined,
      }
    })),
}));
