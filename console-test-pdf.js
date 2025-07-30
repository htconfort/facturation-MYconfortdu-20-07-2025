/**
 * Script de test pour la console du navigateur
 * À copier-coller dans la console (F12) de l'application
 */

console.log('🧪 DÉMARRAGE TEST DIAGNOSTIC PDF');

// 1. Créer une facture de test simple
const testInvoice = {
  invoiceNumber: 'CONSOLE-TEST-001',
  invoiceDate: '2025-01-30',
  eventLocation: 'Paris Test',
  taxRate: 20,
  
  clientName: 'Client Console Test',
  clientEmail: 'console@test.com',
  clientPhone: '0987654321',
  clientAddress: '456 Rue Console',
  clientPostalCode: '75002',
  clientCity: 'Paris',
  clientHousingType: 'Appartement',
  clientDoorCode: '',
  clientSiret: '',
  
  products: [
    {
      name: 'Produit Console 1',
      category: 'Test',
      quantity: 1,
      priceTTC: 100.00,
      priceHT: 83.33,
      totalHT: 83.33,
      totalTTC: 100.00,
      discount: 0,
      discountType: 'percent'
    },
    {
      name: 'Produit Console 2',
      category: 'Test',
      quantity: 2,
      priceTTC: 200.00,
      priceHT: 166.67,
      totalHT: 333.34,
      totalTTC: 400.00,
      discount: 0,
      discountType: 'percent'
    }
  ],
  
  montantHT: 416.67,
  montantTTC: 500.00,
  montantTVA: 83.33,
  montantRemise: 0,
  paymentMethod: 'Console Test',
  montantAcompte: 0,
  montantRestant: 500.00,
  deliveryMethod: '',
  deliveryNotes: '',
  signature: '',
  isSigned: false,
  invoiceNotes: '',
  advisorName: 'Console Tester',
  termsAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('📋 Facture de test créée:', testInvoice);

// 2. Tester le calcul des totaux dans l'aperçu (comme fait par InvoicePreviewModern)
console.log('🧮 CALCUL APERÇU HTML (méthode InvoicePreviewModern):');
const calculateProductTotal = (quantity, priceTTC, discount, discountType) => {
  const productTotal = quantity * priceTTC;
  if (discount <= 0) return productTotal;
  
  if (discountType === 'percent') {
    return productTotal * (1 - discount / 100);
  } else {
    return Math.max(0, productTotal - discount);
  }
};

let totalApercu = 0;
testInvoice.products.forEach((product, index) => {
  const productTotal = calculateProductTotal(
    product.quantity,
    product.priceTTC,
    product.discount,
    product.discountType === 'percent' ? 'percent' : 'fixed'
  );
  console.log(`  Produit ${index + 1}: ${product.name} = ${productTotal}€`);
  totalApercu += productTotal;
});
console.log(`🎯 TOTAL APERÇU: ${totalApercu}€`);

// 3. Instructions pour tester le service PDF
console.log('');
console.log('🔧 POUR TESTER LE SERVICE PDF:');
console.log('1. Copiez cette ligne dans la console:');
console.log('   window.testInvoiceConsole = ', testInvoice);
console.log('');
console.log('2. Puis exécutez:');
console.log('   AdvancedPDFService.downloadPDF(window.testInvoiceConsole)');
console.log('');
console.log('3. Vérifiez dans le PDF téléchargé que le total est bien', totalApercu + '€');
console.log('');
console.log('✅ Si le total dans le PDF = ' + totalApercu + '€ → CORRECTION RÉUSSIE');
console.log('❌ Si le total dans le PDF ≠ ' + totalApercu + '€ → PROBLÈME PERSISTE');

// Exposer la facture de test globalement
window.testInvoiceConsole = testInvoice;
