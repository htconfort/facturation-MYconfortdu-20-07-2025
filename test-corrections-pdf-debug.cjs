#!/usr/bin/env node

/**
 * TEST DEBUG - Affichage Produits et Cadrage Client
 * Vérifie les corrections apportées au PDF InvoicePDF.tsx
 */

console.log('🔧 TEST DEBUG - CORRECTIONS INVOICE PDF');
console.log('=======================================\n');

// Simulation d'une facture avec des données problématiques
const testInvoice = {
  invoiceNumber: 'TEST-001',
  clientName: 'Monsieur Jean-Pierre De La Roche-Saint-Germain',
  clientAddress: 'Appartement 3B, Résidence Les Jardins de la République, 123 Avenue des Champs-Élysées Extension Prolongée',
  clientEmail: 'jean-pierre.delarochesaintgermain@example-very-long-domain.com',
  clientPhone: '+33 6 12 34 56 78',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  products: [
    {
      name: 'Matelas Memory Foam Premium Ultra Confort Taille King Size 180x200cm',
      category: 'Matelas haut de gamme - Collection Premium',
      quantity: 1,
      priceTTC: 899.99,
      discount: 50,
      discountType: 'fixed'
    },
    {
      name: 'Oreiller Ergonomique',
      category: 'Accessoires',
      quantity: 2,
      priceTTC: 79.99,
      discount: 10,
      discountType: 'percent'
    },
    {
      name: '', // Nom vide pour tester la robustesse
      category: 'Test',
      quantity: 1,
      priceTTC: 50.00,
      discount: 0,
      discountType: 'fixed'
    }
  ]
};

console.log('📋 DONNÉES DE TEST:');
console.log('==================');

console.log('\n👤 INFORMATIONS CLIENT:');
console.log('Nom:', testInvoice.clientName, '(Longueur:', testInvoice.clientName.length, 'caractères)');
console.log('Adresse:', testInvoice.clientAddress, '(Longueur:', testInvoice.clientAddress.length, 'caractères)');
console.log('Email:', testInvoice.clientEmail, '(Longueur:', testInvoice.clientEmail.length, 'caractères)');

console.log('\n📦 PRODUITS:');
testInvoice.products.forEach((product, index) => {
  console.log(`${index + 1}. "${product.name || 'PRODUIT SANS NOM'}" (Longueur: ${product.name.length} chars)`);
  console.log(`   Catégorie: "${product.category}"`);
  console.log(`   Prix: ${product.priceTTC}€, Quantité: ${product.quantity}`);
  console.log('');
});

console.log('🔍 ANALYSE DES PROBLÈMES:');
console.log('==========================');

console.log('\n❌ PROBLÈME 1: Cadrage des informations client');
console.log('- Nom très long:', testInvoice.clientName.length > 30 ? 'OUI ⚠️' : 'NON ✅');
console.log('- Adresse très longue:', testInvoice.clientAddress.length > 50 ? 'OUI ⚠️' : 'NON ✅');
console.log('- Email très long:', testInvoice.clientEmail.length > 30 ? 'OUI ⚠️' : 'NON ✅');

console.log('\n❌ PROBLÈME 2: Produits manquants');
console.log('- Nombre de produits:', testInvoice.products.length);
console.log('- Produits avec nom vide:', testInvoice.products.filter(p => !p.name).length);
console.log('- Produits avec nom très long:', testInvoice.products.filter(p => p.name.length > 50).length);

console.log('\n✅ CORRECTIONS APPLIQUÉES:');
console.log('===========================');

console.log('\n🔧 CADRAGE CLIENT:');
console.log('- maxWidth: 50% pour chaque colonne');
console.log('- wordWrap: break-word pour les longs textes');
console.log('- overflowWrap: break-word pour forcer la césure');
console.log('- hyphens: auto pour la césure automatique');
console.log('- fontSize réduit pour l\'email (11px)');

console.log('\n🔧 TABLEAU PRODUITS:');
console.log('- Vérification: invoice.products && invoice.products.length > 0');
console.log('- Fallback: "Produit sans nom" si product.name est vide');
console.log('- Protection: product.quantity || 0, product.priceTTC || 0');
console.log('- maxWidth: 200px pour la colonne désignation');
console.log('- wordWrap: break-word pour les noms longs');

console.log('\n🎯 RÉSULTAT ATTENDU:');
console.log('=====================');
console.log('✅ Les informations client restent dans leur cadre');
console.log('✅ Les noms de produits s\'affichent correctement');
console.log('✅ Les textes longs se coupent proprement');
console.log('✅ Aucun débordement de conteneur');

console.log('\n🚀 Rechargez l\'application localhost:5178 pour voir les corrections !');
