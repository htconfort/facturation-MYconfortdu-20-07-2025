#!/usr/bin/env node

/**
 * 🔍 VÉRIFICATION STRUCTURE PRODUITS - APPLICATION VS N8N
 * L'expert a raison : vérifions si nous envoyons le bon format de "produits"
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function verifierStructureProduits() {
  console.log('🔍 VÉRIFICATION STRUCTURE PRODUITS - APP VS N8N');
  console.log('===============================================');
  console.log('Expert dit : "Si le champ produits n\'est PAS trouvé ou mal formaté,');
  console.log('N8N utilise un HTML codé en dur avec des anciens exemples"');
  console.log('');

  // TEST 1: Ce que notre application envoie actuellement
  console.log('📦 TEST 1: STRUCTURE ACTUELLE DE NOTRE APPLICATION');
  console.log('=================================================');
  
  const structureActuelle = {
    // 🔍 CE QUE NOTRE APP ENVOIE ACTUELLEMENT
    produits: "2x Volet Roulant, 1x Installation", // ❌ CHAÎNE DE CARACTÈRES
    produits_html: "<li><strong>Volet</strong><br>Quantité: 2 × 450€</li>",
    produits_noms: ["Volet Roulant", "Installation"],
    produits_quantites: [2, 1],
    nombre_produits: 2
  };
  
  console.log('Structure actuelle (produits = chaîne) :');
  console.log(JSON.stringify(structureActuelle, null, 2));
  console.log('');
  
  // TEST 2: Structure que N8N attend peut-être
  console.log('📦 TEST 2: STRUCTURE ATTENDUE PAR N8N (TABLEAU)');
  console.log('==============================================');
  
  const structureAttendue = {
    // 🔍 CE QUE N8N ATTEND PEUT-ÊTRE
    produits: [ // ✅ TABLEAU D'OBJETS
      {
        name: "Volet Roulant Alu",
        quantity: 2,
        priceTTC: 450.00,
        total: 900.00
      },
      {
        name: "Installation",
        quantity: 1,
        priceTTC: 450.00,
        total: 450.00
      }
    ],
    produits_html: "<li><strong>Volet</strong><br>Quantité: 2 × 450€</li>",
    nombre_produits: 2
  };
  
  console.log('Structure attendue (produits = tableau) :');
  console.log(JSON.stringify(structureAttendue, null, 2));
  console.log('');

  // TEST 3: Envoyer la structure actuelle (pour confirmer le problème)
  console.log('🚀 TEST 3: ENVOI STRUCTURE ACTUELLE (CHAÎNE)');
  console.log('===========================================');
  
  try {
    const payloadActuel = {
      numero_facture: `TEST-CHAINE-${Date.now()}`,
      nom_du_client: 'Client Test Structure Chaîne',
      email_client: 'test@myconfort.com',
      montant_ttc: 1350.00,
      
      // 🔍 STRUCTURE ACTUELLE (CHAÎNE)
      produits: "2x Volet Roulant Alu, 1x Installation", // CHAÎNE
      produits_html: "<li><strong>Volet Roulant Alu</strong><br>Quantité: 2 × 450.00€ = <strong>900.00€</strong></li>",
      produits_noms: ["Volet Roulant Alu", "Installation"],
      nombre_produits: 2,
      
      date_creation: new Date().toISOString(),
      fichier_facture: btoa(`PDF TEST STRUCTURE CHAINE - ${Date.now()}`)
    };

    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadActuel)
    });
    
    console.log('✅ Envoi structure chaîne - Status:', response1.status);
    console.log('📄 Response:', await response1.text());
    
  } catch (error) {
    console.log('❌ Erreur structure chaîne:', error.message);
  }

  console.log('');
  
  // TEST 4: Envoyer la structure tableau (pour voir si ça corrige)
  console.log('🚀 TEST 4: ENVOI STRUCTURE TABLEAU');
  console.log('=================================');
  
  try {
    const payloadTableau = {
      numero_facture: `TEST-TABLEAU-${Date.now()}`,
      nom_du_client: 'Client Test Structure Tableau',
      email_client: 'test@myconfort.com',
      montant_ttc: 1350.00,
      
      // 🔍 STRUCTURE TABLEAU (OBJETS)
      produits: [ // TABLEAU D'OBJETS
        {
          name: "Volet Roulant Alu",
          quantity: 2,
          priceTTC: 450.00,
          total: 900.00,
          category: "Volets"
        },
        {
          name: "Installation",
          quantity: 1,
          priceTTC: 450.00,
          total: 450.00,
          category: "Services"
        }
      ],
      produits_html: "<li><strong>Volet Roulant Alu</strong><br>Quantité: 2 × 450.00€ = <strong>900.00€</strong></li><li><strong>Installation</strong><br>Quantité: 1 × 450.00€ = <strong>450.00€</strong></li>",
      nombre_produits: 2,
      
      date_creation: new Date().toISOString(),
      fichier_facture: btoa(`PDF TEST STRUCTURE TABLEAU - ${Date.now()}`)
    };

    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadTableau)
    });
    
    console.log('✅ Envoi structure tableau - Status:', response2.status);
    console.log('📄 Response:', await response2.text());
    
  } catch (error) {
    console.log('❌ Erreur structure tableau:', error.message);
  }

  console.log('');
  console.log('🎯 RÉSULTATS À VÉRIFIER :');
  console.log('========================');
  console.log('');
  console.log('1. 📧 VÉRIFIEZ VOS EMAILS :');
  console.log('   → Email "Client Test Structure Chaîne" (produits = chaîne)');
  console.log('   → Email "Client Test Structure Tableau" (produits = tableau)');
  console.log('');
  console.log('2. 🔍 COMPARAISON :');
  console.log('   → Si les 2 emails ont les MÊMES anciens produits = Problème N8N');
  console.log('   → Si l\'email TABLEAU a les bons produits = Problème structure APP');
  console.log('');
  console.log('3. 🛠️ CORRECTION SI STRUCTURE APP :');
  console.log('   → Modifier n8nWebhookService.ts');
  console.log('   → Changer "produits" de chaîne vers tableau d\'objets');
  console.log('');
  console.log('💡 L\'expert a peut-être raison : le problème pourrait être');
  console.log('    la structure du champ "produits" côté application !');
}

// Exécuter la vérification
verifierStructureProduits().catch(console.error);
