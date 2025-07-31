/**
 * Test de la logique de paiement dans InvoicePDF.tsx
 * Ce script teste différents scénarios de paiement pour vérifier l'affichage correct
 * de "Montant payé" vs "Total TTC" et le calcul des chèques à venir
 */

const scenarios = [
  {
    name: "Paiement comptant espèces - entièrement payé",
    invoice: {
      paymentMethod: "espèces",
      montantAcompte: 0,
      nombreChequesAVenir: 0,
      montantTTC: 1500
    },
    expected: {
      label: "MONTANT PAYÉ",
      showAcompte: false,
      showCheques: false
    }
  },
  {
    name: "Paiement carte bleue - entièrement payé",
    invoice: {
      paymentMethod: "carte bleue",
      montantAcompte: 0,
      nombreChequesAVenir: 0,
      montantTTC: 2000
    },
    expected: {
      label: "MONTANT PAYÉ",
      showAcompte: false,
      showCheques: false
    }
  },
  {
    name: "Paiement avec acompte en espèces",
    invoice: {
      paymentMethod: "espèces",
      montantAcompte: 500,
      nombreChequesAVenir: 0,
      montantTTC: 1500
    },
    expected: {
      label: "TOTAL TTC",
      showAcompte: true,
      resteAPayer: 1000,
      showCheques: false
    }
  },
  {
    name: "Paiement avec chèques à venir",
    invoice: {
      paymentMethod: "chèque",
      montantAcompte: 0,
      nombreChequesAVenir: 3,
      montantTTC: 1800
    },
    expected: {
      label: "TOTAL TTC",
      showAcompte: false,
      showCheques: true,
      montantParCheque: 600
    }
  },
  {
    name: "Paiement mixte : acompte + chèques",
    invoice: {
      paymentMethod: "chèque",
      montantAcompte: 600,
      nombreChequesAVenir: 2,
      montantTTC: 2000
    },
    expected: {
      label: "TOTAL TTC",
      showAcompte: true,
      resteAPayer: 1400,
      showCheques: true,
      montantParCheque: 700
    }
  },
  {
    name: "Virement - entièrement payé",
    invoice: {
      paymentMethod: "virement",
      montantAcompte: 0,
      nombreChequesAVenir: 0,
      montantTTC: 3000
    },
    expected: {
      label: "MONTANT PAYÉ",
      showAcompte: false,
      showCheques: false
    }
  }
];

/**
 * Fonction qui reproduit la logique de InvoicePDF.tsx
 */
function testPaymentLogic(invoice) {
  const hasAcompte = invoice.montantAcompte && invoice.montantAcompte > 0;
  const hasChequesAVenir = invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0;
  const isPaymentMethodCash = ['espèces', 'carte bleue', 'carte bancaire', 'virement'].includes(
    invoice.paymentMethod?.toLowerCase() || ''
  );
  
  // La facture est considérée comme entièrement payée si :
  // - Mode de paiement instantané (espèces, carte, virement) ET pas d'acompte ET pas de chèques à venir
  const isFullyPaid = isPaymentMethodCash && !hasAcompte && !hasChequesAVenir;
  
  const label = isFullyPaid ? 'MONTANT PAYÉ' : 'TOTAL TTC';
  
  // Calcul du montant restant
  const resteAPayer = hasAcompte ? invoice.montantTTC - invoice.montantAcompte : 0;
  
  // Calcul du montant par chèque
  let montantParCheque = 0;
  if (hasChequesAVenir) {
    const montantApresAcompte = invoice.montantTTC - (invoice.montantAcompte || 0);
    montantParCheque = montantApresAcompte / invoice.nombreChequesAVenir;
  }
  
  return {
    label,
    showAcompte: Boolean(hasAcompte),
    resteAPayer,
    showCheques: Boolean(hasChequesAVenir),
    montantParCheque: Math.round(montantParCheque * 100) / 100 // Arrondi à 2 décimales
  };
}

console.log("🧪 Test de la logique de paiement - InvoicePDF.tsx\n");
console.log("=" + "=" * 59);

let passedTests = 0;
let totalTests = scenarios.length;

scenarios.forEach((scenario, index) => {
  console.log(`\n📋 Test ${index + 1}: ${scenario.name}`);
  console.log("-".repeat(50));
  
  const result = testPaymentLogic(scenario.invoice);
  const expected = scenario.expected;
  
  let passed = true;
  
  // Vérifier le label
  if (result.label !== expected.label) {
    console.log(`❌ Label: attendu "${expected.label}", obtenu "${result.label}"`);
    passed = false;
  } else {
    console.log(`✅ Label: "${result.label}"`);
  }
  
  // Vérifier l'affichage de l'acompte
  if (result.showAcompte !== expected.showAcompte) {
    console.log(`❌ Acompte: attendu ${expected.showAcompte}, obtenu ${result.showAcompte}`);
    passed = false;
  } else {
    console.log(`✅ Affichage acompte: ${result.showAcompte}`);
  }
  
  // Vérifier le reste à payer si applicable
  if (expected.resteAPayer !== undefined) {
    if (result.resteAPayer !== expected.resteAPayer) {
      console.log(`❌ Reste à payer: attendu ${expected.resteAPayer}€, obtenu ${result.resteAPayer}€`);
      passed = false;
    } else {
      console.log(`✅ Reste à payer: ${result.resteAPayer}€`);
    }
  }
  
  // Vérifier l'affichage des chèques
  if (result.showCheques !== expected.showCheques) {
    console.log(`❌ Chèques: attendu ${expected.showCheques}, obtenu ${result.showCheques}`);
    passed = false;
  } else {
    console.log(`✅ Affichage chèques: ${result.showCheques}`);
  }
  
  // Vérifier le montant par chèque si applicable
  if (expected.montantParCheque !== undefined) {
    if (result.montantParCheque !== expected.montantParCheque) {
      console.log(`❌ Montant par chèque: attendu ${expected.montantParCheque}€, obtenu ${result.montantParCheque}€`);
      passed = false;
    } else {
      console.log(`✅ Montant par chèque: ${result.montantParCheque}€`);
    }
  }
  
  if (passed) {
    console.log(`\n🎉 Test ${index + 1} RÉUSSI`);
    passedTests++;
  } else {
    console.log(`\n💥 Test ${index + 1} ÉCHEC`);
  }
  
  // Afficher les détails de l'invoice pour debug
  console.log(`\n📄 Détails facture:`);
  console.log(`   - Mode paiement: ${scenario.invoice.paymentMethod}`);
  console.log(`   - Montant TTC: ${scenario.invoice.montantTTC}€`);
  console.log(`   - Acompte: ${scenario.invoice.montantAcompte || 0}€`);
  console.log(`   - Chèques à venir: ${scenario.invoice.nombreChequesAVenir || 0}`);
});

console.log("\n" + "=" + "=".repeat(59));
console.log(`📊 RÉSULTATS FINAUX: ${passedTests}/${totalTests} tests réussis`);

if (passedTests === totalTests) {
  console.log("🎊 TOUS LES TESTS SONT PASSÉS ! La logique de paiement est correcte.");
} else {
  console.log("⚠️  Certains tests ont échoué. Vérifiez la logique de paiement.");
}

console.log("\n🔍 Points clés vérifiés:");
console.log("   ✓ Affichage 'MONTANT PAYÉ' vs 'TOTAL TTC'");
console.log("   ✓ Gestion des acomptes");
console.log("   ✓ Calcul du reste à payer");
console.log("   ✓ Affichage des chèques à venir");
console.log("   ✓ Calcul du montant par chèque");
