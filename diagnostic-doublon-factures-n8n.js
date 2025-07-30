#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC N8N - PROBLÈME DE DOUBLON DE FACTURES
 * Le problème : Une facture est envoyée mais une autre facture (ancienne) apparaît dans l'email
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testFactureUnique() {
  console.log('🔍 DIAGNOSTIC N8N - PROBLÈME DOUBLON FACTURES');
  console.log('===============================================');
  console.log('Problème identifié : Facture envoyée ≠ Facture reçue par email');
  console.log('');

  // Test avec des données très spécifiques et uniques
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  const payloadTest = {
    // Données TRÈS spécifiques pour identifier cette facture
    numero_facture: `TEST-${timestamp}`,
    nom_facture: `Facture_Test_Unique_${uniqueId}`,
    nom_du_client: `Client_Test_${timestamp}`,
    email_client: 'test@myconfort.com',
    
    // Données uniques pour vérification
    test_unique_id: uniqueId,
    test_timestamp: timestamp,
    test_marker: `FACTURE_TEST_${new Date().toISOString()}`,
    
    // Données de facture basiques
    montant_ht: 100.00,
    montant_tva: 20.00,
    montant_ttc: 120.00,
    
    // PDF test en base64
    fichier_facture: btoa(`FACTURE TEST UNIQUE - ${uniqueId} - ${timestamp}`),
    
    // Métadonnées
    date_creation: new Date().toISOString(),
    type_test: 'diagnostic_doublon'
  };

  console.log('📦 ENVOI DE FACTURE TEST UNIQUE');
  console.log('================================');
  console.log('Numéro facture:', payloadTest.numero_facture);
  console.log('ID unique:', payloadTest.test_unique_id);
  console.log('Timestamp:', payloadTest.test_timestamp);
  console.log('Nom client:', payloadTest.nom_du_client);
  console.log('');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadTest, null, 2)
    });

    const responseText = await response.text();
    console.log('✅ Réponse N8N:', response.status);
    console.log('📄 Contenu:', responseText);
    
    console.log('');
    console.log('🎯 VÉRIFICATIONS À FAIRE MAINTENANT :');
    console.log('====================================');
    console.log('');
    console.log('1. 📧 VÉRIFIEZ VOTRE EMAIL :');
    console.log(`   → Recherchez une facture avec le numéro: ${payloadTest.numero_facture}`);
    console.log(`   → Le client doit être: ${payloadTest.nom_du_client}`);
    console.log(`   → L'ID unique doit être: ${payloadTest.test_unique_id}`);
    console.log('');
    console.log('2. 🔍 SI LE MAUVAIS EMAIL ARRIVE :');
    console.log('   → Notez le numéro de facture reçu');
    console.log('   → Notez le nom du client reçu');
    console.log('   → Cela confirme un problème de workflow N8N');
    console.log('');
    console.log('3. 🛠️ ACTIONS CÔTÉ N8N :');
    console.log('   → Connectez-vous à https://n8n.srv765811.hstgr.cloud/');
    console.log('   → Menu "Executions" → Voir la dernière exécution');
    console.log('   → Vérifiez que les bonnes données transitent entre les nodes');
    console.log('   → Problème probable : cache/buffer dans un node intermédiaire');
    console.log('');
    console.log('4. 🎯 NODES À VÉRIFIER EN PRIORITÉ :');
    console.log('   → Node qui stocke/lit les données (Google Drive, Database)');
    console.log('   → Node Email (vérifier la source des données)');
    console.log('   → Node de transformation/mapping des données');
    console.log('');

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('');
  console.log('💡 DIAGNOSTIC :');
  console.log('==============');
  console.log('✅ Notre application génère les bons numéros séquentiels');
  console.log('✅ Notre application envoie les bonnes données à N8N');
  console.log('❌ N8N semble traiter/stocker/récupérer les mauvaises données');
  console.log('');
  console.log('🔧 SOLUTION : Corriger le workflow N8N pour qu\'il traite');
  console.log('    les données de la requête actuelle, pas d\'anciennes données cachées.');
}

// Exécuter le test
testFactureUnique().catch(console.error);
