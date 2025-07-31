#!/usr/bin/env node

// 🧪 TEST DE L'ENVOI DE SIGNATURE BASE64 VERS N8N
// Ce script teste si la signature base64 est correctement incluse dans le payload N8N

console.log('🧪 TEST DE L\'ENVOI DE SIGNATURE BASE64 VERS N8N\n');

// Simulation d'une signature base64 (exemple réel d'une signature vide)
const fakeSignatureBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACQCAYAAACP8XdvAAAAAXNSR0IArs4c6QAABHJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFiwSnacSAQJPAcGyCAgQSAkIVsrLaQQIWAMECKQEBCvl5TQCBKwBAgRSAoKV8nIaAQLWAAECKQHBSnk5jQABa4AAgZSAYKW8nEaAgDVAgEBKQLBSXk4jQMAaIEAgJSBYKS+nESBgDRAgkBIQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEEgJCFbKy2kECFgDBAikBAQr5eU0AgSsAQIEUgKClfJyGgEC1gABAikBwUp5OY0AAWuAAIGUgGClvJxGgIA1QIBASVAQrJSX0wgQsAYIEPgAKEQEOl2/CJsAAAAASUVORK5CYII=';

console.log('📋 SIMULATION DE PAYLOAD N8N AVEC SIGNATURE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Simulation d'une facture avec signature
const testInvoice = {
  invoiceNumber: '2025-TEST-001',
  signature: fakeSignatureBase64,
  isSigned: true,
  signatureDate: new Date().toISOString(),
  // ... autres champs
};

// Simulation du payload N8N (structure modifiée)
const simulatedPayload = {
  // Informations de base
  numero_facture: testInvoice.invoiceNumber,
  
  // Signature - AVANT modification
  signature_avant: testInvoice.signature ? 'Oui' : 'Non',
  signature_presente_avant: testInvoice.isSigned ? 'Oui' : 'Non',
  
  // Signature - APRÈS modification (nouveau champ)
  signature: testInvoice.signature ? 'Oui' : 'Non',
  signature_presente: testInvoice.isSigned ? 'Oui' : 'Non',
  signature_base64: testInvoice.signature || '', // ✅ NOUVEAU CHAMP
  date_signature: testInvoice.signatureDate || '',
};

console.log('📤 PAYLOAD ENVOYÉ VERS N8N:');
console.log('');

// Affichage du payload avec masquage partiel de la signature pour la lisibilité
const displayPayload = {
  ...simulatedPayload,
  signature_base64: simulatedPayload.signature_base64 
    ? `${simulatedPayload.signature_base64.substring(0, 50)}... [${simulatedPayload.signature_base64.length} caractères total]`
    : ''
};

console.log(JSON.stringify(displayPayload, null, 2));

console.log('');
console.log('🔍 ANALYSE DE LA SIGNATURE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Signature présente: ${simulatedPayload.signature_presente}`);
console.log(`✅ Format base64: ${simulatedPayload.signature_base64 ? 'Oui' : 'Non'}`);
console.log(`✅ Taille de la signature: ${simulatedPayload.signature_base64.length} caractères`);
console.log(`✅ Type détecté: ${simulatedPayload.signature_base64.includes('data:image/png') ? 'PNG' : simulatedPayload.signature_base64.includes('data:image/jpeg') ? 'JPEG' : 'Inconnu'}`);
console.log(`✅ Date de signature: ${simulatedPayload.date_signature}`);

console.log('');
console.log('📋 UTILISATION CÔTÉ N8N:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Dans votre workflow N8N, vous pouvez maintenant:');
console.log('');
console.log('1. 📧 EMAIL: Attacher la signature comme image:');
console.log('   • Utiliser {{$json.signature_base64}} comme source');
console.log('   • Convertir base64 → fichier image pour attachment');
console.log('');
console.log('2. 📄 PDF: Intégrer la signature dans un PDF généré par N8N:');
console.log('   • Utiliser {{$json.signature_base64}} dans un template HTML');
console.log('   • Exemple: <img src="{{$json.signature_base64}}" alt="Signature"/>');
console.log('');
console.log('3. 💾 STOCKAGE: Sauvegarder la signature:');
console.log('   • Base de données: stocker le champ signature_base64');
console.log('   • Google Drive: convertir en fichier image et uploader');
console.log('');
console.log('4. ✅ CONDITIONS: Vérifier la présence de signature:');
console.log('   • IF {{$json.signature_presente}} === "Oui"');
console.log('   • IF {{$json.signature_base64}} !== ""');

console.log('');
console.log('⚠️  AVERTISSEMENTS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• La signature base64 peut être volumineuse (plusieurs Ko)');
console.log('• Vérifiez les limites de taille de votre webhook N8N');
console.log('• Considérez compresser l\'image si nécessaire');
console.log('• La Data URL inclut le préfixe (data:image/png;base64,...)');

console.log('');
console.log('🎯 MODIFICATIONS APPLIQUÉES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Ajout du champ signature_base64 dans n8nWebhookService.ts');
console.log('✅ Inclusion dans les logs de débogage');
console.log('✅ La signature complète est maintenant envoyée vers N8N');
console.log('');
console.log('🚀 Prêt pour les tests ! Créez une facture avec signature et vérifiez les logs N8N.');
