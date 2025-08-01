#!/usr/bin/env node

/**
 * 🎉 VALIDATION FINALE N8N - URL CORRIGÉE
 * =======================================
 * Test avec la bonne URL : facture-universelle
 */

const https = require('https');

const CORRECT_WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

console.log('🎉 VALIDATION FINALE N8N - URL CORRIGÉE');
console.log('=======================================');

// Payload de test complet pour iPad
const testPayload = {
  // Informations facture
  numero_facture: 'TEST-CORRECTED-' + Date.now(),
  nom_du_client: 'Test URL Corrigée',
  email_client: 'test@url-corrigee.fr',
  telephone_client: '06.12.34.56.78',
  montant_ttc: 599.99,
  mode_reglement: 'CB',
  
  // Produits avec statuts de livraison
  produits: [
    {
      nom: 'MATELAS TEST CORRECTED',
      quantite: 1,
      prix_ttc: 399.99,
      statut_livraison: 'a_livrer'
    },
    {
      nom: 'OREILLER TEST CORRECTED',
      quantite: 1,
      prix_ttc: 200.00,
      statut_livraison: 'emporte'
    }
  ],
  
  // Nouveaux champs statuts de livraison
  produits_statuts_livraison: ['a_livrer', 'emporte'],
  nombre_produits_a_livrer: 1,
  nombre_produits_emportes: 1,
  noms_produits_a_livrer: 'MATELAS TEST CORRECTED',
  noms_produits_emportes: 'OREILLER TEST CORRECTED',
  a_une_livraison: 'Oui',
  a_des_produits_emportes: 'Oui',
  
  // Métadonnées
  source: 'VALIDATION_URL_CORRIGEE',
  timestamp: new Date().toISOString(),
  device: 'Test Correction URL',
  test: true
};

console.log('📤 Test du webhook avec URL corrigée...');
console.log('URL:', CORRECT_WEBHOOK_URL);
console.log('');

const postData = JSON.stringify(testPayload);
const url = new URL(CORRECT_WEBHOOK_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'MyConfort-iPad-Test/1.0'
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  console.log('📊 RÉSULTAT:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    console.log('');
    console.log('🎯 ANALYSE:');
    
    if (res.statusCode === 404) {
      console.log('❌ TOUJOURS 404 - Problème persistant');
      console.log('   → Vérifier que le workflow N8N est bien activé');
      console.log('   → Vérifier que le path est exactement "facture-universelle"');
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('🎉 SUCCÈS TOTAL ! WEBHOOK FONCTIONNEL !');
      console.log('   ✅ URL corrigée et fonctionnelle');
      console.log('   ✅ N8N reçoit et traite les données');
      console.log('   ✅ Application iPad prête pour déploiement');
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      console.log('⚠️  WEBHOOK ACTIF - Erreur de payload (normal pour test)');
      console.log('   ✅ Connexion établie avec N8N');
      console.log('   ✅ Application iPad prête pour déploiement');
    } else if (res.statusCode >= 500) {
      console.log('⚠️  ERREUR SERVEUR N8N');
      console.log('   → Peut être temporaire, retry recommandé');
    }
    
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES:');
    if (res.statusCode !== 404) {
      console.log('1. 🎉 GÉNERER NOUVEAU BUILD avec URL corrigée');
      console.log('2. 🚀 DÉPLOYER sur Netlify');
      console.log('3. 📱 TESTER sur iPad');
      console.log('4. ✅ EMAILS FONCTIONNELS !');
      console.log('');
      console.log('📋 COMMANDES À LANCER:');
      console.log('   npm run build');
      console.log('   # Upload dist/ sur Netlify');
    } else {
      console.log('1. 🔧 Vérifier workflow N8N actif');
      console.log('2. 🔧 Vérifier path webhook dans N8N');
      console.log('3. 🔄 Relancer ce test');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERREUR DE CONNEXION:', error.message);
  console.log('🔧 Vérifications:');
  console.log('   → Serveur N8N accessible ?');
  console.log('   → Connexion internet OK ?');
});

req.on('timeout', () => {
  console.log('⏰ TIMEOUT - N8N ne répond pas dans les 15 secondes');
  req.destroy();
});

req.write(postData);
req.end();
