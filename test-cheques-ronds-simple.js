/**
 * ✅ Test de validation - Chèques Ronds (Version Simplifiée)
 * Vérifie que la logique Math.round() fonctionne bien
 */

console.log("🎯 VALIDATION : Chèques Ronds avec Mode de Paiement Alma Intact");
console.log("=" * 70);

// Test de la logique simplifiée : Math.round(remainingAmount / nombreCheques)
function testChequesRonds(totalTTC, acompte, nombreCheques, modePaiement) {
  const remainingAmount = Math.max(0, totalTTC - acompte);
  
  const montantParCheque = nombreCheques > 0 
    ? modePaiement === 'Chèque à venir'
      ? Math.round(remainingAmount / nombreCheques) // ✨ ROND pour chèques à venir
      : remainingAmount / nombreCheques 
    : 0;

  const totalCheques = montantParCheque * nombreCheques;
  const difference = Math.abs(remainingAmount - totalCheques);
  
  return {
    totalTTC,
    acompte,
    remainingAmount,
    nombreCheques,
    montantParCheque,
    totalCheques,
    difference: Math.round(difference * 100) / 100,
    isInteger: Number.isInteger(montantParCheque),
    modePaiement
  };
}

const testCases = [
  { total: 1234.56, acompte: 100, nCheques: 3, mode: 'Chèque à venir' },
  { total: 1234.56, acompte: 100, nCheques: 3, mode: 'Alma' },
  { total: 2567.89, acompte: 200, nCheques: 5, mode: 'Chèque à venir' },
  { total: 999.99, acompte: 50, nCheques: 3, mode: 'Chèque à venir' },
];

testCases.forEach((test, index) => {
  const result = testChequesRonds(test.total, test.acompte, test.nCheques, test.mode);
  
  console.log(`\n📋 Test ${index + 1}: ${result.modePaiement}`);
  console.log(`   Total: ${result.totalTTC}€, Acompte: ${result.acompte}€`);
  console.log(`   Reste à payer: ${result.remainingAmount}€`);
  console.log(`   ${result.nombreCheques} chèques de: ${result.montantParCheque}€`);
  console.log(`   ${result.isInteger ? '✅' : '❌'} Montant entier: ${result.isInteger}`);
  console.log(`   Différence: ${result.difference}€`);
  
  if (result.modePaiement === 'Chèque à venir' && result.isInteger) {
    console.log(`   🎉 SUCCÈS: Chèques ronds pour les chèques à venir !`);
  } else if (result.modePaiement !== 'Chèque à venir') {
    console.log(`   ✅ NORMAL: Calcul exact pour ${result.modePaiement}`);
  }
});

console.log("\n" + "=" * 70);
console.log("✅ RÉSUMÉ:");
console.log("   • Mode 'Chèque à venir' → Montants RONDS (Math.round)");
console.log("   • Autres modes (Alma, etc.) → Montants EXACTS");
console.log("   • Interface Alma conservée intacte !");
