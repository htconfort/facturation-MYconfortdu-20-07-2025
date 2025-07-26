#!/usr/bin/env node

/**
 * TEST D'INTÉGRATION COMPLÈTE MYCONFORT → N8N
 * ===========================================
 * 
 * Ce script teste l'intégralité du processus d'envoi d'une facture
 * depuis l'application MyConfort vers le workflow N8N, exactement
 * comme le ferait un utilisateur en cliquant sur le bouton "📤 Drive".
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Configuration exacte de l'application
const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
const TIMEOUT_MS = 30000;

console.log('🎯 TEST D\'INTÉGRATION COMPLÈTE MYCONFORT → N8N');
console.log('===============================================\n');

// Données de test réalistes (identiques à l'application)
const mockInvoice = {
  invoiceNumber: 'FAC-2025-001',
  invoiceDate: '2025-01-20',
  dueDate: '2025-02-19',
  clientName: 'Jean Dupont',
  clientEmail: 'jean.dupont@email.com',
  clientPhone: '0123456789',
  clientAddress: '123 Avenue des Champs',
  clientCity: 'Paris',
  clientPostalCode: '75008',
  
  products: [
    {
      name: 'MATELAS BAMBOU PREMIUM',
      quantity: 1,
      unitPrice: 799.00,
      totalPrice: 799.00
    },
    {
      name: 'OREILLER FLOCON ERGONOMIQUE',
      quantity: 2,
      unitPrice: 89.50,
      totalPrice: 179.00
    }
  ],
  
  subtotal: 978.00,
  vat: 195.60,
  total: 1173.60,
  advancePayment: 100.00,
  
  paymentMethod: 'Chèque',
  consultant: 'Bruno Priem',
  notes: 'Livraison prévue dans 15 jours. Merci de votre confiance.',
  status: 'En attente',
  type: 'Facture standard'
};

// Génération d'un PDF simple (simulé en base64)
function generateMockPDF() {
  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 100
>>
stream
BT
/F1 24 Tf
100 700 Td
(FACTURE MYCONFORT) Tj
/F1 12 Tf
100 650 Td
(Client: ${mockInvoice.clientName}) Tj
100 630 Td
(Facture: ${mockInvoice.invoiceNumber}) Tj
100 610 Td
(Montant: ${mockInvoice.total}€) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
285
%%EOF`;

  return Buffer.from(pdfContent).toString('base64');
}

// Adaptation des données (identique à N8nBlueprintAdapter)
function adaptForN8nBlueprint(invoice, pdfBase64) {
  const payload = {
    numero_facture: invoice.invoiceNumber,
    date_facture: invoice.invoiceDate,
    date_echeance: invoice.dueDate || invoice.invoiceDate,
    client_nom: invoice.clientName,
    client_email: invoice.clientEmail,
    client_telephone: invoice.clientPhone || '',
    client_adresse: `${invoice.clientAddress || ''}, ${invoice.clientPostalCode || ''}, ${invoice.clientCity || ''}`.trim(),
    client_ville: invoice.clientCity || '',
    client_code_postal: invoice.clientPostalCode || '',
    montant_ht: invoice.subtotal || 0,
    montant_tva: invoice.vat || 0,
    montant_ttc: invoice.total || 0,
    montant_acompte: invoice.advancePayment || 0,
    description_travaux: invoice.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || '',
    mode_paiement: invoice.paymentMethod || 'Non spécifié',
    conseiller: invoice.consultant || 'MyConfort',
    notes_facture: invoice.notes || '',
    statut_facture: invoice.status || 'En attente',
    type_facture: invoice.type || 'Facture standard'
  };

  // Création du FormData (simulé pour Node.js)
  const boundary = '----MyConfortBoundary' + Date.now();
  let formDataBody = '';
  
  // Ajout du fichier PDF
  formDataBody += `--${boundary}\r\n`;
  formDataBody += `Content-Disposition: form-data; name="data"; filename="Facture_${payload.numero_facture}.pdf"\r\n`;
  formDataBody += `Content-Type: application/pdf\r\n\r\n`;
  formDataBody += Buffer.from(pdfBase64, 'base64').toString('binary');
  formDataBody += `\r\n`;
  
  // Ajout de tous les champs
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formDataBody += `--${boundary}\r\n`;
      formDataBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      formDataBody += String(value);
      formDataBody += `\r\n`;
    }
  });
  
  formDataBody += `--${boundary}--\r\n`;
  
  return {
    payload,
    formDataBody,
    boundary,
    contentLength: Buffer.byteLength(formDataBody, 'binary')
  };
}

// Test principal
async function runCompleteIntegrationTest() {
  try {
    console.log('📋 ÉTAPE 1: Préparation des données');
    console.log('──────────────────────────────────');
    console.log('📄 Facture:', mockInvoice.invoiceNumber);
    console.log('👤 Client:', mockInvoice.clientName, '(' + mockInvoice.clientEmail + ')');
    console.log('💰 Montant TTC:', mockInvoice.total + '€');
    console.log('📦 Produits:', mockInvoice.products.length);
    
    console.log('\n🔄 ÉTAPE 2: Génération PDF');
    console.log('──────────────────────────');
    const pdfBase64 = generateMockPDF();
    const pdfSizeBytes = Math.floor(pdfBase64.length * 0.75);
    console.log('📄 PDF généré:', pdfSizeBytes, 'bytes');
    console.log('🔢 Base64 length:', pdfBase64.length, 'caractères');
    
    console.log('\n⚙️ ÉTAPE 3: Adaptation données N8N');
    console.log('─────────────────────────────────');
    const { payload, formDataBody, boundary, contentLength } = adaptForN8nBlueprint(mockInvoice, pdfBase64);
    console.log('✅ Payload Blueprint généré');
    console.log('📊 Nombre de champs:', Object.keys(payload).length);
    console.log('📦 Taille FormData:', contentLength, 'bytes');
    console.log('🔗 Boundary:', boundary.substring(0, 30) + '...');
    
    console.log('\n📤 ÉTAPE 4: Envoi vers N8N');
    console.log('─────────────────────────');
    console.log('🎯 URL:', WEBHOOK_URL);
    console.log('📨 Méthode: POST');
    console.log('📋 Content-Type: multipart/form-data');
    
    // Envoi HTTP(S) avec timeout
    const startTime = Date.now();
    const response = await sendToN8n(formDataBody, boundary, contentLength);
    const responseTime = Date.now() - startTime;
    
    console.log('\n📥 ÉTAPE 5: Traitement réponse');
    console.log('────────────────────────────');
    console.log('🔢 Status Code:', response.statusCode);
    console.log('⏱️ Temps de réponse:', responseTime + 'ms');
    console.log('📄 Content-Type:', response.headers['content-type'] || 'Non spécifié');
    console.log('📊 Taille réponse:', response.body?.length || 0, 'caractères');
    
    if (response.body) {
      console.log('📋 Réponse body:', response.body.substring(0, 200) + (response.body.length > 200 ? '...' : ''));
    }
    
    // Analyse du résultat
    console.log('\n🎯 ÉTAPE 6: Analyse résultat');
    console.log('───────────────────────────');
    
    if (response.statusCode === 200) {
      console.log('✅ SUCCÈS! Webhook N8N a accepté la facture');
      console.log('🚀 Le workflow N8N devrait maintenant:');
      console.log('   1. Sauvegarder le PDF dans Google Drive');
      console.log('   2. Ajouter une ligne dans Google Sheets');
      console.log('   3. Envoyer un email de confirmation');
      
      console.log('\n🔍 Vérifications à faire:');
      console.log('   - Aller sur votre Google Drive');
      console.log('   - Vérifier le Google Sheets');
      console.log('   - Consulter les logs d\'exécution N8N');
      console.log('   - Vérifier la réception email');
      
    } else if (response.statusCode === 404) {
      console.log('❌ ERREUR 404: Workflow inactif ou URL incorrecte');
      console.log('🔧 Solution: Vérifier l\'activation du workflow dans N8N');
      
    } else if (response.statusCode === 500) {
      console.log('❌ ERREUR 500: Problème dans le workflow N8N');
      console.log('🔧 Solutions possibles:');
      console.log('   - Vérifier les credentials Google (Drive, Sheets, Gmail)');
      console.log('   - Contrôler les mappings de champs dans N8N');
      console.log('   - Consulter les logs d\'exécution N8N');
      
    } else {
      console.log('⚠️ RÉPONSE INATTENDUE:', response.statusCode);
      console.log('🔧 À vérifier: Configuration webhook et workflow N8N');
    }
    
    console.log('\n🎉 TEST D\'INTÉGRATION TERMINÉ');
    console.log('═══════════════════════════════');
    console.log('📊 Résumé:');
    console.log('   - Facture:', mockInvoice.invoiceNumber);
    console.log('   - Client:', mockInvoice.clientName);
    console.log('   - Montant:', mockInvoice.total + '€');
    console.log('   - Status N8N:', response.statusCode);
    console.log('   - Temps total:', responseTime + 'ms');
    
    return response.statusCode === 200;
    
  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error.message);
    console.log('\n🔧 Actions à entreprendre:');
    console.log('   1. Vérifier la connectivité internet');
    console.log('   2. Contrôler l\'URL du webhook N8N');
    console.log('   3. Vérifier que le workflow N8N est actif');
    console.log('   4. Consulter les logs du serveur N8N');
    
    return false;
  }
}

// Fonction d'envoi HTTP(S)
function sendToN8n(formDataBody, boundary, contentLength) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': contentLength,
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-IntegrationTest/1.0'
      },
      timeout: TIMEOUT_MS
    };
    
    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de ' + TIMEOUT_MS + 'ms dépassé'));
    });
    
    req.write(formDataBody, 'binary');
    req.end();
  });
}

// Lancement du test
if (require.main === module) {
  runCompleteIntegrationTest()
    .then(success => {
      if (success) {
        console.log('\n🎉 INTÉGRATION MYCONFORT → N8N RÉUSSIE !');
        process.exit(0);
      } else {
        console.log('\n❌ PROBLÈME D\'INTÉGRATION DÉTECTÉ');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 ERREUR CRITIQUE:', error);
      process.exit(1);
    });
}
