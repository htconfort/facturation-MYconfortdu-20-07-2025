#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC - PROBLÈME NUMÉROTATION FACTURES
 * Vérification des sources de données et du flux de numérotation
 */

console.log('🔍 DIAGNOSTIC NUMÉROTATION FACTURES');
console.log('===================================');

console.log('\n📋 PROBLÈME IDENTIFIÉ:');
console.log('- Vous créez une facture 5335');
console.log('- Mais elle s\'envoie avec le numéro 2025-002');
console.log('- Il y a une désynchronisation dans le système');

console.log('\n🎯 SOURCES POSSIBLES DU PROBLÈME:');
console.log('================================');

console.log('\n1️⃣ GÉNÉRATION AUTOMATIQUE vs MANUELLE');
console.log('   🔧 Le système génère automatiquement: 2025-001, 2025-002...');
console.log('   👤 Vous saisissez manuellement: 5335');
console.log('   ❌ Résultat: Désynchronisation');

console.log('\n2️⃣ CACHE LOCALSTORAGE');
console.log('   📦 Le localStorage peut stocker l\'ancien numéro');
console.log('   🔄 Chaque refresh peut récupérer la même valeur');

console.log('\n3️⃣ ÉTAT REACT NON MIS À JOUR');
console.log('   ⚛️ L\'état de la facture peut ne pas se réinitialiser');
console.log('   🔄 La facture précédente reste en mémoire');

console.log('\n4️⃣ DONNÉES ENVOYÉES À N8N');
console.log('   📤 Le payload peut contenir l\'ancien numéro');
console.log('   🔍 Vérifier: invoice.invoiceNumber dans le webhook');

console.log('\n🛠️ VÉRIFICATIONS À FAIRE:');
console.log('=========================');

console.log('\n🔍 VÉRIFICATION 1: Inspecter le localStorage');
console.log('   1. Ouvrir DevTools (F12)');
console.log('   2. Aller dans Application → Local Storage');
console.log('   3. Chercher "lastInvoiceNumber"');
console.log('   4. Noter la valeur actuelle');

console.log('\n🔍 VÉRIFICATION 2: Logs du webhook');
console.log('   1. Ouvrir la Console (F12)');
console.log('   2. Créer une nouvelle facture');
console.log('   3. Chercher les logs "📦 Payload N8N préparé"');
console.log('   4. Vérifier le champ "numero_facture"');

console.log('\n🔍 VÉRIFICATION 3: État React');
console.log('   1. Installer React DevTools');
console.log('   2. Inspecter le composant App');
console.log('   3. Vérifier invoice.invoiceNumber');

console.log('\n🔍 VÉRIFICATION 4: Bouton "Nouvelle facture"');
console.log('   1. Cliquer sur "Nouvelle facture"');
console.log('   2. Vérifier si le numéro se met à jour');
console.log('   3. Comparer avec le localStorage');

console.log('\n🚀 SOLUTIONS POSSIBLES:');
console.log('======================');

console.log('\n✅ SOLUTION 1: Réinitialisation forcée');
console.log('   - Effacer le localStorage');
console.log('   - Redémarrer l\'application');

console.log('\n✅ SOLUTION 2: Synchronisation manuelle');
console.log('   - Permettre de saisir le numéro manuellement');
console.log('   - Désactiver la génération automatique');

console.log('\n✅ SOLUTION 3: Génération à l\'envoi');
console.log('   - Générer le numéro seulement au moment de l\'envoi');
console.log('   - Plus de conflit avec les brouillons');

console.log('\n🧪 COMMANDES DE DEBUG:');
console.log('=====================');
console.log('Dans la Console du navigateur:');
console.log('');
console.log('// Voir le localStorage actuel');
console.log('localStorage.getItem("lastInvoiceNumber")');
console.log('');
console.log('// Remettre à zéro la numérotation');
console.log('localStorage.setItem("lastInvoiceNumber", "2025-5334")');
console.log('');
console.log('// Effacer complètement');
console.log('localStorage.removeItem("lastInvoiceNumber")');

console.log('\n💡 ÉTAPES POUR RÉSOUDRE:');
console.log('========================');
console.log('1. Faites les 4 vérifications ci-dessus');
console.log('2. Identifiez à quel moment le numéro est incorrect');
console.log('3. Appliquez la solution correspondante');
console.log('4. Testez avec une nouvelle facture');

console.log('\n🎯 PRÊT POUR LE DIAGNOSTIC !');
