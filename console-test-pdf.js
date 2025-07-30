/**
 * 🔍 DIAGNOSTIC CRITIQUE - MAPPING PDF vs APERÇU
 * À copier-coller dans la console (F12) de l'application
 */

console.log('🚨 DIAGNOSTIC CRITIQUE - MAPPING PDF vs APERÇU');
console.log('==================================================');

// 1. Créer une facture de test avec des montants RECONNAISSABLES
const testInvoice = {
  invoiceNumber: 'DIAGNOSTIC-001',
  invoiceDate: '2025-01-30',
  eventLocation: 'Test Mapping',
  taxRate: 20,
  
  clientName: 'Client Diagnostic',
  clientEmail: 'diagnostic@test.com',
  clientPhone: '0987654321',
  clientAddress: '123 Rue Diagnostic',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientHousingType: 'Appartement',
  clientDoorCode: '',
  clientSiret: '',
  
  // 🎯 PRODUITS AVEC MONTANTS FACILEMENT IDENTIFIABLES
  products: [
    {
      name: '🔍 PRODUIT TEST 1 - Montant Unique',
      category: 'Diagnostic',
      quantity: 1,
      priceTTC: 111.11,  // Montant unique facilement identifiable
      priceHT: 92.59,
      totalHT: 92.59,
      totalTTC: 111.11,
      discount: 0,
      discountType: 'percent'
    },
    {
      name: '🔍 PRODUIT TEST 2 - Montant Unique',
      category: 'Diagnostic',
      quantity: 1,
      priceTTC: 222.22,  // Montant unique facilement identifiable
      priceHT: 185.18,
      totalHT: 185.18,
      totalTTC: 222.22,
      discount: 0,
      discountType: 'percent'
    }
  ],
  
  // Calculs pour correspondre aux montants test
  montantHT: 277.77,    // 92.59 + 185.18
  montantTTC: 333.33,   // 111.11 + 222.22 = TOTAL ATTENDU
  montantTVA: 55.56,
  montantRemise: 0,
  paymentMethod: 'Diagnostic Test',
  montantAcompte: 0,
  montantRestant: 333.33,
  deliveryMethod: '',
  deliveryNotes: '',
  signature: '',
  isSigned: false,
  invoiceNotes: '',
  advisorName: 'Diagnostic Tester',
  termsAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('🎯 FACTURE DIAGNOSTIC CRÉÉE - TOTAL ATTENDU: 333.33€');
console.log('📋 Détails des produits test:', testInvoice.products);

// 2. Test de calcul APERÇU HTML (méthode directe)
console.log('');
console.log('📱 CALCUL APERÇU HTML (invoice.products directement):');
console.log('=====================================================');

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
  console.log(`📱 Aperçu - Produit ${index + 1}: ${product.name.substring(0, 30)}... = ${productTotal}€`);
  totalApercu += productTotal;
});
console.log(`📱 TOTAL CALCULÉ PAR L'APERÇU: ${totalApercu}€`);

// 3. Instructions pour test PDF et diagnostic
console.log('');
console.log('🔧 DIAGNOSTIC PDF - INSTRUCTIONS:');
console.log('===================================');
console.log('1. Exécutez cette commande pour tester le PDF:');
console.log('   AdvancedPDFService.downloadPDF(testInvoice)');
console.log('');
console.log('2. Regardez les LOGS dans la console - vous devriez voir:');
console.log('   📤 STRUCTURE EXACTE ENVOYÉE AU SERVICE PDF');
console.log('   🔍 CONVERTINVOICEDATA - Structure reçue');
console.log('   ✅ Mapping produit 1, 2...');
console.log('   📊 GÉNÉRATION TABLEAU PDF - data.items reçu');
console.log('');
console.log('3. Dans le PDF téléchargé, cherchez ces montants:');
console.log('   • Produit 1: 111.11€ (montant unique identifiable)');
console.log('   • Produit 2: 222.22€ (montant unique identifiable)');
console.log('   • TOTAL TTC: 333.33€');
console.log('');
console.log('🎯 RÉSULTATS POSSIBLES:');
console.log('✅ PDF affiche 111.11€ + 222.22€ = 333.33€ → MAPPING CORRIGÉ');
console.log('❌ PDF affiche 375€, 1500€ ou autres → MAPPING DÉFAILLANT');
console.log('⚠️  PDF affiche des montants partiels → MAPPING PARTIEL');

// 4. Exposer pour test immédiat
window.testInvoice = testInvoice;
console.log('');
console.log('🚀 PRÊT POUR LE TEST!');
console.log('Exécutez maintenant: AdvancedPDFService.downloadPDF(testInvoice)');
console.log('Et analysez les logs + le PDF téléchargé!');
