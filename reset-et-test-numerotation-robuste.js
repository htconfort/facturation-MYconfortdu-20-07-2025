/**
 * 🔄 RESET COMPLET + TEST NUMÉROTATION ROBUSTE
 * 
 * Script pour reset complètement le système de numérotation
 * et vérifier que la nouvelle protection fonctionne.
 */

console.log('🔄 RESET COMPLET DU SYSTÈME DE NUMÉROTATION');

// 1. Reset du localStorage
localStorage.removeItem('lastInvoiceNumber');
localStorage.removeItem('factureData');
localStorage.removeItem('lastInvoiceId');

// 2. Reset initial propre
localStorage.setItem('lastInvoiceNumber', '2025-000');

console.log('✅ LocalStorage nettoyé et reset à 2025-000');

// 3. Test de la nouvelle génération
console.log('\n🧪 TEST DE LA NOUVELLE APPROCHE:');

// Simuler le comportement du hook avec sessionId
function createInvoiceSession() {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`📝 Nouvelle session de facture: ${sessionId}`);
  return sessionId;
}

// Test: Créer 3 sessions de facture pour voir l'incrémentation correcte
const session1 = createInvoiceSession();
const session2 = createInvoiceSession();
const session3 = createInvoiceSession();

console.log('\n✅ Système reseté et prêt pour les tests!');
console.log('📋 Sessions créées:', { session1, session2, session3 });
console.log('📊 État initial:', localStorage.getItem('lastInvoiceNumber'));

// Instructions pour l'utilisateur
console.log('\n📖 INSTRUCTIONS:');
console.log('1. Rechargez la page de facturation');
console.log('2. Créez une nouvelle facture');
console.log('3. Le numéro doit être 2025-001');
console.log('4. Rechargez plusieurs fois → le numéro ne doit PAS changer');
console.log('5. Cliquez sur "Nouvelle Facture" → le numéro doit passer à 2025-002');
console.log('6. Vérifiez les logs de la console pour voir le détail');
