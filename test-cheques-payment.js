// Test pour vérifier que les chèques à venir sont correctement sauvegardés et formatés

console.log('🧪 Test des chèques à venir');

// Simulation des données comme dans le store
const mockPaiement = {
  method: 'Chèque à venir',
  depositAmount: 500,
  nombreChequesAVenir: 3,
  note: '3 chèques de 433€ chacun'
};

const mockProduits = [
  { qty: 1, priceTTC: 1800, discount: 0, discountType: 'percent' }
];

// Simulation de la fonction calculateProductTotal
const calculateProductTotal = (qty, priceTTC, discount, discountType) => {
  const subtotal = qty * priceTTC;
  if (discountType === 'percent') {
    return subtotal * (1 - discount / 100);
  } else {
    return subtotal - discount;
  }
};

// Test de la logique de formatage du paymentMethod (copié du store)
const method = mockPaiement.method;
const depositAmount = mockPaiement.depositAmount || 0;
const nombreCheques = mockPaiement.nombreChequesAVenir || 0;
const totalTTC = mockProduits.reduce((sum, p) => {
  const totalTTCWithDiscount = calculateProductTotal(
    p.qty,
    p.priceTTC,
    p.discount || 0,
    p.discountType || 'percent'
  );
  return sum + totalTTCWithDiscount;
}, 0);

let formattedPaymentMethod = method;

if (method === 'Chèque à venir' && nombreCheques > 0) {
  const montantParCheque = Math.round(
    (totalTTC - depositAmount) / nombreCheques
  );
  formattedPaymentMethod = `Chèque à venir (${nombreCheques} chèques de ${montantParCheque}€ + acompte ${depositAmount.toFixed(2)}€)`;
}

console.log('✅ Données d\'entrée:');
console.log('   - Total TTC:', totalTTC + '€');
console.log('   - Acompte:', depositAmount + '€');
console.log('   - Nombre de chèques:', nombreCheques);
console.log('   - Méthode brute:', method);

console.log('\n📄 PaymentMethod formaté pour le PDF:');
console.log('   "' + formattedPaymentMethod + '"');

console.log('\n🎯 Résultat attendu dans le PDF:');
console.log('   "Chèque à venir (3 chèques de 433€ + acompte 500.00€)"');

const isCorrect = formattedPaymentMethod === 'Chèque à venir (3 chèques de 433€ + acompte 500.00€)';
console.log('\n' + (isCorrect ? '✅ SUCCÈS' : '❌ ÉCHEC') + ' - Le formatage est ' + (isCorrect ? 'correct' : 'incorrect'));
