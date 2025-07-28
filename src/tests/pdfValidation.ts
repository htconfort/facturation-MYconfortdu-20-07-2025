import { PDFService } from '../services/pdfService';

// Simple test data for PDF generation validation (partial Invoice for testing)
export const TEST_INVOICE_DATA = {
  invoiceNumber: 'TEST-2024-001',
  invoiceDate: '2024-07-28',
  clientName: 'CLIENT TEST MYCONFORT',
  clientEmail: 'test@myconfort.com',
  clientPhone: '04 68 50 41 45',
  clientAddress: '123 Avenue de Test',
  clientPostalCode: '66000',
  clientCity: 'Perpignan',
  products: [
    {
      name: 'Produit Test 1 - Matelas MyConfort Premium',
      quantity: 1,
      priceTTC: 1200
    },
    {
      name: 'Produit Test 2 - Oreiller Ergonomique',  
      quantity: 2,
      priceTTC: 150
    }
  ]
};

/**
 * Test class for validating PDF generation consistency
 */
export class PDFValidationTests {
  
  /**
   * Test that PDF can be generated from the modern preview component
   */
  static async testPDFGeneration(): Promise<boolean> {
    try {
      console.log('🧪 TEST PDF GENERATION - Début du test');
      
      // Create a temporary container for the test
      const testContainer = document.createElement('div');
      testContainer.style.position = 'fixed';
      testContainer.style.left = '-9999px';
      testContainer.style.top = '-9999px';
      testContainer.style.width = '800px';
      testContainer.style.backgroundColor = 'white';
      testContainer.innerHTML = '<div id="test-invoice-preview"></div>';
      document.body.appendChild(testContainer);
      
      // Render the InvoicePreviewModern component (would need React rendering in real scenario)
      const invoiceElement = testContainer.querySelector('#test-invoice-preview') as HTMLElement;
      if (!invoiceElement) {
        throw new Error('Failed to create test invoice element');
      }
      
      // Simulate the modern invoice content
      invoiceElement.innerHTML = `
        <div class="modern-invoice" style="font-family: Arial; background: #f7f8f5; padding: 20px;">
          <div style="background: #477A0C; color: white; padding: 12px; text-align: center; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 36px;">🌿 MYCONFORT</h1>
            <h2 style="margin: 3px 0 0 0; font-size: 14px;">Facture ${TEST_INVOICE_DATA.invoiceNumber}</h2>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: white; padding: 10px; border: 2px solid #000;">
              <h3>📋 Détails Facture</h3>
              <p><strong>N°:</strong> ${TEST_INVOICE_DATA.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(TEST_INVOICE_DATA.invoiceDate).toLocaleDateString('fr-FR')}</p>
            </div>
            <div style="background: white; padding: 10px; border: 2px solid #000;">
              <h3>👤 Client</h3>
              <p><strong>${TEST_INVOICE_DATA.clientName}</strong></p>
              <p>${TEST_INVOICE_DATA.clientAddress}</p>
              <p>${TEST_INVOICE_DATA.clientPostalCode} ${TEST_INVOICE_DATA.clientCity}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 2px solid #000;">
            <thead>
              <tr style="background: #477A0C; color: white;">
                <th style="padding: 6px; border: 1px solid #000;">Produit</th>
                <th style="padding: 6px; border: 1px solid #000;">Qté</th>
                <th style="padding: 6px; border: 1px solid #000;">Prix TTC</th>
              </tr>
            </thead>
            <tbody>
              ${TEST_INVOICE_DATA.products.map((product: any, index: number) => `
                <tr style="background: ${index % 2 === 0 ? 'white' : '#f8f8f8'};">
                  <td style="padding: 6px; border: 1px solid #000;">${product.name}</td>
                  <td style="padding: 6px; border: 1px solid #000; text-align: center;">${product.quantity}</td>
                  <td style="padding: 6px; border: 1px solid #000; text-align: center;">${product.priceTTC}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Wait for the content to be rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test PDF generation (simplified - using any type for test data)
      const pdfBlob = await PDFService.generateInvoicePDF(TEST_INVOICE_DATA as any, invoiceElement);
      
      // Validate the PDF
      const isValid = pdfBlob && pdfBlob.size > 1000; // Should be at least 1KB
      
      // Cleanup
      document.body.removeChild(testContainer);
      
      console.log(`🧪 TEST PDF GENERATION - ${isValid ? 'RÉUSSI' : 'ÉCHEC'}`);
      console.log(`📊 Taille du PDF: ${pdfBlob.size} bytes`);
      
      return isValid;
      
    } catch (error) {
      console.error('❌ TEST PDF GENERATION - ERREUR:', error);
      return false;
    }
  }
  
  /**
   * Test PDF diagnostic functionality
   */
  static async testPDFDiagnostic(): Promise<boolean> {
    try {
      console.log('🧪 TEST PDF DIAGNOSTIC - Début du test');
      
      // Create a test element with potential issues
      const testElement = document.createElement('div');
      testElement.style.width = '0px'; // Problematic dimension
      testElement.style.height = '0px';
      testElement.innerHTML = ''; // Empty content
      document.body.appendChild(testElement);
      
      // Run diagnostic (should detect issues)
      await PDFService.diagnosePDFIssues(testElement);
      
      // Cleanup
      document.body.removeChild(testElement);
      
      console.log('🧪 TEST PDF DIAGNOSTIC - RÉUSSI');
      return true;
      
    } catch (error) {
      console.error('❌ TEST PDF DIAGNOSTIC - ERREUR:', error);
      return false;
    }
  }
  
  /**
   * Run all PDF validation tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🚀 DÉBUT DES TESTS PDF VALIDATION');
    
    const results = {
      pdfGeneration: await this.testPDFGeneration(),
      pdfDiagnostic: await this.testPDFDiagnostic()
    };
    
    const successCount = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    
    console.log('📊 RÉSULTATS DES TESTS:');
    console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);
    console.log('🔍 Détails:', results);
    
    if (successCount === totalTests) {
      console.log('🎉 TOUS LES TESTS PDF SONT RÉUSSIS !');
      alert('🎉 Tous les tests PDF sont réussis ! Le système est prêt.');
    } else {
      console.warn('⚠️ Certains tests PDF ont échoué. Vérifiez les logs.');
      alert(`⚠️ ${totalTests - successCount} test(s) PDF ont échoué. Vérifiez la console.`);
    }
  }
}

// Export test functions for use in DebugCenter
export { PDFValidationTests as default };
