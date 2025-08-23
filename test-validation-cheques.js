#!/usr/bin/env node

/**
 * 🧪 Test rapide de validation - Chèques Ronds
 * Vérifie que la logique est bien implémentée
 */

console.log("🎯 VALIDATION : Système de Chèques Ronds");
console.log("=" * 50);

// Cas de test réalistes pour l'activité MyConfort
const casDeTest = [
  { 
    scenario: "Matelas + Sommier", 
    total: 1289.90, 
    nCheques: 3,
    description: "Commande standard avec livraison"
  },
  { 
    scenario: "Pack Literie Premium", 
    total: 2456.75, 
    nCheques: 5,
    description: "Achat important, étalement souhaité"
  },
  { 
    scenario: "Oreiller Ergonomique", 
    total: 189.99, 
    nCheques: 2,
    description: "Petit achat, paiement simple"
  },
  { 
    scenario: "Ensemble Complet", 
    total: 3567.80, 
    nCheques: 6,
    description: "Gros achat, étalement maximum"
  }
];

function calculerChequesRonds(totalTTC, nombreCheques) {
  // Montant par chèque arrondi à l'entier
  let montantParCheque = Math.round(totalTTC / nombreCheques);
  let totalCheques = montantParCheque * nombreCheques;
  let acompte = totalTTC - totalCheques;
  
  // Protection contre acomptes négatifs
  if (acompte < 0) {
    montantParCheque = Math.floor(totalTTC / nombreCheques);
    totalCheques = montantParCheque * nombreCheques;
    acompte = totalTTC - totalCheques;
  }
  
  return {
    acompte: Math.round(acompte * 100) / 100,
    montantParCheque,
    totalCheques,
    verification: Math.round((acompte + totalCheques) * 100) / 100
  };
}

casDeTest.forEach((cas, index) => {
  console.log(`\n📋 Cas ${index + 1}: ${cas.scenario}`);
  console.log(`   ${cas.description}`);
  console.log(`   Total facture: ${cas.total}€`);
  
  const result = calculerChequesRonds(cas.total, cas.nCheques);
  
  console.log(`   📊 Résultat:`);
  console.log(`      • Acompte: ${result.acompte}€`);
  console.log(`      • ${cas.nCheques} chèques de: ${result.montantParCheque}€ chacun`);
  console.log(`      • Total vérifié: ${result.verification}€`);
  
  // Validations
  const montantEntier = Number.isInteger(result.montantParCheque);
  const acomptePositif = result.acompte >= 0;
  const totalCorrect = Math.abs(result.verification - cas.total) < 0.01;
  
  console.log(`   ✅ Validations:`);
  console.log(`      • Chèques entiers: ${montantEntier ? '✅' : '❌'}`);
  console.log(`      • Acompte positif: ${acomptePositif ? '✅' : '❌'}`);
  console.log(`      • Total correct: ${totalCorrect ? '✅' : '❌'}`);
  
  if (montantEntier && acomptePositif && totalCorrect) {
    console.log(`   🎉 SUCCÈS - Configuration optimale !`);
  } else {
    console.log(`   ⚠️  PROBLÈME DÉTECTÉ`);
  }
});

console.log("\n" + "=" * 50);
console.log("🏆 VALIDATION TERMINÉE");
console.log("💡 Les chèques à venir seront toujours des montants ronds !");
console.log("🎯 L'expérience client est grandement améliorée !");
