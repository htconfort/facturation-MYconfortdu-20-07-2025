#!/usr/bin/env node

/**
 * 🧪 TEST STATUT DE LIVRAISON - WEBHOOK N8N
 * 
 * Ce script teste l'envoi des données de statut de livraison vers N8N
 * Vérifie que les champs suivants sont correctement transmis :
 * - statut_livraison dans chaque produit
 * - produits_statuts_livraison (array)
 * - statistiques de livraison
 */

console.log('🧪 TEST STATUT DE LIVRAISON - WEBHOOK N8N');
console.log('='.repeat(50));

// Simulation d'une facture avec différents statuts de livraison
const invoiceTest = {
  invoiceNumber: 'TEST-LIVRAISON-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  eventLocation: 'Paris 15ème',
  clientName: 'TEST Statut Livraison',
  clientEmail: 'test@myconfort.fr',
  clientPhone: '0123456789',
  clientAddress: '123 Rue de Test',
  clientPostalCode: '75015',
  clientCity: 'Paris',
  products: [
    {
      id: '1',
      name: 'MATELAS BAMBOU 80x200',
      category: 'Matelas',
      quantity: 1,
      priceTTC: 299.99,
      priceHT: 249.99,
      discount: 0,
      discountType: 'percent',
      isPickupOnSite: false // À LIVRER
    },
    {
      id: '2', 
      name: 'OREILLER MÉMOIRE DE FORME',
      category: 'Oreillers',
      quantity: 2,
      priceTTC: 59.99,
      priceHT: 49.99,
      discount: 0,
      discountType: 'percent',
      isPickupOnSite: true // EMPORTÉ
    },
    {
      id: '3',
      name: 'SURMATELAS TOPPER',
      category: 'Surmatelas',
      quantity: 1,
      priceTTC: 189.99,
      priceHT: 158.32,
      discount: 10,
      discountType: 'percent',
      isPickupOnSite: false // À LIVRER
    },
    {
      id: '4',
      name: 'COUETTE 4 SAISONS',
      category: 'Couettes',
      quantity: 1,
      priceTTC: 129.99,
      priceHT: 108.32,
      discount: 0,
      discountType: 'percent',
      isPickupOnSite: true // EMPORTÉ
    }
  ],
  montantHT: 566.62,
  montantTTC: 679.96,
  montantTVA: 113.34,
  montantRemise: 18.99,
  taxRate: 20,
  paymentMethod: 'Chèque',
  montantAcompte: 200,
  montantRestant: 479.96,
  deliveryMethod: 'Colissimo 48 heures',
  deliveryNotes: 'Test de livraison avec produits mixtes',
  signature: '',
  isSigned: false,
  invoiceNotes: 'Test statut livraison',
  advisorName: 'MYCONFORT Test',
  termsAccepted: true,
  nombreChequesAVenir: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Simulation du mapping N8N
console.log('📦 DONNÉES QUI SERONT ENVOYÉES AU WEBHOOK N8N :');
console.log('-'.repeat(50));

// Affichage des produits avec statut
console.log('\n🏷️ PRODUITS AVEC STATUT DE LIVRAISON :');
invoiceTest.products.forEach((product, index) => {
  const statut = product.isPickupOnSite ? 'emporte' : 'a_livrer';
  const emoji = product.isPickupOnSite ? '📦' : '🚛';
  console.log(`${index + 1}. ${emoji} ${product.name} - Statut: "${statut}"`);
});

// Simulation du payload N8N
const webhookPayload = {
  numero_facture: invoiceTest.invoiceNumber,
  nombre_produits: invoiceTest.products.length,
  
  // Arrays séparés pour N8N
  produits_noms: invoiceTest.products.map(p => p.name),
  produits_statuts_livraison: invoiceTest.products.map(p => p.isPickupOnSite ? 'emporte' : 'a_livrer'),
  
  // Statistiques de livraison
  nombre_produits_a_livrer: invoiceTest.products.filter(p => !p.isPickupOnSite).length,
  nombre_produits_emportes: invoiceTest.products.filter(p => p.isPickupOnSite).length,
  noms_produits_a_livrer: invoiceTest.products.filter(p => !p.isPickupOnSite).map(p => p.name).join(', '),
  noms_produits_emportes: invoiceTest.products.filter(p => p.isPickupOnSite).map(p => p.name).join(', '),
  a_une_livraison: invoiceTest.products.some(p => !p.isPickupOnSite) ? 'Oui' : 'Non',
  a_des_produits_emportes: invoiceTest.products.some(p => p.isPickupOnSite) ? 'Oui' : 'Non',
  
  // Structure complète des produits
  produits: invoiceTest.products.map(product => ({
    nom: product.name,
    quantite: product.quantity,
    prix_ttc: product.priceTTC,
    statut_livraison: product.isPickupOnSite ? 'emporte' : 'a_livrer',
    categorie: product.category
  }))
};

console.log('\n📊 ARRAYS SÉPARÉS POUR N8N :');
console.log('produits_noms:', webhookPayload.produits_noms);
console.log('produits_statuts_livraison:', webhookPayload.produits_statuts_livraison);

console.log('\n📈 STATISTIQUES DE LIVRAISON :');
console.log('nombre_produits_a_livrer:', webhookPayload.nombre_produits_a_livrer);
console.log('nombre_produits_emportes:', webhookPayload.nombre_produits_emportes);
console.log('noms_produits_a_livrer:', webhookPayload.noms_produits_a_livrer);
console.log('noms_produits_emportes:', webhookPayload.noms_produits_emportes);
console.log('a_une_livraison:', webhookPayload.a_une_livraison);
console.log('a_des_produits_emportes:', webhookPayload.a_des_produits_emportes);

console.log('\n🏗️ STRUCTURE PRODUITS COMPLÈTE :');
console.log(JSON.stringify(webhookPayload.produits, null, 2));

console.log('\n✅ VÉRIFICATIONS À FAIRE DANS N8N :');
console.log('1. Vérifiez que le champ "statut_livraison" existe dans chaque produit');
console.log('2. Vérifiez que "produits_statuts_livraison" contient les bonnes valeurs');
console.log('3. Vérifiez les statistiques de livraison');
console.log('4. Les valeurs attendues sont "emporte" ou "a_livrer"');

console.log('\n🔍 DANS VOTRE WORKFLOW N8N :');
console.log('• Webhook → Déclencheur → Données de test → Recherchez "statut_livraison"');
console.log('• Ou utilisez ces expressions :');
console.log('  - Pour tous les produits à livrer : {{ $json.noms_produits_a_livrer }}');
console.log('  - Pour tous les produits emportés : {{ $json.noms_produits_emportes }}');
console.log('  - Pour vérifier s\'il y a une livraison : {{ $json.a_une_livraison }}');

console.log('\n' + '='.repeat(50));
console.log('🎯 Test terminé. Lancez un envoi depuis l\'application pour vérifier !');
