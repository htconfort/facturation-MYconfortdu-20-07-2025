#!/usr/bin/env node

/**
 * DIAGNOSTIC N8N - VERSION NAVIGATEUR SIMULÉE
 * ==========================================
 * 
 * Ce script simule le comportement du navigateur pour tester
 * le format exact que notre application envoie à N8N.
 * 
 * RÉSULTAT IMPORTANT DU DIAGNOSTIC PRÉCÉDENT :
 * ✅ N8N accepte le format JSON avec base64 inline (TEST 3)
 * ❌ FormData avec Buffer Node.js ne fonctionne pas
 * 
 * SOLUTION : Tester FormData avec Blob (comme dans le navigateur)
 */

const fs = require('fs');

// Configuration
const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
const TEST_PDF_BASE64 = 'JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nH2QwQrCMBBE/yXXHtqkTUyPIlpBELQF76E7TSp2E0Ky/XyTNkWwBGZ2mHkPdgZMGI1MlzNIJBBMzCMK1pFmJPULI8YMogcJJxEKq8bxRiEjt0OsQkJKpvF4hItdEhStCUhEE3Cqt4aIMnhJfRNjNXkxPWxRnvlnlSXTZzDmGUOHEVMt5EHCGhMYE1tpQoAMNjJkQBJl5dF7R3qGZmOGgr4O4YCNzx6AcCzc3R3mNAP6OIIq8b3jTLJb7YZpYkr3Y0JNHJmJgCkBg9wHBsGgIGhbFPsHJEJJt5MFdlTrGQUTBaIOJ7JKRzrGpXi0P3sAyxHJIeRw==';

console.log('🔍 DIAGNOSTIC N8N - VERSION NAVIGATEUR SIMULÉE');
console.log('🎯 URL Webhook:', WEBHOOK_URL);
console.log('');

/**
 * Simule la fonction base64ToBlob du navigateur en Node.js
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = Buffer.from(base64, 'base64').toString('binary');
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  // Simuler un Blob
  return {
    stream: () => null,
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(byteArray.buffer),
    size: byteArray.length,
    type: mimeType,
    slice: () => null,
    toString: () => `[Blob ${byteArray.length} bytes, type: ${mimeType}]`
  };
}

/**
 * TEST A : Format JSON avec base64 (succès confirmé)
 */
async function testA_JsonBase64() {
  console.log('📋 TEST A : Format JSON avec base64 (re-test)');
  
  try {
    const payload = {
      numero_facture: 'TEST-JSON-001',
      client_nom: 'Client Test JSON',
      client_email: 'test@example.com',
      montant_ttc: 100.00,
      montant_ht: 83.33,
      montant_tva: 16.67,
      description_travaux: 'Test diagnostic JSON',
      date_facture: '2025-01-20',
      mode_paiement: 'Carte bancaire',
      conseiller: 'MYCONFORT',
      
      // PDF en base64 direct
      pdf_data: TEST_PDF_BASE64,
      pdf_filename: 'facture-test-json.pdf',
      pdf_mimetype: 'application/pdf'
    };
    
    console.log('📤 Envoi JSON complet...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MYCONFORT-APP/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 200) + '...');
    
    if (response.ok) {
      console.log('✅ TEST A RÉUSSI - Format JSON fonctionne');
      console.log('🎯 SOLUTION IDENTIFIÉE : Utiliser JSON avec base64');
    } else {
      console.log('❌ TEST A ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST A:', error.message);
  }
  
  console.log('');
}

/**
 * TEST B : Format FormData simulé navigateur
 */
async function testB_FormDataNavigateur() {
  console.log('📋 TEST B : Format FormData simulé navigateur');
  
  try {
    // Simulation de ce que fait notre application
    const formData = new FormData();
    const pdfBlob = base64ToBlob(TEST_PDF_BASE64, 'application/pdf');
    
    // Important : utiliser un File simulé pour mieux correspondre au navigateur
    const pdfFile = new File([pdfBlob], 'facture-test.pdf', {
      type: 'application/pdf'
    });
    
    formData.append('data', pdfFile);
    formData.append('numero_facture', 'TEST-FORM-001');
    formData.append('client_nom', 'Client Test FormData');
    formData.append('montant_ttc', '100.00');
    
    console.log('📤 Envoi FormData simulé navigateur...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'MYCONFORT-APP/1.0'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 200) + '...');
    
    if (response.ok) {
      console.log('✅ TEST B RÉUSSI - FormData navigateur fonctionne');
    } else {
      console.log('❌ TEST B ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST B:', error.message);
  }
  
  console.log('');
}

/**
 * TEST C : Format recommandé pour N8N (basé sur la doc N8N)
 */
async function testC_FormatN8nRecommande() {
  console.log('📋 TEST C : Format recommandé N8N');
  
  try {
    // Format spécifique N8N pour données binaires
    const payload = {
      // Métadonnées de la facture
      numero_facture: 'TEST-N8N-001',
      client_nom: 'Client Test N8N',
      client_email: 'test@myconfort.com',
      montant_ttc: 100.00,
      description_travaux: 'Test format N8N recommandé',
      
      // Données binaires au format N8N
      binary: {
        data: {
          mimeType: 'application/pdf',
          fileName: 'facture-n8n-test.pdf',
          data: TEST_PDF_BASE64
        }
      }
    };
    
    console.log('📤 Envoi format N8N binaire...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MYCONFORT-APP/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    console.log('📥 Réponse Status:', response.status);
    console.log('📋 Body:', responseText.slice(0, 200) + '...');
    
    if (response.ok) {
      console.log('✅ TEST C RÉUSSI - Format N8N binaire fonctionne');
    } else {
      console.log('❌ TEST C ÉCHOUÉ');
    }
    
  } catch (error) {
    console.error('❌ Erreur TEST C:', error.message);
  }
  
  console.log('');
}

/**
 * Créer un File compatible Node.js (polyfill)
 */
class File {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.size = bits.reduce((total, bit) => total + (bit.size || bit.length || 0), 0);
    this.type = options.type || '';
    this.lastModified = Date.now();
    this._bits = bits;
  }
  
  stream() {
    return null;
  }
  
  text() {
    return Promise.resolve('');
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
}

// Polyfill global pour Node.js
if (typeof globalThis.File === 'undefined') {
  globalThis.File = File;
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('🚀 DÉMARRAGE TESTS NAVIGATEUR SIMULÉS');
  console.log('');
  
  await testA_JsonBase64();
  await testB_FormDataNavigateur();
  await testC_FormatN8nRecommande();
  
  console.log('🏁 TESTS TERMINÉS');
  console.log('');
  console.log('🔍 RECOMMANDATIONS :');
  console.log('1. Si TEST A réussit : Utiliser JSON avec base64');
  console.log('2. Si TEST B réussit : FormData navigateur OK');
  console.log('3. Si TEST C réussit : Format N8N binaire optimal');
  console.log('');
  console.log('🎯 PROCHAINE ÉTAPE :');
  console.log('Adapter n8nBlueprintWebhookService.ts avec le format qui fonctionne');
}

// Exécution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testA_JsonBase64,
  testB_FormDataNavigateur,
  testC_FormatN8nRecommande
};
