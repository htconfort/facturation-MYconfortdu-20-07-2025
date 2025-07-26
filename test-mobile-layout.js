// Test des nouvelles sections mobile/tablet dans l'ordre souhaité
const testInvoice = {
  invoiceNumber: "FAC-2025-001",
  invoiceDate: "2025-07-26",
  eventLocation: "Salon du Meuble - Paris",
  
  // Client
  clientName: "Test Mobile Layout",
  clientEmail: "test@example.com",
  clientPhone: "01 23 45 67 89",
  clientAddress: "123 Rue de Test",
  clientPostalCode: "75001",
  clientCity: "Paris",
  
  // Produits
  products: [
    {
      name: "Matelas Premium Confort",
      quantity: 1,
      priceTTC: 899.00,
      discount: 10,
      discountType: 'percent'
    },
    {
      name: "Oreiller Ergonomique",
      quantity: 2,
      priceTTC: 45.00,
      discount: 0,
      discountType: 'fixed'
    }
  ],
  
  // Montants
  montantHT: 725.83,
  montantTTC: 899.00,
  montantTVA: 173.17,
  montantRemise: 89.90,
  taxRate: 20,
  
  // NOUVEAUTÉS POUR TEST MOBILE/TABLET :
  // 1. Mode de règlement (affiché après le tableau)
  paymentMethod: "Carte bancaire en 3 fois",
  
  // 2. Acompte (affiché après le mode de règlement)
  montantAcompte: 300.00,
  montantRestant: 599.00,
  
  // 3. Remarques (affichées en dernier)
  invoiceNotes: "Livraison prévue sous 15 jours ouvrés. Client préfère la livraison le matin.",
  deliveryNotes: "2ème étage, ascenseur disponible. Sonnez à l'interphone 'Dupont'.",
  
  // Signature
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  isSigned: true,
  signatureDate: "2025-07-26",
  
  // Autres
  deliveryMethod: "Livraison à domicile",
  advisorName: "Sophie Martin",
  termsAccepted: true,
  createdAt: "2025-07-26T10:00:00Z",
  updatedAt: "2025-07-26T10:00:00Z"
};

console.log("=== TEST ORDRE D'AFFICHAGE MOBILE/TABLET ===");
console.log("1. Tableau des produits");
console.log("2. Mode de règlement:", testInvoice.paymentMethod);
console.log("3. Taux d'acompte:", testInvoice.montantAcompte + "€", "(" + ((testInvoice.montantAcompte / testInvoice.montantTTC) * 100).toFixed(1) + "% du total)");
console.log("4. Remarques:");
console.log("   - Notes générales:", testInvoice.invoiceNotes);
console.log("   - Livraison:", testInvoice.deliveryNotes);
console.log("5. Totaux et reste à payer");

export { testInvoice };
