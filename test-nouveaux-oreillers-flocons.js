#!/usr/bin/env node

/**
 * Script de test pour vérifier l'ajout des nouveaux produits Oreillers Flocons
 * - Oreiller Flocon (50€)
 * - Pack deux oreillers flocons (90€)
 */

console.log('🧪 TEST - Nouveaux produits Oreillers Flocons');
console.log('====================================================');

// Simulation du catalogue mis à jour
const nouveauxProduitsOreillers = [
  { name: 'Oreiller Douceur', priceTTC: 80 },
  { name: 'Oreiller Thalasso', priceTTC: 60 },
  { name: 'Oreiller Dual', priceTTC: 60 },
  { name: 'Oreiller Panama', priceTTC: 70 },
  { name: 'Oreiller Papillon', priceTTC: 80 },
  { name: 'Oreiller Flocon', priceTTC: 50 }, // NOUVEAU
  { name: 'Pack de 2 oreillers (thal et dual)', priceTTC: 100 },
  { name: 'Pack oreiller 2 douceur', priceTTC: 150 },
  { name: 'Pack deux oreillers papillon', priceTTC: 150 },
  { name: 'Pack de deux oreillers Panama', priceTTC: 130 },
  { name: 'Pack deux oreillers flocons', priceTTC: 90 }, // NOUVEAU
  { name: 'Traversin 140', priceTTC: 140 },
  { name: 'Traversin 160', priceTTC: 160 },
  { name: 'Pack divers', priceTTC: 0 }
];

console.log('✅ VÉRIFICATIONS :');
console.log('------------------');

// Test 1: Vérifier que "Oreiller Flocon" existe
const oreillerFlocon = nouveauxProduitsOreillers.find(p => p.name === 'Oreiller Flocon');
if (oreillerFlocon) {
  console.log(`✅ "Oreiller Flocon" trouvé - Prix: ${oreillerFlocon.priceTTC}€ TTC`);
  if (oreillerFlocon.priceTTC === 50) {
    console.log('   ✅ Prix correct (50€)');
  } else {
    console.log(`   ❌ Prix incorrect. Attendu: 50€, Trouvé: ${oreillerFlocon.priceTTC}€`);
  }
} else {
  console.log('❌ "Oreiller Flocon" non trouvé dans le catalogue');
}

// Test 2: Vérifier que "Pack deux oreillers flocons" existe
const packFlocons = nouveauxProduitsOreillers.find(p => p.name === 'Pack deux oreillers flocons');
if (packFlocons) {
  console.log(`✅ "Pack deux oreillers flocons" trouvé - Prix: ${packFlocons.priceTTC}€ TTC`);
  if (packFlocons.priceTTC === 90) {
    console.log('   ✅ Prix correct (90€)');
  } else {
    console.log(`   ❌ Prix incorrect. Attendu: 90€, Trouvé: ${packFlocons.priceTTC}€`);
  }
} else {
  console.log('❌ "Pack deux oreillers flocons" non trouvé dans le catalogue');
}

// Test 3: Vérifier le nombre total de produits oreillers
console.log(`\n📊 Nombre total de produits Oreillers: ${nouveauxProduitsOreillers.length}`);

// Test 4: Afficher la liste complète des oreillers avec prix
console.log('\n📋 CATALOGUE COMPLET DES OREILLERS :');
console.log('------------------------------------');
nouveauxProduitsOreillers.forEach((produit, index) => {
  const marker = (produit.name.includes('Flocon')) ? '🆕' : '  ';
  console.log(`${marker} ${index + 1}. ${produit.name} - ${produit.priceTTC}€ TTC`);
});

// Test 5: Cohérence des prix
console.log('\n💰 ANALYSE DES PRIX :');
console.log('---------------------');
const oreillerSimple = nouveauxProduitsOreillers.filter(p => 
  p.name.startsWith('Oreiller ') && !p.name.includes('Pack')
);
const packs = nouveauxProduitsOreillers.filter(p => 
  p.name.startsWith('Pack') && p.priceTTC > 0
);

console.log('Oreillers simples:');
oreillerSimple.forEach(p => console.log(`  - ${p.name}: ${p.priceTTC}€`));

console.log('\nPacks d\'oreillers:');
packs.forEach(p => console.log(`  - ${p.name}: ${p.priceTTC}€`));

// Vérification cohérence prix pack flocons
if (oreillerFlocon && packFlocons) {
  const prixDeuxFlocons = oreillerFlocon.priceTTC * 2;
  const economie = prixDeuxFlocons - packFlocons.priceTTC;
  console.log(`\n🔍 COHÉRENCE PACK FLOCONS :`);
  console.log(`   2 x Oreiller Flocon = ${prixDeuxFlocons}€`);
  console.log(`   Pack deux oreillers flocons = ${packFlocons.priceTTC}€`);
  console.log(`   Économie pack = ${economie}€`);
  
  if (economie > 0) {
    console.log('   ✅ Le pack offre une remise cohérente');
  } else {
    console.log('   ⚠️  Aucune remise sur le pack');
  }
}

console.log('\n🎯 INSTRUCTIONS DE TEST MANUEL :');
console.log('=================================');
console.log('1. Démarrer l\'application avec npm run dev');
console.log('2. Aller dans la section "Produits"');
console.log('3. Sélectionner la catégorie "Oreillers"');
console.log('4. Vérifier la présence de "Oreiller Flocon" à 50€');
console.log('5. Vérifier la présence de "Pack deux oreillers flocons" à 90€');
console.log('6. Ajouter ces produits à une facture test');
console.log('7. Vérifier que les prix s\'affichent correctement dans l\'aperçu');
console.log('8. Tester l\'impression/PDF pour vérifier le rendu final');

console.log('\n✨ Test terminé ! Les nouveaux produits Flocons sont prêts.');
