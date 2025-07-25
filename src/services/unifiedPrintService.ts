import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

export type InvoiceStyle = 'classic' | 'modern' | 'premium';

export class UnifiedPrintService {
  
  static async printInvoice(invoice: Invoice, style: InvoiceStyle = 'modern') {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
        return;
      }

      const total = invoice.products.reduce((sum, product) => 
        sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);

      let printContent = '';

      switch (style) {
        case 'modern':
          printContent = this.generateModernPrint(invoice, total);
          break;
        case 'classic':
          printContent = this.generateClassicPrint(invoice, total);
          break;
        case 'premium':
          printContent = this.generatePremiumPrint(invoice, total);
          break;
        default:
          printContent = this.generateModernPrint(invoice, total);
      }

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
            color: #333;
            font-size: 12px;
            line-height: 1.4;
          }
          
          /* Page 1 - Facture */
          .invoice-page {
            padding: 20mm;
            min-height: 100vh;
            page-break-after: always;
          }
          
          .header { 
            background: linear-gradient(135deg, #477A0C, #5A8F0F); 
            color: white; 
            padding: 20px; 
            text-align: center; 
            margin-bottom: 30px;
            border-radius: 8px;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 10px 0 0 0;
            font-size: 20px;
            font-weight: normal;
          }
          
          .invoice-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            margin-bottom: 30px; 
          }
          
          .invoice-details h3,
          .client-info h3 {
            color: #477A0C;
            font-size: 16px;
            margin: 0 0 15px 0;
            border-bottom: 2px solid #477A0C;
            padding-bottom: 5px;
          }
          
          .client-info { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
            border-left: 4px solid #477A0C;
            font-size: 12px;
          }
          
          .products-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .products-table th, .products-table td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
          }
          
          .products-table th { 
            background: #477A0C; 
            color: white; 
            font-weight: bold;
            text-align: center;
          }
          
          .products-table td:nth-child(2),
          .products-table td:nth-child(3),
          .products-table td:nth-child(4) {
            text-align: center;
          }
          
          .products-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .total-section { 
            text-align: right; 
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #477A0C;
          }
          
          .total { 
            font-size: 20px; 
            font-weight: bold; 
            color: #477A0C; 
            margin-bottom: 10px;
          }
          
          .signature-info {
            margin: 30px 0;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            text-align: center;
          }
          
          .company-footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          /* Page 2 - Conditions Générales */
          .conditions-page {
            padding: 20mm;
            min-height: 100vh;
          }
          
          .conditions-header h1 {
            text-align: center;
            color: #477A0C;
            margin-bottom: 30px;
            font-size: 22px;
            border-bottom: 3px solid #477A0C;
            padding-bottom: 10px;
          }
          
          .conditions-content {
            font-size: 10px;
            line-height: 1.4;
            columns: 2;
            column-gap: 20px;
          }
          
          .condition-section {
            margin-bottom: 12px;
            break-inside: avoid;
          }
          
          .condition-section h3 {
            color: #477A0C;
            font-size: 11px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          
          .condition-section p {
            margin: 0;
            text-align: justify;
          }
          
          .conditions-footer {
            text-align: center;
            margin-top: 30px;
            font-size: 9px;
            font-style: italic;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0;
            }
            .invoice-page {
              padding: 15mm;
              page-break-after: always;
            }
            .conditions-page {
              padding: 15mm;
            }
            .no-print { 
              display: none !important; 
            }
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1: FACTURE -->
        <div class="invoice-page">
          <div class="header">
            <h1>MYCONFORT</h1>
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
              <div style="font-size: 14px; margin-top: 10px;">
                <div>Acompte versé: ${formatCurrency(invoice.montantAcompte)}</div>
                <div style="color: #477A0C; font-weight: bold; font-size: 16px; margin-top: 5px;">
                  Reste à payer: ${formatCurrency(total - invoice.montantAcompte)}
                </div>
              </div>
            ` : ''}
          </div>
          
          ${invoice.signature ? `
            <div class="signature-info">
              <p><strong>✅ Facture signée électroniquement</strong></p>
              <p style="font-size: 11px; margin-top: 5px;">Cette facture a été signée numériquement par le client</p>
            </div>
          ` : ''}
          
          <div class="company-footer">
            <p><strong>MYCONFORT</strong></p>
            <p>88 Avenue des Ternes, 75017 Paris</p>
            <p>Téléphone: 04 68 50 41 45 • Email: myconfort66@gmail.com</p>
            <p>SIRET: 824 313 530 00027</p>
          </div>
        </div>
        
        <!-- PAGE 2: CONDITIONS GÉNÉRALES -->
        <div class="conditions-page">
          <div class="conditions-header">
            <h1>CONDITIONS GÉNÉRALES DE VENTE</h1>
          </div>
          
          <div class="conditions-content">
            ${this.generateConditionsGenerales()}
          </div>
          
          <div class="conditions-footer">
            Les présentes Conditions générales ont été mises à jour le 23 août 2024
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateClassicPrint(invoice: Invoice, total: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoice.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            padding: 20mm; 
            background: white; 
            color: #000;
            font-size: 12px;
            line-height: 1.5;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #000;
          }
          
          .header h2 {
            margin: 10px 0 0 0;
            font-size: 18px;
            font-weight: normal;
          }
          
          .invoice-info { 
            display: table; 
            width: 100%; 
            margin-bottom: 30px; 
          }
          
          .invoice-details, .client-info {
            display: table-cell;
            width: 48%;
            vertical-align: top;
            padding: 15px;
            border: 1px solid #000;
          }
          
          .invoice-details {
            margin-right: 4%;
          }
          
          .invoice-details h3,
          .client-info h3 {
            margin: 0 0 15px 0;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
          }
          
          .client-info { 
            font-size: 12px;
          }
          
          .products-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
            border: 2px solid #000;
          }
          
          .products-table th, .products-table td { 
            border: 1px solid #000; 
            padding: 10px; 
            text-align: left; 
          }
          
          .products-table th { 
            background: #f0f0f0; 
            font-weight: bold;
            text-align: center;
          }
          
          .products-table td:nth-child(2),
          .products-table td:nth-child(3),
          .products-table td:nth-child(4) {
            text-align: center;
          }
          
          .total-section { 
            text-align: right; 
            margin: 30px 0;
            padding: 15px;
            border: 2px solid #000;
          }
          
          .total { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 10px;
          }
          
          .signature-info {
            margin: 30px 0;
            padding: 15px;
            border: 1px solid #000;
            text-align: center;
          }
          
          .company-footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            border-top: 1px solid #000;
            padding-top: 20px;
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
          <h1>MYCONFORT</h1>
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
            <div style="font-size: 14px; margin-top: 10px;">
              <div>Acompte versé: ${formatCurrency(invoice.montantAcompte)}</div>
              <div style="font-weight: bold; font-size: 16px; margin-top: 5px;">
                Reste à payer: ${formatCurrency(total - invoice.montantAcompte)}
              </div>
            </div>
          ` : ''}
        </div>
        
        ${invoice.signature ? `
          <div class="signature-info">
            <p><strong>✅ Facture signée électroniquement</strong></p>
            <p style="font-size: 11px; margin-top: 5px;">Cette facture a été signée numériquement par le client</p>
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
