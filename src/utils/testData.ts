import { Invoice } from '../types';
import { saveInvoice } from './storage';

export const createTestInvoices = () => {
  const testInvoices: Invoice[] = [
    {
      invoiceNumber: 'FAC-2025-001',
      invoiceDate: '2025-07-20',
      eventLocation: 'Paris 17ème',
      clientName: 'Jean Dupont',
      clientEmail: 'jean.dupont@email.com',
      clientPhone: '0123456789',
      clientAddress: '123 Rue de la Paix',
      clientPostalCode: '75017',
      clientCity: 'Paris',
      clientDoorCode: 'A1234',
      products: [
        {
          name: 'Installation climatisation',
          quantity: 1,
          priceHT: 800,
          priceTTC: 960,
          discount: 0,
          discountType: 'fixed' as const,
          totalHT: 800,
          totalTTC: 960,
          category: 'Installation'
        }
      ],
      montantHT: 800,
      montantTTC: 960,
      montantTVA: 160,
      montantRemise: 0,
      taxRate: 20,
      paymentMethod: 'Carte bancaire',
      montantAcompte: 200,
      montantRestant: 760,
      deliveryMethod: 'Sur site',
      deliveryNotes: 'Installation le matin',
      signature: '',
      isSigned: false,
      invoiceNotes: 'Installation standard',
      advisorName: 'Marc Martin',
      termsAccepted: true,
      createdAt: '2025-07-20T10:00:00.000Z',
      updatedAt: '2025-07-20T10:00:00.000Z'
    },
    {
      invoiceNumber: 'FAC-2025-002',
      invoiceDate: '2025-07-22',
      eventLocation: 'Neuilly-sur-Seine',
      clientName: 'Marie Leblanc',
      clientEmail: 'marie.leblanc@email.com',
      clientPhone: '0987654321',
      clientAddress: '456 Avenue Charles de Gaulle',
      clientPostalCode: '92200',
      clientCity: 'Neuilly-sur-Seine',
      products: [
        {
          name: 'Maintenance climatisation',
          quantity: 2,
          priceHT: 150,
          priceTTC: 180,
          discount: 10,
          discountType: 'percent' as const,
          totalHT: 270,
          totalTTC: 324,
          category: 'Maintenance'
        }
      ],
      montantHT: 270,
      montantTTC: 324,
      montantTVA: 54,
      montantRemise: 36,
      taxRate: 20,
      paymentMethod: 'Virement',
      montantAcompte: 0,
      montantRestant: 324,
      deliveryMethod: 'Sur site',
      deliveryNotes: 'Maintenance annuelle',
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      isSigned: true,
      signatureDate: '2025-07-22T14:30:00.000Z',
      invoiceNotes: 'Client satisfait',
      advisorName: 'Sophie Dubois',
      termsAccepted: true,
      createdAt: '2025-07-22T09:00:00.000Z',
      updatedAt: '2025-07-22T14:30:00.000Z'
    }
  ];

  // Sauvegarder chaque facture de test
  testInvoices.forEach(invoice => {
    saveInvoice(invoice);
  });

  console.log('Factures de test créées:', testInvoices.length);
  return testInvoices;
};
