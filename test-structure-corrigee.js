#!/usr/bin/env node

/**
 * 🎯 TEST FINAL - STRUCTURE PRODUITS CORRIGÉE
 * Vérifier que la correction de structure produits résout le problème
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testStructureCorrigee() {
  console.log('🎯 TEST FINAL - STRUCTURE PRODUITS CORRIGÉE');
  console.log('============================================');
  console.log('Structure N8N confirmée : tableau d\'objets avec return [{ json: data }]');
  console.log('');

  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substr(2, 9);

  // Test avec la NOUVELLE structure corrigée
  const payloadCorrige = {
    // Données de base
    numero_facture: `CORRECTED-${timestamp}`,
    nom_du_client: `Client_Structure_Corrigée_${uniqueId}`,
    email_client: 'bruno@myconfort.com', // Votre vraie adresse pour voir le résultat
    montant_ttc: 1500.00,
    
    // ✅ NOUVELLE STRUCTURE PRODUITS - TABLEAU D'OBJETS
    produits: [
      {
        nom: "Volet Roulant Alu Premium",
        quantite: 2,
        prix_ttc: 550.00,
        prix_ht: 458.33,
        total_ttc: 1100.00,
        total_ht: 916.66,
        categorie: "Volets Roulants",
        remise: 0,
        type_remise: "fixed"
      },
      {
        nom: "Moustiquaire Enroulable",
        quantite: 1,
        prix_ttc: 200.00,
        prix_ht: 166.67,
        total_ttc: 200.00,
        total_ht: 166.67,
        categorie: "Moustiquaires",
        remise: 10,
        type_remise: "percent"
      },
      {
        nom: "Installation + Pose",
        quantite: 1,
        prix_ttc: 200.00,
        prix_ht: 166.67,
        total_ttc: 200.00,
        total_ht: 166.67,
        categorie: "Services",
        remise: 0,
        type_remise: "fixed"
      }
    ],
    
    // HTML généré depuis le tableau (comme notre app le fait)
    produits_html: `
      <li><strong>Volet Roulant Alu Premium</strong><br>
       Quantité: 2 × 550.00€ = <strong>1100.00€</strong>
      </li>
      <li><strong>Moustiquaire Enroulable</strong><br>
       Quantité: 1 × 200.00€ = <strong>200.00€</strong><br>
       <em>Remise: -10%</em>
      </li>
      <li><strong>Installation + Pose</strong><br>
       Quantité: 1 × 200.00€ = <strong>200.00€</strong>
      </li>
    `,
    
    // Métadonnées produits
    nombre_produits: 3,
    produits_text: "2x Volet Roulant Alu Premium, 1x Moustiquaire Enroulable, 1x Installation + Pose",
    
    // Autres champs requis
    montant_ht: 1250.00,
    montant_tva: 250.00,
    acompte: 300.00,
    montant_restant: 1200.00,
    mode_paiement: "Chèques à venir",
    nombre_cheques: 4,
    montant_par_cheque: "300.00",
    
    // Métadonnées
    date_creation: new Date().toISOString(),
    fichier_facture: btoa(`PDF STRUCTURE CORRIGÉE - ${uniqueId} - ${timestamp}`)
  };

  console.log('📦 PAYLOAD AVEC STRUCTURE CORRIGÉE');
  console.log('==================================');
  console.log('✅ produits (tableau d\'objets):', payloadCorrige.produits.length, 'produits');
  console.log('✅ produits_html présent:', payloadCorrige.produits_html ? 'OUI' : 'NON');
  console.log('✅ produits_text présent:', payloadCorrige.produits_text ? 'OUI' : 'NON');
  console.log('');
  
  console.log('🔍 Structure produits[0]:');
  console.log(JSON.stringify(payloadCorrige.produits[0], null, 2));
  console.log('');

  try {
    console.log('🚀 ENVOI VERS N8N...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadCorrige, null, 2)
    });

    console.log('✅ Réponse N8N:', response.status);
    const responseText = await response.text();
    console.log('📄 Contenu:', responseText);
    
    console.log('');
    console.log('🎯 VÉRIFICATION DANS VOTRE EMAIL :');
    console.log('=================================');
    console.log('');
    console.log('📧 Recherchez un email avec :');
    console.log(`   → Client: ${payloadCorrige.nom_du_client}`);
    console.log(`   → Numéro: ${payloadCorrige.numero_facture}`);
    console.log('');
    console.log('✅ Si vous voyez maintenant :');
    console.log('   → Volet Roulant Alu Premium (2x 550€)');
    console.log('   → Moustiquaire Enroulable (1x 200€)');
    console.log('   → Installation + Pose (1x 200€)');
    console.log('   → PROBLÈME RÉSOLU ! 🎉');
    console.log('');
    console.log('❌ Si vous voyez encore les anciens produits :');
    console.log('   → Le Code node N8N ne lit toujours pas le tableau');
    console.log('   → Vérifiez le code du node N8N');
    console.log('   → Il doit faire : items[0].json.produits');
    console.log('');

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('');
  console.log('💡 RÉSUMÉ DE LA CORRECTION :');
  console.log('===========================');
  console.log('✅ Application modifiée : produits = tableau d\'objets');
  console.log('✅ Structure N8N respectée : [{ json: data }]');
  console.log('✅ Données complètes : nom, quantite, prix_ttc, etc.');
  console.log('');
  console.log('🔧 Code node N8N doit être :');
  console.log('   return [{ json: { ...items[0].json } }];');
  console.log('');
  console.log('📧 Email doit utiliser :');
  console.log('   {{ $json.produits_html }} ou boucler sur {{ $json.produits }}');
}

// Exécuter le test final
testStructureCorrigee().catch(console.error);
