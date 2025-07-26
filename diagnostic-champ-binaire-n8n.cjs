#!/usr/bin/env node

/**
 * DIAGNOSTIC SPÉCIALISÉ N8N - CHAMP BINAIRE 'DATA'
 * ================================================
 * 
 * Ce script teste spécifiquement le format des données binaires
 * que N8N attend pour le node Google Drive.
 * 
 * ERREUR À RÉSOUDRE :
 * "The item has no binary field 'data' [item 0]"
 * 
 * TESTS :
 * 1. Format standard FormData avec nom 'data'
 * 2. Format avec Content-Disposition filename
 * 3. Format avec Content-Type explicite
 * 4. Format JSON avec données binaires encodées
 * 5. Test de réception côté N8N
 */

const fs = require('fs');

// Configuration
const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
const TEST_PDF_BASE64 = 'JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nH2QwQrCMBBE/yXXHtqkTUyPIlpBELQF76E7TSp2E0Ky/XyTNkWwBGZ2mHkPdgZMGI1MlzNIJBBMzCMK1pFmJPULI8YMogcJJxEKq8bxRiEjt0OsQkJKpvF4hItdEhStCUhEE3Cqt4aIMnhJfRNjNXkxPWxRnvlnlSXTZzDmGUOHEVMt5EHCGhMYE1tpQoAMNjJkQBJl5dF7R3qGZmOGgr4O4YCNzx6AcCzc3R3mNAP6OIIq8b3jTLJb7YZpYkr3Y0JNHJmJgCkBg9wHBsGgIGhbFPsHJEJJt5MFdlTrGQUTBaIOJ7JKRzrGpXi0P3sAyxHJIeRw==';

console.log('🔍 DIAGNOSTIC CHAMP BINAIRE N8N - DÉBUT');
console.log('🎯 URL Webhook:', WEBHOOK_URL);
console.log('📄 Taille PDF test:', Math.floor(TEST_PDF_BASE64.length * 0.75), 'bytes');
console.log('');

/**
 * Convertit base64 en Buffer (Node.js)
 */
function base64ToBuffer(base64) {
  return Buffer.from(base64, 'base64');
}

/**
 * TEST 1 : Format FormData standard avec champ 'data'
 */
async function test1_FormatStandard() {
  console.log('📋 TEST 1 : Format FormData standard');
  
  try {
    const formData = new FormData();
    const pdfBuffer = base64ToBuffer(TEST_PDF_BASE64);
    
    // Champ 'data' comme attendu par N8N
    formData.append('data', pdfBuffer, {
      filename: 'test-facture.pdf',
      contentType: 'application/pdf'
    });
    
    // Quelques champs métadonnées
    formData.append('numero_facture', 'TEST-001');
    formData.append('client_nom', 'Test Client');
    formData.append('montant_ttc', '100.00');
    
    console.log('📤 Envoi avec champ "data" standard...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'DIAGNOSTIC-N8N/1.0'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    console.log('📋 Body:', responseText.slice(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    if (response.ok) {
      console.log('✅ TEST 1 RÉUSSI - Format standard accepté');
    } else {
      console.log('❌ TEST 1 ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST 1:', error.message);
  }
  
  console.log('');
}

/**
 * TEST 2 : Format avec Content-Disposition explicite
 */
async function test2_ContentDisposition() {
  console.log('📋 TEST 2 : Format avec Content-Disposition explicite');
  
  try {
    const formData = new FormData();
    const pdfBuffer = base64ToBuffer(TEST_PDF_BASE64);
    
    // Champ 'data' avec headers explicites
    formData.append('data', pdfBuffer, {
      filename: 'facture-test.pdf',
      contentType: 'application/pdf',
      knownLength: pdfBuffer.length
    });
    
    formData.append('numero_facture', 'TEST-002');
    formData.append('client_nom', 'Test Client 2');
    
    console.log('📤 Envoi avec Content-Disposition explicite...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'DIAGNOSTIC-N8N/2.0'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 300) + '...');
    
    if (response.ok) {
      console.log('✅ TEST 2 RÉUSSI - Content-Disposition OK');
    } else {
      console.log('❌ TEST 2 ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST 2:', error.message);
  }
  
  console.log('');
}

/**
 * TEST 3 : Format JSON avec base64 inline
 */
async function test3_JsonBase64() {
  console.log('📋 TEST 3 : Format JSON avec base64 inline');
  
  try {
    const payload = {
      numero_facture: 'TEST-003',
      client_nom: 'Test Client 3',
      montant_ttc: 150.00,
      data: {
        filename: 'facture-json.pdf',
        mimeType: 'application/pdf',
        data: TEST_PDF_BASE64
      }
    };
    
    console.log('📤 Envoi JSON avec data base64...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DIAGNOSTIC-N8N/3.0'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 300) + '...');
    
    if (response.ok) {
      console.log('✅ TEST 3 RÉUSSI - JSON base64 OK');
    } else {
      console.log('❌ TEST 3 ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST 3:', error.message);
  }
  
  console.log('');
}

/**
 * TEST 4 : Format mixte FormData + JSON
 */
async function test4_MixteFormDataJson() {
  console.log('📋 TEST 4 : Format mixte FormData + JSON');
  
  try {
    const formData = new FormData();
    const pdfBuffer = base64ToBuffer(TEST_PDF_BASE64);
    
    // PDF en binaire
    formData.append('data', pdfBuffer, 'facture-mixte.pdf');
    
    // Métadonnées en JSON
    const metadata = {
      numero_facture: 'TEST-004',
      client_nom: 'Test Client 4',
      montant_ttc: 200.00,
      description_travaux: 'Test diagnostic N8N'
    };
    
    formData.append('metadata', JSON.stringify(metadata));
    
    console.log('📤 Envoi mixte FormData + JSON...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'DIAGNOSTIC-N8N/4.0'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 300) + '...');
    
    if (response.ok) {
      console.log('✅ TEST 4 RÉUSSI - Format mixte OK');
    } else {
      console.log('❌ TEST 4 ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST 4:', error.message);
  }
  
  console.log('');
}

/**
 * TEST 5 : Diagnostic des headers reçus par N8N
 */
async function test5_DiagnosticHeaders() {
  console.log('📋 TEST 5 : Diagnostic des headers N8N');
  
  try {
    const formData = new FormData();
    const pdfBuffer = base64ToBuffer(TEST_PDF_BASE64);
    
    formData.append('data', pdfBuffer, {
      filename: 'diagnostic.pdf',
      contentType: 'application/pdf'
    });
    
    formData.append('debug_test', 'TEST-005');
    formData.append('debug_timestamp', new Date().toISOString());
    formData.append('debug_message', 'Diagnostic headers et format données binaires');
    
    console.log('📤 Envoi avec données de diagnostic...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'DIAGNOSTIC-N8N/5.0',
        'X-Debug': 'headers-analysis'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📄 Content-Type réponse:', response.headers.get('content-type'));
    console.log('📋 Body:', responseText);
    
    // Analyse de la réponse pour des indices
    if (responseText.includes('binary field')) {
      console.log('🔍 Confirmation : N8N cherche un champ binaire');
    }
    
    if (responseText.includes('data')) {
      console.log('🔍 Le champ "data" est mentionné dans la réponse');
    }
    
    if (response.ok) {
      console.log('✅ TEST 5 RÉUSSI - Diagnostic complet');
    } else {
      console.log('❌ TEST 5 : Réponse d\'erreur analysée');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST 5:', error.message);
  }
  
  console.log('');
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('🚀 DÉMARRAGE DIAGNOSTIC COMPLET N8N');
  console.log('');
  
  await test1_FormatStandard();
  await test2_ContentDisposition();
  await test3_JsonBase64();
  await test4_MixteFormDataJson();
  await test5_DiagnosticHeaders();
  
  console.log('');
  console.log('🏁 DIAGNOSTIC TERMINÉ');
  console.log('');
  console.log('🔍 ANALYSE DES RÉSULTATS :');
  console.log('- Si TEST 1 réussit : Format standard OK');
  console.log('- Si TEST 2 réussit : Headers explicites requis');
  console.log('- Si TEST 3 réussit : N8N accepte JSON avec base64');
  console.log('- Si TEST 4 réussit : Format mixte supporté');
  console.log('- Si TEST 5 donne des indices : Analyser la réponse');
  console.log('');
  console.log('🎯 PROCHAINES ÉTAPES :');
  console.log('1. Identifier le format qui fonctionne');
  console.log('2. Adapter le service n8nBlueprintWebhookService.ts');
  console.log('3. Tester avec une vraie facture depuis l\'application');
  console.log('4. Vérifier la cascade Drive/Sheets/Email');
}

// Exécution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  test1_FormatStandard,
  test2_ContentDisposition,
  test3_JsonBase64,
  test4_MixteFormDataJson,
  test5_DiagnosticHeaders
};
