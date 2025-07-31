#!/usr/bin/env node

/**
 * 🔍 TEST MODE DE PAIEMENT - VÉRIFICATION AFFICHAGE EMAIL
 * Teste spécifiquement l'envoi du mode de paiement vers N8N
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testModePaiementAffichage() {
  console.log('🔍 TEST MODE DE PAIEMENT - VÉRIFICATION AFFICHAGE EMAIL');
  console.log('====================================================');
  
  // Test avec différents modes de paiement
  const payloadsTest = [
    {
      test: "1 - Paiement Chèque classique",
      payload: {
        "numero_facture": "TEST-MODE-001",
        "nom_du_client": "Client Test Chèque",
        "email_client": "bruno@myconfort.com",
        "montant_ttc": 1500.00,
        "acompte": 0,
        "montant_restant": 1500.00,
        "mode_paiement": "Chèque",
        "nombre_cheques": 0,
        "montant_par_cheque": "",
        "produits": [
          {
            "nom": "Test Produit",
            "quantite": 1,
            "prix_unitaire_ttc": 1500.00,
            "categorie": "Test"
          }
        ],
        "fichier_facture": "dGVzdCBwZGY=",
        "date_creation": new Date().toISOString()
      }
    },
    {
      test: "2 - Paiement Chèques à venir",
      payload: {
        "numero_facture": "TEST-MODE-002",
        "nom_du_client": "Client Test Chèques à venir",
        "email_client": "bruno@myconfort.com",
        "montant_ttc": 2400.00,
        "acompte": 400.00,
        "montant_restant": 2000.00,
        "mode_paiement": "Chèques à venir",
        "nombre_cheques": 4,
        "montant_par_cheque": "500.00",
        "produits": [
          {
            "nom": "Test Produit Échelonné",
            "quantite": 1,
            "prix_unitaire_ttc": 2400.00,
            "categorie": "Test"
          }
        ],
        "fichier_facture": "dGVzdCBwZGY=",
        "date_creation": new Date().toISOString()
      }
    },
    {
      test: "3 - Paiement Virement",
      payload: {
        "numero_facture": "TEST-MODE-003",
        "nom_du_client": "Client Test Virement",
        "email_client": "bruno@myconfort.com",
        "montant_ttc": 800.00,
        "acompte": 200.00,
        "montant_restant": 600.00,
        "mode_paiement": "Virement bancaire",
        "nombre_cheques": 0,
        "montant_par_cheque": "",
        "produits": [
          {
            "nom": "Test Produit Virement",
            "quantite": 1,
            "prix_unitaire_ttc": 800.00,
            "categorie": "Test"
          }
        ],
        "fichier_facture": "dGVzdCBwZGY=",
        "date_creation": new Date().toISOString()
      }
    }
  ];

  for (const testCase of payloadsTest) {
    console.log(`\n📋 ${testCase.test}`);
    console.log('=' + '='.repeat(testCase.test.length + 3));
    
    console.log(`👤 Client: ${testCase.payload.nom_du_client}`);
    console.log(`💳 Mode de paiement: ${testCase.payload.mode_paiement}`);
    console.log(`💰 Montant TTC: ${testCase.payload.montant_ttc}€`);
    console.log(`📊 Acompte: ${testCase.payload.acompte}€`);
    console.log(`💸 Montant restant: ${testCase.payload.montant_restant}€`);
    
    if (testCase.payload.nombre_cheques > 0) {
      console.log(`📅 Chèques à venir: ${testCase.payload.nombre_cheques} chèque(s) de ${testCase.payload.montant_par_cheque}€`);
    }
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });
      
      const responseText = await response.text();
      console.log(`✅ Status: ${response.status}`);
      console.log(`📧 Réponse: ${responseText}`);
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    console.log('\n⏱️ Attente 3 secondes avant le test suivant...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎯 VÉRIFICATION EMAILS:');
  console.log('=======================');
  console.log('📧 Vérifiez votre boîte email (bruno@myconfort.com)');
  console.log('📋 Vous devriez avoir reçu 3 emails avec les factures test');
  console.log('🔍 VÉRIFIEZ QUE LE MODE DE PAIEMENT APPARAÎT dans chaque email :');
  console.log('   📧 Email 1: "Chèque"');
  console.log('   📧 Email 2: "Chèques à venir" + "4 chèque(s) de 500.00€"');
  console.log('   📧 Email 3: "Virement bancaire"');
  console.log('');
  console.log('❌ Si le mode de paiement n\'apparaît PAS dans les emails :');
  console.log('   👉 Le template email N8N doit être mis à jour');
  console.log('   👉 Vérifiez le champ {{$json.mode_paiement}} dans le template');
  console.log('');
  console.log('✅ Si le mode de paiement apparaît correctement :');
  console.log('   👉 Le problème est résolu !');
  console.log('   👉 L\'application envoie bien les données');
  
}

// Exécuter le test
testModePaiementAffichage().catch(console.error);
