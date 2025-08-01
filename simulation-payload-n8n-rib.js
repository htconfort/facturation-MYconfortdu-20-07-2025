#!/usr/bin/env node

/**
 * 🧪 SIMULATION PAYLOAD N8N AVEC RIB - VIREMENT BANCAIRE
 * ======================================================
 * 
 * Ce script simule exactement ce que N8N recevra quand une facture
 * avec "Virement bancaire" sera envoyée.
 */

console.log('🧪 SIMULATION PAYLOAD N8N AVEC RIB - VIREMENT BANCAIRE');
console.log('========================================================');
console.log('');

// Simulation d'une facture avec virement bancaire
const invoiceVirement = {
  invoiceNumber: 'FAC-2025-001',
  paymentMethod: 'Virement bancaire',
  clientName: 'Jean Dupont',
  clientEmail: 'jean.dupont@email.com',
  montantTTC: 1500.00,
  montantAcompte: 0,
  // ... autres champs
};

// Simulation de la logique des services N8N
function genererPayloadN8nAvecRIB(invoice) {
  const montantRestant = invoice.montantTTC - (invoice.montantAcompte || 0);
  
  return {
    // Champs standard
    numero_facture: invoice.invoiceNumber,
    nom_du_client: invoice.clientName,
    email_client: invoice.clientEmail,
    montant_ttc: invoice.montantTTC,
    acompte: invoice.montantAcompte || 0,
    montant_restant: montantRestant,
    mode_paiement: invoice.paymentMethod,
    
    // ✅ NOUVEAUX CHAMPS RIB AUTOMATIQUES
    afficher_rib: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement'),
    
    rib_html: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement') 
      ? `<div style="margin-top: 20px; padding: 15px; background-color: #e1f5fe; border: 1px solid #2563eb; border-radius: 8px;">
           <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 14px;">📋 Coordonnées bancaires pour votre virement</h3>
           <div style="font-size: 12px; line-height: 1.4;">
             <div><strong>Bénéficiaire :</strong> MYCONFORT</div>
             <div><strong>IBAN :</strong> FR76 1027 8060 4100 0209 3280 165</div>
             <div><strong>BIC :</strong> CMCIFR2A</div>
             <div><strong>Banque :</strong> Crédit Mutuel du Sud-Est</div>
             <div style="margin-top: 8px; font-style: italic; color: #666;">
               Merci d'indiquer le numéro de facture <strong>${invoice.invoiceNumber}</strong> en référence de votre virement.
             </div>
           </div>
         </div>`
      : '',
      
    rib_texte: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement')
      ? `COORDONNÉES BANCAIRES POUR VIREMENT\n\nBénéficiaire : MYCONFORT\nIBAN : FR76 1027 8060 4100 0209 3280 165\nBIC : CMCIFR2A\nBanque : Crédit Mutuel du Sud-Est\n\nMerci d'indiquer le numéro de facture ${invoice.invoiceNumber} en référence de votre virement.`
      : '',
      
    mode_paiement_avec_details: `Montant à régler : ${invoice.montantTTC.toFixed(2)}€ par ${invoice.paymentMethod}`,
    
    // Métadonnées
    date_creation: new Date().toISOString(),
    fichier_facture: '[PDF Base64 - Facture avec RIB intégré]'
  };
}

// Génération du payload
const payloadN8N = genererPayloadN8nAvecRIB(invoiceVirement);

console.log('📤 PAYLOAD COMPLET QUI SERA REÇU PAR N8N :');
console.log('==========================================');
console.log(JSON.stringify(payloadN8N, null, 2));

console.log('\n🎯 CHAMPS SPÉCIFIQUES AU RIB :');
console.log('==============================');
console.log(`afficher_rib: ${payloadN8N.afficher_rib}`);
console.log(`rib_html: ${payloadN8N.rib_html ? 'PRÉSENT (' + payloadN8N.rib_html.length + ' caractères)' : 'ABSENT'}`);
console.log(`rib_texte: ${payloadN8N.rib_texte ? 'PRÉSENT (' + payloadN8N.rib_texte.length + ' caractères)' : 'ABSENT'}`);

console.log('\n📧 UTILISATION DANS LE TEMPLATE EMAIL N8N :');
console.log('============================================');
console.log('Pour afficher le RIB dans votre email, vous pouvez utiliser :');
console.log('');
console.log('🔹 Test conditionnel :');
console.log('{{ if $json.afficher_rib }}');
console.log('  <!-- Le client a choisi virement bancaire -->');
console.log('  {{{ $json.rib_html }}}');
console.log('{{ endif }}');
console.log('');
console.log('🔹 Ou directement :');
console.log('{{{ $json.rib_html }}}');
console.log('(sera vide si pas virement)');

console.log('\n📄 APERÇU DU RIB HTML :');
console.log('======================');
if (payloadN8N.rib_html) {
  // Affichage simplifié du contenu HTML
  const contenuSimple = payloadN8N.rib_html
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/\s+/g, ' ')    // Normaliser les espaces
    .trim();
  console.log(contenuSimple);
} else {
  console.log('Aucun RIB (mode de paiement non-virement)');
}

console.log('\n📄 APERÇU DU RIB TEXTE :');
console.log('=======================');
if (payloadN8N.rib_texte) {
  console.log(payloadN8N.rib_texte);
} else {
  console.log('Aucun RIB (mode de paiement non-virement)');
}

console.log('\n✅ POINTS CLÉS POUR VOTRE WORKFLOW N8N :');
console.log('========================================');
console.log('1. Le champ "afficher_rib" vous permet de conditionner l\'affichage');
console.log('2. Le champ "rib_html" contient le bloc formaté pour email');
console.log('3. Le champ "rib_texte" contient la version texte simple');
console.log('4. Le numéro de facture est automatiquement inclus en référence');
console.log('5. Les coordonnées bancaires sont exactes et conformes');

console.log('\n🎉 VOTRE TEMPLATE EMAIL PEUT MAINTENANT INCLURE LE RIB !');
console.log('=========================================================');
console.log('Testez en créant une facture avec "Virement bancaire" et observez');
console.log('les données reçues dans votre workflow N8N. Le RIB sera présent !');
