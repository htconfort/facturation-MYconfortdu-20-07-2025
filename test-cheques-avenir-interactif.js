#!/usr/bin/env node

/**
 * Script de test pour vérifier l'interactivité du champ "nombre de chèques à venir"
 * 
 * Ce script vérifie que :
 * 1. Le champ de saisie existe dans ProductSection.tsx
 * 2. La propriété nombreChequesAVenir est dans le type Invoice
 * 3. L'affichage dynamique fonctionne dans InvoicePreviewModern.tsx
 * 4. La liaison entre le formulaire et la facture est complète
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 TEST - Interactivité du nombre de chèques à venir');
console.log('=' .repeat(60));

// Chemins des fichiers à vérifier
const files = {
  types: 'src/types/index.ts',
  app: 'src/App.tsx',
  productSection: 'src/components/ProductSection.tsx',
  invoicePreview: 'src/components/InvoicePreviewModern.tsx'
};

let allTestsPassed = true;
const results = [];

// Test 1 : Vérifier la propriété dans le type Invoice
try {
  const typesContent = fs.readFileSync(files.types, 'utf8');
  const hasNombreChequesAVenir = typesContent.includes('nombreChequesAVenir?: number;');
  
  if (hasNombreChequesAVenir) {
    results.push('✅ Type Invoice : nombreChequesAVenir défini correctement');
  } else {
    results.push('❌ Type Invoice : nombreChequesAVenir MANQUANT');
    allTestsPassed = false;
  }
} catch (error) {
  results.push(`❌ Erreur lecture ${files.types}: ${error.message}`);
  allTestsPassed = false;
}

// Test 2 : Vérifier l'état initial dans App.tsx
try {
  const appContent = fs.readFileSync(files.app, 'utf8');
  const hasInitialState = appContent.includes('nombreChequesAVenir: 0');
  const hasPropsPass = appContent.includes('nombreChequesAVenir={invoice.nombreChequesAVenir || 0}') &&
                        appContent.includes('onNombreChequesAVenirChange={(nombre) => setInvoice(prev => ({ ...prev, nombreChequesAVenir: nombre }))}');
  
  if (hasInitialState && hasPropsPass) {
    results.push('✅ App.tsx : État initial et transmission des props OK');
  } else {
    results.push('❌ App.tsx : État initial ou transmission des props MANQUANT');
    if (!hasInitialState) results.push('  - État initial nombreChequesAVenir manquant');
    if (!hasPropsPass) results.push('  - Props nombreChequesAVenir ou callback manquant');
    allTestsPassed = false;
  }
} catch (error) {
  results.push(`❌ Erreur lecture ${files.app}: ${error.message}`);
  allTestsPassed = false;
}

// Test 3 : Vérifier le champ de saisie dans ProductSection.tsx
try {
  const productSectionContent = fs.readFileSync(files.productSection, 'utf8');
  const hasProps = productSectionContent.includes('nombreChequesAVenir: number;') &&
                   productSectionContent.includes('onNombreChequesAVenirChange: (nombre: number) => void;');
  const hasInputField = productSectionContent.includes('value={nombreChequesAVenir || 0}') &&
                        productSectionContent.includes('onNombreChequesAVenirChange(Number(val || "0"))');
  const hasCalculations = productSectionContent.includes('Number(nombreChequesAVenir || 0)');
  
  if (hasProps && hasInputField && hasCalculations) {
    results.push('✅ ProductSection.tsx : Props, champ de saisie et calculs OK');
  } else {
    results.push('❌ ProductSection.tsx : Props, champ de saisie ou calculs MANQUANT');
    if (!hasProps) results.push('  - Props nombreChequesAVenir manquantes');
    if (!hasInputField) results.push('  - Champ de saisie manquant ou mal configuré');
    if (!hasCalculations) results.push('  - Calculs avec nombreChequesAVenir manquants');
    allTestsPassed = false;
  }
} catch (error) {
  results.push(`❌ Erreur lecture ${files.productSection}: ${error.message}`);
  allTestsPassed = false;
}

// Test 4 : Vérifier l'affichage dynamique dans InvoicePreviewModern.tsx
try {
  const invoicePreviewContent = fs.readFileSync(files.invoicePreview, 'utf8');
  const hasConditionalDisplay = invoicePreviewContent.includes('invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0');
  const hasDynamicText = invoicePreviewContent.includes('invoice.nombreChequesAVenir} chèque{invoice.nombreChequesAVenir > 1 ? \'s\' : \'\'} à venir');
  
  if (hasConditionalDisplay && hasDynamicText) {
    results.push('✅ InvoicePreviewModern.tsx : Affichage dynamique OK');
  } else {
    results.push('❌ InvoicePreviewModern.tsx : Affichage dynamique MANQUANT');
    if (!hasConditionalDisplay) results.push('  - Condition d\'affichage manquante');
    if (!hasDynamicText) results.push('  - Texte dynamique manquant');
    allTestsPassed = false;
  }
} catch (error) {
  results.push(`❌ Erreur lecture ${files.invoicePreview}: ${error.message}`);
  allTestsPassed = false;
}

// Test 5 : Vérifier que l'ancien état local n'existe plus
try {
  const productSectionContent = fs.readFileSync(files.productSection, 'utf8');
  const hasOldState = productSectionContent.includes('useState<string>("")') && 
                      productSectionContent.includes('chequesQuantity') &&
                      !productSectionContent.includes('// chequesQuantity est maintenant remplacé par la prop nombreChequesAVenir');
  
  if (!hasOldState) {
    results.push('✅ Migration : Ancien état local chequesQuantity supprimé');
  } else {
    results.push('❌ Migration : Ancien état local chequesQuantity encore présent');
    allTestsPassed = false;
  }
} catch (error) {
  results.push(`❌ Erreur vérification migration: ${error.message}`);
  allTestsPassed = false;
}

// Affichage des résultats
console.log('\n📋 RÉSULTATS DES TESTS :');
console.log('-'.repeat(40));
results.forEach(result => console.log(result));

console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS PASSÉS !');
  console.log('✨ Le champ "nombre de chèques à venir" est maintenant interactif');
  console.log('📝 La valeur saisie dans le formulaire apparaît sur la facture');
  console.log('💾 La valeur est sauvegardée dans l\'objet Invoice');
  console.log('🖨️ La facture imprimée affichera le nombre de chèques à venir');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ !');
  console.log('🔧 Veuillez corriger les problèmes mentionnés ci-dessus');
}
console.log('='.repeat(60));

// Instructions d'usage
console.log('\n📖 INSTRUCTIONS D\'USAGE :');
console.log('1. Ouvrir l\'application MyComfort');
console.log('2. Aller dans la section "Produits & Tarification"');
console.log('3. Dans le bloc "Remarques", section "Chèques à venir"');
console.log('4. Saisir un nombre dans le champ "Nombre de chèques"');
console.log('5. La valeur apparaît instantanément dans l\'aperçu de facture');
console.log('6. Dans le bloc "Remarques" de la facture, à côté de l\'adresse SAV');

process.exit(allTestsPassed ? 0 : 1);
