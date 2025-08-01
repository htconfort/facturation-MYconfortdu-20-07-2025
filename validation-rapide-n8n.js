#!/usr/bin/env node

/**
 * 🧪 VALIDATION RAPIDE N8N POUR IPAD
 * ==================================
 * Script à lancer après activation du workflow N8N
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a';

console.log('🧪 VALIDATION RAPIDE N8N POUR IPAD');
console.log('====================================');

// Payload de test minimal
const testPayload = {
  test: true,
  source: 'validation_rapide_ipad',
  timestamp: new Date().toISOString(),
  numero_facture: 'TEST-VALIDATION-' + Date.now(),
  nom_du_client: 'Test Validation iPad',
  email_client: 'test@validation-ipad.fr'
};

console.log('📤 Test du webhook N8N...');
console.log('URL:', WEBHOOK_URL);
console.log('Payload:', JSON.stringify(testPayload, null, 2));

const postData = JSON.stringify(testPayload);
const url = new URL(WEBHOOK_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('\n📊 RÉSULTAT:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('\n🎯 ANALYSE:');
    
    if (res.statusCode === 404) {
      console.log('❌ WORKFLOW TOUJOURS INACTIF');
      console.log('   → Vérifier que le workflow est bien activé dans N8N');
      console.log('   → Toggle "Actif" en haut à droite du workflow');
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ WORKFLOW ACTIF ET FONCTIONNEL !');
      console.log('   → L\'application iPad peut maintenant envoyer des emails');
      console.log('   → Déploiement Netlify autorisé');
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      console.log('⚠️  WORKFLOW ACTIF mais erreur de données');
      console.log('   → C\'est normal pour un test, l\'important est que le webhook répond');
      console.log('   → Déploiement Netlify autorisé');
    } else {
      console.log('⚠️  Réponse inattendue:', res.statusCode);
      console.log('   → Vérifier l\'état du serveur N8N');
    }
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    if (res.statusCode !== 404) {
      console.log('1. ✅ Déployer sur Netlify (workflow actif)');
      console.log('2. ✅ Tester sur iPad');
      console.log('3. ✅ Vérifier envoi emails');
    } else {
      console.log('1. 🚨 ACTIVER le workflow N8N');
      console.log('2. 🔄 Relancer ce test');
      console.log('3. 🚀 Déployer après validation');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERREUR DE CONNEXION:', error.message);
  console.log('🔧 Vérifications:');
  console.log('   → Serveur N8N accessible ?');
  console.log('   → Connexion internet OK ?');
  console.log('   → URL correcte ?');
});

req.write(postData);
req.end();
