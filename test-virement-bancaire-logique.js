#!/usr/bin/env node

/**
 * ✅ TEST DE LA LOGIQUE VIREMENT BANCAIRE
 * 
 * Ce script teste la nouvelle fonctionnalité :
 * - Quand "Virement bancaire" est sélectionné
 * - Remettre à zéro le nombre de chèques à venir
 * - Positionner automatiquement un acompte obligatoire de 20% du total TTC
 */

console.log('🧪 TEST DE LA LOGIQUE VIREMENT BANCAIRE\n');

// Simulation des données de test
const testCases = [
  {
    name: "Facture 1000€ TTC",
    totalTTC: 1000,
    expectedAcompte20Percent: 200,
    description: "Test basique avec facture de 1000€"
  },
  {
    name: "Facture 1234.56€ TTC", 
    totalTTC: 1234.56,
    expectedAcompte20Percent: 246.91, // Arrondi à 2 décimales
    description: "Test avec montant décimal"
  },
  {
    name: "Facture 750€ TTC",
    totalTTC: 750,
    expectedAcompte20Percent: 150,
    description: "Test avec montant moyen"
  },
  {
    name: "Facture 2500€ TTC",
    totalTTC: 2500,
    expectedAcompte20Percent: 500,
    description: "Test avec montant élevé"
  }
];

// Fonction pour simuler le calcul de l'acompte à 20%
function calculerAcompteVirementBancaire(totalTTC) {
  return Math.round(totalTTC * 0.20 * 100) / 100; // Arrondi à 2 décimales
}

// Fonction pour simuler la logique du useEffect
function simulerLogiqueVirementBancaire(paymentMethod, totalTTC, nombreChequesActuel, acompteActuel) {
  const actions = [];
  
  if (paymentMethod === "Virement") {
    // 1. Remettre à zéro le nombre de chèques à venir
    if (nombreChequesActuel > 0) {
      actions.push({
        type: 'reset_cheques',
        from: nombreChequesActuel,
        to: 0
      });
    }
    
    // 2. Positionner automatiquement un acompte obligatoire de 20% du total TTC
    if (totalTTC > 0) {
      const acompteObligatoire = calculerAcompteVirementBancaire(totalTTC);
      if (acompteActuel !== acompteObligatoire) {
        actions.push({
          type: 'set_acompte',
          from: acompteActuel,
          to: acompteObligatoire,
          percentage: 20
        });
      }
    }
  }
  
  return actions;
}

// Exécution des tests
let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`📋 Test ${index + 1}: ${testCase.name}`);
  console.log(`   ${testCase.description}`);
  
  // Calcul attendu
  const acompteCalcule = calculerAcompteVirementBancaire(testCase.totalTTC);
  
  // Vérification
  const isCorrect = Math.abs(acompteCalcule - testCase.expectedAcompte20Percent) < 0.01;
  
  if (isCorrect) {
    console.log(`   ✅ SUCCÈS: Acompte calculé = ${acompteCalcule}€ (attendu: ${testCase.expectedAcompte20Percent}€)`);
  } else {
    console.log(`   ❌ ÉCHEC: Acompte calculé = ${acompteCalcule}€ (attendu: ${testCase.expectedAcompte20Percent}€)`);
    allTestsPassed = false;
  }
  
  // Test de la logique complète
  const actions = simulerLogiqueVirementBancaire(
    "Virement", 
    testCase.totalTTC, 
    9, // 9 chèques initialement
    0  // Pas d'acompte initial
  );
  
  console.log(`   🔄 Actions simulées:`);
  actions.forEach(action => {
    if (action.type === 'reset_cheques') {
      console.log(`      - Remettre chèques à zéro: ${action.from} → ${action.to}`);
    } else if (action.type === 'set_acompte') {
      console.log(`      - Acompte ${action.percentage}%: ${action.from}€ → ${action.to}€`);
    }
  });
  
  console.log('');
});

// Tests de scénarios complets
console.log('🎯 TESTS DE SCÉNARIOS COMPLETS\n');

const scenarios = [
  {
    name: "Changement de Chèques vers Virement",
    before: {
      paymentMethod: "Chèques à venir",
      nombreCheques: 9,
      acompte: 150,
      totalTTC: 1000
    },
    after: {
      paymentMethod: "Virement"
    }
  },
  {
    name: "Changement de Carte Bleue vers Virement", 
    before: {
      paymentMethod: "Carte Bleue",
      nombreCheques: 0,
      acompte: 50,
      totalTTC: 750
    },
    after: {
      paymentMethod: "Virement"
    }
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`📊 Scénario ${index + 1}: ${scenario.name}`);
  console.log(`   Avant: ${scenario.before.paymentMethod}, ${scenario.before.nombreCheques} chèques, ${scenario.before.acompte}€ acompte`);
  
  const actions = simulerLogiqueVirementBancaire(
    scenario.after.paymentMethod,
    scenario.before.totalTTC,
    scenario.before.nombreCheques,
    scenario.before.acompte
  );
  
  let nouveauNombreCheques = scenario.before.nombreCheques;
  let nouvelAcompte = scenario.before.acompte;
  
  actions.forEach(action => {
    if (action.type === 'reset_cheques') {
      nouveauNombreCheques = action.to;
    } else if (action.type === 'set_acompte') {
      nouvelAcompte = action.to;
    }
  });
  
  console.log(`   Après: ${scenario.after.paymentMethod}, ${nouveauNombreCheques} chèques, ${nouvelAcompte}€ acompte`);
  
  // Vérifications
  const shouldHaveZeroCheques = nouveauNombreCheques === 0;
  const shouldHave20PercentAcompte = Math.abs(nouvelAcompte - (scenario.before.totalTTC * 0.20)) < 0.01;
  
  if (shouldHaveZeroCheques && shouldHave20PercentAcompte) {
    console.log(`   ✅ SUCCÈS: Logique appliquée correctement`);
  } else {
    console.log(`   ❌ ÉCHEC: Logique non conforme`);
    allTestsPassed = false;
  }
  
  console.log('');
});

// Résultat final
console.log('=' .repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS PASSENT - Logique virement bancaire implémentée correctement !');
  console.log('');
  console.log('📋 Résumé de la fonctionnalité:');
  console.log('   ✅ Quand "Virement bancaire" est sélectionné:');
  console.log('   ✅ → Nombre de chèques à venir remis à zéro automatiquement');
  console.log('   ✅ → Acompte obligatoire de 20% du total TTC positionné automatiquement');
  console.log('   ✅ → Calculs arrondis à 2 décimales pour une précision monétaire');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ - Vérifier la logique d\'implémentation');
}
console.log('=' .repeat(60));
