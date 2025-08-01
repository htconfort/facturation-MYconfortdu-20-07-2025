// 🧪 SCRIPT DE TEST COMPLET - Envoi facture via proxy N8N
console.log('🚀 DÉBUT TEST ENVOI FACTURE VIA PROXY N8N');

// Données de test simplifiées
const testInvoice = {
  invoiceNumber: 'TEST-PROXY-001',
  clientName: 'Client Test Proxy',
  clientEmail: 'test.proxy@exemple.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue du Test',
  clientCity: 'TestVille',
  clientPostalCode: '12345',
  products: [
    {
      name: 'Produit Test',
      quantity: 1,
      priceTTC: 100,
      description: 'Test produit proxy'
    }
  ],
  paymentMethod: 'Virement',
  montantAcompte: 0,
  advisorName: 'Conseiller Test',
  eventLocation: 'Lieu Test',
  taxRate: 20,
  termsAccepted: true,
  date: new Date().toISOString().split('T')[0],
  totalTTC: 100,
  totalHT: 83.33,
  totalTVA: 16.67
};

const testPdfBase64 = 'JVBERi0xLjQKJdPr6eEKMSAwIG9iaiAgCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iaiAgCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iaiAzIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNCAwIFIgPj4gPj4gL0NvbnRlbnRzIDUgMCBSID4+CmVuZG9iaiA0IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKNSAwIG9iaiAKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQLQKMC4gMC4gMC4gUkcKL0YxIDEwIFRmCjUwIDc1MiBUZApCVAooVEVTVCBQUk9YWSBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmogeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMTQgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgozODkKJSVFT0Y=';

const testSendToN8n = async () => {
  try {
    console.log('📤 Test envoi vers: /api/n8n/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a');
    
    const payload = {
      // Structure attendue par N8N
      invoiceNumber: testInvoice.invoiceNumber,
      clientName: testInvoice.clientName,
      clientEmail: testInvoice.clientEmail,
      clientPhone: testInvoice.clientPhone,
      clientAddress: testInvoice.clientAddress,
      clientCity: testInvoice.clientCity,
      clientPostalCode: testInvoice.clientPostalCode,
      paymentMethod: testInvoice.paymentMethod,
      montantAcompte: testInvoice.montantAcompte,
      advisorName: testInvoice.advisorName,
      eventLocation: testInvoice.eventLocation,
      date: testInvoice.date,
      totalTTC: testInvoice.totalTTC,
      totalHT: testInvoice.totalHT,
      totalTVA: testInvoice.totalTVA,
      pdfAttachment: testPdfBase64,
      pdfSizeKB: Math.round(testPdfBase64.length * 0.75 / 1024), // Estimation taille
      products: testInvoice.products,
      timestamp: new Date().toISOString(),
      source: 'test-proxy-script'
    };
    
    console.log('📦 Payload préparé:', {
      ...payload,
      pdfAttachment: `[${payload.pdfAttachment.length} caractères]`
    });
    
    const response = await fetch('/api/n8n/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Réponse N8N:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ SUCCÈS! Réponse N8N:', responseText);
    } else {
      const errorText = await response.text();
      console.error('❌ ERREUR N8N:', errorText);
    }
    
  } catch (error) {
    console.error('💥 ERREUR RÉSEAU/PROXY:', error);
  }
};

// Lancer le test
testSendToN8n();
