#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC N8N WEBHOOK - Test de connexion
 * ===============================================
 * Script pour tester la connexion au webhook N8N
 */

console.log('🚀 DIAGNOSTIC N8N WEBHOOK - Début du test\n');

// Test 1: URL directe N8N
const testDirectConnection = async () => {
  console.log('📡 TEST 1: Connexion directe N8N');
  const url = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
  
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Test de connexion depuis diagnostic'
  };

  try {
    console.log(`🔗 URL testée: ${url}`);
    console.log('📦 Payload test:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📤 Headers envoyés:', {
      'Content-Type': 'application/json'
    });

    const responseText = await response.text();
    console.log('📥 Réponse brute:', responseText);

    if (response.ok) {
      console.log('✅ Connexion directe N8N: RÉUSSIE\n');
      return true;
    } else {
      console.log('❌ Connexion directe N8N: ÉCHEC\n');
      return false;
    }

  } catch (error) {
    console.error('💥 Erreur connexion directe:', error.message);
    console.log('❌ Connexion directe N8N: ERREUR\n');
    return false;
  }
};

// Test 2: URL via proxy (si disponible)
const testProxyConnection = async () => {
  console.log('🔄 TEST 2: Connexion via proxy local');
  
  // Vérifier si on est en mode dev avec proxy
  const proxyUrl = 'http://localhost:5173/api/n8n/webhook/facture-universelle';
  
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Test de connexion via proxy'
  };

  try {
    console.log(`🔗 URL proxy testée: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log('📥 Réponse brute:', responseText);

    if (response.ok) {
      console.log('✅ Connexion proxy: RÉUSSIE\n');
      return true;
    } else {
      console.log('❌ Connexion proxy: ÉCHEC\n');
      return false;
    }

  } catch (error) {
    console.error('💥 Erreur connexion proxy:', error.message);
    console.log('❌ Connexion proxy: ERREUR (normal si pas en mode dev)\n');
    return false;
  }
};

// Test principal
const runDiagnostic = async () => {
  console.log('🎯 Démarrage du diagnostic N8N...\n');
  
  const directOk = await testDirectConnection();
  const proxyOk = await testProxyConnection();
  
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC:');
  console.log(`✅ Connexion directe N8N: ${directOk ? 'OK' : 'ÉCHEC'}`);
  console.log(`🔄 Connexion proxy: ${proxyOk ? 'OK' : 'ÉCHEC/NON_DISPONIBLE'}`);
  
  if (directOk) {
    console.log('\n🎉 DIAGNOSTIC: N8N est accessible et fonctionnel !');
    console.log('💡 Problème possible: données de facture ou configuration app');
  } else {
    console.log('\n⚠️ DIAGNOSTIC: Problème de connexion N8N détecté');
    console.log('💡 Vérifiez: URL webhook, firewall, CORS');
  }
};

// Exécution
runDiagnostic().catch(console.error);
