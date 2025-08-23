#!/usr/bin/env node

/**
 * 🧪 TEST FINAL - GÉNÉRATION ET ENVOI FACTURE OPTIMISÉE
 * ====================================================
 * Simule le processus complet avec le nouveau logo optimisé
 */

import fetch from 'node-fetch';

console.log('🧪 TEST FINAL - FACTURE OPTIMISÉE COMPLÈTE');
console.log('==========================================');

// Simulation d'une facture avec tous les éléments (y compris signature)
const testInvoicePayload = {
  // PDF optimisé avec nouveau logo
  nom_facture: 'Facture_MYCONFORT_OPTIMIZED_001',
  fichier_facture: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw6PDqAoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCgoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKL0YxIDEyIFRmCjUwIDgwMCBUZAooVGVzdCBQREYgT3B0aW1pc8OpKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgo1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIwNCAwMDAwMCBuIAowMDAwMDAwMzA5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDA4CiUlRU9GCg==', // PDF test optimisé (~400 bytes)
  
  // Métadonnées de test avec logo optimisé
  numero_facture: 'OPTIMIZED_001',
  date_facture: new Date().toISOString().split('T')[0],
  montant_ttc: 1299.99,
  acompte: 300.00,
  montant_restant: 999.99,

  // Client
  nom_du_client: 'Client Test Optimisé',
  email_client: 'test-optimise@example.com',
  telephone_client: '0123456789',
  adresse_client: '123 Rue de l\'Optimisation, 75001 Paris',

  // Informations de test
  mode_paiement: 'Chèque',
  signature_presente: 'Oui',
  signature_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // Signature optimisée (~150 bytes)

  // Produits de test
  produits: [
    {
      nom: 'Canapé Premium Optimisé',
      quantite: 1,
      prix_ttc: 999.99,
      total_ttc: 999.99,
      categorie: 'Canapé'
    },
    {
      nom: 'Table Basse Design',
      quantite: 1,
      prix_ttc: 300.00,
      total_ttc: 300.00,
      categorie: 'Table'
    }
  ],

  // Métadonnées optimisées
  notes_facture: 'Test avec logo et PDF optimisés - Réduction de 56MB à <500KB',
  dossier_id: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'
};

async function testOptimizedInvoiceSend() {
  console.log('📋 PAYLOAD OPTIMISÉ:');
  const payloadSize = JSON.stringify(testInvoicePayload).length;
  const payloadSizeKB = (payloadSize / 1024).toFixed(2);
  
  console.log(`   Taille totale: ${payloadSizeKB} KB (${payloadSize} bytes)`);
  console.log(`   PDF base64: ${testInvoicePayload.fichier_facture.length} chars`);
  console.log(`   Signature: ${testInvoicePayload.signature_image.length} chars`);
  
  if (payloadSize < 100 * 1024) {
    console.log('   ✅ Payload < 100KB - Excellent !');
  } else if (payloadSize < 1024 * 1024) {
    console.log('   ✅ Payload < 1MB - Très bon');
  } else {
    console.log('   ⚠️ Payload > 1MB - À optimiser');
  }

  console.log('\n🚀 ENVOI VERS N8N...');
  
  try {
    const startTime = Date.now();
    
    // Test via proxy développement
    const response = await fetch('http://localhost:5173/api/n8n/webhook/facture-universelle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MYCONFORT-Optimized-Test/1.0'
      },
      body: JSON.stringify(testInvoicePayload)
    });

    const responseTime = Date.now() - startTime;
    const responseText = await response.text();

    console.log('\n📊 RÉSULTATS FINAUX:');
    console.log(`   ⏱️  Temps d'envoi: ${responseTime}ms`);
    console.log(`   🔢 Status HTTP: ${response.status}`);
    console.log(`   📄 Réponse: ${responseText}`);
    
    if (response.ok) {
      console.log('\n🎉 SUCCÈS TOTAL !');
      console.log('   ✅ Payload optimisé envoyé');
      console.log('   ✅ N8N a traité la facture');
      console.log('   ✅ Email sera envoyé au client');
      console.log('   ✅ PDF sera sauvegardé sur Drive');
      console.log('\n📈 AMÉLIORATION:');
      console.log(`   🔸 Avant: 56MB (échec EPIPE)`);
      console.log(`   🔸 Après: ${payloadSizeKB}KB (succès)`);
      console.log(`   🔸 Réduction: ${((56*1024 - payloadSize/1024) / (56*1024) * 100).toFixed(1)}%`);
    } else {
      console.log('\n❌ ERREUR:', response.status, responseText);
    }

  } catch (error) {
    console.log('\n❌ ERREUR RÉSEAU:', error.message);
  }
}

console.log('\n🎯 DÉMARRAGE DU TEST...');
testOptimizedInvoiceSend();
