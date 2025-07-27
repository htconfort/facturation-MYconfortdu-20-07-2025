// Test pour voir la structure exacte du payload N8N
// À executer dans la console du navigateur

console.log('🔍 ANALYSE DU PAYLOAD ENVOYÉ À N8N');

// Simuler le payload exact envoyé
const testPayload = {
  invoiceNumber: "TEST-2025-001",
  clientName: "Jean Dupont",
  clientEmail: "jean.dupont@test.com",
  totalTTC: 1500,
  products: [
    {
      name: "Matelas Bambou",
      quantity: 1,
      totalTTC: 1500
    }
  ],
  paymentMethod: "Carte bancaire",
  pdfBase64: "JVBERi0xLjQKJcOkw7zDtsO4...", // PDF en base64
  pdfSizeKB: 18
};

console.log('📦 Structure payload:', Object.keys(testPayload));
console.log('🔍 Champs disponibles pour N8N:');
console.log('  - invoiceNumber:', testPayload.invoiceNumber);
console.log('  - clientName:', testPayload.clientName);
console.log('  - clientEmail:', testPayload.clientEmail);
console.log('  - totalTTC:', testPayload.totalTTC);
console.log('  - products:', testPayload.products.length, 'produits');
console.log('  - paymentMethod:', testPayload.paymentMethod);
console.log('  - pdfBase64:', testPayload.pdfBase64.length, 'caractères');

// Test curl pour N8N
const curlCommand = `curl -X POST "https://n8n.srv765811.hstgr.cloud/webhook/e6129ba6-a1f3-4f0a-95b7-a40b8365069c" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testPayload)}'`;

console.log('🧪 Commande curl pour tester:', curlCommand);
