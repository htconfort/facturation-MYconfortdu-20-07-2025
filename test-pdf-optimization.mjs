#!/usr/bin/env node

/**
 * 🧪 TEST GÉNÉRATION PDF OPTIMISÉ
 * ===============================
 * Teste la génération d'un PDF avec les nouvelles optimisations
 * pour vérifier que la taille est acceptable pour l'envoi N8N
 */

// Simuler un environnement de test pour les imports
global.document = {
  createElement: () => ({
    getContext: () => ({
      drawImage: () => {},
      fillRect: () => {},
      fillStyle: '',
    }),
    width: 0,
    height: 0,
    toDataURL: () => 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  }),
  head: {
    appendChild: () => {},
  },
};

global.Image = class {
  onload = null;
  onerror = null;
  src = '';
  width = 100;
  height = 50;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
};

global.URL = {
  createObjectURL: () => 'mock-blob-url',
};

global.FileReader = class {
  onload = null;
  onerror = null;
  result = null;
  
  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      if (this.onload) this.onload();
    }, 10);
  }
};

global.fetch = async (url) => ({
  blob: async () => new Blob(['test'], { type: 'image/png' }),
});

global.window = global;

// Test facture simple
const testInvoice = {
  invoiceNumber: 'TEST_PDF_001',
  invoiceDate: '2025-08-23',
  clientName: 'Client Test',
  clientAddress: '123 Rue Test',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientPhone: '0123456789',
  clientEmail: 'test@example.com',
  products: [
    {
      name: 'Produit Test 1',
      quantity: 1,
      priceTTC: 100,
      priceHT: 83.33,
      discount: 0,
      discountType: 'fixed',
      category: 'Test'
    },
    {
      name: 'Produit Test 2',
      quantity: 2,
      priceTTC: 50,
      priceHT: 41.67,
      discount: 0,
      discountType: 'fixed',
      category: 'Test'
    }
  ],
  montantHT: 175,
  montantTVA: 35,
  montantTTC: 200,
  taxRate: 20,
  paymentMethod: 'Espèces',
  invoiceNotes: 'Test de génération PDF optimisé',
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  isSigned: true,
  signatureDate: '2025-08-23T14:30:00Z'
};

async function testPDFGeneration() {
  console.log('🧪 TEST GÉNÉRATION PDF OPTIMISÉ');
  
  try {
    // Importer le service PDF
    const { PDFService } = await import('../src/services/pdfService.ts');
    
    console.log('📝 Génération du PDF avec facture test...');
    const startTime = Date.now();
    
    const pdfBlob = await PDFService.generateInvoicePDF(testInvoice);
    
    const generationTime = Date.now() - startTime;
    const pdfSizeMB = pdfBlob.size / (1024 * 1024);
    
    console.log('\n📊 RÉSULTATS:');
    console.log('⏱️  Temps de génération:', generationTime + 'ms');
    console.log('📄 Taille PDF:', `${pdfSizeMB.toFixed(3)} MB`);
    console.log('📊 Taille PDF (bytes):', pdfBlob.size);
    console.log('🎯 Type:', pdfBlob.type);
    
    // Vérification de la taille
    if (pdfSizeMB < 1) {
      console.log('✅ EXCELLENT: PDF léger (< 1MB)');
    } else if (pdfSizeMB < 5) {
      console.log('✅ BON: PDF de taille acceptable (< 5MB)');
    } else if (pdfSizeMB < 10) {
      console.log('⚠️  ATTENTION: PDF volumineux (5-10MB)');
    } else {
      console.log('❌ PROBLÈME: PDF trop volumineux (> 10MB)');
    }
    
    // Test conversion en base64
    console.log('\n🔄 Test conversion base64...');
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur conversion'));
      reader.readAsDataURL(pdfBlob);
    });
    
    const pdfBase64 = await base64Promise;
    const base64SizeMB = pdfBase64.length / (1024 * 1024);
    
    console.log('📊 Taille base64:', `${base64SizeMB.toFixed(3)} MB`);
    console.log('📊 Taille base64 (chars):', pdfBase64.length);
    
    if (base64SizeMB < 1) {
      console.log('✅ PARFAIT: Base64 léger (< 1MB) - Compatible N8N');
    } else if (base64SizeMB < 5) {
      console.log('✅ BON: Base64 acceptable (< 5MB) - Compatible N8N');
    } else {
      console.log('❌ PROBLÈME: Base64 trop volumineux - Risque d\'erreur N8N');
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Lancer le test
testPDFGeneration();
