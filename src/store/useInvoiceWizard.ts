import { create } from 'zustand';
import { calculateProductTotal } from '../utils/calculations';

export type WizardStep = 'facture' | 'client' | 'produits' | 'paiement' | 'livraison' | 'signature' | 'recap' | 'nouvelles-commandes';

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
  method: 'Carte Bleue' | 'Espèces' | 'Virement' | 'Chèque' | 'Chèque au comptant' | 'Chèques (3 fois)' | 'Chèque à venir' | 'Acompte' | 'Alma 2x' | 'Alma 3x' | 'Alma 4x' | '';
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

// ✅ AJOUT : état de complétion sérialisable
interface CompletionState {
  completedStepIds: string[]; // on persiste en tableau
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
  
  // ✅ État de complétion
  completion: CompletionState;
  
  // Actions
  setStep: (s: WizardStep) => void;
  
  // Navigation helpers
  steps: WizardStep[];
  getCurrentStepIndex: () => number;
  goNext: () => void;
  goPrev: () => void;
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

  // ✅ API complétion
  markStepDone: (stepId: string) => void;
  resetCompletion: () => void;
  
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
  
  // ✅ État de complétion avec valeur par défaut robuste
  completion: { completedStepIds: [] },
  
  // Navigation helpers
  steps: ['facture', 'client', 'produits', 'paiement', 'livraison', 'signature', 'recap', 'nouvelles-commandes'],
  
  getCurrentStepIndex: () => {
    const state = get();
    return state.steps.indexOf(state.step);
  },
  
  setStep: (s) => set({ step: s }),
  
  goNext: () => {
    const state = get();
    const currentIndex = state.steps.indexOf(state.step);
    const nextStep = state.steps[currentIndex + 1];
    if (nextStep) {
      set({ step: nextStep });
    }
  },
  
  goPrev: () => {
    const state = get();
    const currentIndex = state.steps.indexOf(state.step);
    const prevStep = state.steps[currentIndex - 1];
    if (prevStep) {
      set({ step: prevStep });
    }
  },
  
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
    completion: { completedStepIds: [] },
  }),
  
  // ✅ marquer une étape comme faite
  markStepDone: (stepId) =>
    set((state) => {
      const setArr = new Set(state.completion?.completedStepIds ?? []);
      setArr.add(stepId);
      return { completion: { completedStepIds: Array.from(setArr) } };
    }),

  resetCompletion: () => set({ completion: { completedStepIds: [] } }),
  
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
      
      products: state.produits.map(p => {
        // Calculer le total TTC avec remises appliquées
        const totalTTCWithDiscount = calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          p.discountType || 'percent'
        );
        
        return {
          id: p.id,
          name: p.designation, // ✅ CORRECTION: mapper designation vers name pour compatibilité N8N
          designation: p.designation, // Garder aussi designation pour compatibilité
          quantity: p.qty,
          priceTTC: p.priceTTC,
          category: p.category || '',
          // Calculer automatiquement les prix HT avec TVA 20% et remises
          priceHT: +(p.priceTTC / 1.2).toFixed(2),
          totalHT: +(totalTTCWithDiscount / 1.2).toFixed(2), // ✅ CORRECTION: avec remises
          totalTTC: +totalTTCWithDiscount.toFixed(2), // ✅ CORRECTION: avec remises
          // Champs requis par l'interface Product
          unitPrice: p.priceTTC,
          discount: p.discount || 0, // ✅ CORRECTION: utiliser la vraie remise
          discountType: p.discountType || 'percent', // ✅ CORRECTION: utiliser le vrai type de remise
          isPickupOnSite: p.isPickupOnSite, // ✅ CORRECTION: ajouter l'info livraison/emporter
        };
      }),
      
      // 🎯 CORRECTION: Mode de règlement détaillé 
      paymentMethod: (() => {
        const method = state.paiement.method;
        const depositAmount = state.paiement.depositAmount || 0;
        const nombreCheques = state.paiement.nombreChequesAVenir || 0;
        const totalTTC = state.produits.reduce((sum, p) => {
          const totalTTCWithDiscount = calculateProductTotal(
            p.qty,
            p.priceTTC,
            p.discount || 0,
            p.discountType || 'percent'
          );
          return sum + totalTTCWithDiscount;
        }, 0);
        
        if (method === 'Chèque à venir' && nombreCheques > 0) {
          const montantParCheque = Math.round((totalTTC - depositAmount) / nombreCheques);
          return `Chèque à venir (${nombreCheques} chèques de ${montantParCheque}€ + acompte ${depositAmount.toFixed(2)}€)`;
        }
        
        if (method?.startsWith('Alma') && state.paiement.nombreFoisAlma) {
          const montantParFois = Math.round((totalTTC - depositAmount) / state.paiement.nombreFoisAlma);
          return `${method} (${state.paiement.nombreFoisAlma} fois de ${montantParFois}€ + acompte ${depositAmount.toFixed(2)}€)`;
        }
        
        if (depositAmount > 0 && method !== 'Chèque à venir' && !method?.startsWith('Alma')) {
          return `${method} (acompte ${depositAmount.toFixed(2)}€)`;
        }
        
        return method || '';
      })(),
      montantAcompte: state.paiement.depositAmount || 0,
      depositPaymentMethod: state.paiement.depositPaymentMethod || '',
      montantRestant: state.paiement.remainingAmount || 0,
      nombreChequesAVenir: state.paiement.nombreChequesAVenir || 0,
      
      deliveryMethod: state.livraison.deliveryMethod || '',
      deliveryAddress: state.livraison.deliveryAddress || '',
      deliveryNotes: state.livraison.deliveryNotes || '',
      
      // 🎯 CORRECTION: Calculs des totaux globaux manquants
      montantTTC: state.produits.reduce((sum, p) => {
        const totalTTCWithDiscount = calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          p.discountType || 'percent'
        );
        return sum + totalTTCWithDiscount;
      }, 0),
      montantHT: state.produits.reduce((sum, p) => {
        const totalTTCWithDiscount = calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          p.discountType || 'percent'
        );
        return sum + (totalTTCWithDiscount / 1.2);
      }, 0),
      montantTVA: state.produits.reduce((sum, p) => {
        const totalTTCWithDiscount = calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          p.discountType || 'percent'
        );
        const ht = totalTTCWithDiscount / 1.2;
        return sum + (totalTTCWithDiscount - ht);
      }, 0),
      
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
