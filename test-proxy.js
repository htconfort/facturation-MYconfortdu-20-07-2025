// Test rapide du proxy depuis la console du navigateur
console.log('🧪 Test du proxy Vite vers N8N');

// Test avec le proxy dev (doit fonctionner sans CORS)
fetch('/api/n8n/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    test: true,
    source: 'PROXY_TEST',
    timestamp: new Date().toISOString(),
    message: 'Test proxy Vite'
  })
})
.then(response => {
  console.log('✅ Proxy test - Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('✅ Proxy test - Response:', data);
})
.catch(error => {
  console.error('❌ Proxy test error:', error);
});

// Test direct (devrait générer une erreur CORS en dev)
setTimeout(() => {
  console.log('🧪 Test direct production (CORS attendu)');
  
  fetch('https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      test: true,
      source: 'DIRECT_TEST',
      timestamp: new Date().toISOString(),
      message: 'Test direct production'
    })
  })
  .then(response => {
    console.log('⚠️ Direct test - Status (unexpected):', response.status);
    return response.text();
  })
  .then(data => {
    console.log('⚠️ Direct test - Response (unexpected):', data);
  })
  .catch(error => {
    console.log('✅ Direct test - CORS error (expected):', error.message);
  });
}, 2000);
