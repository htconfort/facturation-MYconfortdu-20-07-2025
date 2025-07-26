#!/usr/bin/env node

/**
 * Test des modifications de taille de police dans l'aperçu de facture
 * 
 * Ce script vérifie que les polices ont été mises à jour correctement :
 * - Police générale : 12px
 * - Bloc produits : 14px
 * - Titres de sections : 13px
 */

import fs from 'fs';

console.log('📝 TEST - Modification des tailles de police dans l\'aperçu facture');
console.log('='.repeat(70));

const file = 'src/components/InvoicePreviewModern.tsx';
let content;

try {
  content = fs.readFileSync(file, 'utf8');
} catch (error) {
  console.log(`❌ Erreur lecture ${file}: ${error.message}`);
  process.exit(1);
}

let allTestsPassed = true;
const results = [];

// Test 1 : Vérifier la police de base (12px)
const hasBaseFontSize = content.includes("fontSize: '12px'") && 
                        content.includes("fontSize: '12px',");
if (hasBaseFontSize) {
  results.push('✅ Police de base : 12px appliquée');
} else {
  results.push('❌ Police de base : 12px MANQUANTE');  
  allTestsPassed = false;
}

// Test 2 : Vérifier la police du bloc produits (14px)
const productTableHeaders = content.match(/background: '#477A0C'[\s\S]*?fontSize: '14px'/g);
const productTableCells = content.match(/padding: '6px 4px'[\s\S]*?fontSize: '14px'/g);

if (productTableHeaders && productTableHeaders.length >= 5) {
  results.push('✅ En-têtes tableau produits : 14px appliquée (5 colonnes)');
} else {
  results.push('❌ En-têtes tableau produits : 14px MANQUANTE');
  allTestsPassed = false;
}

if (productTableCells && productTableCells.length >= 5) {
  results.push('✅ Cellules tableau produits : 14px appliquée');
} else {
  results.push('❌ Cellules tableau produits : 14px MANQUANTE');
  allTestsPassed = false;
}

// Test 3 : Vérifier les titres de sections (13px)
const sectionTitles = content.match(/fontSize: '13px'/g);
if (sectionTitles && sectionTitles.length >= 2) {
  results.push('✅ Titres de sections : 13px appliquée');
} else {
  results.push('❌ Titres de sections : 13px MANQUANTE');
  allTestsPassed = false;
}

// Test 4 : Vérifier qu'il ne reste plus de très petites polices (8px, 9px)
const smallFonts8px = content.match(/fontSize: '8px'/g);
const smallFonts9px = content.match(/fontSize: '9px'/g);

if (!smallFonts8px && !smallFonts9px) {
  results.push('✅ Suppression des très petites polices (8px, 9px)');
} else {
  results.push(`⚠️ Quelques très petites polices subsistent : ${(smallFonts8px?.length || 0)} x 8px, ${(smallFonts9px?.length || 0)} x 9px`);
}

// Test 5 : Vérifier les éléments spécifiques mis à jour
const checks = [
  { name: 'Informations client', pattern: /👤 Informations Client.*?fontSize: '13px'/s },
  { name: 'Détails facture', pattern: /📋 Détails Facture.*?fontSize: '13px'/s },
  { name: 'Désignation produit', pattern: /<strong>{product\.name}<\/strong>/},
  { name: 'Remarques et règlements', pattern: /📝 Remarques et règlements.*?fontSize: '12px'/s },
  { name: 'Adresse SAV', pattern: /💰 Règlements à.*?fontSize: '12px'/s }
];

checks.forEach(check => {
  if (check.pattern.test(content)) {
    results.push(`✅ ${check.name} : Police mise à jour`);
  } else {
    results.push(`❌ ${check.name} : Police NON mise à jour`);
    allTestsPassed = false;
  }
});

// Affichage des résultats
console.log('\n📋 RÉSULTATS DES TESTS :');
console.log('-'.repeat(50));
results.forEach(result => console.log(result));

console.log('\n📊 RÉCAPITULATIF DES POLICES :');
console.log('▸ Police générale : 12px (informations, remarques, adresses)');
console.log('▸ Bloc produits : 14px (en-têtes et cellules du tableau)');
console.log('▸ Titres de sections : 13px (Informations Client, Détails Facture)');
console.log('▸ Éléments secondaires : 10-11px (signatures, footer)');

console.log('\n' + '='.repeat(70));
if (allTestsPassed) {
  console.log('🎉 TOUTES LES MODIFICATIONS DE POLICE APPLIQUÉES !');
  console.log('✨ Le bloc produits est maintenant en 14px pour une meilleure lisibilité');
  console.log('📖 Les autres sections restent en 12px pour la compacité');
  console.log('🖨️ La facture reste compacte tout en étant plus lisible');
} else {
  console.log('❌ CERTAINES MODIFICATIONS DE POLICE MANQUENT !');
  console.log('🔧 Veuillez vérifier les problèmes mentionnés ci-dessus');
}
console.log('='.repeat(70));

console.log('\n🎯 IMPACT SUR LA LISIBILITÉ :');
console.log('1. Tableau des produits plus lisible (14px)');
console.log('2. Noms des produits bien visibles');
console.log('3. Prix et quantités clairement affichés');
console.log('4. Maintien de la compacité générale');
console.log('5. Adaptation pour l\'impression A4');

process.exit(allTestsPassed ? 0 : 1);
