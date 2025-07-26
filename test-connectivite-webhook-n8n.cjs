#!/usr/bin/env node

/**
 * 🧪 TEST DE CONNECTIVITÉ WEBHOOK N8N
 * ===================================
 * 
 * Ce script teste la connectivité avec votre webhook N8N
 * en envoyant un payload de test minimaliste.
 */

const https = require('https');
const { URL } = require('url');

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

console.log('🧪 TEST DE CONNECTIVITÉ WEBHOOK N8N');
console.log('====================================');
console.log('');
console.log('🎯 URL:', WEBHOOK_URL);
console.log('');

// Payload de test minimal
const testPayload = {
  numero_facture: 'CONNECTIVITE-TEST-001',
  client_nom: 'Test de connectivité',
  client_email: 'test@myconfort.fr',
  montant_ttc: 100.00,
  description_travaux: 'Test de connectivité webhook',
  date_facture: new Date().toISOString().slice(0, 10),
  test_mode: true,
  timestamp: new Date().toISOString()
};

function testWebhookConnectivity() {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const postData = JSON.stringify(testPayload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-Connectivity-Test/1.0'
      },
      timeout: 10000 // 10 secondes
    };
    
    console.log('📤 Envoi du payload de test...');
    console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');
    
    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📥 RÉPONSE REÇUE');
        console.log('================');
        console.log('🔢 Status Code:', res.statusCode);
        console.log('⏱️ Temps de réponse:', responseTime + 'ms');
        console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
        console.log('📄 Body:', data);
        console.log('');
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ SUCCÈS : Webhook N8N accessible et fonctionnel !');
          console.log('🎉 Votre Blueprint peut recevoir les factures de l\'application.');
          resolve({
            success: true,
            statusCode: res.statusCode,
            responseTime,
            response: data
          });
        } else {
          console.log('⚠️ ATTENTION : Webhook répond mais avec un code d\'erreur');
          console.log('🔍 Vérifiez votre Blueprint N8N et les champs attendus');
          resolve({
            success: false,
            statusCode: res.statusCode,
            responseTime,
            response: data,
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log('❌ ERREUR DE CONNEXION');
      console.log('======================');
      console.log('⏱️ Temps écoulé:', responseTime + 'ms');
      console.log('🔍 Erreur:', error.message);
      console.log('');
      console.log('❌ ÉCHEC : Impossible de joindre le webhook N8N');
      console.log('🔧 Vérifiez :');
      console.log('   - L\'URL du webhook');
      console.log('   - La connectivité réseau');
      console.log('   - Le statut de votre instance N8N');
      
      resolve({
        success: false,
        responseTime,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('⏰ TIMEOUT : Le webhook N8N ne répond pas dans les 10 secondes');
      console.log('🔧 Vérifiez que votre instance N8N est bien démarrée');
      
      resolve({
        success: false,
        responseTime: 10000,
        error: 'Timeout'
      });
    });
    
    req.write(postData);
    req.end();
  });
}

// Exécution du test
async function runTest() {
  try {
    const result = await testWebhookConnectivity();
    
    console.log('');
    console.log('📊 RÉSUMÉ DU TEST');
    console.log('=================');
    
    if (result.success) {
      console.log('🎯 Statut : ✅ SUCCÈS');
      console.log('⚡ Performance : ' + result.responseTime + 'ms');
      console.log('🚀 Prêt pour production : OUI');
    } else {
      console.log('🎯 Statut : ❌ ÉCHEC');
      console.log('🔍 Problème : ' + result.error);
      console.log('🚀 Prêt pour production : NON');
    }
    
    console.log('');
    console.log('📝 PROCHAINES ÉTAPES :');
    
    if (result.success) {
      console.log('✅ Testez maintenant l\'envoi d\'une vraie facture depuis l\'application');
      console.log('✅ Vérifiez la réception dans votre Google Drive');
      console.log('✅ Contrôlez l\'ajout des données dans Google Sheets');
      console.log('✅ Testez l\'envoi d\'email au client');
    } else {
      console.log('❌ Corrigez le problème de connectivité N8N');
      console.log('❌ Vérifiez l\'URL du webhook dans le code');
      console.log('❌ Redémarrez votre instance N8N si nécessaire');
      console.log('❌ Relancez ce test de connectivité');
    }
    
  } catch (error) {
    console.log('❌ ERREUR INATTENDUE :', error.message);
  }
}

runTest();
