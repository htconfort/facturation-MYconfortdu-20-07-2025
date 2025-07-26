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
            font-size: 13px;
            line-height: 1.4;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            box-sizing: border-box;
            page-break-after: always;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #477A0C;
          }

          .company-info {
            flex: 1;
          }

          .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #477A0C;
            margin-bottom: 8px;
          }

          .company-details {
            font-size: 11px;
            color: #666;
            line-height: 1.3;
          }

          .invoice-title {
            text-align: right;
            flex: 1;
          }

          .invoice-title h1 {
            background: #477A0C;
            color: white;
            margin: 0;
            padding: 15px 20px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px;
          }

          .invoice-number {
            color: #477A0C;
            margin-top: 8px;
            font-weight: bold;
            font-size: 14px;
          }

          .client-info {
            background: #d4edda;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #477A0C;
          }

          .client-info h3 {
            margin: 0 0 10px 0;
            color: #477A0C;
            font-size: 14px;
            font-weight: bold;
          }

          .table-container {
            margin: 20px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #ddd;
          }

          th {
            background: #477A0C;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
          }

          td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 12px;
          }

          tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          .discount-badge {
            background: #dc3545;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }

          .totals {
            margin-top: 30px;
            text-align: right;
          }

          .total-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }

          .total-final {
            background: #477A0C;
            color: white;
            padding: 15px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            margin-top: 10px;
          }

          .footer-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .signature-section {
            width: 300px;
            text-align: center;
          }

          .signature-box {
            border: 2px solid #477A0C;
            height: 120px;
            margin: 10px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: #f8f9fa;
          }

          .signature-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
          }

          .law-article {
            background: #fff3cd;
            border: 2px solid #dc3545;
            padding: 10px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 11px;
            color: #721c24;
            text-align: center;
            font-weight: bold;
          }

          .info-section {
            flex: 1;
            margin-right: 20px;
          }

          .info-item {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #477A0C;
          }

          .info-label {
            font-weight: bold;
            color: #477A0C;
            font-size: 12px;
          }

          .cgv-page {
            page-break-before: always;
          }

          .cgv-title {
            color: #477A0C;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #477A0C;
            padding-bottom: 10px;
          }

          .cgv-content {
            font-size: 11px;
            line-height: 1.5;
            text-align: justify;
          }

          .cgv-section {
            margin-bottom: 15px;
          }

          .cgv-section h4 {
            color: #477A0C;
            font-size: 13px;
            margin-bottom: 5px;
            font-weight: bold;
          }

          @media print {
            body { 
              background: white; 
              font-size: 12px;
            }
            
            .page {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 10mm;
              page-break-after: always;
            }
            
            .page:last-child {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1: FACTURE -->
        <div class="page">
          <!-- En-tête -->
          <div class="header">
            <div class="company-info">
              <div class="company-name">HT CONFORT</div>
              <div class="company-details">
                Spécialiste climatisation et chauffage<br>
                123 Rue de la Climatisation<br>
                75000 PARIS<br>
                Tél: 01 23 45 67 89<br>
                Email: contact@htconfort.fr<br>
                SIRET: 123 456 789 00012 | TVA: FR12345678901
              </div>
            </div>
            <div class="invoice-title">
              <h1>FACTURE</h1>
              <div class="invoice-number">N° ${invoice.invoiceNumber}</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">
                Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          <!-- Informations client -->
          <div class="client-info">
            <h3>FACTURER À:</h3>
            <strong>${invoice.clientName}</strong><br>
            ${invoice.clientAddress}<br>
            ${invoice.clientPostalCode} ${invoice.clientCity}<br>
            ${invoice.clientEmail ? `Email: ${invoice.clientEmail}<br>` : ''}
            ${invoice.clientPhone ? `Tél: ${invoice.clientPhone}<br>` : ''}
          </div>

          <!-- Tableau des produits -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th style="width: 80px;">Qté</th>
                  <th style="width: 100px;">Prix HT</th>
                  <th style="width: 100px;">Prix TTC</th>
                  <th style="width: 80px;">Remise</th>
                  <th style="width: 120px;">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.products.map(product => {
                  const productTotal = calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
                  const discountDisplay = product.discount > 0 ? 
                    `<span class="discount-badge">${product.discount}${product.discountType === 'percent' ? '%' : '€'}</span>` : 
                    '-';
                  
                  return `
                    <tr>
                      <td>
                        <strong>${product.name}</strong>
                      </td>
                      <td>${product.quantity}</td>
                      <td>${formatCurrency(product.priceTTC / 1.2)}</td>
                      <td>${formatCurrency(product.priceTTC)}</td>
                      <td>${discountDisplay}</td>
                      <td><strong>${formatCurrency(productTotal)}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totaux -->
          <div class="totals">
            <div class="total-line">
              <span>Total HT:</span>
              <span>${formatCurrency(total / 1.2)}</span>
            </div>
            <div class="total-line">
              <span>TVA (20%):</span>
              <span>${formatCurrency(total * 0.2 / 1.2)}</span>
            </div>
            <div class="total-final">
              <div class="total-line" style="border: none; color: white;">
                <span>TOTAL TTC:</span>
                <span>${formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <!-- Section footer avec informations et signature -->
          <div class="footer-section">
            <div class="info-section">
              ${invoice.eventLocation ? `
                <div class="info-item">
                  <div class="info-label">LIEU D'INTERVENTION:</div>
                  ${invoice.eventLocation}
                </div>
              ` : ''}
              
              ${invoice.eventLocation ? `
                <div class="info-item">
                  <div class="info-label">DATE D'INTERVENTION:</div>
                  ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                </div>
              ` : ''}

              <div class="info-item">
                <div class="info-label">CONDITIONS DE PAIEMENT:</div>
                Paiement à réception de facture<br>
                En cas de retard, pénalités de 3% par mois
              </div>
            </div>

            <div class="signature-section">
              <div style="font-weight: bold; color: #477A0C; margin-bottom: 10px;">
                Signature du client
              </div>
              <div class="signature-box">
                ${invoice.signature ? 
                  `<img src="${invoice.signature}" alt="Signature client" class="signature-image" />` : 
                  '<span style="color: #999; font-style: italic;">Signature requise</span>'
                }
              </div>
              <div style="font-size: 11px; color: #666;">
                Bon pour accord et exécution
              </div>

              <!-- Article de loi -->
              <div class="law-article">
                ⚖️ Article L.441-6 du Code de commerce ⚖️<br>
                Facturation immédiate obligatoire pour les prestations de services
              </div>
            </div>
          </div>
        </div>

        <!-- PAGE 2: CONDITIONS GÉNÉRALES -->
        <div class="page cgv-page">
          <div class="cgv-title">CONDITIONS GÉNÉRALES DE VENTE</div>
          
          <div class="cgv-content">
            <div class="cgv-section">
              <h4>1. OBJET</h4>
              <p>Les présentes conditions générales de vente régissent les relations contractuelles entre HT CONFORT et ses clients pour la fourniture et l'installation d'équipements de climatisation et de chauffage.</p>
            </div>

            <div class="cgv-section">
              <h4>2. PRIX ET PAIEMENT</h4>
              <p>Les prix sont exprimés en euros TTC. Le paiement est exigible à réception de facture. En cas de retard de paiement, des pénalités de retard au taux de 3% par mois sont automatiquement appliquées, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.</p>
            </div>

            <div class="cgv-section">
              <h4>3. DÉLAIS D'EXÉCUTION</h4>
              <p>Les délais d'intervention sont donnés à titre indicatif. Un retard dans l'exécution ne peut donner lieu à annulation de la commande, pénalités ou dommages-intérêts.</p>
            </div>

            <div class="cgv-section">
              <h4>4. GARANTIES</h4>
              <p>Nous garantissons nos installations contre tout vice de fabrication pendant 2 ans à compter de la réception des travaux. Cette garantie ne couvre pas l'usure normale, les dommages résultant d'un mauvais usage ou d'un défaut d'entretien.</p>
            </div>

            <div class="cgv-section">
              <h4>5. RESPONSABILITÉ</h4>
              <p>Notre responsabilité est limitée au montant de la facture. Nous ne saurions être tenus responsables des dommages indirects ou immatériels.</p>
            </div>

            <div class="cgv-section">
              <h4>6. PROPRIÉTÉ</h4>
              <p>Les équipements livrés demeurent notre propriété jusqu'au paiement intégral du prix. En cas de non-paiement, nous nous réservons le droit de reprendre les équipements installés.</p>
            </div>

            <div class="cgv-section">
              <h4>7. DROIT DE RÉTRACTATION</h4>
              <p>Conformément à l'article L.121-21 du Code de la consommation, le client dispose d'un délai de 14 jours pour exercer son droit de rétractation, sauf exceptions prévues par la loi.</p>
            </div>

            <div class="cgv-section">
              <h4>8. LITIGES</h4>
              <p>Tout litige relatif à l'interprétation ou à l'exécution des présentes conditions générales sera de la compétence exclusive des tribunaux de Paris. Le droit français est seul applicable.</p>
            </div>

            <div class="cgv-section">
              <h4>9. DONNÉES PERSONNELLES</h4>
              <p>Les données personnelles collectées sont traitées conformément au RGPD. Elles sont utilisées uniquement dans le cadre de la relation commerciale et ne sont pas transmises à des tiers.</p>
            </div>

            <div class="cgv-section">
              <h4>10. ACCEPTATION</h4>
              <p>La signature du présent devis/facture emporte acceptation pleine et entière des présentes conditions générales de vente.</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #477A0C; color: #477A0C; font-weight: bold;">
            HT CONFORT - Votre spécialiste climatisation et chauffage<br>
            <span style="font-size: 11px; color: #666;">Conditions générales disponibles sur demande | Version du ${new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
