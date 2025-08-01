// 🧪 TEST URL N8N DEPUIS L'APPLICATION
// Testez ce script dans la console de votre navigateur

console.log('🔍 DIAGNOSTIC URL N8N DANS L\'APPLICATION');
console.log('==========================================');

// Test 1: Vérifier quelle URL est configurée
console.log('\n📋 CONFIGURATION ACTUELLE:');

// Simuler les imports pour voir la configuration
const testConfig = {
  webhookUrl: import.meta?.env?.VITE_N8N_WEBHOOK_URL || 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle'
};

console.log('URL configurée:', testConfig.webhookUrl);
console.log('Environment:', import.meta?.env?.MODE);
console.log('Is Production:', import.meta?.env?.PROD);
console.log('Is Development:', import.meta?.env?.DEV);

// Test 2: Tester le WebhookUrlHelper
console.log('\n🔧 TEST WEBHOOKURLHELPER:');

try {
  // Simuler la logique du WebhookUrlHelper
  const isProd = import.meta?.env?.PROD;
  const isLocalhost = window.location.hostname === 'localhost';
  
  let webhookUrl;
  if (isProd || isLocalhost) {
    webhookUrl = '/api/n8n/webhook/facture-universelle';
    console.log('✅ Utilise proxy:', webhookUrl);
  } else {
    webhookUrl = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
    console.log('✅ Utilise URL directe:', webhookUrl);
  }
} catch (error) {
  console.log('❌ Erreur WebhookUrlHelper:', error);
}

// Test 3: Test direct de connexion
console.log('\n📤 TEST CONNEXION DIRECTE:');

// Test proxy (en développement)
fetch('/api/n8n/webhook/facture-universelle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    test: 'debug_from_app',
    source: 'browser_console',
    timestamp: new Date().toISOString()
  })
})
.then(response => {
  console.log('📊 Proxy test - Status:', response.status);
  if (response.status === 404) {
    console.log('❌ Erreur 404 sur proxy - Vérifiez Vite config');
  } else {
    console.log('✅ Proxy fonctionne');
  }
  return response.text();
})
.then(data => console.log('📄 Proxy response:', data))
.catch(error => console.log('❌ Proxy error:', error));

// Test URL directe
setTimeout(() => {
  fetch('https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      test: 'debug_direct',
      source: 'browser_console_direct',
      timestamp: new Date().toISOString()
    })
  })
  .then(response => {
    console.log('📊 Direct test - Status:', response.status);
    if (response.status === 404) {
      console.log('❌ Erreur 404 sur URL directe - Workflow N8N inactif');
    } else {
      console.log('✅ URL directe fonctionne');
    }
    return response.text();
  })
  .then(data => console.log('📄 Direct response:', data))
  .catch(error => console.log('❌ Direct error (CORS attendu):', error));
}, 1000);

console.log('\n🎯 INSTRUCTIONS:');
console.log('1. Copiez ce script dans la console de votre navigateur');
console.log('2. Ouvrez http://localhost:5173');
console.log('3. Appuyez F12 → Console');
console.log('4. Collez et exécutez ce script');
console.log('5. Regardez les résultats pour identifier le problème');
