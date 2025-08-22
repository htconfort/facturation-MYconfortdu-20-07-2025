#!/usr/bin/env node

/**
 * 🔧 DIAGNOSTIC N8N MODE NORMAL vs MODE WIZARD
 * 
 * Ce script compare la structure Invoice du mode normal 
 * vs mode wizard pour identifier les différences qui
 * pourraient empêcher N8N de fonctionner.
 */

console.log('🔧 DIAGNOSTIC N8N MODE NORMAL vs MODE WIZARD');
console.log('='.repeat(60));

// Structure Invoice du mode NORMAL (MainApp.tsx)
const invoiceNormal = {
  invoiceNumber: 'FAC-2025-001',
  invoiceDate: '2025-08-22',
  eventLocation: '',
  taxRate: 20,
  
  // Client - Structure plate
  clientName: 'Jean Dupont',
  clientEmail: 'jean@example.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue Test',
  clientAddressLine2: '',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientHousingType: '',
  clientDoorCode: '',
  clientSiret: '',
  
  // Produits et montants
  products: [
    {
      id: '1',
      name: 'Matelas Premium',
      category: 'Literie',
      quantity: 1,
      priceHT: 749.17,
      priceTTC: 899,
      unitPrice: 899,
      discount: 0,
      discountType: 'fixed',
      totalHT: 749.17,
      totalTTC: 899
    }
  ],
  montantHT: 749.17,
  montantTTC: 899,
  montantTVA: 149.83,
  montantRemise: 0,
  
  // Paiement
  paymentMethod: 'Carte bancaire',
  montantAcompte: 0,
  montantRestant: 899,
  
  // Livraison
  deliveryMethod: '',
  deliveryNotes: '',
  
  // Signature
  signature: '',
  isSigned: false,
  
  // Notes et conseiller
  invoiceNotes: '',
  advisorName: '',
  termsAccepted: false,
  
  // Chèques à venir
  nombreChequesAVenir: 0,
  
  // Métadonnées
  createdAt: '2025-08-22T10:30:00.000Z',
  updatedAt: '2025-08-22T10:30:00.000Z',
};

// Structure Invoice du mode WIZARD (store useInvoiceWizard)
const invoiceWizard = {
  invoiceNumber: 'FAC-2025-001',
  invoiceDate: '2025-08-22',
  eventLocation: 'Salon de Lille',
  
  // Client - Structure plate
  clientName: 'Jean Dupont',
  clientEmail: 'jean@example.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue Test',
  clientAddressLine2: '',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientHousingType: 'Maison',
  clientDoorCode: '1234',
  clientSiret: '',
  
  // Produits (même structure)
  products: [
    {
      id: '1',
      name: 'Matelas Premium',
      category: 'Literie',
      quantity: 1,
      priceHT: 749.17,
      priceTTC: 899,
      unitPrice: 899,
      discount: 0,
      discountType: 'fixed',
      totalHT: 749.17,
      totalTTC: 899
    }
  ],
  
  // Montants
  montantHT: 749.17,
  montantTTC: 899,
  montantTVA: 149.83,
  montantRemise: 0,
  taxRate: 20,
  
  // Paiement
  paymentMethod: 'Carte bancaire',
  montantAcompte: 0,
  depositPaymentMethod: '',
  montantRestant: 899,
  nombreChequesAVenir: 0,
  
  // Livraison
  deliveryMethod: 'Livraison à domicile',
  deliveryAddress: '',
  deliveryNotes: '',
  
  // Signature
  signature: 'data:image/png;base64,iVBORw0K...',
  isSigned: true,
  signatureDate: '2025-08-22T10:30:00.000Z',
  
  // Notes et conseiller
  invoiceNotes: 'Notes de test',
  advisorName: 'Marie Martin',
  termsAccepted: true,
  
  // Métadonnées
  createdAt: '2025-08-22T10:30:00.000Z',
  updatedAt: '2025-08-22T10:30:00.000Z',
};

console.log('📊 COMPARAISON DES STRUCTURES');

// Champs requis par le service N8N
const requiredFields = [
  'invoiceNumber',
  'clientName', 
  'clientEmail',
  'products',
  'paymentMethod',
  'montantTTC',
  'signature', // Peut être vide
  'isSigned',
  'advisorName',
  'termsAccepted'
];

console.log('\n🔍 VÉRIFICATION DES CHAMPS REQUIS:');

requiredFields.forEach(field => {
  const normalHas = invoiceNormal.hasOwnProperty(field);
  const wizardHas = invoiceWizard.hasOwnProperty(field);
  const normalValue = invoiceNormal[field];
  const wizardValue = invoiceWizard[field];
  
  console.log(`\n${field}:`);
  console.log(`  Normal:  ${normalHas ? '✅' : '❌'} ${normalValue}`);
  console.log(`  Wizard:  ${wizardHas ? '✅' : '❌'} ${wizardValue}`);
  
  if (!normalHas && wizardHas) {
    console.log(`  ⚠️  MANQUE dans le mode normal !`);
  }
});

// Champs supplémentaires dans le wizard
const wizardOnlyFields = [
  'signatureDate',
  'depositPaymentMethod',
  'deliveryAddress'
];

console.log('\n📋 CHAMPS SUPPLÉMENTAIRES DU WIZARD:');
wizardOnlyFields.forEach(field => {
  const normalHas = invoiceNormal.hasOwnProperty(field);
  const wizardHas = invoiceWizard.hasOwnProperty(field);
  
  console.log(`${field}: Normal ${normalHas ? '✅' : '❌'} | Wizard ${wizardHas ? '✅' : '❌'}`);
  
  if (!normalHas && wizardHas) {
    console.log(`  → Mode normal devrait avoir ce champ`);
  }
});

// Test de génération de payload
console.log('\n🧪 TEST DE GÉNÉRATION PAYLOAD N8N');

function testPayloadGeneration(invoice, mode) {
  console.log(`\n--- TEST ${mode.toUpperCase()} ---`);
  
  try {
    // Simulation simplifiée du payload (champs critiques)
    const payload = {
      numero_facture: invoice.invoiceNumber,
      nom_du_client: invoice.clientName,
      email_client: invoice.clientEmail,
      signature_presente: invoice.isSigned ? 'Oui' : 'Non',
      signature_image: invoice.signature || '',
      date_signature: invoice.signatureDate || '',
      mode_paiement: invoice.paymentMethod,
      conseiller: invoice.advisorName || 'MYCONFORT',
      montant_ttc: invoice.montantTTC.toFixed(2),
      produits: invoice.products.map(p => ({
        nom: p.name,
        quantite: p.quantity,
        prix_ttc: p.priceTTC
      }))
    };
    
    console.log('✅ Payload généré avec succès');
    console.log(`   - Client: ${payload.nom_du_client}`);
    console.log(`   - Signature: ${payload.signature_presente}`);
    console.log(`   - Conseiller: ${payload.conseiller}`);
    console.log(`   - Produits: ${payload.produits.length} item(s)`);
    
    // Vérifications critiques
    const checks = [
      { test: !!payload.numero_facture, name: 'Numéro facture' },
      { test: !!payload.nom_du_client, name: 'Nom client' },
      { test: !!payload.email_client, name: 'Email client' },
      { test: !!payload.mode_paiement, name: 'Mode paiement' },
      { test: payload.produits.length > 0, name: 'Produits' }
    ];
    
    const failed = checks.filter(c => !c.test);
    if (failed.length > 0) {
      console.log('⚠️  Problèmes détectés:');
      failed.forEach(f => console.log(`   - ${f.name} manquant`));
    } else {
      console.log('✅ Tous les champs critiques présents');
    }
    
    return failed.length === 0;
    
  } catch (error) {
    console.log('❌ Erreur génération payload:', error.message);
    return false;
  }
}

const normalResult = testPayloadGeneration(invoiceNormal, 'NORMAL');
const wizardResult = testPayloadGeneration(invoiceWizard, 'WIZARD');

console.log('\n📊 RÉSUMÉ FINAL:');
console.log(`Mode Normal: ${normalResult ? '✅ OK' : '❌ PROBLÈME'}`);
console.log(`Mode Wizard: ${wizardResult ? '✅ OK' : '❌ PROBLÈME'}`);

if (!normalResult) {
  console.log('\n🔧 CORRECTIONS SUGGÉRÉES POUR LE MODE NORMAL:');
  console.log('1. Ajouter signatureDate dans la structure Invoice');
  console.log('2. Ajouter depositPaymentMethod dans la structure Invoice');
  console.log('3. Vérifier que advisorName a une valeur par défaut');
  console.log('4. Vérifier que tous les champs sont initialisés');
} else {
  console.log('\n🎉 MODE NORMAL COMPATIBLE AVEC N8N !');
}
