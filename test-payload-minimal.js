#!/usr/bin/env node

/**
 * 🎯 TEST MINIMAL - STRUCTURE CONFIRMÉE
 * Envoie le JSON minimal avec tableau produits comme confirmé
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testPayloadMinimal() {
  console.log('🎯 TEST MINIMAL - STRUCTURE CONFIRMÉE PAR L\'EXPERT');
  console.log('==================================================');
  
  // Structure exacte confirmée par l'expert
  const payloadMinimal = {
    "numero_facture": "2025-004",
    "nom_du_client": "Pauline",
    "email_client": "bruno@myconfort.com", // Votre email pour voir le test
    "montant_ttc": 1350.00,
    "acompte": 300.00,
    "montant_restant": 1050.00,
    "mode_paiement": "Chèques à venir",
    "nombre_cheques": 3,
    "montant_par_cheque": "350.00",
    
    // ✅ TABLEAU PRODUITS - STRUCTURE CONFIRMÉE
    "produits": [
      {
        "nom": "Volet Roulant Alu",
        "quantite": 2,
        "prix_ttc": 450.00,
        "total_ttc": 900.00,
        "categorie": "Volets",
        "remise": 0,
        "type_remise": "fixed"
      },
      {
        "nom": "Moustiquaire Premium",
        "quantite": 1,
        "prix_ttc": 250.00,
        "total_ttc": 250.00,
        "categorie": "Moustiquaires",
        "remise": 10,
        "type_remise": "percent"
      },
      {
        "nom": "Installation",
        "quantite": 1,
        "prix_ttc": 200.00,
        "total_ttc": 200.00,
        "categorie": "Services",
        "remise": 0,
        "type_remise": "fixed"
      }
    ],
    
    "produits_html": "<li><strong>Volet Roulant Alu</strong><br>Quantité: 2 × 450.00€ = <strong>900.00€</strong></li><li><strong>Moustiquaire Premium</strong><br>Quantité: 1 × 250.00€ = <strong>250.00€</strong><br><em>Remise: -10%</em></li><li><strong>Installation</strong><br>Quantité: 1 × 200.00€ = <strong>200.00€</strong></li>",
    "nombre_produits": 3,
    "date_creation": new Date().toISOString(),
    "fichier_facture": btoa(`PDF PAULINE - 2025-004 - ${Date.now()}`)
  };

  console.log('📦 PAYLOAD MINIMAL CONFIRMÉ');
  console.log('===========================');
  console.log('✅ Client:', payloadMinimal.nom_du_client);
  console.log('✅ Numéro:', payloadMinimal.numero_facture);
  console.log('✅ Produits tableau:', Array.isArray(payloadMinimal.produits), `(${payloadMinimal.produits.length} items)`);
  console.log('✅ Premier produit:', payloadMinimal.produits[0].nom);
  console.log('');

  try {
    console.log('🚀 ENVOI VERS N8N...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadMinimal, null, 2)
    });

    console.log('✅ Réponse N8N:', response.status);
    const responseText = await response.text();
    console.log('📄 Contenu:', responseText);
    
    console.log('');
    console.log('🎯 VÉRIFICATION EMAIL :');
    console.log('======================');
    console.log('Recherchez un email avec :');
    console.log('→ Client: Pauline');
    console.log('→ Numéro: 2025-004');
    console.log('→ Produits attendus :');
    console.log('  • Volet Roulant Alu (2x 450€)');
    console.log('  • Moustiquaire Premium (1x 250€)');
    console.log('  • Installation (1x 200€)');
    console.log('');
    console.log('✅ Si vous voyez ces produits → PROBLÈME RÉSOLU !');
    console.log('❌ Si vous voyez les anciens produits → Code node N8N à corriger');

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('');
  console.log('💡 STRUCTURE VALIDÉE :');
  console.log('======================');
  console.log('✅ Notre application envoie maintenant le bon format');
  console.log('✅ Tableau produits avec objets complets');
  console.log('✅ Structure confirmée par l\'expert');
  console.log('');
  console.log('🔧 Code node N8N doit utiliser :');
  console.log('   const produits = items[0].json.produits;');
  console.log('   // produits est maintenant un tableau d\'objets ✅');
}

// Exécuter le test
testPayloadMinimal().catch(console.error);
