#!/usr/bin/env node

// 🧪 TEST : Vérifier que l'application envoie bien le PDF
const webhookUrl = 'https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a';

// Données de test avec PDF (simulé)
const testPayload = {
  invoice_number: "TEST-2025-001",
  client_email: "test@example.com", 
  client_name: "Test Client",
  amount: 100.50,
  date: "2025-07-27",
  pdf_base64: "JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCUyMAi", // PDF de test
  items: [
    {
      id: 1,
      description: "Produit test",
      quantity: 1,
      unit_price: 100.50,
      total_price: 100.50
    }
  ],
  source: "Test_Script",
  version: "1.0"
};

console.log('🧪 TEST : Envoi payload avec PDF vers N8N');
console.log('📤 URL:', webhookUrl);
console.log('📊 Payload:', {
  ...testPayload,
  pdf_base64: testPayload.pdf_base64 ? `${testPayload.pdf_base64.substring(0, 20)}... (${testPayload.pdf_base64.length} chars)` : 'ABSENT'
});

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('✅ Réponse N8N:', response.status, response.statusText);
  return response.text();
})
.then(text => {
  console.log('📄 Contenu réponse:', text);
  console.log('🎯 Test terminé - Vérifiez les logs N8N');
})
.catch(error => {
  console.error('❌ Erreur:', error.message);
});
