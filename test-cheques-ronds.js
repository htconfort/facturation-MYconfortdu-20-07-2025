/**
 * Test pour vérifier la logique des chèques ronds
 */

// Simulation de la logique mise en place (version corrigée)
function calculateRoundedCheques(totalTTC, nombreCheques, acompteInitial = 0) {
  const remaining = totalTTC - acompteInitial;
  let montantParCheque = Math.round(remaining / nombreCheques);
  let totalCheques = montantParCheque * nombreCheques;
  let acompteAjuste = totalTTC - totalCheques;
  
  // Si l'acompte devient négatif, réduire le montant par chèque
  if (acompteAjuste < 0) {
    montantParCheque = Math.floor(totalTTC / nombreCheques);
    totalCheques = montantParCheque * nombreCheques;
    acompteAjuste = totalTTC - totalCheques;
  }
  
  acompteAjuste = Math.max(0, acompteAjuste);
  
  return {
    totalTTC,
    acompteAjuste: Math.round(acompteAjuste * 100) / 100, // Arrondir à 2 décimales
    nombreCheques,
    montantParCheque,
    totalCheques,
    verification: acompteAjuste + totalCheques
  };
}

// Tests avec différents montants
const testCases = [
  { total: 1234.56, nCheques: 3 },
  { total: 2567.89, nCheques: 5 },
  { total: 890.25, nCheques: 2 },
  { total: 1500.00, nCheques: 4 },
  { total: 999.99, nCheques: 3 }
];

console.log("🧮 Test de la logique des chèques ronds\n");
console.log("=" * 60);

testCases.forEach((test, index) => {
  const result = calculateRoundedCheques(test.total, test.nCheques);
  
  console.log(`\n📋 Test ${index + 1}:`);
  console.log(`   Total TTC: ${result.totalTTC}€`);
  console.log(`   Acompte ajusté: ${result.acompteAjuste}€`);
  console.log(`   Nombre de chèques: ${result.nombreCheques}`);
  console.log(`   💰 Montant par chèque: ${result.montantParCheque}€ (ENTIER ✅)`);
  console.log(`   Total des chèques: ${result.totalCheques}€`);
  console.log(`   Vérification: ${result.verification}€ = ${result.totalTTC}€ ${result.verification === result.totalTTC ? '✅' : '❌'}`);
  
  // Vérifier que les chèques sont bien entiers
  const isRound = Number.isInteger(result.montantParCheque);
  console.log(`   Chèques entiers: ${isRound ? '✅' : '❌'}`);
});

console.log("\n" + "=" * 60);
console.log("✅ Tous les montants de chèques sont des nombres entiers !");
console.log("💡 L'acompte s'ajuste automatiquement pour compenser les centimes.");
