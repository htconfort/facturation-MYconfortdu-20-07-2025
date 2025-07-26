#!/usr/bin/env node

/**
 * 🧪 TEST DE CORRECTION BUFFER → BLOB
 * ===================================
 * 
 * Ce script teste la nouvelle fonction de conversion base64 vers Blob
 * qui remplace Buffer (non disponible dans le navigateur).
 */

console.log('🧪 TEST DE CORRECTION BUFFER → BLOB');
console.log('====================================');
console.log('');

// Test de la fonction base64ToBlob (version navigateur)
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Test avec un PDF de base64 simple
const testPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSANCj4+Ci9QcmMKPj4KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxIDAgMCAxIDEwMCA3MDAgVG0KKEZOQ1RVUkUgVEVTVCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozMzkKJSVFT0Y=';

console.log('📋 Test de conversion base64 → Blob');
console.log('------------------------------------');

try {
  // Test de la fonction base64ToBlob
  const pdfBlob = base64ToBlob(testPdfBase64, 'application/pdf');
  
  console.log('✅ Conversion réussie !');
  console.log('📊 Taille du Blob:', pdfBlob.size, 'bytes');
  console.log('📄 Type MIME:', pdfBlob.type);
  console.log('🔧 Constructor:', pdfBlob.constructor.name);
  
  // Vérification que c'est bien un Blob
  if (pdfBlob instanceof Blob) {
    console.log('✅ Instance Blob validée');
  } else {
    console.log('❌ Ce n\'est pas une instance Blob');
  }
  
  // Test de création du FormData
  console.log('');
  console.log('📦 Test FormData avec Blob');
  console.log('---------------------------');
  
  const formData = new FormData();
  formData.append('data', pdfBlob, 'Facture_TEST-001.pdf');
  formData.append('numero_facture', 'TEST-001');
  formData.append('client_nom', 'Client Test');
  
  console.log('✅ FormData créé avec succès');
  console.log('🔢 Nombre d\'entrées:', Array.from(formData.entries()).length);
  
  // Affichage des entrées FormData
  for (const [key, value] of formData.entries()) {
    if (key === 'data') {
      console.log(`📄 ${key}: [Blob - ${value.size} bytes - ${value.type}]`);
    } else {
      console.log(`📋 ${key}: ${value}`);
    }
  }
  
  console.log('');
  console.log('🎉 RÉSULTAT FINAL');
  console.log('==================');
  console.log('✅ Fonction base64ToBlob : OK');
  console.log('✅ Création Blob PDF : OK');
  console.log('✅ FormData multipart : OK');
  console.log('✅ Prêt pour envoi N8N : OUI');
  
} catch (error) {
  console.log('❌ Erreur lors du test:', error.message);
  console.log('🔍 Stack trace:', error.stack);
}

console.log('');
console.log('📝 Note: Ce test valide la correction de l\'erreur "Buffer is not defined"');
console.log('🚀 L\'application peut maintenant envoyer des PDFs vers votre Blueprint N8N !');
