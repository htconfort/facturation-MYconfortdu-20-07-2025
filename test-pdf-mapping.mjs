import { writeFileSync } from 'fs';

/**
 * Script de test pour valider le mapping des produits dans le PDF
 * Simulation d'une facture avec des produits réels
 */

// Simulation d'une facture test avec des produits réels
const testInvoice = {
  invoiceNumber: "FAC-TEST-2025-001",
  invoiceDate: "2025-01-28",
  eventLocation: "Paris 15ème",
  taxRate: 20,
  
  // Client test
  clientName: "Client Test",
  clientEmail: "test@example.com",
  clientPhone: "0123456789",
  clientAddress: "123 Rue de Test",
  clientPostalCode: "75015",
  clientCity: "Paris",
  clientHousingType: "Appartement",
  clientDoorCode: "A123",
  clientSiret: "12345678901234",
  
  // Produits RÉELS (pas hardcodés)
  products: [
    {
      name: "Matelas Premium King Size",
      category: "Literie",
      quantity: 2,
      priceTTC: 899.99,
      discount: 0,
      discountType: "percentage"
    },
    {
      name: "Sommier tapissier 160x200",
      category: "Literie", 
      quantity: 1,
      priceTTC: 456.50,
      discount: 10,
      discountType: "percentage"
    },
    {
      name: "Oreiller mémoire de forme",
      category: "Accessoires",
      quantity: 4,
      priceTTC: 89.90,
      discount: 0,
      discountType: "percentage"
    }
  ],
  
  // Calculs automatiques
  montantHT: 0, // Sera calculé
  montantTTC: 0, // Sera calculé
  montantTVA: 0, // Sera calculé
  montantRemise: 0,
  
  // Paiement
  paymentMethod: "Chèque",
  montantAcompte: 500,
  montantRestant: 0, // Sera calculé
  
  // Livraison
  deliveryMethod: "Livraison standard",
  deliveryNotes: "Livraison prévue sous 2 semaines",
  
  // Signature
  signature: "",
  isSigned: false,
  
  // Notes et conseiller
  invoiceNotes: "Facture de test pour validation du mapping des produits",
  advisorName: "Conseiller Test",
  termsAccepted: true,
  
  // Métadonnées
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Calcul des totaux
const totalTTC = testInvoice.products.reduce((sum, product) => {
  const productTotal = product.quantity * product.priceTTC;
  const discountAmount = product.discountType === 'percentage' 
    ? productTotal * (product.discount / 100)
    : product.discount;
  return sum + (productTotal - discountAmount);
}, 0);

testInvoice.montantTTC = totalTTC;
testInvoice.montantHT = totalTTC / (1 + testInvoice.taxRate / 100);
testInvoice.montantTVA = totalTTC - testInvoice.montantHT;
testInvoice.montantRestant = totalTTC - testInvoice.montantAcompte;

console.log('🧪 FACTURE TEST GÉNÉRÉE:');
console.log('===============================');
console.log(`📋 Numéro: ${testInvoice.invoiceNumber}`);
console.log(`👤 Client: ${testInvoice.clientName}`);
console.log(`🛒 Nombre de produits: ${testInvoice.products.length}`);
console.log('');

console.log('🏷️ DÉTAIL DES PRODUITS:');
testInvoice.products.forEach((product, index) => {
  const productTotal = product.quantity * product.priceTTC;
  const discountAmount = product.discountType === 'percentage' 
    ? productTotal * (product.discount / 100)
    : product.discount;
  const finalTotal = productTotal - discountAmount;
  
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Quantité: ${product.quantity}`);
  console.log(`   Prix TTC unitaire: ${product.priceTTC}€`);
  console.log(`   Remise: ${product.discount}${product.discountType === 'percentage' ? '%' : '€'}`);
  console.log(`   Total: ${finalTotal.toFixed(2)}€`);
  console.log('');
});

console.log('💰 TOTAUX CALCULÉS:');
console.log(`   Total HT: ${testInvoice.montantHT.toFixed(2)}€`);
console.log(`   Total TVA (${testInvoice.taxRate}%): ${testInvoice.montantTVA.toFixed(2)}€`);
console.log(`   Total TTC: ${testInvoice.montantTTC.toFixed(2)}€`);
console.log(`   Acompte: ${testInvoice.montantAcompte}€`);
console.log(`   Restant dû: ${testInvoice.montantRestant.toFixed(2)}€`);
console.log('');

console.log('✅ Cette facture test doit générer un PDF avec ces montants EXACTS');
console.log('❌ Si le PDF montre des montants différents (comme 375€ ou 1500€),');
console.log('   alors il y a encore un problème de mapping à corriger.');
console.log('');
console.log('🔍 Pour tester:');
console.log('1. Copiez ces données dans l\'application');
console.log('2. Générez le PDF');
console.log('3. Vérifiez que les totaux correspondent exactement');

// Sauvegarde de la structure pour import dans l'app
try {
  writeFileSync('test-invoice-structure.json', JSON.stringify(testInvoice, null, 2));
  console.log('💾 Structure sauvegardée dans test-invoice-structure.json');
} catch (error) {
  console.log('⚠️ Impossible de sauvegarder le fichier, mais les données sont affichées ci-dessus');
}
