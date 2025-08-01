// 🧪 TEST WEBHOOK URL EN DÉVELOPPEMENT
// Pour tester rapidement si le proxy fonctionne

console.log('🔍 TEST WEBHOOK URL HELPER');

// Simule l'import des modules
if (typeof window !== 'undefined') {
  console.log('Environment:', {
    isProd: false, // Mode dev
    hostname: window.location.hostname,
    href: window.location.href
  });
  
  // Test du proxy avec une simple requête fetch
  const testProxyUrl = '/api/n8n/webhook/facture-universelle';
  
  console.log('🧪 Testing proxy URL:', testProxyUrl);
  
  fetch(testProxyUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('✅ Proxy test response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
  })
  .catch(error => {
    console.log('❌ Proxy test error:', error.message);
  });
}
