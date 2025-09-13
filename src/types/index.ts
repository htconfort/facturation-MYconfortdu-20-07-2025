export interface Client {
  id?: string;
  name: string;
  address: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  housingType?: string;
  doorCode?: string;
  phone: string;
  email: string;
  siret?: string;
  createdAt?: string;
  invoices?: string[];
}

export interface Product {
  id?: string;
  name: string;
  category?: string;
  quantity: number;
  priceHT: number;
  priceTTC: number;
  unitPrice?: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  totalHT: number;
  totalTTC: number;
  autoCalculateHT?: boolean;
  isPickupOnSite?: boolean; // true = emporter, false = à livrer
}

export interface ProductCatalog {
  category: string;
  name: string;
  price?: number;
  priceTTC: number;
  autoCalculateHT?: boolean;
}

export interface DeliveryInfo {
  method: string;
  notes: string;
}

export interface PaymentInfo {
  method: string;
  depositAmount: number;
}

export interface Invoice {
  // Informations de base
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation?: string;

  // Client - Structure plate pour compatibilité webhook
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientAddressLine2?: string;
  clientPostalCode: string;
  clientCity: string;
  clientHousingType?: string;
  clientDoorCode?: string;
  clientSiret?: string;

  // Produits
  products: Product[];

  // Montants (calculés et stockés)
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  montantRemise: number;
  taxRate: number;

  // Paiement
  paymentMethod: string;
  montantAcompte: number;
  depositPaymentMethod?: string; // Mode de règlement de l'acompte
  montantRestant: number;

  // Livraison
  deliveryMethod: string;
  deliveryAddress?: string;
  deliveryNotes: string;

  // Signature
  signature: string;
  isSigned: boolean;
  signatureDate?: string;

  // Suivi email (optionnel)
  emailSent?: boolean;
  emailSentDate?: string;

  // Notes et conseiller
  invoiceNotes: string;
  advisorName: string;
  termsAccepted: boolean;

  // Chèques à venir
  nombreChequesAVenir?: number;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export type ToastType = 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}
