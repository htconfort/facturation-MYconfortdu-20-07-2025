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

      const printContent = this.generateCompactPrintHTML(invoice);

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

  static generateCompactPrintHTML(invoice: Invoice): string {
    // Utiliser le format de la facture du 27 septembre
    return this.generateSeptember27Format(invoice);
  }

  private static generateSeptember27Format(invoice: Invoice): string {
    const formatDate = (date: string) =>
      new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });

    const totalTTC = invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
    }, 0);

    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const totalTVA = totalTTC - totalHT;

    const totalDiscount = invoice.products.reduce((sum, product) => {
      const originalTotal = product.priceTTC * product.quantity;
      const discountedTotal = calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType === 'percentage' ? 'percent' : 'fixed'
      );
      return sum + (originalTotal - discountedTotal);
    }, 0);

    const products = invoice.products.map((product) => {
      const totalProduct = calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
      const discountText = product.discount > 0 ? 
        (product.discountType === 'percentage' ? `${product.discount}%` : `${formatCurrency(product.discount)}`) : '-';
      
      return `
        <tr>
          <td style="background: #f9f9f9; padding: 6px; border: 1px solid #e3e3e3; color: #222;">${product.name}</td>
          <td style="background: #f9f9f9; padding: 6px; border: 1px solid #e3e3e3; color: #222; text-align: center;">${product.quantity}</td>
          <td style="background: #f9f9f9; padding: 6px; border: 1px solid #e3e3e3; color: #222; text-align: right;">${formatCurrency(product.priceTTC)}</td>
          <td style="background: #f9f9f9; padding: 6px; border: 1px solid #e3e3e3; color: #222; text-align: center;">${discountText}</td>
          <td style="background: #f9f9f9; padding: 6px; border: 1px solid #e3e3e3; color: #222; text-align: right; font-weight: bold;">${formatCurrency(totalProduct)}</td>
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
            padding: 20px; 
            background: white; 
            font-size: 13px;
            line-height: 1.2;
            color: #111;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 12px;
            padding-top: 10px;
            position: relative;
            width: 100%;
            min-height: 60px;
          }
          
          .logo-container {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 5px;
            z-index: 10;
            width: auto;
            height: auto;
          }
          
          .logo {
            height: 40px;
            width: auto;
            display: block;
            margin: 0 auto;
          }
          
          .company-info {
            flex: 0 0 45%;
            font-size: 13px;
            line-height: 1.5;
            color: #222;
            margin-right: 10%;
          }
          
          .client-info {
            flex: 0 0 45%;
            font-size: 13px;
            line-height: 1.5;
            color: #222;
            text-align: right;
            margin-left: 10%;
          }
          
          .title {
            font-size: 24px;
            color: #222;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
            margin-top: 5px;
            margin-bottom: 0;
          }
          
          .invoice-details {
            margin-top: 3px;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 6px;
            font-size: 12px;
          }
          
          .th {
            background: #8dbf4b;
            color: #fff;
            text-align: left;
            padding: 6px;
            border: 1px solid #e3e3e3;
            font-weight: bold;
          }
          
          .totals {
            text-align: right;
            margin-top: 6px;
          }
          
          .total-row {
            font-weight: bold;
            font-size: 15px;
            background: #fff;
          }
          
          .remise {
            color: #7abd3f;
            font-weight: bold;
            font-size: 14px;
            text-align: right;
            margin-top: 2px;
          }
          
          .section-title {
            font-weight: bold;
            margin-top: 18px;
            margin-bottom: 6px;
            font-size: 15px;
            color: #222;
          }
          
          .signature {
            margin-top: 16px;
            margin-bottom: 8px;
            min-height: 40px;
            border: 1px dashed #ccc;
            border-radius: 4px;
            display: inline-block;
            padding: 6px;
            background: #fff;
          }
          
          .cgv {
            color: #7abd3f;
            font-weight: bold;
            font-size: 15px;
            margin-top: 22px;
            margin-bottom: 4px;
            letter-spacing: 1px;
          }
          
          .legal {
            font-size: 13px;
            color: #222;
            margin-top: 4px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          
          .note {
            font-size: 12px;
            color: #444;
            font-style: italic;
            margin-top: 2px;
          }
          
          .page-break {
            page-break-before: always;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #e5e5e5;
          }
          
          /* Media queries pour iPad et appareils tactiles */
          @media screen and (max-width: 1024px) {
            .header {
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .company-info {
              flex: 0 0 40%;
              margin-right: 5%;
            }
            
            .client-info {
              flex: 0 0 40%;
              margin-left: 5%;
              text-align: right;
            }
            
            .logo-container {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              top: 5px;
              z-index: 10;
            }
          }
          
          /* Media queries pour impression */
          @media print {
            .header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
            }
            
            .company-info {
              flex: 0 0 45% !important;
              margin-right: 10% !important;
            }
            
            .client-info {
              flex: 0 0 45% !important;
              margin-left: 10% !important;
              text-align: right !important;
            }
            
            .logo-container {
              position: absolute !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              top: 5px !important;
              z-index: 10 !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <!-- LOGO AU CENTRE -->
          <div class="logo-container">
            <img src="/HT-Confort_Full_Green.png" alt="HT Confort" class="logo" />
          </div>
          
          <div>
            <div class="company-info">
              <strong>MYCONFORT</strong><br />
              88 avenue des Ternes<br />
              75017 Paris<br />
              Tél : +33 6 61 48 60 23<br />
              Email : htconfort@gmail.com<br />
              Web : htconfort.com<br />
              SIRET : 824 313 530 00027<br />
              IBAN : FR76 1660 7000 1708 1216 3980 964<br />
              BIC : CCBPFRPPPPG<br />
            </div>
          </div>
          
          <div class="client-info">
            <strong>Client</strong><br />
            ${invoice.clientName}<br />
            ${invoice.clientAddress}<br />
            ${invoice.clientPostalCode} ${invoice.clientCity}<br />
            Tél : ${invoice.clientPhone}<br />
            Email : ${invoice.clientEmail}
          </div>
        </div>

        <!-- FACTURE TITLE -->
        <div class="title">FACTURE</div>
        <div class="invoice-details">
          <strong>Facture n° : ${invoice.invoiceNumber}</strong><br />
          Date : ${formatDate(invoice.invoiceDate)}
        </div>

        <!-- TABLEAU PRODUITS -->
        <table class="table">
          <thead>
            <tr>
              <th class="th">Désignation</th>
              <th class="th">Qté</th>
              <th class="th">PU TTC</th>
              <th class="th">Remise</th>
              <th class="th">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${products}
          </tbody>
        </table>

        <!-- TOTALS -->
        <div class="totals">
          <div class="total-row">Total HT&nbsp;&nbsp;&nbsp;${formatCurrency(totalHT)}</div>
          <div class="total-row">TVA 20%&nbsp;&nbsp;&nbsp;${formatCurrency(totalTVA)}</div>
          <div class="total-row">Total TTC&nbsp;&nbsp;&nbsp;${formatCurrency(totalTTC)}</div>
          ${totalDiscount > 0 ? `<div class="remise">Remise totale appliquée&nbsp;&nbsp;&nbsp;- ${formatCurrency(totalDiscount)}</div>` : ''}
        </div>

        <!-- MODE DE REGLEMENT -->
        <div class="section-title">Mode de règlement</div>
        <div>${invoice.paymentMethod || 'Chèque à venir'}</div>
        <div style="font-weight: bold; font-size: 13px; margin-top: 6px; margin-bottom: 4px;">
          Merci pour votre confiance
        </div>
        <div style="font-size: 12px; margin-top: 0; margin-bottom: 4px;">
          Paiement par virement : IBAN FR76 1660 7000 1708 1216 3980 964 — BIC CCBPFRPPPPG. Indiquez le n° de facture ${invoice.invoiceNumber} en référence.
        </div>

        <!-- SIGNATURE -->
        <div class="section-title">Signature client :</div>
        <div class="signature">
          ${invoice.signature ? 
            `<img src="${invoice.signature}" alt="Signature client" style="max-height: 35px; max-width: 180px;" />` : 
            '<span style="color: #666; font-style: italic;">Signature requise</span>'
          }
        </div>
        <div style="font-size: 12px; margin-top: 2px; margin-bottom: 3px;">
          Signé le ${formatDate(invoice.signatureDate || invoice.invoiceDate)}
        </div>

        <!-- CGV & LEGAL -->
        <div class="cgv">
          Conditions générales de vente acceptées par le client
        </div>
        <div class="legal">
          INFORMATION LÉGALE - ARTICLE L224-59
        </div>
        <div class="note">
          « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
        </div>

        <!-- DEUXIÈME PAGE - CONDITIONS GÉNÉRALES -->
        <div class="page-break">
          <h1 style="text-align: center; color: #477A0C; margin-bottom: 15px; font-size: 18px;">
            CONDITIONS GÉNÉRALES DE VENTE
          </h1>
          
          <div style="font-size: 9px; line-height: 1.3; columns: 2; column-gap: 15px;">
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 1 - Livraison</h3>
              <p>Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 2 - Délais de Livraison</h3>
              <p>Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 3 - Risques de Transport</h3>
              <p>Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 4 - Acceptation des Conditions</h3>
              <p>Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 5 - Réclamations</h3>
              <p>Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 6 - Retours</h3>
              <p>Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n'implique aucune reconnaissance.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 7 - Tailles des Matelas</h3>
              <p>Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 8 - Odeur des Matériaux</h3>
              <p>Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 9 - Règlements et Remises</h3>
              <p>Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 10 - Paiement</h3>
              <p>Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 11 - Pénalités de Retard</h3>
              <p>En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 12 - Exigibilité en Cas de Non-Paiement</h3>
              <p>Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 13 - Livraison Incomplète ou Non-Conforme</h3>
              <p>En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 14 - Litiges</h3>
              <p>Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
            </div>
            
            <div style="margin-bottom: 8px; break-inside: avoid;">
              <h3 style="color: #477A0C; font-size: 10px; margin-bottom: 3px; font-weight: bold;">Art. 15 - Horaires de Livraison</h3>
              <p>Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 15px; font-size: 8px; font-style: italic;">
            Les présentes Conditions générales ont été mises à jour le 23 août 2024
          </div>
        </div>
      </body>
      </html>
    `;
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
