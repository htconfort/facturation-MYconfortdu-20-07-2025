import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export type PrintOptions = {
  includeSignature?: boolean;
  format?: 'a4' | 'compact';
};

export class UnifiedPrintService {
  static async printInvoice(invoice: Invoice) {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert(
          "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups."
        );
        return;
      }

      const total = invoice.products.reduce(
        (sum, product) =>
          sum +
          calculateProductTotal(
            product.quantity,
            product.priceTTC,
            product.discount,
            product.discountType
          ),
        0
      );

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
      alert("Erreur lors de l'impression de la facture");
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

          /* Styles pour les nouvelles sections */
          .payment-method-section, .deposit-section, .notes-section {
            margin-top: 20px;
            padding: 12px 15px;
            border-radius: 6px;
            border-left: 4px solid;
            margin-bottom: 15px;
          }

          .payment-method-section {
            background: #E8F5E8;
            border-left-color: #477A0C;
          }

          .deposit-section {
            background: #FFF4E6;
            border-left-color: #FF8C00;
          }

          .notes-section {
            background: #F0F8FF;
            border-left-color: #4A90E2;
          }

          .section-header {
            font-weight: bold;
            font-size: 12px;
            color: #14281D;
            margin-bottom: 8px;
          }

          .payment-badge {
            font-size: 12px;
            color: #477A0C;
            font-weight: bold;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #477A0C;
            display: inline-block;
          }

          /* Styles RIB pour virement bancaire */
          .rib-section {
            margin-top: 8px;
            padding: 8px;
            background: #e1f5fe;
            border: 1px solid #2563eb;
            border-radius: 4px;
          }

          .rib-header {
            font-size: 11px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 6px;
          }

          .rib-info {
            font-size: 10px;
            line-height: 1.4;
            color: #000;
          }

          .rib-info div {
            margin-bottom: 2px;
          }

          .deposit-amount {
            font-size: 14px;
            color: #FF8C00;
            font-weight: bold;
          }

          .deposit-percentage {
            font-size: 10px;
            margin-left: 5px;
          }

          .note-item {
            font-size: 11px;
            color: #14281D;
            line-height: 1.4;
            margin-bottom: 8px;
          }

          .note-item:last-child {
            margin-bottom: 0;
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

          .remaining-amount {
            background: #F55D3E;
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
                ${invoice.products
                  .map(product => {
                    const productTotal = calculateProductTotal(
                      product.quantity,
                      product.priceTTC,
                      product.discount,
                      product.discountType
                    );
                    const discountDisplay =
                      product.discount > 0
                        ? `<span class="discount-badge">${product.discount}${product.discountType === 'percent' ? '%' : '€'}</span>`
                        : '-';

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
                  })
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- Section Taux d'Acompte - EN 2ème POSITION POUR MOBILE -->
          ${
            invoice.montantAcompte > 0
              ? `
            <div class="deposit-section">
              <div class="section-header">💰 Acompte versé:</div>
              <div class="deposit-amount">
                ${formatCurrency(invoice.montantAcompte)}
                <span class="deposit-percentage">(${((invoice.montantAcompte / total) * 100).toFixed(1)}% du total)</span>
              </div>
            </div>
          `
              : ''
          }

          <!-- Section Remarques - EN 3ème POSITION POUR MOBILE -->
          ${
            invoice.invoiceNotes || invoice.deliveryNotes
              ? `
            <div class="notes-section">
              <div class="section-header">📝 Remarques:</div>
              ${
                invoice.invoiceNotes
                  ? `
                <div class="note-item">
                  <strong>Notes générales:</strong> ${invoice.invoiceNotes}
                </div>
              `
                  : ''
              }
              ${
                invoice.deliveryNotes
                  ? `
                <div class="note-item">
                  <strong>Livraison par transporteur France Express CXI:</strong> ${invoice.deliveryNotes}
                </div>
              `
                  : `
                <div class="note-item">
                  <strong>Livraison:</strong> Livraison par transporteur France Express CXI
                </div>
              `
              }
            </div>
          `
              : ''
          }

          <!-- Section Mode de Règlement - EN 4ème POSITION POUR MOBILE -->
          ${
            invoice.paymentMethod
              ? `
            <div class="payment-method-section">
              <div class="section-header">💳 Mode de règlement:</div>
              <div class="payment-badge">${invoice.paymentMethod}</div>
              
              ${
                invoice.paymentMethod &&
                invoice.paymentMethod.toLowerCase().includes('virement')
                  ? `
                <!-- RIB pour Virement Bancaire -->
                <div class="rib-section">
                  <div class="rib-header">📋 Coordonnées bancaires pour virement</div>
                  <div class="rib-info">
                    <div><strong>Bénéficiaire:</strong> MYCONFORT</div>
                    <div><strong>IBAN:</strong> FR76 1660 7000 1708 1216 3980 964</div>
                    <div><strong>BIC:</strong> CCBPFRPPPPG</div>
                    <div><strong>Banque:</strong> Banque Populaire du Sud</div>
                    <div style="margin-top: 4px; font-style: italic; color: #666; font-size: 10px;">
                      Merci d'indiquer le numéro de facture en référence
                    </div>
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          `
              : ''
          }

          <!-- Totaux -->
          <div class="totals">
            <div class="total-line">
              <span>Total HT:</span>
              <span>${formatCurrency(total / 1.2)}</span>
            </div>
            <div class="total-line">
              <span>TVA (20%):</span>
              <span>${formatCurrency((total * 0.2) / 1.2)}</span>
            </div>
            <div class="total-final">
              <div class="total-line" style="border: none; color: white;">
                <span>TOTAL TTC:</span>
                <span>${formatCurrency(total)}</span>
              </div>
            </div>
            ${
              invoice.montantAcompte > 0
                ? `
              <div class="remaining-amount">
                <div class="total-line" style="border: none; color: #F55D3E; font-weight: bold; font-size: 16px;">
                  <span>Reste à payer:</span>
                  <span>${formatCurrency(total - invoice.montantAcompte)}</span>
                </div>
              </div>
            `
                : ''
            }
          </div>

          <!-- Section footer avec informations et signature -->
          <div class="footer-section">
            <div class="info-section">
              ${
                invoice.eventLocation
                  ? `
                <div class="info-item">
                  <div class="info-label">LIEU D'INTERVENTION:</div>
                  ${invoice.eventLocation}
                </div>
              `
                  : ''
              }
              
              ${
                invoice.eventLocation
                  ? `
                <div class="info-item">
                  <div class="info-label">DATE D'INTERVENTION:</div>
                  ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                </div>
              `
                  : ''
              }

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
                ${
                  invoice.signature
                    ? `<img src="${invoice.signature}" alt="Signature client" class="signature-image" />`
                    : '<span style="color: #999; font-style: italic;">Signature requise</span>'
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
              <h4>Art. 1 - LOI HAMMON</h4>
              <p>Les achats effectués sur les foires expositions et salon, à l'exception de ceux faisant l'objet d'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 2 - Délais de Livraison</h4>
              <p>Sauf convention expresse, le retard dans les délais de livraison ne peut donner lieu à indemnité ou annulation de la commande, et notamment en cas de force majeure ou événement propre à retarder ou suspendre la livraison des marchandises. Les délais sont donnés à titre indicatif et ne constituent pas un engagement ferme. Ne pouvant pas maîtriser les plannings des transporteurs nous déclinons toute responsabilité en cas de délai dépassé.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 3 - Risques de Transport</h4>
              <p>Nos fournitures même convenues franco, voyagent aux risques et périls du destinataire, à qui il appartient, en cas d'avaries ou de pertes, de faire toutes réserves, et d'exercer tout recours auprès des transporteurs seuls responsables. La date de livraison estimée d'un produit est basée sur la présence du produit en stock et sur l'adresse de livraison que vous nous avez fournie et est soumise à la réception de votre paiement de ce produit.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 4 - Acceptation des Conditions</h4>
              <p>Toute livraison est soumise à l'acceptation expresse des présentes conditions de vente. Le transporteur dépose les colis à l'adresse indiquée, mais n'est pas habilité à monter à l'étage (CGV du transporteur). Le client aura toute faculté de réceptionner les fournitures au moment de la livraison. Il lui appartient à ce moment d'en prendre après contrôle l'entière responsabilité.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 5 - Réclamations</h4>
              <p>Les réclamations concernant la qualité de la marchandise, à l'exclusion de tout litige de transport, devront être formulées par écrit dans les huit jours qui suivent la livraison par lettre recommandée avec accusé de réception.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 6 - Retours</h4>
              <p>Aucun retour de marchandises ne pourra être effectué sans notre consentement écrit, ce consentement n'impliquant aucune reconnaissance.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 7 - Tailles des Matelas</h4>
              <p>Étant donné que les mousses viscoélastiques utilisées pour la réalisation de nos matelas sont thermosensibles, cette caractéristique peut faire apparaître des dilatations pouvant faire varier leurs tailles de quelques centimètres (plus ou moins 5 cm). Les tailles standard de matelas sont données à titre indicatif, et ne constituent pas une obligation contractuelle de délivrance pouvant faire l'objet de non conformité, d'échange ou d'annulation de la commande.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 8 - Odeur des Matériaux</h4>
              <p>Par l'acceptation expresse des présentes conditions de vente l'acheteur est informé que la spécificité des mousses viscoélastiques conçues avec des polyols à base naturelle (huile de ricin) ainsi que les matières de conditionnement peuvent émettre une légère odeur qui s'estompe après déballage, cela ne constitue pas un vice rédhibitoire ou un défaut pouvant faire l'objet de non conformité au sens de l'article 1604 et 1641 du code civil.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 9 - Règlements et Remises</h4>
              <p>Sauf convention expresse, aucun rabais, ristourne ou escompte sur facture ne pourra être exigé par l'acheteur en cas de règlement comptant. Les conditions de garantie comprennent l'intégralité des mousses. Les textiles et accessoires ne sont pas soumis à garantie.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 10 - Paiement</h4>
              <p>Nos factures sont payables selon les modalités suivantes : Par chèque ou virement à réception de facture. Par carte bancaire ou espèce.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 11 - Pénalités de Retard</h4>
              <p>En cas de non-paiement d'une facture à son échéance, nous nous réservons le droit d'augmenter son montant de 10% avec un minimum de 300 € sans préjudice des intérêts de retard. De même, nous pourrons résilier la vente de plein droit et sans sommation par renvoi d'une simple lettre recommandée.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 12 - Exigibilité</h4>
              <p>Le non-paiement d'une seule échéance rend exigible de plein droit le solde dû sur toutes les échéances à venir.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 13 - Livraison Incomplète ou Non-Conforme</h4>
              <p>Il se peut que le colis soit endommagé ou que le contenu de celui-ci ait été partiellement ou totalement dérobé. Si vous constatez une telle erreur, veuillez le mentionner sur le bon du transporteur et refuser le produit. Dans le cas où vous prendriez connaissance de cette erreur après le départ du transporteur, veuillez nous signaler celle-ci par mail à l'adresse myconfort66@gmail.com ou par téléphone dans un délai maximum de 72h ouvrables.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 14 - Litiges</h4>
              <p>Tout litige, même en cas de recours en garantie ou de pluralité de défendeur est, à défaut d'accord amiable de la compétence du Tribunal de Commerce de PERPIGNAN dans le ressort duquel se trouve notre siège social. Ou de la compétence des Tribunaux de Commerce dans le ressort duquel se trouve notre prestataire.</p>
            </div>

            <div class="cgv-section">
              <h4>Art. 15 - Horaires de Livraison</h4>
              <p>Nous ne pouvons livrer les produits que du lundi au vendredi (excepté les jours fériés) et une personne âgée de plus de 18 ans doit être présente à l'adresse de livraison quand le produit est livré. Une fois que vous avez passé une commande, il est difficile de modifier l'adresse de livraison. Si vous souhaitez discuter d'une modification de l'adresse de livraison après avoir passé une commande, veuillez nous contacter dès que possible à l'adresse myconfort66@gmail.com.</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #477A0C; color: #477A0C; font-weight: bold;">
            MYCONFORT - Votre spécialiste matelas et literie<br>
            <span style="font-size: 11px; color: #666;">Les présentes Conditions générales ont été mises à jour le 1 Janvier 2017</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Ajouter cette méthode à la classe UnifiedPrintService
  static async generateInvoicePdf(
    draft: any,
    opts: PrintOptions = { includeSignature: true, format: 'a4' }
  ): Promise<jsPDF> {
    const doc = new jsPDF({
      unit: 'pt',
      format: opts.format === 'compact' ? [595, 420] : 'a4',
    });

    // Configuration des polices et couleurs
    const primaryColor = '#477A0C'; // myconfort-green
    const darkColor = '#14281D'; // myconfort-dark

    let yPosition = 50;
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header avec logo (si disponible)
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('MYCONFORT', margin, yPosition);
    doc.setFontSize(12);
    doc.setTextColor(darkColor);
    doc.text('Votre spécialiste literie et confort', margin, yPosition + 20);

    yPosition += 60;

    // Numéro de facture et date
    doc.setFontSize(16);
    doc.setTextColor(darkColor);
    doc.text(`Facture N° ${draft.invoiceNumber || 'XXX'}`, margin, yPosition);
    doc.setFontSize(10);
    doc.text(
      `Date: ${new Date(draft.invoiceDate || Date.now()).toLocaleDateString(
        'fr-FR'
      )}`,
      pageWidth - 150,
      yPosition
    );

    yPosition += 40;

    // Informations client
    if (draft.client) {
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text('FACTURER À:', margin, yPosition);
      yPosition += 20;

      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      if (draft.client.name || draft.client.nom) {
        doc.text(
          `${draft.client.name || draft.client.nom} ${draft.client.prenom || ''}`,
          margin,
          yPosition
        );
        yPosition += 15;
      }
      if (draft.client.email) {
        doc.text(draft.client.email, margin, yPosition);
        yPosition += 15;
      }
      if (draft.client.address || draft.client.adresse?.rue) {
        doc.text(
          draft.client.address || draft.client.adresse?.rue || '',
          margin,
          yPosition
        );
        yPosition += 15;
      }
      if (draft.client.city || draft.client.adresse?.ville) {
        const postalCode =
          draft.client.postalCode || draft.client.adresse?.codePostal || '';
        const city = draft.client.city || draft.client.adresse?.ville || '';
        doc.text(`${postalCode} ${city}`, margin, yPosition);
        yPosition += 15;
      }
    }

    yPosition += 20;

    // Tableau des produits
    if (draft.produits && draft.produits.length > 0) {
      const tableData = draft.produits.map((produit: any) => [
        produit.designation || produit.nom || '',
        produit.qty || produit.quantite || 1,
        `${(produit.priceTTC || produit.prixUnitaire || 0).toFixed(2)} €`,
        `${(
          ((produit.qty || produit.quantite || 1) *
            (produit.priceTTC || produit.prixUnitaire || 0)) /
          1
        ).toFixed(2)} €`,
      ]);

      (doc as any).autoTable({
        head: [['Désignation', 'Qté', 'Prix unitaire', 'Total']],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 8,
        },
        headStyles: {
          fillColor: [71, 122, 12], // myconfort-green en RGB
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // Total
      const totalHT = draft.produits.reduce(
        (sum: number, p: any) =>
          sum +
          ((p.qty || p.quantite || 1) * (p.priceTTC || p.prixUnitaire || 0)) /
            1.2,
        0
      );
      const totalTTC = draft.produits.reduce(
        (sum: number, p: any) =>
          sum +
          (p.qty || p.quantite || 1) * (p.priceTTC || p.prixUnitaire || 0),
        0
      );
      const totalTVA = totalTTC - totalHT;

      doc.setFontSize(10);
      doc.text(`Total HT: ${totalHT.toFixed(2)} €`, pageWidth - 200, yPosition);
      yPosition += 15;
      doc.text(
        `TVA (20%): ${totalTVA.toFixed(2)} €`,
        pageWidth - 200,
        yPosition
      );
      yPosition += 15;
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text(
        `Total TTC: ${totalTTC.toFixed(2)} €`,
        pageWidth - 200,
        yPosition
      );
      yPosition += 30;
    }

    // Informations de paiement
    if (draft.paiement?.method) {
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.text(`Mode de paiement: ${draft.paiement.method}`, margin, yPosition);
      yPosition += 15;

      if (draft.paiement.depositAmount > 0) {
        doc.text(
          `Acompte: ${draft.paiement.depositAmount.toFixed(2)} €`,
          margin,
          yPosition
        );
        yPosition += 15;
      }

      if (draft.paiement.remainingAmount > 0) {
        doc.text(
          `Restant dû: ${draft.paiement.remainingAmount.toFixed(2)} €`,
          margin,
          yPosition
        );
        yPosition += 15;
      }

      yPosition += 20;
    }

    // Signatures (si demandées + disponibles)
    if (
      opts.includeSignature &&
      (draft.signature?.clientSignature || draft.signature?.technicienSignature)
    ) {
      // Vérifier si on a assez de place, sinon nouvelle page
      if (yPosition > doc.internal.pageSize.getHeight() - 200) {
        doc.addPage();
        yPosition = 50;
      }

      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text('SIGNATURES', margin, yPosition);
      yPosition += 30;

      // Signature client
      if (draft.signature?.clientSignature) {
        doc.setFontSize(10);
        doc.setTextColor(darkColor);
        doc.text('Signature client:', margin, yPosition);
        yPosition += 10;

        try {
          doc.addImage(
            draft.signature.clientSignature,
            'PNG',
            margin,
            yPosition,
            200,
            60,
            '',
            'FAST'
          );
        } catch (error) {
          console.warn("Erreur lors de l'ajout de la signature client:", error);
          doc.text(
            'Signature non disponible (format invalide)',
            margin,
            yPosition + 30
          );
        }
        yPosition += 80;
      }

      // Signature technicien
      if (draft.signature?.technicienSignature) {
        doc.setFontSize(10);
        doc.setTextColor(darkColor);
        doc.text('Signature responsable:', margin, yPosition);
        yPosition += 10;

        try {
          doc.addImage(
            draft.signature.technicienSignature,
            'PNG',
            margin,
            yPosition,
            200,
            60,
            '',
            'FAST'
          );
        } catch (error) {
          console.warn(
            "Erreur lors de l'ajout de la signature responsable:",
            error
          );
          doc.text(
            'Signature non disponible (format invalide)',
            margin,
            yPosition + 30
          );
        }
        yPosition += 80;
      }

      // Métadonnées de signature
      if (draft.signature?.lieu) {
        doc.text(`Lieu: ${draft.signature.lieu}`, margin, yPosition);
        yPosition += 15;
      }

      if (draft.signature?.dateSignature) {
        doc.text(
          `Date de signature: ${new Date(
            draft.signature.dateSignature
          ).toLocaleString('fr-FR')}`,
          margin,
          yPosition
        );
      }
    }

    return doc;
  }

  // Méthode utilitaire pour exporter directement
  static async exportInvoicePdf(
    draft: any,
    filename?: string,
    opts?: PrintOptions
  ): Promise<void> {
    try {
      const doc = await this.generateInvoicePdf(draft, opts);
      const blob = doc.output('blob');
      saveAs(
        blob,
        filename || `facture_${draft?.invoiceNumber || 'sans_num'}.pdf`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}
