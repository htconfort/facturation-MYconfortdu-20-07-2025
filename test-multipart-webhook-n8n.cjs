#!/usr/bin/env node

/**
 * 🧪 TEST MULTIPART/FORM-DATA POUR WEBHOOK N8N
 * =============================================
 * 
 * Ce script teste l'envoi multipart/form-data vers votre webhook N8N
 * exactement comme le fait l'application MyConfort.
 */

const https = require('https');
const { URL } = require('url');
const { Buffer } = require('buffer');

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

console.log('🧪 TEST MULTIPART/FORM-DATA WEBHOOK N8N');
console.log('========================================');
console.log('');
console.log('🎯 URL:', WEBHOOK_URL);
console.log('📦 Format: multipart/form-data (comme l\'application)');
console.log('');

// Simulation d'un PDF simple en base64
const testPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSANCj4+Ci9QcmMKPj4KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxIDAgMCAxIDEwMCA3MDAgVG0KKEZOQ1RVUkUgVEVTVCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozMzkKJSVFT0Y=';

// Données de test au format Blueprint N8N
const testPayload = {
  numero_facture: 'TEST-MULTIPART-001',
  date_facture: '2025-07-26',
  date_echeance: '2025-08-25',
  
  client_nom: 'Client Test Multipart',
  client_email: 'test-multipart@myconfort.fr',
  client_telephone: '0123456789',
  client_adresse: '123 Rue du Test, 75001, Paris',
  client_ville: 'Paris',
  client_code_postal: '75001',
  
  montant_ht: 83.33,
  montant_tva: 16.67,
  montant_ttc: 100.00,
  montant_acompte: 0,
  
  description_travaux: 'Test multipart/form-data',
  mode_paiement: 'Test',
  conseiller: 'MYCONFORT Test',
  notes_facture: 'Test d\'envoi multipart vers Blueprint N8N',
  
  statut_facture: 'Test',
  type_facture: 'Facture test'  
};

function createMultipartFormData(fields, pdfBase64) {
  const boundary = '----formdata-myconfort-' + Math.random().toString(16);
  let body = '';
  
  // Ajouter le PDF
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="data"; filename="Facture_${fields.numero_facture}.pdf"\r\n`;
  body += `Content-Type: application/pdf\r\n\r\n`;
  
  // Convertir body en Buffer pour concatener avec PDF
  const bodyBuffer = Buffer.from(body, 'utf8');
  const endBoundary = Buffer.from(`\r\n--${boundary}`, 'utf8');
  
  // Créer le début du multipart
  let parts = [bodyBuffer, pdfBuffer, endBoundary];
  
  // Ajouter tous les champs texte
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      const fieldPart = Buffer.from(
        `\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}\r\n--${boundary}`,
        'utf8'
      );
      parts.push(fieldPart);
    }
  });
  
  // Finaliser le multipart
  const finalBoundary = Buffer.from(`--\r\n`, 'utf8');
  parts.push(finalBoundary);
  
  return {
    boundary,
    body: Buffer.concat(parts)
  };
}

function testMultipartWebhook() {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const { boundary, body } = createMultipartFormData(testPayload, testPdfBase64);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-Multipart-Test/1.0'
      },
      timeout: 15000 // 15 secondes
    };
    
    console.log('📤 Envoi du payload multipart/form-data...');
    console.log('📊 Taille totale:', body.length, 'bytes');
    console.log('📄 PDF inclus:', Math.round(testPdfBase64.length * 0.75), 'bytes');
    console.log('📋 Champs:', Object.keys(testPayload).length);
    console.log('');
    
    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📥 RÉPONSE MULTIPART REÇUE');
        console.log('==========================');
        console.log('🔢 Status Code:', res.statusCode);
        console.log('⏱️ Temps de réponse:', responseTime + 'ms');
        console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
        console.log('📄 Body:', data);
        console.log('');
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ SUCCÈS : Blueprint N8N a reçu le multipart/form-data !');
          console.log('🎉 Votre workflow "Workflow Facture Universel" s\'est déclenché correctement.');
          console.log('🚀 L\'application MyConfort peut maintenant envoyer des factures !');
          resolve({
            success: true,
            statusCode: res.statusCode,
            responseTime,
            response: data
          });
        } else {
          console.log('⚠️ ATTENTION : Blueprint répond avec erreur', res.statusCode);
          
          if (res.statusCode === 500) {
            console.log('🔍 Erreur 500 : Problème dans votre workflow N8N');
            console.log('   - Vérifiez que le workflow est activé');
            console.log('   - Contrôlez les nodes de votre Blueprint');
            console.log('   - Regardez les logs d\'exécution N8N');
          }
          
          resolve({
            success: false,
            statusCode: res.statusCode,
            responseTime,
            response: data,
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log('❌ ERREUR DE CONNEXION MULTIPART');
      console.log('=================================');
      console.log('⏱️ Temps écoulé:', responseTime + 'ms');
      console.log('🔍 Erreur:', error.message);
      console.log('');
      console.log('❌ ÉCHEC : Impossible de joindre le webhook multipart N8N');
      
      resolve({
        success: false,
        responseTime,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('⏰ TIMEOUT : Le webhook multipart N8N ne répond pas');
      
      resolve({
        success: false,
        responseTime: 15000,
        error: 'Timeout multipart'
      });
    });
    
    req.write(body);
    req.end();
  });
}

// Exécution du test
async function runMultipartTest() {
  try {
    const result = await testMultipartWebhook();
    
    console.log('');
    console.log('📊 RÉSUMÉ DU TEST MULTIPART');
    console.log('============================');
    
    if (result.success) {
      console.log('🎯 Statut : ✅ SUCCÈS');
      console.log('⚡ Performance : ' + result.responseTime + 'ms');
      console.log('🚀 Prêt pour production : OUI');
      console.log('📧 Test avec vraie facture : RECOMMANDÉ');
    } else {
      console.log('🎯 Statut : ❌ ÉCHEC');
      console.log('🔍 Problème : ' + result.error);
      console.log('🚀 Prêt pour production : NON');
    }
    
    console.log('');
    console.log('📝 INFORMATIONS BLUEPRINT');
    console.log('==========================');
    console.log('📍 URL mise à jour : ' + WEBHOOK_URL);
    console.log('📦 Format testé : multipart/form-data');
    console.log('📄 PDF inclus : OUI (' + Math.round(testPdfBase64.length * 0.75) + ' bytes)');
    console.log('📋 Champs compatibles : ' + Object.keys(testPayload).length);
    
    if (result.success) {
      console.log('');
      console.log('🎉 FÉLICITATIONS !');
      console.log('===================');
      console.log('✅ Votre Blueprint N8N fonctionne parfaitement');
      console.log('✅ L\'application peut envoyer des factures');
      console.log('✅ Le format multipart/form-data est accepté');
      console.log('✅ Testez maintenant avec une vraie facture !');
    }
    
  } catch (error) {
    console.log('❌ ERREUR INATTENDUE MULTIPART :', error.message);
  }
}

runMultipartTest();
