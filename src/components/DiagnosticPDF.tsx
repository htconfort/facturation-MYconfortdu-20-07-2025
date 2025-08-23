import React from 'react';
import { Invoice } from '../types';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Test de diagnostic pour comparer aperçu HTML vs PDF
export const DiagnosticPDF: React.FC = () => {
  const testInvoice: Invoice = {
    invoiceNumber: 'TEST-001',
    invoiceDate: '2025-01-30',
    eventLocation: 'Paris',
    taxRate: 20,

    clientName: 'Client Test',
    clientEmail: 'test@example.com',
    clientPhone: '0123456789',
    clientAddress: '123 Rue Test',
    clientPostalCode: '75001',
    clientCity: 'Paris',
    clientHousingType: 'Appartement',
    clientDoorCode: '',
    clientSiret: '',

    products: [
      {
        name: 'Matelas Test',
        category: 'Literie',
        quantity: 1,
        priceTTC: 999.99,
        priceHT: 833.33,
        totalHT: 833.33,
        totalTTC: 999.99,
        discount: 0,
        discountType: 'percent',
      },
      {
        name: 'Oreiller Test',
        category: 'Accessoires',
        quantity: 2,
        priceTTC: 89.9,
        priceHT: 74.92,
        totalHT: 149.84,
        totalTTC: 179.8,
        discount: 10,
        discountType: 'percent',
      },
    ],

    montantHT: 0,
    montantTTC: 0,
    montantTVA: 0,
    montantRemise: 0,
    paymentMethod: 'Test',
    montantAcompte: 0,
    montantRestant: 0,
    deliveryMethod: '',
    deliveryNotes: '',
    signature: '',
    isSigned: false,
    invoiceNotes: '',
    advisorName: 'Test',
    termsAccepted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleTestPDF = async () => {
    console.log('🧪 TEST DIAGNOSTIC PDF');
    console.log('📋 Invoice de test:', testInvoice);

    // Tester la génération PDF avec logs
    try {
      await AdvancedPDFService.downloadPDF(testInvoice);
      console.log('✅ PDF généré avec succès');
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔬 Diagnostic PDF vs Aperçu</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Aperçu HTML */}
        <div
          style={{
            border: '2px solid #3B82F6',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <h3>📱 APERÇU HTML (invoice.products directement)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#3B82F6', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                  Produit
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                  Qté
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                  Prix TTC
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                  Remise
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {testInvoice.products.map((product, index) => {
                const productTotal = calculateProductTotal(
                  product.quantity,
                  product.priceTTC,
                  product.discount,
                  product.discountType === 'percent' ? 'percent' : 'fixed'
                );

                return (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {product.name}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                      }}
                    >
                      {product.quantity}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'right',
                      }}
                    >
                      {formatCurrency(product.priceTTC)}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'right',
                      }}
                    >
                      {product.discount > 0
                        ? `${product.discount}${product.discountType === 'percent' ? '%' : '€'}`
                        : '-'}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'right',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(productTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#EBF8FF',
              borderRadius: '4px',
            }}
          >
            <strong>Total calculé dans l'aperçu :</strong>
            <br />
            {formatCurrency(
              testInvoice.products.reduce((sum, product) => {
                return (
                  sum +
                  calculateProductTotal(
                    product.quantity,
                    product.priceTTC,
                    product.discount,
                    product.discountType === 'percent' ? 'percent' : 'fixed'
                  )
                );
              }, 0)
            )}
          </div>
        </div>

        {/* Simulation PDF */}
        <div
          style={{
            border: '2px solid #EF4444',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <h3>📄 PDF (via convertInvoiceData)</h3>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Le PDF utilise convertInvoiceData() qui mappe invoice.products vers
            data.items.
            <br />
            Cliquez sur "Tester PDF" et regardez les logs de la console pour
            voir ce qui se passe.
          </p>

          <button
            onClick={handleTestPDF}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🧪 Tester Génération PDF
          </button>

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#FEF2F2',
              borderRadius: '4px',
            }}
          >
            <strong>Instructions :</strong>
            <br />
            1. Cliquez sur "Tester PDF"
            <br />
            2. Regardez les logs de la console
            <br />
            3. Comparez les montants dans le PDF généré
            <br />
            4. Si les montants diffèrent, le problème est dans
            convertInvoiceData()
          </div>
        </div>
      </div>

      <div
        style={{ background: '#F3F4F6', padding: '16px', borderRadius: '8px' }}
      >
        <h4>🔍 Structure de test utilisée :</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(testInvoice.products, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DiagnosticPDF;
