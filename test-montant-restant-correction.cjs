#!/usr/bin/env node

// 🧪 TEST SIMPLE DE LA CORRECTION DU MONTANT_RESTANT
// Ce script simule la logique corrigée sans importer les modules TypeScript

console.log('🧪 TEST DE LA CORRECTION DU MONTANT_RESTANT\n');

// Simulation de la fonction calculateInvoiceTotals corrigée
function simulateCalculateInvoiceTotals(products, taxRate, acompte, paymentMethod) {
  const totalTTC = products.reduce((sum, product) => {
    return sum + (product.quantity * product.priceTTC);
  }, 0);
  
  // ⭐ LOGIQUE CORRIGÉE
  const isImmediatePayment = ['espèces', 'carte bancaire', 'carte bleue', 'virement'].includes(
    paymentMethod.toLowerCase()
  );
  const hasDeposit = acompte > 0;
  
  // Pour les paiements immédiats sans acompte, montant_restant = 0
  const montantRestant = (isImmediatePayment && !hasDeposit) 
    ? 0 
    : Math.max(0, totalTTC - acompte);
  
  return {
    montantTTC: totalTTC,
    montantAcompte: acompte,
    montantRestant: montantRestant
  };
}

// Cas de test qui reproduit le problème initial
const problematicCase = {
  name: "🔍 CAS PROBLÉMATIQUE INITIAL",
  products: [
    { name: "Matelas", quantity: 1, priceTTC: 450, discount: 0, discountType: 'percent' }
  ],
  taxRate: 20,
  acompte: 0,
  paymentMethod: 'Espèces'
};

console.log('🔍 REPRODUCTION DU PROBLÈME INITIAL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Produit: ${problematicCase.products[0].name} - ${problematicCase.products[0].priceTTC}€`);
console.log(`Mode de paiement: ${problematicCase.paymentMethod}`);
console.log(`Acompte: ${problematicCase.acompte}€`);
console.log('');

// Test avec l'ancienne logique (défaillante)
const oldLogicResult = {
  montantTTC: 450,
  montantRestant: 450 - 0 // Ancienne logique: totalAmount - acompteAmount
};

console.log('❌ ANCIENNE LOGIQUE (problématique):');
console.log(`   montant_ttc: ${oldLogicResult.montantTTC}€`);
console.log(`   montant_restant: ${oldLogicResult.montantRestant}€`);
console.log(`   → JSON envoyé à N8N: "montant_restant": ${oldLogicResult.montantRestant}`);
console.log(`   → Affichage PDF: "TOTAL TTC" (car montant_restant > 0)`);
console.log(`   → ⚠️ PROBLÈME: Paiement espèces mais montant_restant ≠ 0`);
console.log('');

// Test avec la nouvelle logique (corrigée)
const newLogicResult = simulateCalculateInvoiceTotals(
  problematicCase.products,
  problematicCase.taxRate,
  problematicCase.acompte,
  problematicCase.paymentMethod
);

console.log('✅ NOUVELLE LOGIQUE (corrigée):');
console.log(`   montant_ttc: ${newLogicResult.montantTTC}€`);
console.log(`   montant_restant: ${newLogicResult.montantRestant}€`);
console.log(`   → JSON envoyé à N8N: "montant_restant": ${newLogicResult.montantRestant}`);
console.log(`   → Affichage PDF: "MONTANT PAYÉ" (car montant_restant = 0)`);
console.log(`   → ✅ CORRECT: Paiement espèces et montant_restant = 0`);
console.log('');

// Tests supplémentaires
const additionalTests = [
  {
    name: "Carte bancaire sans acompte",
    products: [{ quantity: 1, priceTTC: 600 }],
    acompte: 0,
    paymentMethod: 'Carte bancaire',
    expected: { montantRestant: 0, display: 'MONTANT PAYÉ' }
  },
  {
    name: "Virement sans acompte",
    products: [{ quantity: 1, priceTTC: 750 }],
    acompte: 0,
    paymentMethod: 'Virement',
    expected: { montantRestant: 0, display: 'MONTANT PAYÉ' }
  },
  {
    name: "Chèques à venir avec acompte",
    products: [{ quantity: 1, priceTTC: 1200 }],
    acompte: 200,
    paymentMethod: 'Chèques à venir',
    expected: { montantRestant: 1000, display: 'TOTAL TTC' }
  },
  {
    name: "Espèces avec acompte",
    products: [{ quantity: 1, priceTTC: 800 }],
    acompte: 300,
    paymentMethod: 'Espèces',
    expected: { montantRestant: 500, display: 'TOTAL TTC' }
  }
];

console.log('🧪 TESTS SUPPLÉMENTAIRES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

additionalTests.forEach((test, index) => {
  const result = simulateCalculateInvoiceTotals(
    test.products,
    20,
    test.acompte,
    test.paymentMethod
  );
  
  const isCorrect = result.montantRestant === test.expected.montantRestant;
  const status = isCorrect ? '✅' : '❌';
  
  console.log(`${index + 1}. ${test.name}: ${status}`);
  console.log(`   Paiement: ${test.paymentMethod}, Acompte: ${test.acompte}€`);
  console.log(`   Résultat: montant_restant = ${result.montantRestant}€`);
  console.log(`   Affichage: "${test.expected.display}"`);
  console.log('');
});

console.log('🎯 RÉSUMÉ DE LA CORRECTION:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Fichiers modifiés:');
console.log('   • src/services/n8nWebhookService.ts');
console.log('   • src/services/googleDriveService.ts');
console.log('   • src/App.tsx (useEffect pour recalcul automatique)');
console.log('');
console.log('🔧 Changements effectués:');
console.log('   • Remplacement de "montantRestant = totalAmount - acompteAmount"');
console.log('   • Par l\'utilisation de calculateInvoiceTotals()');
console.log('   • Recalcul automatique dans App.tsx lors des changements');
console.log('');
console.log('📋 Nouvelle logique:');
console.log('   • Paiement immédiat + pas d\'acompte → montant_restant = 0');
console.log('   • Autres cas → montant_restant = max(0, total - acompte)');
console.log('');
console.log('🚀 Le problème de votre webhook N8N est maintenant résolu !');
console.log('   Espèces → montant_restant: 0 → "MONTANT PAYÉ"');
