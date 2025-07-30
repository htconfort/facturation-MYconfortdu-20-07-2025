#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC N8N - ERREUR 500
 * Script pour diagnostiquer le problème avec le webhook N8N
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testN8nDiagnostic() {
  console.log('🔍 DIAGNOSTIC N8N - ERREUR 500 - VERSION AVANCÉE');
  console.log('=================================================');
  
  // Test 1: Connectivité de base
  console.log('\n📡 TEST 1: Connectivité de base');
  try {
    const response = await fetch(WEBHOOK_URL.replace('/webhook/facture-universelle', '/'), {
      method: 'GET'
    });
    console.log('✅ Serveur N8N accessible:', response.status);
  } catch (error) {
    console.log('❌ Serveur N8N inaccessible:', error.message);
  }
  
  // Test 1b: Vérifier si le webhook existe
  console.log('\n🔍 TEST 1b: Vérification existence webhook');
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    console.log('GET sur webhook - Status:', response.status);
    const text = await response.text();
    console.log('Response GET:', text);
  } catch (error) {
    console.log('❌ Erreur GET webhook:', error.message);
  }
  
  // Test 2: Test avec payload minimal
  console.log('\n📦 TEST 2: Payload minimal');
  try {
    const minimalPayload = {
      test: true,
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalPayload)
    });
    
    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
  } catch (error) {
    console.log('❌ Erreur payload minimal:', error.message);
  }
  
  // Test 3: Test avec les champs essentiels seulement
  console.log('\n📋 TEST 3: Champs essentiels seulement');
  try {
    const essentialPayload = {
      nom_facture: 'Test_Facture_001',
      numero_facture: 'TEST001',
      nom_du_client: 'Test Client',
      email_client: 'test@example.com',
      montant_ttc: 100.00,
      fichier_facture: 'dGVzdCBwZGY=', // "test pdf" en base64
      date_creation: new Date().toISOString()
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(essentialPayload)
    });
    
    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
  } catch (error) {
    console.log('❌ Erreur champs essentiels:', error.message);
  }
  
  // Test 4: Vérifier les headers de réponse
  console.log('\n🔍 TEST 4: Headers de réponse détaillés');
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ diagnostic: true })
    });
    
    console.log('Status:', response.status);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const responseText = await response.text();
    console.log('Body:', responseText);
    
  } catch (error) {
    console.log('❌ Erreur headers:', error.message);
  }
  
  console.log('\n🎯 ACTIONS IMMÉDIATES À FAIRE:');
  console.log('==============================');
  console.log('');
  console.log('🔑 1. CONNECTEZ-VOUS À N8N:');
  console.log('   👉 https://n8n.srv765811.hstgr.cloud/');
  console.log('');
  console.log('📋 2. VÉRIFIEZ LE WORKFLOW:');
  console.log('   ✅ Le workflow doit être ACTIVÉ (toggle ON)');
  console.log('   ✅ Le webhook node doit avoir le chemin: /facture-universelle');
  console.log('   ✅ Cliquez sur "Test workflow" avec un payload simple');
  console.log('');
  console.log('🔍 3. CONSULTEZ LES LOGS:');
  console.log('   👉 Menu "Executions" → Voir les erreurs récentes');
  console.log('   👉 Identifiez quel node échoue exactement');
  console.log('');
  console.log('⚡ 4. PROBLÈMES FRÉQUENTS:');
  console.log('   🔧 Credentials Google Drive expirées');
  console.log('   🔧 Node Email mal configuré');
  console.log('   🔧 Champ requis manquant dans un node');
  console.log('   🔧 Workflow désactivé accidentellement');
  console.log('');
  console.log('📞 5. TEST RAPIDE:');
  console.log('   Testez manuellement dans N8N avec ce payload:');
  console.log('   {');
  console.log('     "test": true,');
  console.log('     "nom_facture": "Test",');
  console.log('     "fichier_facture": "dGVzdA=="');
  console.log('   }');
  console.log('');
  console.log('💡 Une fois le workflow N8N réparé, notre code fonctionnera parfaitement !');
}

// Exécuter le diagnostic
testN8nDiagnostic().catch(console.error);
