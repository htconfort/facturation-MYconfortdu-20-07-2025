// Test des nouvelles sections dans l'aperçu de facture

const testInvoice = {
  invoiceNumber: "TEST-001",
  invoiceDate: "2025-07-26",
  eventLocation: "Salon de l'habitat Paris",
  clientName: "M. Jean Dupont",
  clientEmail: "jean.dupont@email.com",
  clientPhone: "06 12 34 56 78",
  clientAddress: "123 rue de la République",
  clientPostalCode: "75001",
  clientCity: "Paris",
  clientHousingType: "Appartement",
  clientDoorCode: "A1234",
  advisorName: "Marie Martin",
  
  // CHAMPS IMPORTANTS POUR LES NOUVELLES SECTIONS
  paymentMethod: "Chèque", // ← Section Mode de règlement
  montantAcompte: 500, // ← Section Acompte
  invoiceNotes: "Installation prévue en septembre", // ← Section Remarques
  deliveryNotes: "Livraison à domicile - 2ème étage sans ascenseur", // ← Section Remarques
  
  products: [
    {
      name: "Matelas Memory Foam",
      quantity: 1,
      priceTTC: 1200,
      discount: 10,
      discountType: "percent"
    },
    {
      name: "Oreiller ergonomique",
      quantity: 2,
      priceTTC: 80,
      discount: 0,
      discountType: "fixed"
    }
  ],
  
  montantHT: 1000,
  montantTTC: 1240,
  montantTVA: 240,
  montantRemise: 120,
  taxRate: 20,
  montantRestant: 740,
  
  deliveryMethod: "Livraison standard",
  signature: null,
  isSigned: false,
  termsAccepted: true,
  createdAt: "2025-07-26T08:30:00Z",
  updatedAt: "2025-07-26T08:30:00Z"
};

console.log("Données de test pour vérifier les nouvelles sections:");
console.log("- Mode de règlement:", testInvoice.paymentMethod);
console.log("- Acompte:", testInvoice.montantAcompte + "€");
console.log("- Notes générales:", testInvoice.invoiceNotes);
console.log("- Notes livraison:", testInvoice.deliveryNotes);
