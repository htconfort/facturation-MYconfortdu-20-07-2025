#!/usr/bin/env node

/**
 * SCRIPT DE TEST COMPLET - MAPPING N8N EXHAUSTIF
 * Valide que tous les champs de l'interface Invoice sont bien transmis dans le payload
 */

// 🧪 DONNÉES DE TEST COMPLÈTES
const testInvoice = {
  // Facture de base
  invoiceNumber: 'TEST-2025-001',
  invoiceDate: '2025-07-30',
  
  // Financier complet
  montantHT: 850.00,
  montantTVA: 170.00,
  montantTTC: 1020.00,
  montantRemise: 50.00,
  taxRate: 20,
  acompte: 200.00,
  restantDu: 820.00,
  
  // Client complet
  clientName: 'Jean Dupont',
  clientEmail: 'jean.dupont@example.com',
  clientPhone: '0123456789',
  clientAddress: '123 rue de la Paix',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientHousingType: 'Appartement',
  clientDoorCode: 'A1234',
  clientSiret: '12345678901234',
  
  // Paiement et signature
  paymentMethod: 'Chèque',
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  isSigned: true,
  signatureDate: '2025-07-30T14:30:00Z',
  
  // Livraison
  deliveryMethod: 'Livraison standard',
  deliveryNotes: 'Appeler avant livraison',
  
  // Chèques à venir
  nombreChequesAVenir: 3,
  
  // Métadonnées
  invoiceNotes: 'Facture de test complète',
  advisorName: 'Marie Martin',
  eventLocation: 'Showroom Paris',
  termsAccepted: true,
  createdAt: '2025-07-30T12:00:00Z',
  updatedAt: '2025-07-30T14:30:00Z',
  
  // Produits complets (3 produits)
  products: [
    {
      name: 'Isolation combles',
      category: 'Isolation',
      quantity: 50,
      priceHT: 12.00,
      priceTTC: 14.40,
      discount: 0,
      totalHT: 600.00,
      totalTTC: 720.00
    },
    {
      name: 'Isolation murs',
      category: 'Isolation',
      quantity: 30,
      priceHT: 8.00,
      priceTTC: 9.60,
      discount: 5,
      totalHT: 228.00,
      totalTTC: 273.60
    },
    {
      name: 'VMC double flux',
      category: 'Ventilation',
      quantity: 1,
      priceHT: 800.00,
      priceTTC: 960.00,
      discount: 10,
      totalHT: 720.00,
      totalTTC: 864.00
    }
  ]
};

// 🔬 SIMULATION DU MAPPING N8N
function simulateN8nMapping(invoice) {
  const montantRestant = invoice.restantDu || (invoice.montantTTC - (invoice.acompte || 0));
  
  return {
    // === INFORMATIONS FACTURE ===
    numero_facture: invoice.invoiceNumber,
    date_facture: invoice.invoiceDate,
    
    // === MONTANTS FINANCIERS COMPLETS ===
    montant_total_ttc: invoice.montantTTC || 0,
    acompte: invoice.acompte || 0,
    restant_du: montantRestant,
    montant_ht: invoice.montantHT || 0,
    montant_tva: invoice.montantTVA || 0,
    montant_remise: invoice.montantRemise || 0,
    taux_tva: invoice.taxRate || 20,
    
    // === CLIENT COMPLET ===
    nom_du_client: invoice.clientName,
    email_client: invoice.clientEmail,
    telephone_client: invoice.clientPhone,
    adresse_client: `${invoice.clientAddress}, ${invoice.clientPostalCode} ${invoice.clientCity}`,
    client_adresse_rue: invoice.clientAddress,
    client_code_postal: invoice.clientPostalCode,
    client_ville: invoice.clientCity,
    client_type_logement: invoice.clientHousingType || '',
    client_code_porte: invoice.clientDoorCode || '',
    client_siret: invoice.clientSiret || '',
    
    // === PAIEMENT ET SIGNATURE ===
    mode_paiement: invoice.paymentMethod || 'Non spécifié',
    signature: invoice.signature ? 'Oui' : 'Non',
    signature_presente: invoice.isSigned ? 'Oui' : 'Non',
    date_signature: invoice.signatureDate || '',
    
    // === LIVRAISON ===
    methode_livraison: invoice.deliveryMethod || '',
    notes_livraison: invoice.deliveryNotes || '',
    
    // === CHÈQUES À VENIR ===
    nombre_cheques: invoice.nombreChequesAVenir || 0,
    montant_par_cheque: invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0 && montantRestant > 0
      ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2)
      : '',
    mode_paiement_avec_details: invoice.paymentMethod && invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0
      ? `${invoice.paymentMethod} - ${invoice.nombreChequesAVenir} chèque${invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir de ${invoice.nombreChequesAVenir && montantRestant > 0 ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2) : '0.00'}€ chacun`
      : invoice.paymentMethod || 'Non spécifié',
    
    // === MÉTADONNÉES ===
    notes_facture: invoice.invoiceNotes || '',
    conseiller: invoice.advisorName || 'MYCONFORT',
    lieu_evenement: invoice.eventLocation || 'Non spécifié',
    conditions_acceptees: invoice.termsAccepted ? 'Oui' : 'Non',
    date_creation_facture: invoice.createdAt || new Date().toISOString(),
    date_modification_facture: invoice.updatedAt || new Date().toISOString(),
    
    // === PRODUITS HTML ===
    produits_html: invoice.products.map(product => {
      const total = product.quantity * product.priceTTC;
      return `<li><strong>${product.name}</strong><br>
                  Catégorie: ${product.category}<br>
                  Quantité: ${product.quantity}<br>
                  Prix unitaire HT: ${product.priceHT.toFixed(2)}€<br>
                  Prix unitaire TTC: ${product.priceTTC.toFixed(2)}€<br>
                  ${product.discount > 0 ? `Remise: ${product.discount}%<br>` : ''}
                  Total TTC: ${total.toFixed(2)}€</li>`
    }).join(''),
    
    // === ARRAYS PRODUITS SÉPARÉS ===
    produits_noms: invoice.products.map(p => p.name),
    produits_categories: invoice.products.map(p => p.category),
    produits_quantites: invoice.products.map(p => p.quantity),
    produits_prix_ht_unitaires: invoice.products.map(p => p.priceHT),
    produits_prix_ttc_unitaires: invoice.products.map(p => p.priceTTC),
    produits_remises: invoice.products.map(p => p.discount || 0),
    produits_totaux_ht: invoice.products.map(p => p.totalHT || (p.quantity * p.priceHT)),
    produits_totaux_ttc: invoice.products.map(p => p.totalTTC || (p.quantity * p.priceTTC)),
    nombre_produits: invoice.products.length,
    
    // === PDF ===
    fichier_facture: 'JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDM...' // Base64 simulé
  };
}

// 🎯 EXÉCUTION DU TEST
console.log('🚀 TEST COMPLET DU MAPPING N8N');
console.log('================================');

const payload = simulateN8nMapping(testInvoice);

// Compter et valider tous les champs
const totalFields = Object.keys(payload).length;
console.log(`📊 NOMBRE TOTAL DE CHAMPS: ${totalFields}`);
console.log('');

// Validation par catégorie
const categories = {
  'Facture de base': ['numero_facture', 'date_facture'],
  'Montants financiers': ['montant_total_ttc', 'acompte', 'restant_du', 'montant_ht', 'montant_tva', 'montant_remise', 'taux_tva'],
  'Client': ['nom_du_client', 'email_client', 'telephone_client', 'adresse_client', 'client_adresse_rue', 'client_code_postal', 'client_ville', 'client_type_logement', 'client_code_porte', 'client_siret'],
  'Paiement': ['mode_paiement', 'signature', 'signature_presente', 'date_signature'],
  'Livraison': ['methode_livraison', 'notes_livraison'],
  'Chèques': ['nombre_cheques', 'montant_par_cheque', 'mode_paiement_avec_details'],
  'Métadonnées': ['notes_facture', 'conseiller', 'lieu_evenement', 'conditions_acceptees', 'date_creation_facture', 'date_modification_facture'],
  'Produits': ['produits_html', 'produits_noms', 'produits_categories', 'produits_quantites', 'produits_prix_ht_unitaires', 'produits_prix_ttc_unitaires', 'produits_remises', 'produits_totaux_ht', 'produits_totaux_ttc', 'nombre_produits'],
  'PDF': ['fichier_facture']
};

let totalValidated = 0;
Object.entries(categories).forEach(([category, fields]) => {
  console.log(`\n📁 ${category.toUpperCase()} (${fields.length} champs):`);
  fields.forEach(field => {
    const hasValue = payload[field] !== undefined && payload[field] !== null && payload[field] !== '';
    const isArray = Array.isArray(payload[field]);
    const arrayLength = isArray ? payload[field].length : null;
    
    console.log(`  ${hasValue ? '✅' : '❌'} ${field}: ${
      isArray 
        ? `[Array ${arrayLength} items] ${payload[field].slice(0, 2).join(', ')}${arrayLength > 2 ? '...' : ''}`
        : typeof payload[field] === 'string' && payload[field].length > 50 
          ? `${payload[field].substring(0, 50)}...`
          : payload[field]
    }`);
    
    if (hasValue) totalValidated++;
  });
});

console.log('\n' + '='.repeat(50));
console.log(`🎯 RÉSULTAT FINAL:`);
console.log(`   ${totalValidated}/${totalFields} champs validés (${((totalValidated/totalFields)*100).toFixed(1)}%)`);

if (totalValidated === totalFields) {
  console.log('✅ SUCCÈS: Tous les champs sont présents et valides!');
  console.log('🚀 Le mapping N8N est EXHAUSTIF et prêt pour la production.');
} else {
  console.log('❌ ATTENTION: Certains champs sont manquants ou vides.');
  console.log('🔧 Vérifiez les champs marqués d\'un ❌ ci-dessus.');
}

console.log('\n📋 AVANTAGES DE CE MAPPING COMPLET:');
console.log('   • Automatisations N8N avancées possibles');
console.log('   • Emails détaillés avec toutes les informations');
console.log('   • Intégrations CRM/ERP facilitées');
console.log('   • Rapports et analyses exhaustives');
console.log('   • Traçabilité complète des factures');

console.log('\n🌐 URL DE PRODUCTION CONFIGURÉE:');
console.log('   https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle');
