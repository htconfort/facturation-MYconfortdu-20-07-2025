// sendFacture.js
// Script Node.js pour envoyer une facture (PDF + champs texte) en multipart/form-data à un webhook n8n
// Usage: node sendFacture.js <webhook_url> <chemin_vers_pdf>

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node sendFacture.js <webhook_url> <chemin_vers_pdf>');
  process.exit(1);
}

const webhookUrl = process.argv[2];
const pdfPath = process.argv[3];

// Exemple de données de facture (à adapter selon vos besoins)
const fields = {
  numero_facture: 'F2025-001',
  client_nom: 'Jean Dupont',
  client_email: 'jean.dupont@example.com',
  client_telephone: '0601020304',
  client_adresse: '12 rue de Paris',
  client_ville: 'Paris',
  client_code_postal: '75001',
  date_facture: '2025-07-26',
  date_echeance: '2025-08-10',
  montant_ht: '1000',
  montant_tva: '200',
  montant_ttc: '1200',
  montant_acompte: '0',
  description_travaux: 'Installation pompe à chaleur',
  mode_paiement: 'Virement',
  conseiller: 'Alice Martin',
  notes_facture: 'Merci pour votre confiance',
  statut_facture: 'envoyée',
  type_facture: 'acompte'
};

async function sendFacture() {
  const form = new FormData();
  // Ajouter tous les champs texte d'abord
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  // Ajouter le PDF en dernier (champ 'data')
  form.append('data', fs.createReadStream(pdfPath), {
    filename: 'facture.pdf',
    contentType: 'application/pdf'
  });

  try {
    const response = await axios.post(webhookUrl, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log('Réponse n8n:', response.status, response.data);
  } catch (err) {
    if (err.response) {
      console.error('Erreur n8n:', err.response.status, err.response.data);
    } else {
      console.error('Erreur:', err.message);
    }
  }
}

sendFacture();
