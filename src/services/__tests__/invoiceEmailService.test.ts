import { describe, it, expect } from 'vitest';
import type { Invoice } from '../../types';
import { __testables } from '../invoiceEmailService';

describe('invoiceEmailService mapInvoiceToPdfDraft', () => {
  it('maps a flattened Invoice to the PDF draft structure', () => {
    const invoice: Invoice = {
      invoiceNumber: 'FAC-2025-0001',
      invoiceDate: '2025-10-03',
      eventLocation: 'Salon Habitat 2025',
      clientName: 'Jean Dupont',
      clientEmail: 'jean.dupont@example.com',
      clientPhone: '0600000000',
      clientAddress: '10 Rue des Fleurs',
      clientAddressLine2: '',
      clientPostalCode: '75001',
      clientCity: 'Paris',
      clientHousingType: 'Appartement',
      clientDoorCode: 'B12',
      clientSiret: '12345678900012',
      products: [
        {
          id: 'p1',
          name: 'Matelas Confort',
          category: 'Matelas',
          quantity: 1,
          priceHT: 500,
          priceTTC: 600,
          unitPrice: 600,
          discount: 10,
          discountType: 'percent',
          totalHT: 500,
          totalTTC: 600,
        },
      ],
      montantHT: 500,
      montantTTC: 600,
      montantTVA: 100,
      montantRemise: 0,
      taxRate: 20,
      paymentMethod: 'Virement',
      montantAcompte: 100,
      depositPaymentMethod: 'Carte Bleue',
      montantRestant: 500,
      deliveryMethod: 'Livraison',
      deliveryAddress: '10 Rue des Fleurs, 75001 Paris',
      deliveryNotes: 'Interphone B12',
      signature: 'data:image/png;base64,AAA',
      isSigned: true,
      signatureDate: '2025-10-03T10:00:00.000Z',
      emailSent: false,
      emailSentDate: undefined,
      invoiceNotes: 'Merci de votre confiance',
      advisorName: 'Alice',
      termsAccepted: true,
      nombreChequesAVenir: 0,
      createdAt: '2025-10-03T09:00:00.000Z',
      updatedAt: '2025-10-03T09:00:00.000Z',
    };

    const draft = __testables.mapInvoiceToPdfDraft(invoice as Invoice);

    expect(draft.invoiceNumber).toBe(invoice.invoiceNumber);
    expect(draft.clientName).toBe(invoice.clientName);
    expect(draft.clientEmail).toBe(invoice.clientEmail);
    expect(draft.clientPostalCode).toBe(invoice.clientPostalCode);
    expect(draft.clientCity).toBe(invoice.clientCity);
    expect(draft.paymentMethod).toBe('Virement');
    expect(draft.montantAcompte).toBe(100);
    expect(draft.invoiceNotes).toBe('Merci de votre confiance');
    expect(draft.signature).toBe('data:image/png;base64,AAA');
    expect(draft.products.length).toBe(1);
    expect(draft.products[0]).toMatchObject({
      name: 'Matelas Confort',
      quantity: 1,
      priceTTC: 600,
      discount: 10,
      discountType: 'percent',
    });
  });
});

