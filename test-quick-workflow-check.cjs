#!/usr/bin/env node

/**
 * 🧪 TEST RAPIDE DU WORKFLOW N8N
 * ===============================
 * 
 * Script pour vérifier rapidement si le workflow N8N est actif
 * À lancer après avoir activé le workflow dans l'interface N8N
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

console.log('🧪 TEST RAPIDE - WORKFLOW N8N ACTIF ?');
console.log('=====================================');
console.log('🎯 URL:', WEBHOOK_URL);
console.log('');

// Payload minimal de test
const testPayload = {
  numero_facture: 'QUICK-TEST-001',
  client_nom: 'Test Rapide',
  client_email: 'test@myconfort.fr',
  client_telephone: '0123456789',
  montant_ht: 100,
  montant_ttc: 120,
  date_facture: new Date().toISOString().split('T')[0],
  test_mode: true,
  timestamp: new Date().toISOString(),
  quick_check: true
};

const postData = JSON.stringify(testPayload);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'MyConfort-QuickTest/1.0'
  },
  timeout: 10000
};

console.log('📤 Envoi payload de test...');
console.log('⏱️ Timeout: 10 secondes');
console.log('');

const startTime = Date.now();

const req = https.request(WEBHOOK_URL, options, (res) => {
  const responseTime = Date.now() - startTime;
  
  console.log('📥 RÉPONSE REÇUE');
  console.log('================');
  console.log('🔢 Status Code:', res.statusCode);
  console.log('⏱️ Temps de réponse:', responseTime + 'ms');
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('');
    
    if (res.statusCode === 200) {
      console.log('✅ SUCCÈS ! LE WORKFLOW EST ACTIF');
      console.log('🎉 Le webhook N8N répond correctement');
      console.log('');
      console.log('📄 Réponse:', body || 'OK');
      console.log('');
      console.log('🚀 PRÊT POUR L\'APPLICATION !');
      console.log('Vous pouvez maintenant envoyer des factures depuis l\'app');
      
    } else if (res.statusCode === 404) {
      console.log('❌ WORKFLOW INACTIF');
      console.log('🔧 Action requise: Activez le workflow dans N8N');
      console.log('🎯 Allez dans N8N > Votre workflow > Toggle en haut à droite');
      console.log('');
      try {
        const errorData = JSON.parse(body);
        if (errorData.hint) {
          console.log('💡 Conseil N8N:', errorData.hint);
        }
      } catch (e) {
        console.log('📄 Message:', body);
      }
      
    } else if (res.statusCode >= 500) {
      console.log('⚠️ ERREUR SERVEUR N8N');
      console.log('🔧 Le workflow est peut-être actif mais il y a une erreur');
      console.log('📄 Réponse:', body);
      console.log('');
      console.log('💡 Vérifiez les logs N8N pour plus de détails');
      
    } else {
      console.log('❓ STATUT INATTENDU');
      console.log('📄 Réponse:', body);
    }
    
    console.log('');
    console.log('📊 RÉSUMÉ');
    console.log('==========');
    console.log('🎯 Workflow actif:', res.statusCode === 200 ? '✅ OUI' : '❌ NON');
    console.log('🔗 Connectivité:', responseTime < 5000 ? '✅ OK' : '⚠️ LENTE');
    console.log('🚀 Prêt production:', res.statusCode === 200 ? '✅ OUI' : '❌ NON');
  });
});

req.on('error', (error) => {
  const responseTime = Date.now() - startTime;
  
  console.log('❌ ERREUR DE CONNEXION');
  console.log('=======================');
  console.log('⏱️ Après:', responseTime + 'ms');
  console.log('🔍 Erreur:', error.message);
  console.log('');
  
  if (error.code === 'ENOTFOUND') {
    console.log('🌐 Problème DNS - Vérifiez l\'URL');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('🚫 Connexion refusée - Serveur N8N éteint ?');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('⏰ Timeout - Serveur N8N trop lent');
  }
  
  console.log('');
  console.log('📊 RÉSUMÉ');
  console.log('==========');
  console.log('🎯 Workflow actif: ❓ INCONNU');
  console.log('🔗 Connectivité: ❌ ÉCHEC');
  console.log('🚀 Prêt production: ❌ NON');
});

req.on('timeout', () => {
  req.destroy();
  console.log('⏰ TIMEOUT - Pas de réponse après 10 secondes');
});

req.write(postData);
req.end();
