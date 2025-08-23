#!/usr/bin/env node

/**
 * 🧪 TEST COMPLET ENVOI FACTURE VIA WEBHOOK N8N
 * =============================================
 * Simule l'envoi d'une facture avec payload complet
 * pour valider l'intégration N8N end-to-end
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';

// 📄 PAYLOAD DE TEST COMPLET (identique à la structure N8nWebhookService)
const testInvoicePayload = {
  // PDF data
  nom_facture: 'Facture_MYCONFORT_TEST_001',
  fichier_facture: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFRFU1QpCi9Qcm9kdWNlciAoTXlDb21mb3J0KQovQ3JlYXRpb25EYXRlIChEOjIwMjQwMTA5KQo+PgplbmRvYmoKMiAwIG9iago8PAovUGFnZXMgMyAwIFIKL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0tpZHMgWzQgMCBSXQovQ291bnQgMQovVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovVHlwZSAvUGFnZQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCAzMwo+PgpzdHJlYW0KQJRMXHJ3IDEgai6ItCDo5aSAMAr5/t9JCG9PUENVKGZFCkVORFNUUkVBTQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAxMTYgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMjMwIDAwMDAwIG4gCjAwMDAwMDAzMjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDIgMCBSCj4+CnN0YXJ0eHJlZgo0MDkKJSVFT0YK', // PDF test minimal base64
  date_creation: new Date().toISOString(),

  // Invoice metadata
  numero_facture: 'TEST_001',
  date_facture: new Date().toISOString().split('T')[0],
  montant_ttc: 1200.00,
  acompte: 300.00,
  montant_restant: 900.00,

  // Champs financiers détaillés
  montant_ht: 1000.00,
  montant_tva: 200.00,
  montant_remise: 0,
  taux_tva: 20,

  // Client information
  nom_du_client: 'Test Client',
  email_client: 'test@example.com',
  telephone_client: '0123456789',
  adresse_client: '123 Rue de Test, 75001 Paris',

  // Champs client détaillés
  client_adresse_rue: '123 Rue de Test',
  client_code_postal: '75001',
  client_ville: 'Paris',
  client_type_logement: 'Appartement',
  client_code_porte: 'A123',
  client_siret: '',

  // Payment information
  mode_paiement: 'Chèque',
  signature: 'Oui',
  signature_presente: 'Oui',
  signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  date_signature: new Date().toISOString(),

  // Livraison
  methode_livraison: 'Livraison standard',
  notes_livraison: 'Livraison en semaine',

  // Chèques à venir
  nombre_cheques: 3,
  montant_par_cheque: '300.00',
  mode_paiement_avec_details: 'Chèque - 3 chèques à venir de 300.00€ chacun',

  // Paiement ALMA
  est_paiement_alma: false,
  nombre_paiements_alma: 0,
  montant_par_paiement_alma: '',

  // RIB pour virement
  afficher_rib: false,
  rib_html: '',
  rib_texte: '',

  // Notes et métadonnées
  notes_facture: 'Facture de test pour validation N8N',
  conseiller: 'Test Conseiller',
  lieu_evenement: 'Showroom Paris',
  conditions_acceptees: 'Oui',
  date_creation_facture: new Date().toISOString(),
  date_modification_facture: new Date().toISOString(),

  // Produits HTML pour email
  produits_html: '<li><strong>Canapé Premium</strong><br>Quantité: 1 × 1000.00€ = <strong>1000.00€</strong></li><li><strong>Table basse</strong><br>Quantité: 1 × 200.00€ = <strong>200.00€</strong></li>',

  // Liste produits pour email
  liste_produits_email: '• Canapé Premium - Quantité: 1 - Prix unitaire: 1000.00€ - Total: 1000.00€\n• Table basse - Quantité: 1 - Prix unitaire: 200.00€ - Total: 200.00€',

  // Noms des produits
  noms_produits_string: 'Canapé Premium, Table basse',
  resume_produits: 'Canapé Premium et 1 autre produit',

  // Champs produits séparés
  produits_noms: ['Canapé Premium', 'Table basse'],
  produits_categories: ['Canapé', 'Table'],
  produits_quantites: [1, 1],
  produits_prix_unitaires: ['1000.00', '200.00'],
  produits_prix_ht_unitaires: ['833.33', '166.67'],
  produits_remises: [0, 0],
  produits_types_remises: ['fixed', 'fixed'],
  produits_totaux: ['1000.00', '200.00'],
  produits_totaux_ht: ['833.33', '166.67'],
  produits_statuts_livraison: ['a_livrer', 'a_livrer'],

  // Métadonnées
  nombre_produits: 2,

  // Statistiques livraison
  nombre_produits_a_livrer: 2,
  nombre_produits_emportes: 0,
  noms_produits_a_livrer: 'Canapé Premium, Table basse',
  noms_produits_emportes: '',
  a_une_livraison: 'Oui',
  a_des_produits_emportes: 'Non',

  // Structure produits pour N8N
  produits: [
    {
      nom: 'Canapé Premium',
      quantite: 1,
      prix_ttc: 1000.00,
      prix_ht: 833.33,
      total_ttc: 1000.00,
      total_ht: 833.33,
      categorie: 'Canapé',
      statut_livraison: 'a_livrer',
      remise: 0,
      type_remise: 'fixed'
    },
    {
      nom: 'Table basse',
      quantite: 1,
      prix_ttc: 200.00,
      prix_ht: 166.67,
      total_ttc: 200.00,
      total_ht: 166.67,
      categorie: 'Table',
      statut_livraison: 'a_livrer',
      remise: 0,
      type_remise: 'fixed'
    }
  ],

  // Format texte produits
  produits_text: '1x Canapé Premium, 1x Table basse',

  // Google Drive folder ID
  dossier_id: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'
};

/**
 * Test l'envoi du webhook
 */
async function testWebhookSend() {
  console.log('🧪 TEST ENVOI FACTURE VERS N8N WEBHOOK');
  console.log('🎯 URL:', WEBHOOK_URL);
  console.log('📦 Payload size:', JSON.stringify(testInvoicePayload).length, 'chars');

  try {
    const startTime = Date.now();

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-Test-Invoice/1.0'
      },
      body: JSON.stringify(testInvoicePayload)
    });

    const responseTime = Date.now() - startTime;
    const responseText = await response.text();

    console.log('\n📊 RÉSULTATS:');
    console.log('⏱️  Temps de réponse:', responseTime + 'ms');
    console.log('🔢 Status:', response.status);
    console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📋 Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCÈS: Le webhook N8N a bien reçu la facture test');
      console.log('💌 Un email devrait être envoyé à test@example.com');
      console.log('💾 Et la facture sauvegardée sur Google Drive');
    } else {
      console.log('\n❌ ÉCHEC: Le webhook N8N a rejeté la facture test');
      console.log('🔍 Vérifiez la configuration du workflow N8N');
    }

  } catch (error) {
    console.log('\n❌ ERREUR RÉSEAU:', error.message);
    console.log('🔍 Vérifiez que N8N est accessible et configuré');
  }
}

// Lancer le test
testWebhookSend();
