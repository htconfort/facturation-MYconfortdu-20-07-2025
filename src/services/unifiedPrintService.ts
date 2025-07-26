import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

export class UnifiedPrintService {
  
  static async printInvoice(invoice: Invoice) {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
        return;
      }

      const total = invoice.products.reduce((sum, product) => 
        sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);

      const printContent = this.generateModernPrint(invoice, total);

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };

    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  }

  private static generateModernPrint(invoice: Invoice, total: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoice.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white; 
            color: #14281D;
            font-size: 11px;
            line-height: 1.3;
          }
          
          /* Page 1 - Facture condensée */
          .invoice-page {
            padding: 15mm;
            min-height: 100vh;
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }
          
          .header { 
            background: #477A0C; 
            color: white; 
            padding: 15px 20px; 
            text-align: center; 
            margin-bottom: 20px;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(71, 122, 12, 0.3);
          }
          
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          
          .header h2 {
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: normal;
            opacity: 0.9;
          }
          
          .invoice-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
          }
          
          .invoice-details, .client-info {
            background: #F2EFE2; 
            padding: 15px; 
            border-radius: 6px;
            border-left: 4px solid #477A0C;
            font-size: 11px;
          }
          
          .invoice-details h3,
          .client-info h3 {
            color: #477A0C;
            font-size: 13px;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #477A0C;
            padding-bottom: 3px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .invoice-details p,
          .client-info p {
            margin: 3px 0;
            line-height: 1.4;
          }
          
          .products-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(71, 122, 12, 0.2);
            flex-shrink: 0;
          }
          
          .products-table th, .products-table td { 
            padding: 8px 6px; 
            text-align: left; 
            border-bottom: 1px solid #e0e0e0;
          }
          
          .products-table th { 
            background: #477A0C; 
            color: white; 
            font-weight: bold;
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .products-table td:nth-child(2),
          .products-table td:nth-child(3),
          .products-table td:nth-child(4) {
            text-align: center;
          }
          
          .products-table tr:nth-child(even) {
            background-color: #F2EFE2;
          }
          
          .products-table tr:hover {
            background-color: rgba(71, 122, 12, 0.1);
          }
          
          .total-section { 
            margin-top: auto;
            padding: 15px;
            background: #F2EFE2;
            border-radius: 6px;
            border-left: 4px solid #477A0C;
            margin-bottom: 20px;
          }
          
          .total-grid {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            align-items: center;
          }
          
          .total-label {
            font-weight: bold;
            font-size: 12px;
            color: #14281D;
          }
          
          .total-value {
            text-align: right;
            font-weight: bold;
            font-size: 12px;
            color: #477A0C;
          }
          
          .total-main {
            font-size: 18px !important;
            color: #477A0C !important;
            border-top: 2px solid #477A0C;
            padding-top: 8px;
            margin-top: 8px;
          }
          
          .signature-info {
            background: #d4edda;
            border-left: 4px solid #477A0C;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }
          
          .signature-text {
            flex: 1;
          }
          
          .signature-container {
            background: white;
            border: 2px solid #477A0C;
            border-radius: 4px;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 80px;
            max-width: 120px;
            height: 40px;
          }
          
          .signature-image {
            max-height: 30px;
            max-width: 110px;
            object-fit: contain;
          }
          
          .legal-notice {
            background: #F55D3E;
            color: white;
            padding: 10px 15px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
            border-radius: 6px;
            margin-bottom: 20px;
            line-height: 1.3;
          }
          
          .company-footer {
            text-align: center;
            color: #080F0F;
            font-size: 10px;
            border-top: 2px solid #477A0C;
            padding-top: 15px;
            margin-top: auto;
          }
          
          .company-footer strong {
            color: #477A0C;
            font-size: 12px;
          }
          
          /* Page 2 - Conditions Générales */
          .conditions-page {
            padding: 15mm;
            min-height: 100vh;
            background: white;
          }
          
          .conditions-header {
            background: #477A0C;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 6px;
            margin-bottom: 25px;
          }
          
          .conditions-header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .conditions-warning {
            background: #F55D3E;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          
          .conditions-content {
            font-size: 10px;
            line-height: 1.4;
            columns: 2;
            column-gap: 20px;
            column-rule: 1px solid #477A0C;
          }
          
          .condition-section {
            margin-bottom: 12px;
            break-inside: avoid;
            padding: 8px;
            background: #F2EFE2;
            border-left: 3px solid #477A0C;
            border-radius: 4px;
          }
          
          .condition-section h3 {
            color: #477A0C;
            font-size: 11px;
            margin: 0 0 5px 0;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .condition-section p {
            margin: 0;
            text-align: justify;
            color: #14281D;
          }
          
          .conditions-footer {
            text-align: center;
            margin-top: 25px;
            font-size: 9px;
            font-style: italic;
            color: #080F0F;
            border-top: 2px solid #477A0C;
            padding-top: 15px;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0;
            }
            .invoice-page {
              padding: 12mm;
              page-break-after: always;
            }
            .conditions-page {
              padding: 12mm;
            }
            .no-print { 
              display: none !important; 
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1: FACTURE CONDENSÉE -->
        <div class="invoice-page">
          <div class="header">
            <h1>🌿 MYCONFORT</h1>
            <h2>Facture ${invoice.invoiceNumber}</h2>
          </div>
          
          <div class="invoice-info">
            <div class="invoice-details">
              <h3>📋 Détails Facture</h3>
              <p><strong>N°:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
              ${invoice.eventLocation ? `<p><strong>📍 Lieu:</strong> ${invoice.eventLocation}</p>` : ''}
              ${invoice.advisorName ? `<p><strong>👤 Conseiller:</strong> ${invoice.advisorName}</p>` : ''}
              ${invoice.clientHousingType ? `<p><strong>🏠 Logement:</strong> ${invoice.clientHousingType}</p>` : ''}
            </div>
            
            <div class="client-info">
              <h3>👤 Informations Client</h3>
              <p><strong>${invoice.clientName}</strong></p>
              <p>📍 ${invoice.clientAddress}</p>
              <p>${invoice.clientPostalCode} ${invoice.clientCity}</p>
              ${invoice.clientDoorCode ? `<p>🚪 Code: ${invoice.clientDoorCode}</p>` : ''}
              <p>📞 ${invoice.clientPhone}</p>
              <p>✉️ ${invoice.clientEmail}</p>
            </div>
          </div>
          
          <table class="products-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Qté</th>
                <th>P.U. TTC</th>
                <th>Remise</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.products.map(product => `
                <tr>
                  <td><strong>${product.name}</strong></td>
                  <td>${product.quantity}</td>
                  <td>${formatCurrency(product.priceTTC)}</td>
                  <td>
                    ${product.discount > 0 ? 
                      `<span style="color: #F55D3E; font-weight: bold; background-color: #ffe6e6; padding: 2px 6px; border-radius: 3px; font-size: 10px;">
                        -${product.discount}${product.discountType === 'percent' ? '%' : '€'}
                      </span>` : 
                      `<span style="color: #666; font-size: 10px;">-</span>`
                    }
                  </td>
                  <td>
                    <div><strong>${formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}</strong></div>
                    ${product.discount > 0 ? 
                      `<div style="font-size: 9px; color: #F55D3E; margin-top: 2px;">
                        (-${product.discountType === 'percent' ? product.discount + '%' : formatCurrency(product.discount)})
                      </div>` : ''
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-grid">
              <div class="total-label">Sous-total HT:</div>
              <div class="total-value">${formatCurrency(invoice.montantHT)}</div>
              
              <div class="total-label">TVA (${invoice.taxRate || 20}%):</div>
              <div class="total-value">${formatCurrency(invoice.montantTVA)}</div>
              
              <div class="total-label total-main">TOTAL TTC:</div>
              <div class="total-value total-main">${formatCurrency(total)}</div>
              
              ${invoice.montantAcompte > 0 ? `
                <div class="total-label">Acompte versé:</div>
                <div class="total-value">-${formatCurrency(invoice.montantAcompte)}</div>
                
                <div class="total-label total-main" style="color: #F55D3E !important;">Reste à payer:</div>
                <div class="total-value total-main" style="color: #F55D3E !important;">${formatCurrency(total - invoice.montantAcompte)}</div>
              ` : ''}
            </div>
          </div>
          
          ${invoice.signature ? `
            <div class="signature-info">
              <div class="signature-text">
                <p style="margin: 0; font-weight: bold; font-size: 11px;"><strong>✅ Facture signée électroniquement</strong></p>
                <p style="font-size: 9px; margin: 3px 0 0 0; line-height: 1.2;">Cette facture a été signée numériquement par le client le ${new Date(invoice.signatureDate || invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div class="signature-container">
                <img src="${invoice.signature}" alt="Signature électronique" class="signature-image" />
              </div>
            </div>
          ` : ''}
          
          <div class="legal-notice">
            ⚠️ IMPORTANT : LE CONSOMMATEUR NE BÉNÉFICIE PAS D'UN DROIT DE RÉTRACTATION POUR UN ACHAT EFFECTUÉ DANS UNE FOIRE OU DANS UN SALON.
          </div>
          
          <div class="company-footer">
            <p><strong>🌿 MYCONFORT</strong></p>
            <p>88 Avenue des Ternes, 75017 Paris • France</p>
            <p>📞 04 68 50 41 45 • ✉️ myconfort66@gmail.com</p>
            <p>SIRET: 824 313 530 00027</p>
            <p style="margin-top: 10px; font-style: italic;">Votre spécialiste en confort et bien-être</p>
          </div>
        </div>
        
        <!-- PAGE 2: CONDITIONS GÉNÉRALES -->
        <div class="conditions-page">
          <div class="conditions-header">
            <h1>📜 Conditions Générales de Vente</h1>
          </div>
          
          <div class="conditions-warning">
            ⚠️ IMPORTANT : LE CONSOMMATEUR NE BÉNÉFICIE PAS D'UN DROIT DE RÉTRACTATION POUR UN ACHAT EFFECTUÉ DANS UNE FOIRE OU DANS UN SALON.
          </div>
          
          <div class="conditions-content">
            ${this.generateConditionsGenerales()}
          </div>
          
          <div class="conditions-footer">
            <p>📧 Contact: myconfort66@gmail.com</p>
            <p>Les présentes Conditions Générales de Vente ont été mises à jour le 23 août 2024</p>
            <p>Version informatique générée automatiquement – 2024 • Format A4 – Usage Commercial Professionnel</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePremiumPrint(invoice: Invoice, total: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoice.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', 'Arial', sans-serif; 
            margin: 0; 
            padding: 20mm; 
            background: white; 
            color: #2c3e50;
            font-size: 12px;
            line-height: 1.6;
          }
          
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            margin-bottom: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 300;
            letter-spacing: 2px;
          }
          
          .header h2 {
            margin: 15px 0 0 0;
            font-size: 22px;
            font-weight: 300;
            opacity: 0.9;
          }
          
          .invoice-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-bottom: 40px; 
          }
          
          .invoice-details, .client-info {
            background: #f8f9fc;
            padding: 25px;
            border-radius: 12px;
            border-left: 5px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .invoice-details h3,
          .client-info h3 {
            color: #667eea;
            font-size: 18px;
            margin: 0 0 20px 0;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .client-info { 
            font-size: 12px;
          }
          
          .products-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 40px 0; 
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          
          .products-table th, .products-table td { 
            padding: 15px; 
            text-align: left; 
          }
          
          .products-table th { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            font-weight: 500;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .products-table td:nth-child(2),
          .products-table td:nth-child(3),
          .products-table td:nth-child(4) {
            text-align: center;
          }
          
          .products-table tr:nth-child(even) {
            background-color: #f8f9fc;
          }
          
          .products-table tr {
            border-bottom: 1px solid #e1e8ed;
          }
          
          .total-section { 
            text-align: right; 
            margin: 40px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fc, #e8ecf7);
            border-radius: 12px;
            border-left: 5px solid #667eea;
          }
          
          .total { 
            font-size: 24px; 
            font-weight: 600; 
            color: #667eea; 
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .signature-info {
            margin: 40px 0;
            padding: 20px;
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border-radius: 12px;
            border-left: 5px solid #28a745;
            text-align: center;
          }
          
          .company-footer {
            margin-top: 60px;
            text-align: center;
            color: #6c757d;
            font-size: 11px;
            border-top: 2px solid #e1e8ed;
            padding-top: 25px;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✨ MYCONFORT</h1>
          <h2>Facture ${invoice.invoiceNumber}</h2>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-details">
            <h3>Informations Facture</h3>
            <p><strong>Numéro:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            ${invoice.eventLocation ? `<p><strong>Lieu d'événement:</strong> ${invoice.eventLocation}</p>` : ''}
            ${invoice.advisorName ? `<p><strong>Conseiller:</strong> ${invoice.advisorName}</p>` : ''}
            ${invoice.clientHousingType ? `<p><strong>Type de logement:</strong> ${invoice.clientHousingType}</p>` : ''}
          </div>
          
          <div class="client-info">
            <h3>Informations Client</h3>
            <p><strong>${invoice.clientName}</strong></p>
            <p>${invoice.clientAddress}</p>
            <p>${invoice.clientPostalCode} ${invoice.clientCity}</p>
            ${invoice.clientDoorCode ? `<p><strong>Code porte:</strong> ${invoice.clientDoorCode}</p>` : ''}
            <p><strong>Téléphone:</strong> ${invoice.clientPhone}</p>
            <p><strong>Email:</strong> ${invoice.clientEmail}</p>
          </div>
        </div>
        
        <table class="products-table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Quantité</th>
              <th>Prix unitaire TTC</th>
              <th>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.products.map(product => `
              <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.quantity}</td>
                <td>${formatCurrency(product.priceTTC)}</td>
                <td><strong>${formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total">
            TOTAL TTC: ${formatCurrency(total)}
          </div>
          ${invoice.montantAcompte > 0 ? `
            <div style="font-size: 16px; margin-top: 15px;">
              <div>Acompte versé: ${formatCurrency(invoice.montantAcompte)}</div>
              <div style="color: #667eea; font-weight: bold; font-size: 18px; margin-top: 10px;">
                Reste à payer: ${formatCurrency(total - invoice.montantAcompte)}
              </div>
            </div>
          ` : ''}
        </div>
        
        ${invoice.signature ? `
          <div class="signature-info">
            <p><strong>✅ Facture signée électroniquement</strong></p>
            <p style="font-size: 12px; margin-top: 8px;">Cette facture a été signée numériquement par le client</p>
          </div>
        ` : ''}
        
        <div class="company-footer">
          <p><strong>MYCONFORT</strong></p>
          <p>88 Avenue des Ternes, 75017 Paris</p>
          <p>Téléphone: 04 68 50 41 45 • Email: myconfort66@gmail.com</p>
          <p>SIRET: 824 313 530 00027</p>
        </div>
      </body>
      </html>
    `;
  }

  private static generateProfessionalPrint(invoice: Invoice, _total: number): string {
    // Astuce : place ici l'URL de ta fleur/logo, ou intègre-le en base64 pour éviter tout souci de CORS lors du print/PDF.
    const logoUrl = "https://i.imgur.com/jRSn6Ov.png"; // <- Change ici par le vrai logo de ta fleur

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facture ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #222;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 13px;
        }
        .header {
          background: #477A0C;
          color: #fff;
          padding: 18px 0 10px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 0 0 6px 6px;
          margin-bottom: 25px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          margin-left: 40px;
        }
        .logo-section img {
          width: 48px;
          height: 48px;
          margin-right: 16px;
        }
        .brand-name {
          font-size: 25px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .subtitle {
          font-size: 14px;
          margin-left: 2px;
          color: #e7f8e3;
        }
        .badge-facture {
          background: #406c0c;
          color: #fff;
          padding: 12px 32px;
          border-radius: 5px 0 0 5px;
          font-weight: bold;
          font-size: 18px;
          margin-right: 0;
          letter-spacing: 1px;
        }
        .company-and-invoice {
          display: flex;
          justify-content: space-between;
          margin: 0 40px 12px 40px;
        }
        .company-info {
          font-size: 13px;
          line-height: 1.6;
        }
        .company-info strong {
          color: #477A0C;
        }
        .invoice-meta {
          text-align: right;
          font-size: 15px;
        }
        .invoice-meta .label {
          font-weight: bold;
          color: #477A0C;
        }
        hr {
          border: none;
          border-top: 2px solid #477A0C;
          margin: 22px 0 20px 0;
          width: 92%;
        }
        .double-columns {
          display: flex;
          justify-content: space-between;
          margin: 0 40px 16px 40px;
        }
        .double-columns > div {
          width: 49%;
          background: #fafafa;
          border: 1px solid #b5d7a2;
          border-radius: 6px;
          padding: 16px 22px;
          box-sizing: border-box;
          min-height: 78px;
        }
        .double-columns .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #477A0C;
          border-bottom: 1.5px solid #477A0C;
          margin-bottom: 9px;
          padding-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .double-columns p {
          margin: 0 0 4px 0;
          font-size: 13px;
        }
        .products-table {
          width: 92%;
          margin: 22px auto;
          border-collapse: collapse;
          box-shadow: 0 0 5px #d6ecd2;
          font-size: 13px;
        }
        .products-table th {
          background: #477A0C;
          color: #fff;
          font-weight: bold;
          text-align: center;
          padding: 9px 4px;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        .products-table td {
          padding: 7px 4px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
        }
        .products-table td:first-child, .products-table th:first-child {
          text-align: left;
          padding-left: 8px;
        }
        .products-table tr:last-child td {
          border-bottom: none;
        }
        .totals-box {
          width: 340px;
          float: right;
          margin-right: 4.5vw;
          margin-top: 8px;
          margin-bottom: 26px;
          background: #f8fefa;
          border-radius: 8px;
          box-shadow: 0 2px 8px #e8fbe6;
          border-left: 4px solid #477A0C;
          padding: 20px 18px 16px 18px;
        }
        .totals-box table {
          width: 100%;
          font-size: 13px;
        }
        .totals-box tr td {
          padding: 3.5px 0;
        }
        .totals-box .label {
          color: #333;
        }
        .totals-box .total-ttc {
          font-size: 18px;
          font-weight: bold;
          color: #477A0C;
          border-top: 2.5px solid #477A0C;
          padding-top: 6px;
          margin-top: 5px;
        }
        .payment-method {
          width: 92%;
          margin: 22px auto 0 auto;
          background: #f6fef5;
          border-left: 4px solid #477A0C;
          border-radius: 5px;
          padding: 16px 18px;
          box-sizing: border-box;
        }
        .payment-method .section-title {
          color: #477A0C;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 6px;
          border-bottom: 1.3px solid #477A0C;
          padding-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .payment-method .mode {
          margin-bottom: 8px;
          font-weight: bold;
        }
        .thanks-footer {
          width: 100vw;
          background: #477A0C;
          color: #fff;
          padding: 22px 0 10px 0;
          margin-top: 32px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .thanks-footer img {
          vertical-align: middle;
          margin-right: 10px;
          width: 30px;
          height: 30px;
        }
        .thanks-footer .thanks-title {
          font-size: 16px;
          font-weight: bold;
          display: inline-block;
          margin-left: 10px;
          vertical-align: middle;
        }
        .thanks-footer .slogan {
          display: block;
          margin-top: 7px;
          font-size: 13px;
        }
        .thanks-footer .footer-details {
          margin-top: 3px;
          font-size: 11px;
          color: #e7f8e3;
        }
        .page-break {
          page-break-before: always;
          margin: 0;
          height: 1px;
          border: none;
        }
        .cgv {
          width: 92%;
          margin: 25px auto;
          font-size: 12px;
        }
        .cgv-title {
          font-size: 17px;
          font-weight: bold;
          color: #477A0C;
          border-bottom: 2.5px solid #477A0C;
          margin-bottom: 13px;
          padding-bottom: 4px;
          text-align: center;
          letter-spacing: 1px;
        }
        .cgv-important {
          color: #c93434;
          font-weight: bold;
          font-size: 13px;
          text-align: center;
          margin: 11px 0 17px 0;
          letter-spacing: 0.5px;
        }
        .cgv-article {
          margin-bottom: 9px;
        }
        .cgv-article-title {
          font-weight: bold;
          font-size: 12px;
          color: #000;
          margin-bottom: 1.5px;
        }
        .cgv-contact {
          margin: 13px 0 5px 0;
          font-size: 11px;
          color: #3d3d3d;
          text-align: right;
        }
        .cgv-footer {
          margin-top: 18px;
          font-size: 10px;
          color: #888;
          text-align: center;
        }
        @media print {
          .thanks-footer, .header, .company-and-invoice, .double-columns, .products-table, .totals-box, .payment-method, .cgv, .cgv-title, .cgv-important, .cgv-article, .cgv-contact, .cgv-footer {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <!-- EN-TÊTE -->
      <div class="header">
        <div class="logo-section">
          <img src="${logoUrl}" alt="MYCONFORT"/>
          <div>
            <div class="brand-name">MYCONFORT</div>
            <div class="subtitle">Facturation Professionnelle</div>
          </div>
        </div>
        <div class="badge-facture">FACTURE</div>
      </div>

      <!-- COORDONNÉES ENTREPRISE + INFOS FACTURE -->
      <div class="company-and-invoice">
        <div class="company-info">
          <strong>MYCONFORT</strong><br/>
          88 Avenue des Ternes<br/>
          75017 Paris, France<br/>
          SIRET: 824 313 530 00027<br/>
          Tél: 04 68 50 41 45<br/>
          Email: myconfort66@gmail.com<br/>
          Site web: https://www.htconfort.com
        </div>
        <div class="invoice-meta">
          <div><span class="label">N° Facture:</span> ${invoice.invoiceNumber}</div>
          <div><span class="label">Date:</span> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</div>
        </div>
      </div>

      <hr />

      <!-- INFOS CLIENT + INFOS COMPLÉMENTAIRES -->
      <div class="double-columns">
        <div>
          <div class="section-title">FACTURER À</div>
          <p><strong>${invoice.clientName}</strong></p>
          <p>${invoice.clientAddress}</p>
          <p>${invoice.clientPostalCode} ${invoice.clientCity}</p>
          <p>Tél: ${invoice.clientPhone || ""}</p>
          <p>Email: ${invoice.clientEmail || ""}</p>
        </div>
        <div>
          <div class="section-title">INFORMATIONS COMPLÉMENTAIRES</div>
          ${invoice.eventLocation ? `<p><strong>Lieu événement:</strong> ${invoice.eventLocation}</p>` : ""}
          ${invoice.advisorName ? `<p><strong>Conseiller:</strong> ${invoice.advisorName}</p>` : ""}
          ${invoice.clientHousingType ? `<p><strong>Type logement:</strong> ${invoice.clientHousingType}</p>` : ""}
        </div>
      </div>

      <!-- TABLEAU PRODUITS -->
      <table class="products-table">
        <thead>
          <tr>
            <th>DÉSIGNATION</th>
            <th>QTÉ</th>
            <th>PU HT</th>
            <th>PU TTC</th>
            <th>REMISE</th>
            <th>TOTAL TTC</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.products.map(product => `
            <tr>
              <td style="text-align: left;"><strong>${product.name}</strong></td>
              <td>${product.quantity}</td>
              <td>${formatCurrency(product.priceHT)}</td>
              <td>${formatCurrency(product.priceTTC)}</td>
              <td>${product.discount > 0 ? (product.discountType === 'percent' ? `${product.discount} %` : `${formatCurrency(product.discount)}`) : "-"}</td>
              <td><strong>${formatCurrency(
                calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType)
              )}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- TOTALS -->
      <div class="totals-box">
        <table>
          <tr>
            <td class="label">Total HT :</td>
            <td style="text-align: right;">${formatCurrency(invoice.montantHT)}</td>
          </tr>
          <tr>
            <td class="label">TVA (${invoice.taxRate || 20}%) :</td>
            <td style="text-align: right;">${formatCurrency(invoice.montantTVA)}</td>
          </tr>
          <tr>
            <td class="label total-ttc">TOTAL TTC :</td>
            <td class="total-ttc" style="text-align: right;">${formatCurrency(invoice.montantTTC)}</td>
          </tr>
          ${invoice.montantAcompte > 0 ? `
          <tr>
            <td class="label">Acompte :</td>
            <td style="text-align: right;">${formatCurrency(invoice.montantAcompte)}</td>
          </tr>
          <tr>
            <td class="label" style="color:#477A0C;font-weight: bold;">Reste à payer :</td>
            <td style="color:#477A0C;font-weight: bold;text-align: right;">${formatCurrency(invoice.montantRestant)}</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- MODALITÉS DE PAIEMENT -->
      <div class="payment-method">
        <div class="section-title">MODALITÉS DE PAIEMENT</div>
        <div class="mode">Mode de règlement : ${invoice.paymentMethod || ""}</div>
        <div style="font-size: 12px;">
          Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.
        </div>
      </div>

      <!-- FOOTER MERCI -->
      <div class="thanks-footer">
        <img src="${logoUrl}" alt="MYCONFORT"/>
        <span class="thanks-title">MYCONFORT</span><br/>
        <span class="slogan">Merci de votre confiance !</span>
        <div class="footer-details">
          Votre spécialiste en matelas et literie de qualité<br/>
          TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530
        </div>
      </div>

      <!-- SAUT DE PAGE -->
      <div class="page-break"></div>

      <!-- CGV -->
      <div class="cgv">
        <div class="cgv-title">CONDITIONS GÉNÉRALES DE VENTE</div>
        <div class="cgv-important">
          IMPORTANT : LE CONSOMMATEUR NE BÉNÉFICIE PAS D'UN DROIT DE RÉTRACTATION<br/>
          POUR UN ACHAT EFFECTUÉ DANS UNE FOIRE OU DANS UN SALON.
        </div>
        ${this.generateConditionsGenerales()}
        <div class="cgv-contact">Contact : myconfort66@gmail.com</div>
        <div class="cgv-footer">
          Les présentes Conditions Générales de Vente ont été mises à jour le 23 août 2024<br/>
          Version informatique générée automatiquement – 2024<br/>
          Format A4 – Public : Usage Commercial Professionnel PDF
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private static generateConditionsGenerales(): string {
    return `
      <div class="condition-section">
        <h3>Art. 1 - Livraison</h3>
        <p>Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 2 - Délais de Livraison</h3>
        <p>Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 3 - Risques de Transport</h3>
        <p>Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 4 - Acceptation des Conditions</h3>
        <p>Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 5 - Réclamations</h3>
        <p>Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 6 - Retours</h3>
        <p>Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n'implique aucune reconnaissance.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 7 - Tailles des Matelas</h3>
        <p>Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 8 - Odeur des Matériaux</h3>
        <p>Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 9 - Règlements et Remises</h3>
        <p>Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 10 - Paiement</h3>
        <p>Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 11 - Pénalités de Retard</h3>
        <p>En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 12 - Exigibilité en Cas de Non-Paiement</h3>
        <p>Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 13 - Livraison Incomplète ou Non-Conforme</h3>
        <p>En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 14 - Litiges</h3>
        <p>Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
      </div>

      <div class="condition-section">
        <h3>Art. 15 - Horaires de Livraison</h3>
        <p>Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.</p>
      </div>
    `;
  }
}
