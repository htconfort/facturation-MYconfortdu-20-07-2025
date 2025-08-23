export type InvoiceItem = {
  designation: string;
  quantity: number;
  priceTTC: number;
  discount?: number;
  discountType?: 'percent' | 'amount';
  category?: string;
  isPickupOnSite?: boolean;
};

export interface InvoiceForPDF {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientAddress: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientPhone?: string;
  clientEmail?: string;
  products: InvoiceItem[];
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  taxRate: number; // 20
  paymentMethod?: string;
  remarks?: string;
}
