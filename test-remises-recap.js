// Test pour vérifier le calcul des remises dans le récapitulatif

// Simulation d'un produit avec 100% de remise
const produit = {
  id: 'test-1',
  designation: 'Pack Thalasso x2',
  qty: 2,
  priceTTC: 50, // 50€ × 2 = 100€ de base
  discount: 100, // 100% de remise
  discountType: 'percent'
};

// Fonction calculateProductTotal (copie de src/utils/calculations.ts)
function calculateProductTotal(quantity, priceTTC, discount, discountType) {
  let productTotal = priceTTC * quantity;

  if (discount > 0) {
    if (discountType === 'percent') {
      productTotal -= productTotal * (discount / 100);
    } else {
      productTotal -= discount * quantity;
    }
  }

  return Math.max(0, productTotal);
}

// Test 1: Calcul du total après remise
const totalAvecRemise = calculateProductTotal(
  produit.qty,
  produit.priceTTC,
  produit.discount,
  produit.discountType
);

console.log('🧾 Test Remises dans Récapitulatif');
console.log('=====================================');
console.log('📦 Produit:', produit.designation);
console.log('💰 Prix unitaire TTC:', produit.priceTTC + '€');
console.log('🔢 Quantité:', produit.qty);
console.log('💸 Remise:', produit.discount + (produit.discountType === 'percent' ? '%' : '€'));
console.log('');

console.log('📊 Calculs:');
console.log('- Total avant remise:', (produit.priceTTC * produit.qty) + '€');
console.log('- Total après remise:', totalAvecRemise + '€');
console.log('- Montant de la remise:', (produit.priceTTC * produit.qty - totalAvecRemise) + '€');
console.log('');

// Test 2: Simulation du calcul montantRemise dans StepRecap
const montantRemise = (() => {
  const originalTotal = produit.priceTTC * produit.qty;
  const discountedTotal = calculateProductTotal(
    produit.qty,
    produit.priceTTC,
    produit.discount,
    produit.discountType
  );
  return originalTotal - discountedTotal;
})();

console.log('✅ Résultats attendus dans StepRecap:');
console.log('- Sous-total avant remises:', (produit.priceTTC * produit.qty) + '€');
console.log('- Total des remises: -' + montantRemise + '€');
console.log('- Total TTC:', totalAvecRemise + '€');
console.log('');

// Vérification
if (montantRemise === 100 && totalAvecRemise === 0) {
  console.log('✅ SUCCESS: Les remises sont correctement calculées !');
  console.log('   - Remise de 100% sur 100€ = 100€ de remise');
  console.log('   - Total final = 0€');
} else {
  console.log('❌ ERROR: Problème dans le calcul des remises');
  console.log('   - Attendu: remise=100€, total=0€');
  console.log('   - Obtenu: remise=' + montantRemise + '€, total=' + totalAvecRemise + '€');
}
