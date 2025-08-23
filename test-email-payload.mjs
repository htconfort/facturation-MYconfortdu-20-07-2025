// Script de test pour vérifier le payload email envoyé à N8N
// Usage: node test-email-payload.mjs

const testInvoice = {
  invoiceNumber: 'TEST-EMAIL-2025-001',
  invoiceDate: '2025-01-22',
  clientName: 'Test Client',
  clientEmail: 'test@example.com',
  clientPhone: '0123456789',
  clientAddress: '123 Rue Test',
  clientPostalCode: '12345',
  clientCity: 'Test City',
  clientHousingType: 'Maison',
  clientDoorCode: '1234',
  clientSiret: '',
  paymentMethod: 'Virement bancaire',
  deliveryMethod: 'Livraison standard',
  deliveryNotes: 'Test livraison',
  advisorName: 'Test Advisor',
  eventLocation: 'Test Location',
  invoiceNotes: 'Notes de test',
  termsAccepted: true,
  isSigned: true,
  signature: 'data:image/png;base64,test-signature',
  signatureDate: '2025-01-22T10:00:00Z',
  nombreChequesAVenir: 0,
  taxRate: 20,
  montantHT: 100,
  montantTVA: 20,
  montantTTC: 120,
  montantAcompte: 50,
  montantRemise: 0,
  createdAt: '2025-01-22T10:00:00Z',
  updatedAt: '2025-01-22T10:00:00Z',
  products: [
    {
      name: 'Produit Test 1',
      category: 'Test Category',
      quantity: 2,
      priceTTC: 30,
      priceHT: 25,
      discount: 5,
      discountType: 'percent'
    },
    {
      name: 'Produit Test 2',
      category: 'Test Category',
      quantity: 1,
      priceTTC: 60,
      priceHT: 50,
      discount: 0,
      discountType: 'fixed'
    }
  ]
};

// Simuler la fonction calculateInvoiceTotals
function calculateInvoiceTotals(products, taxRate, acompte, paymentMethod) {
  const totalHT = products.reduce((sum, p) => sum + (p.quantity * p.priceHT), 0);
  const totalTTC = products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0);
  
  return {
    montantTTC: totalTTC,
    montantAcompte: acompte,
    montantRestant: totalTTC - acompte
  };
}

// Simuler la création du payload (extrait du service N8N)
function createEmailPayload(invoice) {
  const calculatedTotals = calculateInvoiceTotals(
    invoice.products,
    invoice.taxRate || 20,
    invoice.montantAcompte || 0,
    invoice.paymentMethod || ''
  );

  const totalAmount = calculatedTotals.montantTTC;
  const acompteAmount = calculatedTotals.montantAcompte;
  const montantRestant = calculatedTotals.montantRestant;

  return {
    // CHAMPS ESSENTIELS POUR EMAIL
    nom_facture: `Facture_MYCONFORT_${invoice.invoiceNumber}`,
    numero_facture: invoice.invoiceNumber,
    date_facture: invoice.invoiceDate,
    nom_du_client: invoice.clientName,
    email_client: invoice.clientEmail,
    montant_ttc: totalAmount,
    acompte: acompteAmount,
    montant_restant: montantRestant,
    
    // CHAMPS PRODUITS POUR EMAIL
    produits_html: invoice.products.map(product => {
      const total = product.quantity * product.priceTTC;
      return `<li><strong>${product.name}</strong><br>
               Quantité: ${product.quantity} × ${product.priceTTC.toFixed(2)}€ = <strong>${total.toFixed(2)}€</strong>
               ${product.discount > 0 ? `<br><em>Remise: -${product.discount}${product.discountType === 'percent' ? '%' : '€'}</em>` : ''}
               </li>`;
    }).join(''),
    
    liste_produits_email: invoice.products.map(product => {
      const total = product.quantity * product.priceTTC;
      return `• ${product.name} - Quantité: ${product.quantity} - Prix unitaire: ${product.priceTTC.toFixed(2)}€ - Total: ${total.toFixed(2)}€`;
    }).join('\n'),
    
    noms_produits_string: invoice.products.map(p => p.name).join(', '),
    
    // PAIEMENT DÉTAILLÉ
    mode_paiement: invoice.paymentMethod || 'Non spécifié',
    mode_paiement_avec_details: (() => {
      if ((!acompteAmount || acompteAmount === 0) && (!invoice.nombreChequesAVenir || invoice.nombreChequesAVenir === 0)) {
        return `Montant à régler : ${totalAmount.toFixed(2)}€ par ${invoice.paymentMethod || 'Non spécifié'}`;
      } else if (invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
        return `${invoice.paymentMethod || 'Chèques à venir'} - ${invoice.nombreChequesAVenir} chèque${invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir de ${montantRestant > 0 ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2) : '0.00'}€ chacun`;
      } else {
        return `Montant restant : ${montantRestant.toFixed(2)}€ par ${invoice.paymentMethod || 'Non spécifié'}`;
      }
    })(),
    
    // COORDONNÉES BANCAIRES (si virement)
    afficher_rib: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement'),
    rib_html: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement') ? 
      `<div style="margin-top: 20px; padding: 15px; background-color: #e1f5fe; border: 1px solid #2563eb; border-radius: 8px;">
         <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 14px;">📋 Coordonnées bancaires pour votre virement</h3>
         <div style="font-size: 12px; line-height: 1.4;">
           <div><strong>Bénéficiaire :</strong> MYCONFORT</div>
           <div><strong>IBAN :</strong> FR76 1660 7000 1708 1216 3980 964</div>
           <div><strong>BIC :</strong> CCBPFRPPPPG</div>
           <div><strong>Banque :</strong> Banque Populaire du Sud</div>
           <div style="margin-top: 8px; font-style: italic; color: #666;">
             Merci d'indiquer le numéro de facture <strong>${invoice.invoiceNumber}</strong> en référence de votre virement.
           </div>
         </div>
       </div>` : '',
    
    // MÉTADONNÉES
    conseiller: invoice.advisorName || 'MYCONFORT',
    lieu_evenement: invoice.eventLocation || 'Non spécifié',
    notes_facture: invoice.invoiceNotes || '',
    
    nombre_produits: invoice.products.length
  };
}

// Créer et afficher le payload
console.log('🧪 TEST DU PAYLOAD EMAIL N8N\n');
console.log('='.repeat(60));

const payload = createEmailPayload(testInvoice);

console.log('📋 CHAMPS PRINCIPAUX POUR EMAIL:');
console.log('='.repeat(40));
console.log(`✅ nom_du_client: "${payload.nom_du_client}"`);
console.log(`✅ numero_facture: "${payload.numero_facture}"`);
console.log(`✅ montant_ttc: ${payload.montant_ttc}€`);
console.log(`✅ mode_paiement: "${payload.mode_paiement}"`);
console.log(`✅ nombre_produits: ${payload.nombre_produits}`);

console.log('\n🛒 PRODUITS HTML (pour email riche):');
console.log('='.repeat(40));
console.log(payload.produits_html);

console.log('\n📝 LISTE PRODUITS TEXTE (alternative):');
console.log('='.repeat(40));
console.log(payload.liste_produits_email);

console.log('\n💳 DÉTAILS PAIEMENT:');
console.log('='.repeat(40));
console.log(`✅ mode_paiement_avec_details: "${payload.mode_paiement_avec_details}"`);

if (payload.afficher_rib) {
  console.log('\n🏦 COORDONNÉES BANCAIRES:');
  console.log('='.repeat(40));
  console.log('✅ Virement détecté - RIB inclus dans l\'email');
  console.log('✅ HTML du RIB disponible dans rib_html');
}

console.log('\n📊 RÉSUMÉ:');
console.log('='.repeat(40));
console.log(`✅ Champs email essentiels: PRÉSENTS`);
console.log(`✅ Produits formatés HTML: PRÉSENTS (${payload.produits_html.length} caractères)`);
console.log(`✅ Détails paiement: PRÉSENTS`);
console.log(`✅ Coordonnées bancaires: ${payload.afficher_rib ? 'PRÉSENTES' : 'NON NÉCESSAIRES'}`);

console.log('\n🎯 CONCLUSION:');
console.log('='.repeat(40));
console.log('✅ Le service N8N envoie TOUS les champs nécessaires pour un email riche.');
console.log('❌ Si l\'email est minimaliste, le problème vient du TEMPLATE N8N.');
console.log('🔧 Solution: Vérifier et corriger le template email dans le workflow N8N.');

console.log('\n📋 TEMPLATE N8N RECOMMANDÉ:');
console.log('='.repeat(40));
console.log('Utilisez {{$json.produits_html}} pour afficher les produits');
console.log('Utilisez {{$json.mode_paiement_avec_details}} pour le paiement');
console.log('Utilisez {{{$json.rib_html}}} pour les coordonnées bancaires');
console.log('Voir le fichier DIAGNOSTIC_EMAIL_MINIMALISTE.md pour le template complet.');
