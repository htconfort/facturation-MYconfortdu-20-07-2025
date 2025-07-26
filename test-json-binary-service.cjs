#!/usr/bin/env node

/**
 * TEST DU SERVICE JSON BINAIRE N8N
 * ===============================
 * 
 * Ce script teste le nouveau service n8nJsonBinaryService
 * qui envoie les données au format JSON avec binary.data
 * que N8N peut traiter nativement.
 */

const fs = require('fs');

// Configuration
const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

// Simulation d'une facture de test
const mockInvoice = {
  invoiceNumber: 'TEST-JSON-BIN-001',
  invoiceDate: '2025-01-20',
  clientName: 'Client Test JSON Binary',
  clientEmail: 'test-json-binary@myconfort.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue du Test',
  clientCity: 'Paris',
  clientPostalCode: '75001',
  
  products: [
    {
      name: 'MATELAS BAMBOU TEST',
      quantity: 1,
      priceTTC: 890,
      description: 'Matelas test pour JSON binary'
    },
    {
      name: 'OREILLER TEST',
      quantity: 2,
      priceTTC: 55,
      description: 'Oreiller test'
    }
  ],
  
  taxRate: 20,
  montantAcompte: 100,
  paymentMethod: 'Carte bancaire',
  advisorName: 'Test Advisor',
  invoiceNotes: 'Test du service JSON binary N8N'
};

// PDF de test en base64
const TEST_PDF_BASE64 = 'JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nH2QwQrCMBBE/yXXHtqkTUyPIlpBELQF76E7TSp2E0Iy/XyTNkWwBGZ2mHkPdgZMGI1MlzNIJBBMzCMK1pFmJPULI8YMogcJJxEKq8bxRiEjt0OsQkJKpvF4hItdEhStCUhEE3Cqt4aIMnhJfRNjNXkxPWxRnvlnlSXTZzDmGUOHEVMt5EHCGhMYE1tpQoAMNjJkQBJl5dF7R3qGZmOGgr4O4YCNzx6AcCzc3R3mNAP6OIIq8b3jTLJb7YZpYkr3Y0JNHJmJgCkBg9wHBsGgIGhbFPsHJEJJt5MFdlTrGQUTBaIOJ7JKRzrGpXi0P3sAyxHJIeRw==';

console.log('🧪 TEST SERVICE JSON BINAIRE N8N');
console.log('🎯 URL:', WEBHOOK_URL);
console.log('📄 Facture de test:', mockInvoice.invoiceNumber);
console.log('👤 Client:', mockInvoice.clientName);
console.log('');

/**
 * Simulation de l'adapter N8N
 */
function adaptForN8nBlueprint(invoice, pdfBase64) {
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + (product.quantity * product.priceTTC);
  }, 0);
  
  const totalHT = totalTTC / (1 + (20 / 100)); // 20% TVA
  const montantTVA = totalTTC - totalHT;
  const acompte = invoice.montantAcompte || 0;
  
  const descriptionTravaux = invoice.products.length > 0 
    ? invoice.products.map(p => `${p.name} (x${p.quantity})`).join(', ')
    : 'Services MyConfort';
  
  const adresseComplete = [
    invoice.clientAddress,
    invoice.clientPostalCode,
    invoice.clientCity
  ].filter(Boolean).join(', ');
  
  const dateFacture = invoice.invoiceDate || new Date().toISOString().slice(0, 10);
  const dateEcheance = new Date(dateFacture);
  dateEcheance.setDate(dateEcheance.getDate() + 30);
  
  const payload = {
    numero_facture: invoice.invoiceNumber || 'INCONNU',
    date_facture: dateFacture,
    date_echeance: dateEcheance.toISOString().slice(0, 10),
    
    client_nom: invoice.clientName || 'INCONNU',
    client_email: invoice.clientEmail || 'INCONNU',
    client_telephone: invoice.clientPhone || '',
    client_adresse: adresseComplete,
    client_ville: invoice.clientCity || '',
    client_code_postal: invoice.clientPostalCode || '',
    
    montant_ht: Math.round(totalHT * 100) / 100,
    montant_tva: Math.round(montantTVA * 100) / 100,
    montant_ttc: Math.round(totalTTC * 100) / 100,
    montant_acompte: Math.round(acompte * 100) / 100,
    
    description_travaux: descriptionTravaux,
    mode_paiement: invoice.paymentMethod || 'Non spécifié',
    conseiller: invoice.advisorName || 'MYCONFORT',
    notes_facture: invoice.invoiceNotes || '',
    
    statut_facture: 'En attente',
    type_facture: 'Facture standard'
  };
  
  return { payload };
}

/**
 * Test du service JSON binaire
 */
async function testJsonBinaryService() {
  try {
    console.log('🔄 PRÉPARATION DU PAYLOAD JSON BINAIRE...');
    
    // 1. Adapter les données de base
    const { payload } = adaptForN8nBlueprint(mockInvoice, TEST_PDF_BASE64);
    
    // 2. Format JSON avec binary data N8N-compatible
    const jsonPayload = {
      // Toutes les métadonnées normales
      ...payload,
      
      // Format binary spécifique N8N
      binary: {
        data: {
          mimeType: 'application/pdf',
          fileName: `Facture_${payload.numero_facture}.pdf`,
          data: TEST_PDF_BASE64,
          size: Math.floor(TEST_PDF_BASE64.length * 0.75)
        }
      },
      
      // Informations de debug pour N8N
      _debug: {
        source: 'TEST-SCRIPT',
        format: 'JSON-BINARY',
        timestamp: new Date().toISOString(),
        pdf_size_base64: TEST_PDF_BASE64.length,
        pdf_size_estimated: Math.floor(TEST_PDF_BASE64.length * 0.75)
      }
    };
    
    console.log('✅ Payload JSON binaire généré:');
    console.log('📊 Taille payload JSON:', JSON.stringify(jsonPayload).length, 'caractères');
    console.log('📄 PDF intégré:', jsonPayload.binary.data.fileName);
    console.log('💰 Montant TTC:', jsonPayload.montant_ttc, '€');
    console.log('👤 Client:', jsonPayload.client_nom);
    console.log('');
    
    // 3. Envoi JSON pur
    console.log('📤 ENVOI JSON BINAIRE VERS N8N...');
    
    const startTime = Date.now();
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-TestScript/1.0'
      },
      body: JSON.stringify(jsonPayload)
    });
    
    const responseTime = Date.now() - startTime;
    
    // 4. Traitement de la réponse
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { 
        raw: responseText,
        message: 'Réponse non-JSON reçue'
      };
    }
    
    console.log('📥 RÉPONSE N8N JSON BINAIRE:');
    console.log('🔢 Status:', response.status);
    console.log('⏱️ Temps de réponse:', responseTime, 'ms');
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    console.log('📋 Body:', JSON.stringify(responseData, null, 2));
    console.log('');
    
    if (response.ok) {
      console.log('✅ SUCCESS ! N8N A REÇU LE JSON BINAIRE');
      console.log('🎉 Le workflow devrait maintenant traiter le binary.data');
      console.log('🔍 Vérifiez les executions N8N pour voir si Google Drive reçoit le fichier');
      
      return {
        success: true,
        status: response.status,
        responseTime,
        data: responseData
      };
      
    } else {
      console.log('❌ ERREUR ! N8N A REJETÉ LE JSON BINAIRE');
      console.log('🔍 Status', response.status, 'indique un problème côté workflow');
      
      // Analyse spécifique des erreurs
      if (responseText.includes('binary field')) {
        console.log('💡 DIAGNOSTIC: Le node Google Drive cherche encore le champ "data"');
        console.log('🔧 SOLUTION: Vérifiez le mapping dans le node Google Drive');
        console.log('   Utilisez: {{ $json.binary.data }} au lieu de {{ $binary.data }}');
      }
      
      return {
        success: false,
        status: response.status,
        responseTime,
        data: responseData
      };
    }
    
  } catch (error) {
    console.error('❌ ERREUR TEST JSON BINAIRE:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test de connectivité simple
 */
async function testConnectivity() {
  console.log('🔍 TEST CONNECTIVITÉ BASIQUE...');
  
  try {
    const testPayload = {
      test_connectivity: true,
      timestamp: new Date().toISOString(),
      source: 'test-script'
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📥 Status connectivité:', response.status);
    
    if (response.ok) {
      console.log('✅ Connectivité OK - Webhook N8N accessible');
    } else {
      console.log('⚠️ Webhook accessible mais retourne une erreur');
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur connectivité:', error.message);
    console.log('');
  }
}

/**
 * Exécution des tests
 */
async function runTests() {
  console.log('🚀 DÉMARRAGE TESTS JSON BINAIRE');
  console.log('');
  
  // Test 1: Connectivité basique
  await testConnectivity();
  
  // Test 2: Service JSON binaire complet
  const result = await testJsonBinaryService();
  
  console.log('');
  console.log('🏁 TESTS TERMINÉS');
  console.log('');
  
  if (result.success) {
    console.log('🎯 PROCHAINES ÉTAPES:');
    console.log('1. Intégrer n8nJsonBinaryService dans l\'application');
    console.log('2. Remplacer n8nBlueprintWebhookService par cette version');
    console.log('3. Tester depuis l\'application avec le bouton "📤 Drive"');
    console.log('4. Vérifier Google Drive, Sheets, Email');
  } else {
    console.log('🔧 ACTIONS REQUISES:');
    console.log('1. Vérifier la configuration du workflow N8N');
    console.log('2. S\'assurer que le node Google Drive map {{ $json.binary.data }}');
    console.log('3. Activer "Binary Data" sur le node Webhook si pas fait');
    console.log('4. Consulter les logs N8N pour plus de détails');
  }
}

// Exécution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testJsonBinaryService,
  testConnectivity
};
