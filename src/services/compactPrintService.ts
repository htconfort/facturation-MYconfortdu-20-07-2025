import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

export class CompactPrintService {
  
  static async printInvoice(invoice: Invoice) {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
        return;
      }

      const printContent = this.generateCompactPrint(invoice);

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

  private static generateCompactPrint(invoice: Invoice): string {
    const products = invoice.products.map((product) => {
      const totalProduct = calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
      const discountText = product.discount > 0 ? 
        (product.discountType === 'percent' ? `-${product.discount}%` : `-${formatCurrency(product.discount)}`) : '';
      
      return `
        <tr>
          <td>${product.name}</td>
          <td style="text-align: center;">${product.quantity}</td>
          <td style="text-align: right;">${formatCurrency(product.priceTTC)}</td>
          <td style="text-align: center;">${discountText || '-'}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(totalProduct)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoice.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white; 
            font-size: 11px;
            line-height: 1.2;
            color: #000;
          }
          
          .invoice-page {
            width: 100%;
            max-width: none;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          /* En-tête compact */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 2px solid #477A0C;
            flex-shrink: 0;
          }

          .company-info {
            flex: 1;
          }

          .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #477A0C;
            margin-bottom: 6px;
          }

          .company-details {
            font-size: 12px;
            color: #000;
            line-height: 1.3;
          }

          .invoice-info {
            text-align: right;
            flex: 1;
          }

          .invoice-title {
            background: #477A0C;
            color: white;
            margin: 0;
            padding: 12px 16px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 4px;
          }

          .invoice-number {
            color: #000;
            margin-top: 8px;
            font-weight: bold;
            font-size: 14px;
          }

          /* Section client compact */
          .client-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            margin-top: 18px;
          }

          .client-info {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #477A0C;
            flex: 1;
            margin-right: 10px;
          }

          .client-info h3 {
            margin: 0 0 6px 0;
            color: #000;
            font-size: 14px;
            font-weight: bold;
          }

          .delivery-info {
            background: #e8f5e8;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #28a745;
            flex: 1;
          }

          .delivery-info h3 {
            margin: 0 0 6px 0;
            color: #000;
            font-size: 14px;
            font-weight: bold;
          }

          /* Tableau compact */
          .table-container {
            flex-grow: 1;
            margin: 12px 0;
            min-height: 200px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
            font-size: 12px;
          }

          th {
            background: #477A0C;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
          }

          td {
            padding: 6px 10px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
            color: #000;
          }

          td:first-child {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            color: #000;
          }

          tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          /* Totaux et paiement en ligne - OPTIMISÉ */
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 8px;
            gap: 8px;
            flex-shrink: 0;
          }

          .totals-section {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
            min-width: 180px;
          }

          .totals-section h3 {
            margin: 0 0 4px 0;
            color: #000;
            font-size: 12px;
            font-weight: bold;
          }

          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 10px;
            color: #000;
          }

          .total-final {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 12px;
            color: #000;
            border-top: 1px solid #477A0C;
            padding-top: 2px;
            margin-top: 2px;
          }

          .payment-signature {
            flex: 1;
            display: flex;
            gap: 8px;
          }

          .payment-info, .signature-section {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
            flex: 1;
          }

          .payment-info h3, .signature-section h3 {
            margin: 0 0 4px 0;
            color: #000;
            font-size: 12px;
            font-weight: bold;
          }

          .signature-box {
            border: 1px dashed #ccc;
            min-height: 30px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-size: 9px;
            margin-top: 4px;
          }

          /* Styles RIB pour virement bancaire */
          .rib-section {
            margin-top: 8px;
            padding: 6px;
            background: #e1f5fe;
            border: 1px solid #2563eb;
            border-radius: 4px;
          }

          .rib-info {
            font-size: 9px;
            line-height: 1.3;
            color: #000;
          }

          /* Notes compactes */
          .notes-compact {
            margin-top: 8px;
            font-size: 8px;
            color: #666;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 6px;
            margin-bottom: 8px;
          }

          /* Information légale - COMPACTE */
          .legal-info {
            margin-top: 8px;
            font-size: 10px;
            color: #000;
            text-align: center;
            border: 1px solid #477A0C;
            background: #f8f9fa;
            padding: 6px;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .legal-info h3 {
            margin: 0 0 4px 0;
            color: #000;
            font-size: 11px;
            font-weight: bold;
          }

          .legal-info p {
            margin: 0;
            font-weight: bold;
            line-height: 1.2;
          }

          /* Espace flexible pour expansion tableau - RÉDUIT */
          .flexible-space {
            flex-grow: 1;
            min-height: 5px;
          }

          /* Footer légal - COMPACT */
          .footer-legal {
            margin-top: 4px;
            border-top: 1px solid #477A0C;
            padding-top: 4px;
            font-size: 7px;
            background: #f8f9fa;
            padding: 4px;
            border-radius: 4px;
            flex-shrink: 0;
          }

          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
          }

          .footer-left {
            flex: 1;
          }

          .footer-left p {
            margin: 0 0 2px 0;
            line-height: 1.1;
            text-align: justify;
          }

          /* Footer final - COMPACT */
          .final-footer {
            margin-top: 4px;
            padding-top: 2px;
            border-top: 1px solid #477A0C;
            font-size: 6px;
            text-align: center;
            color: #000;
            flex-shrink: 0;
          }

          .final-footer p {
            margin: 0;
            line-height: 1.1;
          }

          /* Statuts de livraison */
          .delivery-status {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            color: white;
          }

          .status-emporte { background-color: #28a745; }
          .status-a-livrer { background-color: #ffc107; color: #000; }

          /* Conditions Générales de Vente - COMPACTES */
          .cgv-section {
            margin-top: auto;
            border-top: 1px solid #477A0C;
            padding-top: 4px;
            flex-shrink: 0;
          }

          .cgv-section h3 {
            margin: 0 0 4px 0;
            color: #000;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
          }

          .cgv-content {
            display: flex;
            gap: 8px;
            font-size: 6px;
            line-height: 1.0;
            color: #000;
          }

          .cgv-column {
            flex: 1;
          }

          .cgv-content p {
            margin: 0 0 2px 0;
            text-align: justify;
            color: #000;
          }

          .cgv-content strong {
            color: #000;
            font-size: 6.5px;
          }

          @media print {
            body { margin: 0; padding: 0; }
            .invoice-page { height: auto; min-height: 0; }
            @page { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-page">
          <!-- En-tête -->
          <div class="header">
            <div class="company-info">
              <div class="company-name">MYCONFORT</div>
              <div class="company-details">
                88 Avenue des Ternes, 75017 Paris<br>
                SIRET: 824 313 530 00027<br>
                Tél: 04 68 50 41 45 | Email: myconfort@gmail.com
              </div>
            </div>
            <div class="invoice-info">
              <h1 class="invoice-title">FACTURE</h1>
              <div class="invoice-number">
                N° ${invoice.invoiceNumber}<br>
                Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          <!-- Section client et livraison -->
          <div class="client-section">
            <div class="client-info">
              <h3>FACTURÉ À :</h3>
              <strong>${invoice.clientName}</strong><br>
              ${invoice.clientAddress}<br>
              ${invoice.clientPostalCode} ${invoice.clientCity}<br>
              Tél: ${invoice.clientPhone}<br>
              Email: ${invoice.clientEmail}
            </div>
            <div class="delivery-info">
              <h3>LIVRAISON :</h3>
              Mode: Livraison par transporteur France Express CXI<br>
              ${invoice.deliveryNotes ? `Notes: ${invoice.deliveryNotes}` : ''}
            </div>
          </div>

          <!-- Tableau des produits -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 60%;">Désignation</th>
                  <th style="width: 8%; text-align: center;">Qté</th>
                  <th style="width: 12%; text-align: right;">Prix Unit.</th>
                  <th style="width: 8%; text-align: center;">Remise</th>
                  <th style="width: 12%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${products}
              </tbody>
            </table>
          </div>

          <!-- Footer avec totaux, paiement et signature -->
          <div class="footer-section">
            <div class="payment-signature">
              <div class="payment-info">
                <h3>PAIEMENT</h3>
                <div>Mode: ${invoice.paymentMethod}</div>
                ${invoice.montantAcompte > 0 ? `<div>Acompte: ${formatCurrency(invoice.montantAcompte)}</div>` : ''}
                ${invoice.montantRestant > 0 ? `<div><strong>Reste à payer: ${formatCurrency(invoice.montantRestant)}</strong></div>` : ''}
                
                ${invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement') ? `
                <!-- RIB pour Virement Bancaire -->
                <div class="rib-section">
                  <h4 style="margin: 8px 0 4px 0; font-size: 11px; font-weight: bold; color: #2563eb;">COORDONNÉES BANCAIRES</h4>
                  <div class="rib-info">
                    <div style="font-size: 9px; line-height: 1.3;">
                      <div><strong>Bénéficiaire:</strong> MYCONFORT</div>
                      <div><strong>IBAN:</strong> FR76 1660 7000 1708 1216 3980 964</div>
                      <div><strong>BIC:</strong> CCBPFRPPPPG</div>
                      <div><strong>Banque:</strong> Banque Populaire du Sud</div>
                      <div style="margin-top: 4px; font-style: italic; color: #666;">
                        Merci d'indiquer le numéro de facture en référence
                      </div>
                    </div>
                  </div>
                </div>
                ` : ''}
              </div>
              <div class="signature-section">
                <h3>SIGNATURE CLIENT</h3>
                <div class="signature-box">
                  ${invoice.signature ? 'Signé' : 'Signature requise'}
                </div>
              </div>
            </div>
            
            <div class="totals-section">
              <h3>TOTAUX</h3>
              <div class="total-line">
                <span>Total HT:</span>
                <span>${formatCurrency(invoice.montantHT)}</span>
              </div>
              <div class="total-line">
                <span>TVA (${invoice.taxRate}%):</span>
                <span>${formatCurrency(invoice.montantTVA)}</span>
              </div>
              <div class="total-final">
                <span>TOTAL TTC:</span>
                <span>${formatCurrency(invoice.montantTTC)}</span>
              </div>
            </div>
          </div>

          <!-- Information légale -->
          <div class="legal-info">
            <h3>⚖️ INFORMATION LÉGALE - ARTICLE L224-59</h3>
            <p><strong>« Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »</strong></p>
          </div>

          <!-- Espace flexible pour expansion tableau -->
          <div class="flexible-space"></div>

          <!-- Footer légal -->
          <div class="footer-legal">
            <div class="footer-content">
              <div class="footer-left">
                <p><strong>✅ Conditions générales acceptées</strong></p>
                <p><strong>RETARD DE PAIEMENT :</strong> Toute somme non payée à l'échéance porte de plein droit intérêt à au moins 4 fois le taux d'intérêt légal. Une indemnité forfaitaire de 40 € pour frais de recouvrement sera due en cas de retard de paiement (article L441-3 du Code du commerce).</p>
              </div>
            </div>
          </div>

          <!-- Conditions Générales de Vente -->
          <div class="cgv-section">
            <h3>CONDITIONS GÉNÉRALES DE VENTE</h3>
            <div class="cgv-content">
              <div class="cgv-column">
                <p><strong>Art. 1 - Livraison</strong><br>
                Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison. Le transporteur livre au pas de porte. Vérifiez les dimensions pour le passage. Aucun service d'installation prévu.</p>
                
                <p><strong>Art. 2 - Délais de Livraison</strong><br>
                Délais indicatifs, pas d'engagement ferme. En cas de retard, aucune indemnité. Déclinons toute responsabilité en cas de force majeure.</p>
                
                <p><strong>Art. 3 - Risques de Transport</strong><br>
                Marchandises aux risques du destinataire. Réserves obligatoires sur bordereau transporteur en cas d'avarie.</p>
                
                <p><strong>Art. 4 - Acceptation</strong><br>
                Livraison implique acceptation des conditions. Transporteur livre sans monter étages. Client responsable vérification.</p>
                
                <p><strong>Art. 5 - Réclamations</strong><br>
                Réclamations qualité par écrit sous 8 jours, lettre recommandée avec AR.</p>
                
                <p><strong>Art. 6 - Retours</strong><br>
                Aucun retour sans accord écrit préalable. Accord n'implique aucune reconnaissance.</p>
                
                <p><strong>Art. 7 - Tailles Matelas</strong><br>
                Dimensions +/- 5 cm possibles (thermosensibilité mousses). Tailles indicatives. Matelas sur mesure : spécifications exactes requises.</p>
                
                <p><strong>Art. 8 - Odeur Matériaux</strong><br>
                Mousses naturelles peuvent émettre légère odeur qui disparaît. Ne constitue pas défaut.</p>
              </div>
              
              <div class="cgv-column">
                <p><strong>Art. 9 - Règlements</strong><br>
                Sauf accord express, aucun rabais pour paiement comptant. Garantie mousses, pas textiles/accessoires.</p>
                
                <p><strong>Art. 10 - Paiement</strong><br>
                Factures payables par chèque, virement, carte bancaire ou espèce à réception.</p>
                
                <p><strong>Art. 11 - Pénalités Retard</strong><br>
                Non-paiement : majoration 10% min. 300€, intérêts de retard. Droit de résiliation sans sommation.</p>
                
                <p><strong>Art. 12 - Exigibilité</strong><br>
                Non-paiement échéance rend exigible solde toutes échéances à venir.</p>
                
                <p><strong>Art. 13 - Livraison Non-Conforme</strong><br>
                Livraison endommagée : mentionner sur bon, refuser produit. Erreur constatée après : contact sous 72h ouvrables.</p>
                
                <p><strong>Art. 14 - Litiges</strong><br>
                Compétence exclusive Tribunal Commerce Perpignan ou tribunal du prestataire.</p>
                
                <p><strong>Art. 15 - Horaires Livraison</strong><br>
                Lundi-vendredi hors fériés. Personne majeure présente obligatoire. Modification adresse : myconfort66@gmail.com.</p>
              </div>
            </div>
          </div>

          <!-- Footer final - Réserve de propriété -->
          <div class="final-footer">
            <p><strong>RÉSERVE DE PROPRIÉTÉ :</strong> Toutes nos marchandises restent propriété jusqu'au paiement complet du prix convenu. Dès l'expédition, l'acheteur restera gardien des dites marchandises et assumera le risque de conservation.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
