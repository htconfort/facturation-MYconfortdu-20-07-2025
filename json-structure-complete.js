#!/usr/bin/env node

/**
 * 🔍 AFFICHAGE EXACT DU JSON ENVOYÉ PAR L'APPLICATION
 * Structure complète du payload vers le webhook N8N
 */

console.log('📦 JSON EXACT ENVOYÉ PAR NOTRE APPLICATION');
console.log('==========================================');
console.log('');

// Structure exacte que notre application envoie maintenant
const payloadExact = {
  // PDF et métadonnées de base
  "nom_facture": "Facture_MYCONFORT_2025-002",
  "fichier_facture": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTAwCj4+CnN0cmVhbQpCVApxCjI4LjM1IDc1NyBUZApxCi9GMSA5IFRmCihGQUNUVVJFIE1ZQ09ORk9SVCApIFRqCkVUClEKNDIuNTIgNzQ1IFRkCihOdW1lcm86IDIwMjUtMDAyKSBUagpFVApxCi9GMSA5IFRmCjxBIG5vdGVzPkVUClEKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgo8PDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2NiAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDIzNyAwMDAwMCBuIAowMDAwMDAzMTAgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NzQKJSVFT0Y=",
  "date_creation": "2025-07-30T14:52:32.891Z",

  // Numéro et date facture
  "numero_facture": "2025-002",
  "date_facture": "2025-07-30",

  // Montants financiers
  "montant_ttc": 1500.00,
  "acompte": 300.00,
  "montant_restant": 1200.00,
  "montant_ht": 1250.00,
  "montant_tva": 250.00,
  "montant_remise": 0,
  "taux_tva": 20,

  // Informations client
  "nom_du_client": "Jean Dupont",
  "email_client": "jean.dupont@example.com",
  "telephone_client": "0123456789",
  "adresse_client": "123 Rue de la Paix, 75001 Paris",
  "client_adresse_rue": "123 Rue de la Paix",
  "client_code_postal": "75001",
  "client_ville": "Paris",
  "client_type_logement": "Maison individuelle",
  "client_code_porte": "A123",
  "client_siret": "",

  // Paiement
  "mode_paiement": "Chèques à venir",
  "signature": "Oui",
  "signature_presente": "Oui",
  "date_signature": "2025-07-30T14:52:32.891Z",

  // Livraison
  "methode_livraison": "Standard",
  "notes_livraison": "Accès par l'arrière de la maison",

  // Chèques à venir
  "nombre_cheques": 4,
  "montant_par_cheque": "300.00",
  "mode_paiement_avec_details": "Chèques à venir - 4 chèques à venir de 300.00€ chacun",

  // Notes et métadonnées
  "notes_facture": "Installation prévue la semaine prochaine",
  "conseiller": "MYCONFORT",
  "lieu_evenement": "Domicile client",
  "conditions_acceptees": "Oui",
  "date_creation_facture": "2025-07-30T14:52:32.891Z",
  "date_modification_facture": "2025-07-30T14:52:32.891Z",

  // ✅ PRODUITS_HTML (pré-généré par l'application)
  "produits_html": "<li><strong>Volet Roulant Alu</strong><br>Quantité: 2 × 450.00€ = <strong>900.00€</strong></li><li><strong>Moustiquaire Enroulable</strong><br>Quantité: 1 × 200.00€ = <strong>200.00€</strong><br><em>Remise: -10%</em></li><li><strong>Installation</strong><br>Quantité: 1 × 400.00€ = <strong>400.00€</strong></li>",

  // ✅ CHAMPS PRODUITS SÉPARÉS (pour N8N)
  "produits_noms": ["Volet Roulant Alu", "Moustiquaire Enroulable", "Installation"],
  "produits_categories": ["Volets", "Moustiquaires", "Services"],
  "produits_quantites": [2, 1, 1],
  "produits_prix_unitaires": ["450.00", "200.00", "400.00"],
  "produits_prix_ht_unitaires": ["375.00", "166.67", "333.33"],
  "produits_remises": [0, 10, 0],
  "produits_types_remises": ["fixed", "percent", "fixed"],
  "produits_totaux": ["900.00", "200.00", "400.00"],
  "produits_totaux_ht": ["750.00", "166.67", "333.33"],

  // ✅ NOMBRE DE PRODUITS
  "nombre_produits": 3,

  // ✅ TABLEAU PRODUITS (STRUCTURE CORRIGÉE)
  "produits": [
    {
      "nom": "Volet Roulant Alu",
      "quantite": 2,
      "prix_ttc": 450.00,
      "prix_ht": 375.00,
      "total_ttc": 900.00,
      "total_ht": 750.00,
      "categorie": "Volets",
      "remise": 0,
      "type_remise": "fixed"
    },
    {
      "nom": "Moustiquaire Enroulable",
      "quantite": 1,
      "prix_ttc": 200.00,
      "prix_ht": 166.67,
      "total_ttc": 200.00,
      "total_ht": 166.67,
      "categorie": "Moustiquaires",
      "remise": 10,
      "type_remise": "percent"
    },
    {
      "nom": "Installation",
      "quantite": 1,
      "prix_ttc": 400.00,
      "prix_ht": 333.33,
      "total_ttc": 400.00,
      "total_ht": 333.33,
      "categorie": "Services",
      "remise": 0,
      "type_remise": "fixed"
    }
  ],

  // ✅ TEXTE PRODUITS (pour compatibilité)
  "produits_text": "2x Volet Roulant Alu, 1x Moustiquaire Enroulable, 1x Installation",

  // Google Drive
  "dossier_id": "1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-"
};

console.log('🎯 STRUCTURE COMPLÈTE DU PAYLOAD :');
console.log('==================================');
console.log(JSON.stringify(payloadExact, null, 2));

console.log('');
console.log('🔑 CHAMPS CLÉS POUR N8N :');
console.log('=========================');
console.log('');
console.log('📊 PRODUITS (tableau d\'objets) :');
console.log(JSON.stringify(payloadExact.produits, null, 2));
console.log('');
console.log('🎨 PRODUITS_HTML (pré-généré) :');
console.log(payloadExact.produits_html);
console.log('');
console.log('📝 PRODUITS_TEXT (compatible) :');
console.log(payloadExact.produits_text);
console.log('');
console.log('🔢 NOMBRE_PRODUITS :');
console.log(payloadExact.nombre_produits);

console.log('');
console.log('✅ CETTE STRUCTURE EST MAINTENANT ENVOYÉE PAR NOTRE APPLICATION');
console.log('📋 COPIEZ CETTE STRUCTURE POUR VOS TESTS N8N');
