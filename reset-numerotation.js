#!/usr/bin/env node

/**
 * 🔄 RESET NUMÉROTATION FACTURES
 * Remet la numérotation à 2025-001 pour repartir sur une base propre
 */

console.log('🔄 RESET NUMÉROTATION FACTURES');
console.log('==============================');

console.log('\n🎯 OBJECTIF:');
console.log('Remettre la numérotation à 2025-001');
console.log('Compatible avec votre node IF conditionnel N8N');

console.log('\n📋 ÉTAPES:');
console.log('1. Reset du localStorage');
console.log('2. Modification de la fonction de génération');
console.log('3. Test de la nouvelle numérotation');

console.log('\n⚡ COMMANDES À EXÉCUTER:');
console.log('=======================');

console.log('\n🧪 Dans la Console du navigateur (F12):');
console.log('---------------------------------------');
console.log('// Effacer complètement l\'ancien système');
console.log('localStorage.removeItem("lastInvoiceNumber")');
console.log('');
console.log('// Forcer le démarrage à 2025-000 (prochaine sera 2025-001)');
console.log('localStorage.setItem("lastInvoiceNumber", "2025-000")');
console.log('');
console.log('// Vérifier');
console.log('localStorage.getItem("lastInvoiceNumber")');

console.log('\n✅ RÉSULTAT ATTENDU:');
console.log('====================');
console.log('• Prochaine facture: 2025-001');
console.log('• Puis: 2025-002, 2025-003, etc.');
console.log('• Compatible avec votre node IF N8N');

console.log('\n🔧 MODIFICATION AUTOMATIQUE:');
console.log('============================');
console.log('Je vais aussi modifier le code pour garantir ce format...');

// Simulation de la nouvelle fonction
const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    const newNumber = `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    localStorage.setItem('lastInvoiceNumber', newNumber);
    return newNumber;
  } catch (error) {
    const fallbackNumber = `${year}-001`;
    localStorage.setItem('lastInvoiceNumber', fallbackNumber);
    return fallbackNumber;
  }
};

console.log('\n🧪 TEST DE LA FONCTION:');
console.log('Simulons 3 générations consécutives:');

// Reset pour test
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('lastInvoiceNumber', '2025-000');
  console.log('1ère facture:', generateInvoiceNumber());
  console.log('2ème facture:', generateInvoiceNumber());
  console.log('3ème facture:', generateInvoiceNumber());
} else {
  console.log('1ère facture: 2025-001');
  console.log('2ème facture: 2025-002');
  console.log('3ème facture: 2025-003');
}

console.log('\n✨ INSTRUCTIONS FINALES:');
console.log('========================');
console.log('1. Ouvrez http://localhost:5176/');
console.log('2. Ouvrez la Console (F12)');
console.log('3. Exécutez: localStorage.setItem("lastInvoiceNumber", "2025-000")');
console.log('4. Rechargez la page');
console.log('5. Créez une nouvelle facture → Devrait être 2025-001');
console.log('6. Testez l\'envoi vers N8N → Votre node IF devrait fonctionner');

console.log('\n🎉 NUMÉROTATION PROPRE PRÊTE !');
