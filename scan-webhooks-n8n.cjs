#!/usr/bin/env node

/**
 * 🔍 SCAN DES WEBHOOKS N8N POSSIBLES
 * ===================================
 * 
 * Teste différents noms de webhook possibles
 */

const https = require('https');

const BASE_URL = 'https://n8n.srv765811.hstgr.cloud/webhook';
const POSSIBLE_WEBHOOKS = [
  'blueprint-workflow-facture-universel',
  'facture-universelle',
  'workflow-facture-universel',
  'blueprint-facture',
  'facture-blueprint',
  'facture-myconfort',
  'myconfort-facture',
  'workflow-facture',
  'facture-workflow'
];

console.log('🔍 SCAN DES WEBHOOKS N8N POSSIBLES');
console.log('===================================');
console.log('');

const testWebhook = (webhookName) => {
  return new Promise((resolve) => {
    const url = `${BASE_URL}/${webhookName}`;
    
    const testPayload = JSON.stringify({
      test: true,
      webhook_name: webhookName,
      timestamp: new Date().toISOString()
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPayload)
      },
      timeout: 5000
    };

    const startTime = Date.now();
    const req = https.request(url, options, (res) => {
      const responseTime = Date.now() - startTime;
      
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          name: webhookName,
          status: res.statusCode,
          responseTime,
          body: body.substring(0, 200),
          active: res.statusCode !== 404
        });
      });
    });

    req.on('error', () => {
      resolve({
        name: webhookName,
        status: 'ERROR',
        responseTime: Date.now() - startTime,
        body: 'Connection failed',
        active: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: webhookName,
        status: 'TIMEOUT',
        responseTime: 5000,
        body: 'Request timeout',
        active: false
      });
    });

    req.write(testPayload);
    req.end();
  });
};

const scanWebhooks = async () => {
  console.log('📡 Test de', POSSIBLE_WEBHOOKS.length, 'webhooks possibles...');
  console.log('');

  const results = [];
  
  for (const webhook of POSSIBLE_WEBHOOKS) {
    process.stdout.write(`⏳ ${webhook}... `);
    const result = await testWebhook(webhook);
    results.push(result);
    
    if (result.active) {
      console.log(`✅ ACTIF (${result.status}) - ${result.responseTime}ms`);
    } else if (result.status === 404) {
      console.log(`❌ Inactif (404) - ${result.responseTime}ms`);
    } else {
      console.log(`⚠️ ${result.status} - ${result.responseTime}ms`);
    }
  }

  console.log('');
  console.log('📊 RÉSULTATS DU SCAN');
  console.log('====================');

  const activeWebhooks = results.filter(r => r.active);
  const inactiveWebhooks = results.filter(r => !r.active && r.status === 404);
  const errorWebhooks = results.filter(r => !r.active && r.status !== 404);

  if (activeWebhooks.length > 0) {
    console.log('');
    console.log('✅ WEBHOOKS ACTIFS:');
    activeWebhooks.forEach(w => {
      console.log(`   • ${w.name} (${w.status}) - ${w.responseTime}ms`);
      console.log(`     URL: ${BASE_URL}/${w.name}`);
    });
  }

  if (inactiveWebhooks.length > 0) {
    console.log('');
    console.log('❌ WEBHOOKS INACTIFS (404):');
    inactiveWebhooks.forEach(w => {
      console.log(`   • ${w.name} - ${w.responseTime}ms`);
    });
  }

  if (errorWebhooks.length > 0) {
    console.log('');
    console.log('⚠️ WEBHOOKS EN ERREUR:');
    errorWebhooks.forEach(w => {
      console.log(`   • ${w.name} (${w.status}) - ${w.responseTime}ms`);
    });
  }

  console.log('');
  console.log('🎯 RECOMMANDATION:');
  if (activeWebhooks.length > 0) {
    console.log('✅ Utilisez un des webhooks actifs ci-dessus');
    console.log('   Mettez à jour l\'URL dans le service n8nBlueprintWebhookService.ts');
  } else {
    console.log('❌ Aucun webhook actif trouvé');
    console.log('   Vérifiez que vos workflows N8N sont activés');
    console.log('   Ou utilisez un nom de webhook différent');
  }
};

scanWebhooks().catch(console.error);
