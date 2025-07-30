/**
 * 🧹 NETTOYAGE COMPLET LOCALSTORAGE
 * 
 * Copiez et collez ce code dans la console du navigateur
 * pour nettoyer complètement le système et repartir à zéro.
 */

// Nettoyage complet
console.log('🧹 NETTOYAGE COMPLET DU LOCALSTORAGE');

// 1. Supprimer toutes les données de facturation
const keysToRemove = [
  'lastInvoiceNumber',
  'factureData', 
  'lastInvoiceId',
  'invoiceData',
  'currentInvoice'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`🗑️ Supprimé: ${key}`);
  }
});

// 2. Reset propre à 2025-000
localStorage.setItem('lastInvoiceNumber', '2025-000');
console.log('✅ Reset à 2025-000');

// 3. Vérification
console.log('📊 État après nettoyage:');
console.log('- lastInvoiceNumber:', localStorage.getItem('lastInvoiceNumber'));
console.log('- Autres clés:', Object.keys(localStorage).filter(k => k.includes('invoice') || k.includes('facture')));

// 4. Recharger la page
console.log('🔄 Rechargement de la page dans 2 secondes...');
setTimeout(() => {
  location.reload();
}, 2000);

console.log('✅ Nettoyage terminé !');
console.log('📝 Prochaine facture sera: 2025-001');
