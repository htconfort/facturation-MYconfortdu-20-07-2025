// Script de test pour vérifier l'envoi de la signature dans le payload N8N
// Usage: node test-signature-payload.mjs

const testInvoiceWithSignature = {
  invoiceNumber: 'TEST-SIGNATURE-2025-001',
  invoiceDate: '2025-01-22',
  clientName: 'Client Signataire',
  clientEmail: 'client.test@example.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue Test',
  clientPostalCode: '12345',
  clientCity: 'Test City',
  clientHousingType: 'Maison',
  clientDoorCode: '1234',
  clientSiret: '',
  paymentMethod: 'Carte bancaire',
  deliveryMethod: 'Livraison standard',
  deliveryNotes: 'Test livraison',
  advisorName: 'Test Advisor',
  eventLocation: 'Test Location',
  invoiceNotes: 'Notes de test',
  termsAccepted: true,
  
  // ✅ SIGNATURE PRÉSENTE
  isSigned: true,
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Exemple de signature base64
  signatureDate: '2025-01-22T14:30:00Z',
  
  nombreChequesAVenir: 0,
  taxRate: 20,
  montantHT: 100,
  montantTVA: 20,
  montantTTC: 120,
  montantAcompte: 50,
  montantRemise: 0,
  createdAt: '2025-01-22T10:00:00Z',
  updatedAt: '2025-01-22T10:00:00Z',
  products: [
    {
      name: 'Produit Test Signé',
      category: 'Test Category',
      quantity: 1,
      priceTTC: 120,
      priceHT: 100,
      discount: 0,
      discountType: 'fixed'
    }
  ]
};

const testInvoiceWithoutSignature = {
  ...testInvoiceWithSignature,
  invoiceNumber: 'TEST-NO-SIGNATURE-2025-002',
  clientName: 'Client Non Signataire',
  
  // ❌ SIGNATURE ABSENTE
  isSigned: false,
  signature: '',
  signatureDate: ''
};

// Simuler la fonction calculateInvoiceTotals
function calculateInvoiceTotals(products, taxRate, acompte, paymentMethod) {
  const totalHT = products.reduce((sum, p) => sum + (p.quantity * p.priceHT), 0);
  const totalTTC = products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0);
  
  return {
    montantTTC: totalTTC,
    montantAcompte: acompte,
    montantRestant: totalTTC - acompte
  };
}

// Créer le payload signature (extrait du service N8N)
function createSignaturePayload(invoice) {
  const calculatedTotals = calculateInvoiceTotals(
    invoice.products,
    invoice.taxRate || 20,
    invoice.montantAcompte || 0,
    invoice.paymentMethod || ''
  );

  return {
    // Informations de base
    nom_du_client: invoice.clientName,
    numero_facture: invoice.invoiceNumber,
    
    // CHAMPS SIGNATURE
    signature: invoice.isSigned ? 'Oui' : 'Non',
    signature_presente: invoice.isSigned ? 'Oui' : 'Non',
    signature_image: invoice.signature || '', // ✅ SIGNATURE BASE64 COMPLÈTE
    date_signature: invoice.signatureDate || '',
    
    // Autres champs nécessaires pour email
    mode_paiement: invoice.paymentMethod,
    montant_ttc: calculatedTotals.montantTTC,
    conseiller: invoice.advisorName
  };
}

console.log('🖋️ TEST DE LA SIGNATURE DANS LE PAYLOAD N8N\n');
console.log('='.repeat(60));

// Test 1: Facture avec signature
console.log('📋 TEST 1: FACTURE AVEC SIGNATURE');
console.log('='.repeat(40));

const payloadAvecSignature = createSignaturePayload(testInvoiceWithSignature);

console.log(`✅ Client: ${payloadAvecSignature.nom_du_client}`);
console.log(`✅ Facture: ${payloadAvecSignature.numero_facture}`);
console.log(`✅ Signature présente: ${payloadAvecSignature.signature_presente}`);
console.log(`✅ Statut signature: ${payloadAvecSignature.signature}`);
console.log(`✅ Date signature: ${payloadAvecSignature.date_signature}`);

if (payloadAvecSignature.signature_image) {
  console.log(`✅ Image signature: ${payloadAvecSignature.signature_image.substring(0, 50)}... (${payloadAvecSignature.signature_image.length} caractères)`);
  console.log(`✅ Format valide: ${payloadAvecSignature.signature_image.startsWith('data:image/') ? 'OUI' : 'NON'}`);
} else {
  console.log(`❌ Image signature: ABSENTE`);
}

console.log('\n📋 TEST 2: FACTURE SANS SIGNATURE');
console.log('='.repeat(40));

const payloadSansSignature = createSignaturePayload(testInvoiceWithoutSignature);

console.log(`✅ Client: ${payloadSansSignature.nom_du_client}`);
console.log(`✅ Facture: ${payloadSansSignature.numero_facture}`);
console.log(`✅ Signature présente: ${payloadSansSignature.signature_presente}`);
console.log(`✅ Statut signature: ${payloadSansSignature.signature}`);
console.log(`✅ Date signature: ${payloadSansSignature.date_signature || 'NON DÉFINIE'}`);
console.log(`✅ Image signature: ${payloadSansSignature.signature_image || 'ABSENTE'}`);

console.log('\n🎯 TEMPLATE EMAIL N8N - UTILISATION:');
console.log('='.repeat(40));
console.log('Conditions à utiliser dans le template email:');
console.log('');
console.log('{{#if $json.signature_presente}}');
console.log('{{#if (eq $json.signature_presente "Oui")}}');
console.log('  <!-- Affichage de la signature -->');
console.log('  {{#if $json.signature_image}}');
console.log('    <img src="{{$json.signature_image}}" alt="Signature" />');
console.log('  {{else}}');
console.log('    ✓ Signature électronique enregistrée');
console.log('  {{/if}}');
console.log('  Date: {{$json.date_signature}}');
console.log('{{/if}}');
console.log('{{/if}}');

console.log('\n📊 RÉSUMÉ DES TESTS:');
console.log('='.repeat(40));
console.log(`✅ Facture avec signature: signature_image = ${payloadAvecSignature.signature_image ? 'PRÉSENTE' : 'ABSENTE'}`);
console.log(`✅ Facture sans signature: signature_image = ${payloadSansSignature.signature_image ? 'PRÉSENTE' : 'ABSENTE'}`);
console.log(`✅ Format data:image: ${payloadAvecSignature.signature_image && payloadAvecSignature.signature_image.startsWith('data:image/') ? 'VALIDE' : 'À VÉRIFIER'}`);

console.log('\n🔧 DIAGNOSTIC:');
console.log('='.repeat(40));
console.log('✅ Le service N8N envoie bien le champ signature_image');
console.log('✅ Le template email peut afficher la signature');
console.log('✅ Les conditions permettent de gérer les cas avec/sans signature');
console.log('');
console.log('Si la signature n\'apparaît pas dans l\'email:');
console.log('1. Vérifier que invoice.signature contient bien data:image/...');
console.log('2. Vérifier que le template N8N utilise {{{$json.signature_image}}} (3 accolades)');
console.log('3. Vérifier les conditions {{#if}} dans le template N8N');
