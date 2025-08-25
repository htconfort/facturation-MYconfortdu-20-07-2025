// Test des totaux dans l'export du store
console.log('🧮 Test des calculs de totaux dans l\'export du store');

// Simulation d'un produit avec remise
const produitTest = {
  qty: 2,
  priceTTC: 1000, // 1000€ TTC l'unité
  discount: 10, // 10% de remise
  discountType: 'percent'
};

// Fonction calculateProductTotal simulée
function calculateProductTotal(qty, priceTTC, discount = 0, discountType = 'percent') {
  const total = qty * priceTTC;
  if (discountType === 'percent') {
    return total * (1 - discount / 100);
  } else {
    return total - discount;
  }
}

const totalTTCWithDiscount = calculateProductTotal(
  produitTest.qty,
  produitTest.priceTTC,
  produitTest.discount,
  produitTest.discountType
);

console.log('📦 Produit test:');
console.log(`- Quantité: ${produitTest.qty}`);
console.log(`- Prix unitaire TTC: ${produitTest.priceTTC}€`);
console.log(`- Remise: ${produitTest.discount}${produitTest.discountType === 'percent' ? '%' : '€'}`);
console.log(`- Total TTC avec remise: ${totalTTCWithDiscount.toFixed(2)}€`);

const montantHT = totalTTCWithDiscount / 1.2;
const montantTVA = totalTTCWithDiscount - montantHT;

console.log('\n💰 Totaux calculés:');
console.log(`- Montant HT: ${montantHT.toFixed(2)}€`);
console.log(`- Montant TVA (20%): ${montantTVA.toFixed(2)}€`);
console.log(`- Montant TTC: ${totalTTCWithDiscount.toFixed(2)}€`);

// Test mode de règlement détaillé
function testPaymentMethod() {
  const tests = [
    {
      method: 'Chèque à venir',
      depositAmount: 500,
      nombreChequesAVenir: 3,
      totalTTC: 1800,
      expected: 'Chèque à venir (3 chèques de 433€ + acompte 500.00€)'
    },
    {
      method: 'Alma 3x',
      depositAmount: 200,
      nombreFoisAlma: 3,
      totalTTC: 1800,
      expected: 'Alma 3x (3 fois de 533€ + acompte 200.00€)'
    },
    {
      method: 'Carte Bleue',
      depositAmount: 300,
      totalTTC: 1800,
      expected: 'Carte Bleue (acompte 300.00€)'
    }
  ];
  
  console.log('\n💳 Test des modes de règlement détaillés:');
  
  tests.forEach((test, index) => {
    let result;
    const { method, depositAmount, nombreChequesAVenir, nombreFoisAlma, totalTTC } = test;
    
    if (method === 'Chèque à venir' && nombreChequesAVenir > 0) {
      const montantParCheque = Math.round((totalTTC - depositAmount) / nombreChequesAVenir);
      result = `Chèque à venir (${nombreChequesAVenir} chèques de ${montantParCheque}€ + acompte ${depositAmount.toFixed(2)}€)`;
    } else if (method?.startsWith('Alma') && nombreFoisAlma) {
      const montantParFois = Math.round((totalTTC - depositAmount) / nombreFoisAlma);
      result = `${method} (${nombreFoisAlma} fois de ${montantParFois}€ + acompte ${depositAmount.toFixed(2)}€)`;
    } else if (depositAmount > 0) {
      result = `${method} (acompte ${depositAmount.toFixed(2)}€)`;
    } else {
      result = method;
    }
    
    console.log(`${index + 1}. ${test.method}:`);
    console.log(`   Résultat: "${result}"`);
    console.log(`   Attendu:  "${test.expected}"`);
    console.log(`   ✅ ${result === test.expected ? 'CORRECT' : 'ERREUR'}`);
    console.log('');
  });
}

testPaymentMethod();

console.log('✅ Test terminé !');
