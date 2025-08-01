#!/usr/bin/env node

/**
 * 🔍 TEST DIAGNOSTIC ERREUR 404 N8N
 * =================================
 * Script pour diagnostiquer pourquoi N8N retourne 404
 */

const https = require('https');

console.log('🔍 DIAGNOSTIC ERREUR 404 N8N');
console.log('============================');

const urls = [
  'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle',
  'https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a',
  'https://n8n.srv765811.hstgr.cloud/healthz'
];

async function testUrl(url, description) {
  console.log(`\n🧪 ${description}`);
  console.log(`URL: ${url}`);
  
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify({
      test: 'diagnostic_404',
      timestamp: new Date().toISOString()
    });
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: urlObj.pathname.includes('healthz') ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'MyConfort-Diagnostic/1.0'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📄 Response: ${data}`);
        
        if (res.statusCode === 404) {
          console.log('❌ 404 - Webhook non trouvé');
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Succès - Webhook accessible');
        } else {
          console.log(`⚠️  Code ${res.statusCode} - À investiguer`);
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Erreur: ${error.message}`);
      resolve(null);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Timeout');
      req.destroy();
      resolve(null);
    });
    
    if (options.method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
}

async function runDiagnostic() {
  console.log('🚀 DÉBUT DU DIAGNOSTIC...\n');
  
  const results = [];
  
  results.push(await testUrl(urls[0], 'Test URL corrigée (facture-universelle)'));
  results.push(await testUrl(urls[1], 'Test ancienne URL (UUID)'));
  results.push(await testUrl(urls[2], 'Test santé serveur N8N'));
  
  console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC:');
  console.log('========================');
  
  const [correctUrl, oldUrl, healthCheck] = results;
  
  if (healthCheck === 200) {
    console.log('✅ Serveur N8N accessible');
  } else {
    console.log('❌ Serveur N8N inaccessible');
  }
  
  if (correctUrl === 200) {
    console.log('✅ URL corrigée fonctionne');
  } else if (correctUrl === 404) {
    console.log('❌ URL corrigée retourne 404');
  }
  
  if (oldUrl === 404) {
    console.log('✅ Ancienne URL bien supprimée (404 attendu)');
  } else if (oldUrl === 200) {
    console.log('⚠️  Ancienne URL fonctionne encore');
  }
  
  console.log('\n🎯 RECOMMANDATIONS:');
  
  if (correctUrl === 404) {
    console.log('🔧 ACTIONS REQUISES:');
    console.log('1. Vérifier que le workflow N8N est ACTIF');
    console.log('2. Vérifier le path exact dans le node Webhook N8N');
    console.log('3. Le path pourrait être différent de "facture-universelle"');
    console.log('4. Accéder à l\'interface N8N pour vérifier');
  } else if (correctUrl === 200) {
    console.log('🎉 WEBHOOK FONCTIONNEL !');
    console.log('1. L\'application peut être déployée');
    console.log('2. Vérifier que l\'app locale utilise la bonne URL');
    console.log('3. Vider le cache navigateur si problème persiste');
  }
}

runDiagnostic().catch(console.error);
