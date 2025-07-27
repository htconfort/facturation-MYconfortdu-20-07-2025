// Script de test avec facture complète
// À exécuter dans la console du navigateur

console.log('🧪 Création d\'une facture de test complète');

// Fonction pour créer une facture test complète
function createTestInvoice() {
  return {
    invoiceNumber: "TEST-2025-001",
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: "lyon",
    
    // Informations client complètes
    clientName: "Jean Dupont",
    clientEmail: "jean.dupont@test.com",
    clientPhone: "0123456789",
    clientAddress: "123 Rue de la Paix",
    clientCity: "Lyon",
    clientPostalCode: "69000",
    clientHousingType: "Maison",
    clientDoorCode: "A1234",
    clientSiret: "",
    
    // Conseiller
    advisorName: "Marie Martin",
    
    // Produits (au moins 1 requis)
    products: [
      {
        name: "Matelas Bambou 140x190",
        category: "Matelas",
        quantity: 1,
        unitPriceHT: 400,
        unitPriceTTC: 480,
        discount: 0,
        discountType: "percentage",
        totalTTC: 480
      },
      {
        name: "Oreiller Mémoire",
        category: "Oreillers", 
        quantity: 2,
        unitPriceHT: 50,
        unitPriceTTC: 60,
        discount: 10,
        discountType: "percentage",
        totalTTC: 108
      }
    ],
    
    // Totaux
    totalHT: 490,
    totalTTC: 588,
    totalTVA: 98,
    taxRate: 20,
    
    // Paiement (obligatoire)
    paymentMethod: "Carte bancaire",
    depositAmount: 200,
    remainingAmount: 388,
    
    // Livraison
    deliveryMethod: "Livraison standard",
    deliveryNotes: "Sonnez 2 fois",
    
    // Notes
    invoiceNotes: "Facture de test générée automatiquement",
    
    // Validation
    termsAccepted: true,
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  };
}

// Fonction pour tester avec cette facture
async function testWithCompleteInvoice() {
  const testInvoice = createTestInvoice();
  
  console.log('📋 Facture de test créée:', testInvoice);
  console.log('✅ Champs obligatoires remplis:');
  console.log('  - clientAddress:', testInvoice.clientAddress);
  console.log('  - clientCity:', testInvoice.clientCity);
  console.log('  - clientPostalCode:', testInvoice.clientPostalCode);
  console.log('  - products:', testInvoice.products.length, 'produits');
  console.log('  - paymentMethod:', testInvoice.paymentMethod);
  
  // Test avec le service N8N
  if (window.N8nWebhookService) {
    console.log('🧪 Test avec payload simplifié...');
    
    try {
      const result = await window.N8nWebhookService.testSimplifiedPayload(testInvoice);
      console.log('📥 Résultat test:', result);
    } catch (error) {
      console.error('❌ Erreur test:', error);
    }
  } else {
    console.warn('⚠️ Service N8N non disponible dans window');
  }
}

// Exporter pour utilisation
window.createTestInvoice = createTestInvoice;
window.testWithCompleteInvoice = testWithCompleteInvoice;

console.log('✅ Fonctions de test créées. Utilisez:');
console.log('  - createTestInvoice() pour créer une facture test');
console.log('  - testWithCompleteInvoice() pour tester avec N8N');
