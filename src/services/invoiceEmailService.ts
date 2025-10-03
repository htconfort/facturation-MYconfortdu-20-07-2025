import { UnifiedPrintService } from './unifiedPrintService';
import { N8nWebhookService } from './n8nWebhookService';
import type { Invoice, Product } from '../types';

type PdfDraftProduct = {
  name: string;
  quantity: number;
  priceTTC: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  priceHT?: number;
};

type PdfDraft = {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  products: PdfDraftProduct[];
  montantAcompte: number;
  paymentMethod: string;
  invoiceNotes?: string;
  deliveryNotes?: string;
  eventLocation?: string;
  signature?: string;
  taxRate?: number;
};

export type SendInvoiceEmailResult = {
  success: boolean;
  message: string;
  n8n?: unknown;
};

function mapInvoiceToPdfDraft(source: Invoice): PdfDraft {
  const toDraftProduct = (p: Product): PdfDraftProduct => ({
    name: p.name,
    quantity: p.quantity,
    priceTTC: p.priceTTC,
    discount: p.discount ?? 0,
    discountType: p.discountType ?? 'fixed',
    priceHT: p.priceHT,
  });

  return {
    invoiceNumber: source.invoiceNumber,
    invoiceDate: source.invoiceDate,
    clientName: source.clientName,
    clientEmail: source.clientEmail,
    clientPhone: source.clientPhone,
    clientAddress: source.clientAddress,
    clientPostalCode: source.clientPostalCode,
    clientCity: source.clientCity,
    products: (source.products || []).map(toDraftProduct),
    montantAcompte: source.montantAcompte || 0,
    paymentMethod: source.paymentMethod || '',
    invoiceNotes: source.invoiceNotes,
    deliveryNotes: source.deliveryNotes,
    eventLocation: source.eventLocation,
    signature: source.signature,
    taxRate: source.taxRate,
  };
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      } else {
        reject(new Error('Invalid reader result'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

export async function sendInvoiceByEmail(invoice: Invoice): Promise<SendInvoiceEmailResult> {
  // 1) Mapper la facture au brouillon attendu par UnifiedPrintService
  const draft = mapInvoiceToPdfDraft(invoice);

  // 2) Générer le PDF jsPDF en mémoire, puis le convertir en base64
  const doc = await UnifiedPrintService.generateInvoicePdf(draft, {
    includeSignature: true,
    format: 'a4',
  });
  const pdfBlob = doc.output('blob');
  const pdfBase64 = await blobToBase64(pdfBlob);

  // 3) Envoyer via N8N (le workflow se charge d'expédier l'email au client)
  const n8n = await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);

  return {
    success: n8n.success,
    message: n8n.message,
    n8n: n8n.response ?? n8n.payload,
  };
}

export const __testables = { mapInvoiceToPdfDraft };

