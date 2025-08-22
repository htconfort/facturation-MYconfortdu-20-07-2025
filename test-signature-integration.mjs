#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST SIGNATURE DANS PAYLOAD N8N
 * 
 * Ce script teste spécifiquement la transmission de la signature
 * du wizard vers le payload N8N pour s'assurer que :
 * 1. La signature est bien récupérée du state
 * 2. Elle est transmise dans le bon format (data:image/png;base64,...)
 * 3. Les champs signature_image, signature_presente sont corrects
 */

// Simulation du state du wizard avec signature
const mockWizardState = {
  signature: {
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    timestamp: '2025-08-22T10:30:00.000Z'
  },
  invoiceNumber: 'TEST-001',
  client: {
    name: 'Test Client',
    email: 'test@example.com'
  },
  produits: [
    {
      name: 'Produit Test',
      quantity: 1,
      priceTTC: 100,
      priceHT: 83.33
    }
  ],
  paiement: {
    method: 'Espèces'
  },
  advisorName: 'Test Conseiller',
  termsAccepted: true
};

// Simulation de la fonction createInvoice du store
function createInvoice(state) {
  return {
    invoiceNumber: state.invoiceNumber,
    clientName: state.client.name,
    clientEmail: state.client.email,
    products: state.produits.map(p => ({
      name: p.name,
      quantity: p.quantity,
      priceTTC: p.priceTTC,
      priceHT: p.priceHT
    })),
    paymentMethod: state.paiement.method,
    
    // 🎯 SIGNATURE - NOUVELLE STRUCTURE
    signature: state.signature.dataUrl || '',
    isSigned: !!state.signature.dataUrl,
    signatureDate: state.signature.dataUrl ? state.signature.timestamp || new Date().toISOString() : undefined,
    
    advisorName: state.advisorName || '',
    termsAccepted: state.termsAccepted,
  };
}

// Test du payload N8N
function testSignaturePayload(invoice) {
  console.log('🧪 TEST SIGNATURE DANS PAYLOAD N8N');
  console.log('='.repeat(50));
  
  // Simulation du payload N8N (extrait du service)
  const webhookPayload = {
    numero_facture: invoice.invoiceNumber,
    nom_du_client: invoice.clientName,
    
    // 🎯 CHAMPS SIGNATURE
    signature: invoice.isSigned ? 'Oui' : 'Non',
    signature_presente: invoice.isSigned ? 'Oui' : 'Non',
    signature_image: invoice.signature || '', // ✅ SIGNATURE BASE64 COMPLÈTE
    date_signature: invoice.signatureDate || '',
    
    // Autres champs
    mode_paiement: invoice.paymentMethod,
    conseiller: invoice.advisorName,
  };
  
  console.log('📦 Payload N8N généré :');
  console.log('- signature:', webhookPayload.signature);
  console.log('- signature_presente:', webhookPayload.signature_presente);
  console.log('- signature_image (preview):', webhookPayload.signature_image.substring(0, 50) + '...');
  console.log('- date_signature:', webhookPayload.date_signature);
  
  // ✅ VÉRIFICATIONS
  console.log('\n🔍 VÉRIFICATIONS :');
  
  const checks = [
    {
      name: 'Signature présente',
      test: webhookPayload.signature_presente === 'Oui',
      value: webhookPayload.signature_presente
    },
    {
      name: 'Signature image non vide',
      test: webhookPayload.signature_image.length > 0,
      value: `${webhookPayload.signature_image.length} caractères`
    },
    {
      name: 'Format data:image valide',
      test: webhookPayload.signature_image.startsWith('data:image/'),
      value: webhookPayload.signature_image.substring(0, 30) + '...'
    },
    {
      name: 'Date signature présente',
      test: webhookPayload.date_signature.length > 0,
      value: webhookPayload.date_signature
    }
  ];
  
  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.value}`);
  });
  
  const allPassed = checks.every(check => check.test);
  
  console.log('\n📊 RÉSULTAT GLOBAL :');
  if (allPassed) {
    console.log('✅ TOUS LES TESTS PASSENT - La signature sera correctement affichée dans l\'email N8N !');
  } else {
    console.log('❌ PROBLÈMES DÉTECTÉS - La signature pourrait ne pas s\'afficher correctement');
  }
  
  return allPassed;
}

// Test avec signature
console.log('🎯 TEST AVEC SIGNATURE');
const invoiceWithSignature = createInvoice(mockWizardState);
const testResult1 = testSignaturePayload(invoiceWithSignature);

console.log('\n' + '='.repeat(50));

// Test sans signature
console.log('🎯 TEST SANS SIGNATURE');
const mockStateNoSignature = {
  ...mockWizardState,
  signature: { dataUrl: '', timestamp: '' }
};
const invoiceNoSignature = createInvoice(mockStateNoSignature);
const testResult2 = testSignaturePayload(invoiceNoSignature);

console.log('\n' + '='.repeat(50));
console.log('📋 RÉSUMÉ FINAL :');
console.log(`✅ Test avec signature: ${testResult1 ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`✅ Test sans signature: ${testResult2 ? 'RÉUSSI (normal)' : 'PROBLÈME'}`);

if (testResult1) {
  console.log('\n🎉 CONCLUSION: La signature devrait s\'afficher correctement dans les emails N8N !');
} else {
  console.log('\n⚠️  CONCLUSION: Il y a un problème avec la transmission de la signature');
}
