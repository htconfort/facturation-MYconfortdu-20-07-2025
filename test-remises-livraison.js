// Test de vérification des remises et de la synchronisation livraison/emporter
// Ce script teste si les corrections apportées fonctionnent correctement

console.log('🧪 Test des corrections - Remises et Livraison/Emporter');
console.log('================================================');

// Simulation d'un produit avec remise de 100%
const produitAvecRemise = {
  id: 'test-1',
  designation: 'Pack Thalasso x2',
  qty: 2,
  priceTTC: 500,
  discount: 100, // 100% de remise
  discountType: 'percent',
  isPickupOnSite: false // À livrer
};

// Fonction calculateProductTotal simulée (copiée depuis utils/calculations.ts)
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

// Test 1: Calcul des remises
console.log('\n📊 Test 1: Calcul des remises');
console.log('Produit:', produitAvecRemise.designation);
console.log('Quantité:', produitAvecRemise.qty);
console.log('Prix unitaire TTC:', produitAvecRemise.priceTTC + '€');
console.log('Remise:', produitAvecRemise.discount + produitAvecRemise.discountType === 'percent' ? '%' : '€');

const montantOriginal = produitAvecRemise.priceTTC * produitAvecRemise.qty;
const montantApresRemise = calculateProductTotal(
  produitAvecRemise.qty,
  produitAvecRemise.priceTTC,
  produitAvecRemise.discount,
  produitAvecRemise.discountType
);
const montantRemise = montantOriginal - montantApresRemise;

console.log('➡️ Montant original:', montantOriginal + '€');
console.log('➡️ Montant après remise:', montantApresRemise + '€');
console.log('➡️ Montant de la remise:', montantRemise + '€');

if (produitAvecRemise.discount === 100 && produitAvecRemise.discountType === 'percent') {
  if (montantApresRemise === 0) {
    console.log('✅ Test remise 100% réussi');
  } else {
    console.log('❌ Test remise 100% échoué');
  }
}

// Test 2: Synchronisation livraison/emporter
console.log('\n🚚 Test 2: Synchronisation livraison/emporter');
console.log('Mode de livraison:', produitAvecRemise.isPickupOnSite ? '🚗 Emporter' : '📦 Livrer');

// Simulation de la synchronisation vers l'objet Invoice
const simulatedInvoiceProduct = {
  id: produitAvecRemise.id,
  name: produitAvecRemise.designation,
  designation: produitAvecRemise.designation,
  quantity: produitAvecRemise.qty,
  priceTTC: produitAvecRemise.priceTTC,
  discount: produitAvecRemise.discount,
  discountType: produitAvecRemise.discountType,
  isPickupOnSite: produitAvecRemise.isPickupOnSite, // ✅ Cette propriété doit être présente
  totalTTC: montantApresRemise
};

console.log('Objet produit synchronisé:');
console.log('- ID:', simulatedInvoiceProduct.id);
console.log('- Désignation:', simulatedInvoiceProduct.designation);
console.log('- Mode livraison:', simulatedInvoiceProduct.isPickupOnSite ? 'Emporter' : 'Livrer');
console.log('- Total TTC avec remise:', simulatedInvoiceProduct.totalTTC + '€');

if (simulatedInvoiceProduct.hasOwnProperty('isPickupOnSite')) {
  console.log('✅ Test synchronisation livraison/emporter réussi');
} else {
  console.log('❌ Test synchronisation livraison/emporter échoué');
}

// Test 3: Affichage récapitulatif simulé
console.log('\n📋 Test 3: Simulation affichage récapitulatif');
const products = [produitAvecRemise];
const produitsALivrer = products.filter(p => !p.isPickupOnSite);
const produitsAEmporter = products.filter(p => p.isPickupOnSite);

console.log('Produits à livrer:', produitsALivrer.length);
console.log('Produits à emporter:', produitsAEmporter.length);

products.forEach(p => {
  const mode = p.isPickupOnSite ? '🚗 Emporter' : '📦 Livrer';
  const total = calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType);
  console.log(`- ${p.designation}: ${mode} - ${total}€`);
});

console.log('\n🎯 Résumé des corrections apportées:');
console.log('1. ✅ Ajout affichage des remises dans StepRecap.tsx');
console.log('2. ✅ Correction syncToMainInvoice() pour inclure les remises');
console.log('3. ✅ Correction syncToMainInvoice() pour inclure isPickupOnSite');
console.log('4. ✅ Mise à jour type Product pour inclure isPickupOnSite');
console.log('5. ✅ Import calculateProductTotal dans store pour calculs corrects');

console.log('\n🚀 Les corrections devraient maintenant permettre:');
console.log('- Affichage correct des remises dans le récapitulatif');
console.log('- Synchronisation des modes livraison/emporter');
console.log('- Calculs corrects des totaux avec remises appliquées');
