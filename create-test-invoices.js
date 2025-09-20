// Script pour créer des factures de test
import fs from 'fs';
import path from 'path';

// Factures de test pour vérifier le scroll horizontal
const testInvoices = [
  {
    "invoiceNumber": "FAC-TEST-001",
    "invoiceDate": "2025-09-20",
    "clientName": "Client Test 1",
    "clientEmail": "client1@test.fr",
    "clientPhone": "01 23 45 67 89",
    "clientAddress": "123 Rue de Test",
    "clientPostalCode": "75001",
    "clientCity": "Paris",
    "eventLocation": "Salon professionnel",
    "taxRate": 20,
    "products": [
      {
        "name": "MATELAS BAMBOU 160x200",
        "quantity": 1,
        "priceHT": 500,
        "priceTTC": 600,
        "discount": 0,
        "discountType": "fixed",
        "category": "Literie"
      }
    ],
    "montantHT": 500,
    "montantTTC": 600,
    "montantTVA": 100,
    "montantAcompte": 0,
    "montantRestant": 600,
    "paymentMethod": "Virement bancaire",
    "deliveryMethod": "Livraison à domicile",
    "signature": true,
    "isSigned": true,
    "signatureDate": "2025-09-20",
    "advisorName": "Conseiller Test",
    "termsAccepted": true,
    "createdAt": "2025-09-20T15:31:00.000Z",
    "updatedAt": "2025-09-20T15:31:00.000Z"
  },
  {
    "invoiceNumber": "FAC-TEST-002", 
    "invoiceDate": "2025-09-19",
    "clientName": "Client Test 2 - Nom très long pour tester le scroll",
    "clientEmail": "client2@test-long-domain.com",
    "clientPhone": "01 23 45 67 89",
    "clientAddress": "456 Avenue de Test Très Longue",
    "clientPostalCode": "92100",
    "clientCity": "Boulogne-Billancourt",
    "eventLocation": "Événement professionnel avec nom très long",
    "taxRate": 20,
    "products": [
      {
        "name": "SOMMIER À LATTES 160x200",
        "quantity": 1,
        "priceHT": 300,
        "priceTTC": 360,
        "discount": 0,
        "discountType": "fixed",
        "category": "Literie"
      }
    ],
    "montantHT": 300,
    "montantTTC": 360,
    "montantTVA": 60,
    "montantAcompte": 0,
    "montantRestant": 360,
    "paymentMethod": "ALMA - 3 fois",
    "deliveryMethod": "Livraison express",
    "signature": true,
    "isSigned": true,
    "signatureDate": "2025-09-19",
    "advisorName": "Conseiller Expert",
    "termsAccepted": true,
    "createdAt": "2025-09-19T15:31:00.000Z",
    "updatedAt": "2025-09-19T15:31:00.000Z"
  }
];

console.log('📋 Factures de test créées:');
console.log(JSON.stringify(testInvoices, null, 2));

// Insérer dans localStorage via console
console.log('\n🔧 Pour insérer dans localStorage, collez ceci dans la console:');
console.log('localStorage.setItem("myconfortInvoices", JSON.stringify(' + JSON.stringify(testInvoices, null, 2) + '));');
console.log('location.reload();');
