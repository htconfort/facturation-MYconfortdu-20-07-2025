const nodemailer = require('nodemailer');

// 🧪 TEST EMAIL CLIENT - Vérification réception avec PDF
console.log('🧪 TEST : Vérification email client avec PDF');

// Configuration email de test (remplacez par vos vraies données)
const testConfig = {
  service: 'gmail', // ou votre service
  auth: {
    user: 'votre-email@gmail.com',
    pass: 'votre-mot-de-passe-app'
  }
};

// Créer le transporteur
const transporter = nodemailer.createTransporter(testConfig);

// PDF de test (base64 simulé)
const testPdfBase64 = 'JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCUyMAi...'; // Remplacez par un vrai PDF

// Options email
const mailOptions = {
  from: testConfig.auth.user,
  to: 'destinataire@example.com', // Remplacez par votre email de test
  subject: 'Test PDF - Facture MyConfort',
  html: `
    <h2>Test d'envoi PDF</h2>
    <p>Ceci est un test pour vérifier que le PDF est bien joint.</p>
    <p><strong>Facture n°:</strong> TEST-2025-001</p>
    <p><strong>Montant:</strong> 100.50€</p>
    <p><strong>Client:</strong> Test Client</p>
  `,
  attachments: [
    {
      filename: 'facture_TEST-2025-001.pdf',
      content: testPdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf'
    }
  ]
};

console.log('📧 Envoi email de test...');
console.log('📎 PDF joint:', testPdfBase64 ? 'OUI' : 'NON');
console.log('📊 Taille PDF:', testPdfBase64.length, 'caractères');

// Envoyer l'email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error('❌ Erreur envoi:', error.message);
//   } else {
//     console.log('✅ Email envoyé:', info.messageId);
//     console.log('📧 Réponse:', info.response);
//   }
// });

console.log('ℹ️  Pou r envoyer réellement, décommentez les lignes transporter.sendMail');
console.log('🎯 Ce script teste la structure email + PDF');
