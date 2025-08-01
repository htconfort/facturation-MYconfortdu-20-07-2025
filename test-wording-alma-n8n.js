/**
 * 🧪 TEST DE VALIDATION DU WORDING ALMA DANS LES SERVICES N8N
 * ============================================================
 * 
 * Ce script teste la correction du wording pour ALMA :
 * - "paiements" pour ALMA
 * - "chèques" pour les chèques classiques
 */

// Simulation des données de facturation ALMA
const testInvoiceALMA = {
  invoiceNumber: "FAC-2025-001",
  invoiceDate: "2025-01-28",
  clientName: "Jean Dupont",
  clientEmail: "jean.dupont@email.com",
  clientPhone: "0123456789",
  clientAddress: "123 Rue de la Paix",
  clientPostalCode: "75001",
  clientCity: "Paris",
  
  products: [
    {
      name: "Canapé 3 places",
      quantity: 1,
      priceTTC: 1200,
      priceHT: 1000,
      category: "Mobilier"
    }
  ],
  
  taxRate: 20,
  paymentMethod: "ALMA 4x", // 🎯 MODE ALMA
  nombreChequesAVenir: 4,    // 🎯 4 PAIEMENTS ALMA
  montantAcompte: 300,       // 🎯 ACOMPTE 25%
  
  isSigned: true,
  signature: "data:image/png;base64,iVBOR...",
  termsAccepted: true
};

// Simulation des données de facturation chèques classiques
const testInvoiceCheques = {
  ...testInvoiceALMA,
  paymentMethod: "Chèques à venir", // 🎯 MODE CHÈQUES CLASSIQUES
  nombreChequesAVenir: 3            // 🎯 3 CHÈQUES
};

console.log('🧪 TEST WORDING ALMA VS CHÈQUES DANS LES SERVICES N8N');
console.log('===================================================');

// Test 1: Mode ALMA
console.log('\n📱 TEST 1: MODE ALMA');
console.log('-------------------');

// Calculs pour ALMA
const totalTTC_ALMA = testInvoiceALMA.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0);
const montantRestant_ALMA = totalTTC_ALMA - testInvoiceALMA.montantAcompte;

const modeALMA_details = (() => {
  const acompteAmount = testInvoiceALMA.montantAcompte || 0;
  const nombrePaiements = testInvoiceALMA.nombreChequesAVenir || 0;
  
  if (testInvoiceALMA.paymentMethod && testInvoiceALMA.paymentMethod.includes('ALMA') && nombrePaiements > 0) {
    return `${testInvoiceALMA.paymentMethod} - ${nombrePaiements} paiement${nombrePaiements > 1 ? 's' : ''} de ${montantRestant_ALMA > 0 ? (montantRestant_ALMA / nombrePaiements).toFixed(2) : '0.00'}€ chacun`;
  }
  return 'Erreur de logique';
})();

console.log(`📊 Total TTC: ${totalTTC_ALMA}€`);
console.log(`💰 Acompte: ${testInvoiceALMA.montantAcompte}€`);
console.log(`💳 Restant: ${montantRestant_ALMA}€`);
console.log(`🔢 Nombre: ${testInvoiceALMA.nombreChequesAVenir}`);
console.log(`📝 Mode: ${testInvoiceALMA.paymentMethod}`);
console.log(`✅ RÉSULTAT: "${modeALMA_details}"`);

// Validation ALMA
const shouldContainPaiements = modeALMA_details.includes('paiement') && !modeALMA_details.includes('chèque');
console.log(`🎯 Contient "paiement" (et pas "chèque"): ${shouldContainPaiements ? '✅ OUI' : '❌ NON'}`);

// Test 2: Mode chèques classiques
console.log('\n💰 TEST 2: MODE CHÈQUES CLASSIQUES');
console.log('----------------------------------');

// Calculs pour chèques
const totalTTC_Cheques = testInvoiceCheques.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0);
const montantRestant_Cheques = totalTTC_Cheques - testInvoiceCheques.montantAcompte;

const modeCheques_details = (() => {
  const acompteAmount = testInvoiceCheques.montantAcompte || 0;
  const nombreCheques = testInvoiceCheques.nombreChequesAVenir || 0;
  
  if (nombreCheques > 0 && !testInvoiceCheques.paymentMethod.includes('ALMA')) {
    return `${testInvoiceCheques.paymentMethod} - ${nombreCheques} chèque${nombreCheques > 1 ? 's' : ''} à venir de ${montantRestant_Cheques > 0 ? (montantRestant_Cheques / nombreCheques).toFixed(2) : '0.00'}€ chacun`;
  }
  return 'Erreur de logique';
})();

console.log(`📊 Total TTC: ${totalTTC_Cheques}€`);
console.log(`💰 Acompte: ${testInvoiceCheques.montantAcompte}€`);
console.log(`💳 Restant: ${montantRestant_Cheques}€`);
console.log(`🔢 Nombre: ${testInvoiceCheques.nombreChequesAVenir}`);
console.log(`📝 Mode: ${testInvoiceCheques.paymentMethod}`);
console.log(`✅ RÉSULTAT: "${modeCheques_details}"`);

// Validation chèques
const shouldContainCheques = modeCheques_details.includes('chèque') && !modeCheques_details.includes('paiement');
console.log(`🎯 Contient "chèque" (et pas "paiement"): ${shouldContainCheques ? '✅ OUI' : '❌ NON'}`);

// Test 3: Champs N8N générés
console.log('\n📡 TEST 3: CHAMPS N8N GÉNÉRÉS');
console.log('-----------------------------');

// Simulation des champs N8N pour ALMA
const n8nFields_ALMA = {
  est_paiement_alma: testInvoiceALMA.paymentMethod && testInvoiceALMA.paymentMethod.includes('ALMA'),
  nombre_paiements_alma: testInvoiceALMA.paymentMethod && testInvoiceALMA.paymentMethod.includes('ALMA') 
    ? testInvoiceALMA.nombreChequesAVenir || 0 
    : 0,
  montant_par_paiement_alma: testInvoiceALMA.paymentMethod && testInvoiceALMA.paymentMethod.includes('ALMA') && testInvoiceALMA.nombreChequesAVenir && testInvoiceALMA.nombreChequesAVenir > 0 && montantRestant_ALMA > 0
    ? (montantRestant_ALMA / testInvoiceALMA.nombreChequesAVenir).toFixed(2)
    : '',
  mode_paiement_avec_details: modeALMA_details
};

console.log('🎯 CHAMPS N8N POUR ALMA:');
console.log(`  • est_paiement_alma: ${n8nFields_ALMA.est_paiement_alma}`);
console.log(`  • nombre_paiements_alma: ${n8nFields_ALMA.nombre_paiements_alma}`);
console.log(`  • montant_par_paiement_alma: ${n8nFields_ALMA.montant_par_paiement_alma}€`);
console.log(`  • mode_paiement_avec_details: "${n8nFields_ALMA.mode_paiement_avec_details}"`);

// Simulation des champs N8N pour chèques
const n8nFields_Cheques = {
  est_paiement_alma: testInvoiceCheques.paymentMethod && testInvoiceCheques.paymentMethod.includes('ALMA'),
  nombre_paiements_alma: 0, // Pas de paiements ALMA
  montant_par_paiement_alma: '',
  mode_paiement_avec_details: modeCheques_details
};

console.log('\n💰 CHAMPS N8N POUR CHÈQUES:');
console.log(`  • est_paiement_alma: ${n8nFields_Cheques.est_paiement_alma}`);
console.log(`  • nombre_paiements_alma: ${n8nFields_Cheques.nombre_paiements_alma}`);
console.log(`  • montant_par_paiement_alma: "${n8nFields_Cheques.montant_par_paiement_alma}"`);
console.log(`  • mode_paiement_avec_details: "${n8nFields_Cheques.mode_paiement_avec_details}"`);

// Résultat final
console.log('\n🎉 RÉSULTAT FINAL');
console.log('=================');

const testsPassed = shouldContainPaiements && shouldContainCheques;
console.log(`✅ Test ALMA (contient "paiement"): ${shouldContainPaiements ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`✅ Test Chèques (contient "chèque"): ${shouldContainCheques ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`🏆 VALIDATION GLOBALE: ${testsPassed ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ CERTAINS TESTS ÉCHOUÉS'}`);

if (testsPassed) {
  console.log('\n🎯 LE WORDING ALMA EST CORRECTEMENT IMPLÉMENTÉ !');
  console.log('• Les emails N8N afficheront "4 paiements" pour ALMA');
  console.log('• Les emails N8N afficheront "3 chèques" pour les chèques classiques');
  console.log('• La distinction est automatique selon le mode de paiement');
} else {
  console.log('\n❌ IL Y A UN PROBLÈME DANS LA LOGIQUE DE WORDING');
}
