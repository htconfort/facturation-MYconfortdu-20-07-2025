// Script de test à exécuter dans la console du navigateur
const createTestInvoice = () => {
  const testInvoice = {
    invoiceNumber: 'FAC-2025-TEST',
    invoiceDate: '2025-07-25',
    eventLocation: 'Paris Test',
    clientName: 'Test Client',
    clientEmail: 'test@test.com',
    clientPhone: '0123456789',
    clientAddress: '123 Test Street',
    clientPostalCode: '75001',
    clientCity: 'Paris',
    clientDoorCode: '',
    products: [{
      name: 'Test Product',
      quantity: 1,
      priceHT: 100,
      priceTTC: 120,
      discount: 0,
      discountType: 'fixed',
      totalHT: 100,
      totalTTC: 120,
      category: 'Test'
    }],
    montantHT: 100,
    montantTTC: 120,
    montantTVA: 20,
    montantRemise: 0,
    taxRate: 20,
    paymentMethod: 'Test',
    montantAcompte: 0,
    montantRestant: 120,
    deliveryMethod: 'Test',
    deliveryNotes: '',
    signature: '',
    isSigned: false,
    invoiceNotes: 'Test invoice',
    advisorName: 'Test Advisor',
    termsAccepted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existingInvoices = localStorage.getItem('myconfortInvoices');
  const invoices = existingInvoices ? JSON.parse(existingInvoices) : [];
  invoices.push(testInvoice);
  
  localStorage.setItem('myconfortInvoices', JSON.stringify(invoices));
  console.log('Facture de test créée:', testInvoice);
  
  // Recharger la page pour voir les changements
  window.location.reload();
};

// Exécuter la fonction
createTestInvoice();
