#!/usr/bin/env node

/**
 * 🔄 RESET COMPLET NUMÉROTATION - FORCE 2025-001
 * Force le retour à 2025-001 même si localStorage contient des valeurs plus élevées
 */

console.log('🔄 RESET COMPLET NUMÉROTATION');
console.log('============================');

console.log('\n❌ PROBLÈME IDENTIFIÉ:');
console.log('Vous êtes à 2025-013 au lieu de 2025-001');
console.log('Le localStorage contient une valeur plus élevée');

console.log('\n⚡ RESET FORCÉ - COMMANDES À EXÉCUTER:');
console.log('=====================================');

console.log('\n🧪 Dans la Console du navigateur (F12):');
console.log('---------------------------------------');

console.log('// 1. EFFACEMENT COMPLET');
console.log('localStorage.clear()');
console.log('');

console.log('// 2. RESET FORCÉ À ZÉRO');
console.log('localStorage.setItem("lastInvoiceNumber", "2025-000")');
console.log('');

console.log('// 3. VÉRIFICATION');
console.log('localStorage.getItem("lastInvoiceNumber")');
console.log('// Doit afficher: "2025-000"');
console.log('');

console.log('// 4. RECHARGEZ LA PAGE (F5)');
console.log('// La prochaine facture sera: 2025-001');

console.log('\n🔧 ALTERNATIVE - SI ÇA NE MARCHE PAS:');
console.log('====================================');

console.log('// Forcer directement à 2025-001');
console.log('localStorage.setItem("lastInvoiceNumber", "2025-001")');
console.log('// Puis rechargez - la prochaine sera 2025-002');

console.log('\n📋 VÉRIFICATION ÉTAPE PAR ÉTAPE:');
console.log('================================');

console.log('1. Ouvrez http://localhost:5176/');
console.log('2. F12 → Console');
console.log('3. Tapez: localStorage.getItem("lastInvoiceNumber")');
console.log('4. Notez la valeur actuelle');
console.log('5. Tapez: localStorage.setItem("lastInvoiceNumber", "2025-000")');
console.log('6. Rechargez la page (F5)');
console.log('7. Cliquez "Nouvelle facture"');
console.log('8. Vérifiez le numéro affiché');

console.log('\n🎯 OBJECTIF:');
console.log('============');
console.log('✅ Facture actuelle: 2025-001');
console.log('✅ Prochaine facture: 2025-002');
console.log('✅ Compatible avec votre node IF N8N');

console.log('\n🚨 SI LE PROBLÈME PERSISTE:');
console.log('===========================');
console.log('Il peut y avoir un cache browser.');
console.log('');
console.log('Solutions:');
console.log('• Ctrl+Shift+R (rechargement forcé)');
console.log('• Ou navigation privée');
console.log('• Ou vider le cache complètement');

console.log('\n💡 TESTEZ MAINTENANT:');
console.log('====================');
console.log('1. Exécutez les commandes ci-dessus');
console.log('2. Confirmez que vous obtenez 2025-001');
console.log('3. Si non, dites-moi la valeur exacte que vous voyez');

console.log('\n🔍 DEBUG - Pour voir ce qui se passe:');
console.log('====================================');
console.log('// Voir tout le localStorage');
console.log('console.log(localStorage)');
console.log('');
console.log('// Voir toutes les clés');
console.log('Object.keys(localStorage)');
console.log('');
console.log('// Effacer une clé spécifique');
console.log('localStorage.removeItem("lastInvoiceNumber")');

console.log('\n🎉 PRÊT POUR LE RESET COMPLET !');
