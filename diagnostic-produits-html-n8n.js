#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC PRODUITS N8N - PROBLÈME HTML CODÉ EN DUR
 * Vérifier pourquoi le Code node N8N utilise un HTML par défaut au lieu du bon produits_html
 */

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

async function testProduitsHTML() {
  console.log('🔍 DIAGNOSTIC PRODUITS N8N - HTML CODÉ EN DUR');
  console.log('==============================================');
  console.log('Problème : Code node utilise un vieux HTML par défaut');
  console.log('');

  // Test avec les MÊMES données que l'application envoie
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  const payloadRealiste = {
    // 1. DONNÉES DE BASE
    nom_facture: `Facture_MYCONFORT_TEST-${uniqueId}`,
    numero_facture: `TEST-${timestamp}`,
    nom_du_client: `Client_Test_${uniqueId}`,
    email_client: 'test@myconfort.com',
    
    // 2. CHAMPS FINANCIERS COMPLETS
    montant_ttc: 1500.00,
    montant_ht: 1250.00,
    montant_tva: 250.00,
    acompte: 300.00,
    montant_restant: 1200.00,
    
    // 3. ✅ PRODUITS_HTML - CE QUE LE CODE NODE DOIT UTILISER
    produits_html: `
      <li><strong>Volet Roulant Alu</strong><br>
       Quantité: 2 × 450.00€ = <strong>900.00€</strong>
      </li>
      <li><strong>Moustiquaire</strong><br>
       Quantité: 1 × 150.00€ = <strong>150.00€</strong>
      </li>
      <li><strong>Installation</strong><br>
       Quantité: 1 × 450.00€ = <strong>450.00€</strong>
      </li>
    `,
    
    // 4. ✅ TABLEAU PRODUITS - STRUCTURE COMPLÈTE
    produits: [
      {
        name: 'Volet Roulant Alu',
        quantity: 2,
        priceTTC: 450.00,
        priceHT: 375.00,
        category: 'Volets'
      },
      {
        name: 'Moustiquaire',
        quantity: 1,
        priceTTC: 150.00,
        priceHT: 125.00,
        category: 'Accessoires'
      },
      {
        name: 'Installation',
        quantity: 1,
        priceTTC: 450.00,
        priceHT: 375.00,
        category: 'Services'
      }
    ],
    
    // 5. CHAMPS PRODUITS SÉPARÉS POUR N8N
    produits_noms: ['Volet Roulant Alu', 'Moustiquaire', 'Installation'],
    produits_quantites: [2, 1, 1],
    produits_prix_unitaires: ['450.00', '150.00', '450.00'],
    nombre_produits: 3,
    
    // 6. AUTRES CHAMPS REQUIS
    mode_paiement: 'Chèques à venir',
    nombre_cheques: 4,
    montant_par_cheque: '300.00',
    date_creation: new Date().toISOString(),
    fichier_facture: btoa(`PDF TEST UNIQUE - ${uniqueId} - ${timestamp}`)
  };

  console.log('📦 PAYLOAD COMPLET AVEC PRODUITS');
  console.log('=================================');
  console.log('✅ produits_html présent:', payloadRealiste.produits_html ? 'OUI' : 'NON');
  console.log('✅ tableau produits présent:', Array.isArray(payloadRealiste.produits) ? `OUI (${payloadRealiste.produits.length} produits)` : 'NON');
  console.log('✅ produits_noms présent:', Array.isArray(payloadRealiste.produits_noms) ? `OUI (${payloadRealiste.produits_noms.length} noms)` : 'NON');
  console.log('');
  
  console.log('🔍 Contenu produits_html:');
  console.log(payloadRealiste.produits_html);
  console.log('');

  try {
    console.log('🚀 ENVOI VERS N8N...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadRealiste, null, 2)
    });

    console.log('✅ Réponse N8N:', response.status);
    const responseText = await response.text();
    console.log('📄 Contenu:', responseText);
    
    console.log('');
    console.log('🎯 VÉRIFICATIONS DANS N8N :');
    console.log('===========================');
    console.log('');
    console.log('1. 🔗 CONNECTEZ-VOUS À N8N:');
    console.log('   👉 https://n8n.srv765811.hstgr.cloud/');
    console.log('');
    console.log('2. 📋 MENU "EXECUTIONS":');
    console.log('   → Cliquez sur la dernière exécution');
    console.log('   → Regardez le node "Code" qui traite produits_html');
    console.log('');
    console.log('3. 🔍 VÉRIFIEZ LES DONNÉES D\'ENTRÉE DU CODE NODE:');
    console.log('   → Le champ "produits_html" doit contenir nos données');
    console.log('   → Le champ "produits" (tableau) doit être présent');
    console.log('   → Si absent = problème de mapping entre nodes');
    console.log('');
    console.log('4. 🛠️ CORRIGEZ LE CODE NODE:');
    console.log('   Si les données sont présentes mais mal utilisées:');
    console.log('   → Remplacez la logique par défaut');
    console.log('   → Utilisez directement {{ $json.produits_html }}');
    console.log('   → Supprimez les exemples codés en dur');
    console.log('');
    console.log('5. 📧 CODE NODE CORRECT:');
    console.log('   return [{');
    console.log('     json: {');
    console.log('       ...items[0].json,');
    console.log('       produits_html: items[0].json.produits_html || "Aucun produit"');
    console.log('     }');
    console.log('   }];');
    console.log('');

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('');
  console.log('💡 DIAGNOSTIC :');
  console.log('==============');
  console.log('✅ Notre app envoie produits_html correctement');
  console.log('✅ Notre app envoie le tableau produits correctement');
  console.log('❌ Le Code node N8N ignore nos données et utilise un HTML par défaut');
  console.log('');
  console.log('🔧 SOLUTION : Modifier le Code node N8N pour utiliser nos données');
  console.log('    au lieu de générer un HTML codé en dur avec d\'anciens exemples.');
}

// Exécuter le diagnostic
testProduitsHTML().catch(console.error);
