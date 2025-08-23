#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC RAPIDE N8N - Application MyConfort
 */

console.log('🚀 DIAGNOSTIC RAPIDE: Pourquoi les factures ne partent pas\n');

// 1. Test direct de l'URL N8N
console.log('📡 Test 1: Webhook N8N accessible');
try {
  const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: 'diagnostic-rapide' })
  });
  
  if (response.ok) {
    console.log('✅ N8N webhook: ACCESSIBLE');
  } else {
    console.log('❌ N8N webhook: ERREUR', response.status);
  }
} catch (error) {
  console.log('❌ N8N webhook: TIMEOUT/RÉSEAU');
}

// 2. Vérifier la configuration Vite.config pour le proxy
console.log('\n🔄 Test 2: Configuration proxy développement');
console.log('📁 Vérifiez dans vite.config.ts le proxy N8N:');
console.log(`
server: {
  proxy: {
    '/api/n8n': {
      target: 'https://n8n.srv765811.hstgr.cloud',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/n8n/, '')
    }
  }
}
`);

console.log('\n📋 CAUSES PROBABLES:');
console.log('1. 🔧 Variables env manquantes (.env local)');
console.log('2. 🔄 Proxy Vite non configuré pour dev');
console.log('3. 📦 Données facture malformées');
console.log('4. 🚫 CORS bloqué en développement');
console.log('5. ⏱️ Timeout trop court');

console.log('\n💡 ACTIONS:');
console.log('1. Créer .env avec VITE_N8N_WEBHOOK_URL');
console.log('2. Vérifier vite.config.ts proxy N8N');
console.log('3. Vérifier console navigateur pour erreurs');
console.log('4. Tester en mode production Netlify');
