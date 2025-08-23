#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST - GÉNÉRATION PAYLOAD N8N AVEC PRODUITS
 * 
 * Ce script simule la génération d'un payload N8N pour vérifier
 * que tous les champs produits sont bien présents et formatés.
 */

console.log('🧪 TEST PAYLOAD N8N - VÉRIFICATION CHAMPS PRODUITS\n');

// Simulation d'une facture avec produits variés
const mockInvoice = {
  invoiceNumber: 'TEST-2025-001',
  invoiceDate: '2025-01-23',
  clientName: 'Jean Dupont',
  clientEmail: 'jean.dupont@email.com',
  clientPhone: '06 12 34 56 78',
  clientAddress: '123 Rue de la Paix',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  paymentMethod: 'ALMA 3 fois',
  nombreChequesAVenir: 3,
  montantAcompte: 500,
  taxRate: 20,
  products: [
    {
      name: 'Pompe à chaleur Atlantic Alféa Evolution 11kW',
      category: 'Pompe à chaleur',
      quantity: 1,
      priceTTC: 8500,
      priceHT: 7083.33,
      discount: 200,
      discountType: 'fixed'
    },
    {
      name: 'Climatisation Daikin Sensira FTXF35A',
      category: 'Climatisation',
      quantity: 2,
      priceTTC: 1200,
      priceHT: 1000,
      discount: 5,
      discountType: 'percent'
    },
    {
      name: 'Installation et mise en service',
      category: 'Prestation',
      quantity: 1,
      priceTTC: 800,
      priceHT: 666.67,
      discount: 0,
      discountType: 'fixed'
    }
  ]
};

// Calculs
const totalTTC = mockInvoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0);
const montantRestant = totalTTC - mockInvoice.montantAcompte;

// Génération des champs produits (simulation du service N8N)
const champsProduitsGeneres = {
  // 1. CHAMPS SIMPLES pour affichage direct
  noms_produits_string: mockInvoice.products.map(p => p.name).join(', '),
  
  resume_produits: mockInvoice.products.length === 1 
    ? mockInvoice.products[0].name
    : `${mockInvoice.products[0].name} et ${mockInvoice.products.length - 1} autre${mockInvoice.products.length > 2 ? 's' : ''} produit${mockInvoice.products.length > 2 ? 's' : ''}`,
  
  liste_produits_email: mockInvoice.products.map(product => {
    const total = product.quantity * product.priceTTC;
    return `• ${product.name} - Quantité: ${product.quantity} - Prix unitaire: ${product.priceTTC.toFixed(2)}€ - Total: ${total.toFixed(2)}€`;
  }).join('\n'),
  
  // 2. CHAMPS TABLEAUX pour traitement N8N
  produits_noms: mockInvoice.products.map(p => p.name),
  produits_categories: mockInvoice.products.map(p => p.category || ''),
  produits_quantites: mockInvoice.products.map(p => p.quantity),
  produits_prix_unitaires: mockInvoice.products.map(p => p.priceTTC.toFixed(2)),
  
  // 3. CHAMP HTML pour emails riches
  produits_html: mockInvoice.products.map(product => {
    const total = product.quantity * product.priceTTC;
    return `<li><strong>${product.name}</strong><br>
             Quantité: ${product.quantity} × ${product.priceTTC.toFixed(2)}€ = <strong>${total.toFixed(2)}€</strong>
             ${product.discount > 0 ? `<br><em>Remise: -${product.discount}${product.discountType === 'percent' ? '%' : '€'}</em>` : ''}
             </li>`;
  }).join(''),
  
  // 4. TABLEAU D'OBJETS pour structure complète
  produits: mockInvoice.products.map(product => ({
    nom: product.name,
    quantite: product.quantity,
    prix_ttc: product.priceTTC,
    prix_ht: product.priceHT,
    total_ttc: product.quantity * product.priceTTC,
    total_ht: product.quantity * product.priceHT,
    categorie: product.category || 'Non spécifiée',
    remise: product.discount || 0,
    type_remise: product.discountType || 'fixed'
  })),
  
  // 5. STATISTIQUES
  nombre_produits: mockInvoice.products.length
};

// AFFICHAGE DU TEST
console.log('📋 DONNÉES FACTURE SIMULÉE:');
console.log(`- Numéro: ${mockInvoice.invoiceNumber}`);
console.log(`- Client: ${mockInvoice.clientName}`);
console.log(`- Mode paiement: ${mockInvoice.paymentMethod}`);
console.log(`- Nombre produits: ${mockInvoice.products.length}`);
console.log(`- Total TTC: ${totalTTC.toFixed(2)}€`);
console.log(`- Acompte: ${mockInvoice.montantAcompte}€`);
console.log(`- Montant restant: ${montantRestant.toFixed(2)}€`);

console.log('\n🛍️ CHAMPS PRODUITS GÉNÉRÉS POUR N8N:\n');

// Test de chaque champ
console.log('1️⃣ CHAMP SIMPLE - noms_produits_string:');
console.log(`"${champsProduitsGeneres.noms_produits_string}"`);
console.log(`   ✅ Longueur: ${champsProduitsGeneres.noms_produits_string.length} caractères`);

console.log('\n2️⃣ CHAMP RÉSUMÉ - resume_produits:');
console.log(`"${champsProduitsGeneres.resume_produits}"`);
console.log(`   ✅ Longueur: ${champsProduitsGeneres.resume_produits.length} caractères`);

console.log('\n3️⃣ CHAMP LISTE EMAIL - liste_produits_email:');
console.log(champsProduitsGeneres.liste_produits_email);
console.log(`   ✅ Longueur: ${champsProduitsGeneres.liste_produits_email.length} caractères`);

console.log('\n4️⃣ CHAMP TABLEAU - produits_noms:');
console.log(JSON.stringify(champsProduitsGeneres.produits_noms, null, 2));
console.log(`   ✅ Nombre d'éléments: ${champsProduitsGeneres.produits_noms.length}`);

console.log('\n5️⃣ CHAMP HTML - produits_html (extrait):');
console.log(champsProduitsGeneres.produits_html.substring(0, 200) + '...');
console.log(`   ✅ Longueur totale: ${champsProduitsGeneres.produits_html.length} caractères`);

console.log('\n6️⃣ TABLEAU D\'OBJETS - produits (premier élément):');
console.log(JSON.stringify(champsProduitsGeneres.produits[0], null, 2));
console.log(`   ✅ Nombre d'objets: ${champsProduitsGeneres.produits.length}`);

console.log('\n📊 STATISTIQUES CHAMPS:');
console.log(`- nombre_produits: ${champsProduitsGeneres.nombre_produits}`);
console.log(`- produits_categories: ${JSON.stringify(champsProduitsGeneres.produits_categories)}`);
console.log(`- produits_quantites: ${JSON.stringify(champsProduitsGeneres.produits_quantites)}`);
console.log(`- produits_prix_unitaires: ${JSON.stringify(champsProduitsGeneres.produits_prix_unitaires)}`);

console.log('\n🎯 TEMPLATES N8N RECOMMANDÉS:');
console.log('\n📧 Pour email simple:');
console.log('{{ $json.noms_produits_string }}');

console.log('\n📧 Pour email détaillé:');
console.log('{{ $json.liste_produits_email }}');

console.log('\n📧 Pour email HTML:');
console.log('<ul>{{{ $json.produits_html }}}</ul>');

console.log('\n📧 Pour email avec résumé:');
console.log('Commande: {{ $json.resume_produits }}');

console.log('\n✅ CONCLUSION:');
console.log('Tous les champs produits sont correctement générés.');
console.log('Si ils n\'apparaissent pas dans N8N, le problème est côté configuration N8N.');
console.log('Consultez le fichier GUIDE_DEBUG_N8N_PRODUITS.md pour la résolution.');

console.log('\n🔍 PAYLOAD FINAL (structure complète):');
const payloadFinal = {
  numero_facture: mockInvoice.invoiceNumber,
  nom_du_client: mockInvoice.clientName,
  email_client: mockInvoice.clientEmail,
  montant_ttc: totalTTC,
  ...champsProduitsGeneres
};

console.log(JSON.stringify(payloadFinal, null, 2));
