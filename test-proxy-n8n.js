// 🧪 Test rapide du proxy N8N Vite
const testProxyN8n = async () => {
  console.log('🔍 Test du proxy N8N via Vite...');
  
  const testPayload = {
    test: true,
    message: 'Test de connexion proxy N8N',
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log('📤 Envoi vers: /api/n8n/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a');
    
    const response = await fetch('/api/n8n/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Statut réponse:', response.status);
    console.log('📋 Headers réponse:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const responseData = await response.text();
      console.log('✅ Succès proxy N8N!');
      console.log('📦 Réponse:', responseData);
    } else {
      console.error('❌ Erreur proxy:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test proxy:', error);
  }
};

// Lancer le test
testProxyN8n();
