// Version optimisée avec imports dynamiques
import type { Invoice } from '../types';

export type PDFBlob = Blob;

type Item = {
  name?: string;
  designation?: string; // tolérance
  quantity?: number;
  priceTTC?: number;
  discount?: number;
  discountType?: 'percent' | 'fixed' | 'amount'; // Aligné avec les types existants
  category?: string;
};

type InvoiceForPDF = {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientAddress: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientPhone?: string;
  clientEmail?: string;
  products: Item[];
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  montantRemise?: number;
  paymentMethod?: string;
  montantAcompte?: number;
  montantRestant?: number;
  advisorName?: string;
  signature?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  invoiceNotes?: string;
  termsAccepted?: boolean;
  isSigned?: boolean;
  signatureDate?: string;
  depositPaymentMethod?: string;
  eventLocation?: string;
  chequeAmount1?: number;
  chequeDate1?: string;
  chequeAmount2?: number;
  chequeDate2?: string;
  chequeAmount3?: number;
  chequeDate3?: string;
  taxRate?: number;
};

// Import dynamique des librairies PDF
async function loadPdfLibs() {
  const [{ default: jsPDF }, autoTableImport] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  
  const autoTable = autoTableImport as unknown as (doc: typeof jsPDF.prototype, opts: any) => void;
  return { jsPDF, autoTable };
}

// Fonction principale avec import dynamique - reprend la logique existante
export async function generatePdf(invoice: Invoice): Promise<PDFBlob> {
  // Chargement dynamique des libs PDF
  const { jsPDF, autoTable } = await loadPdfLibs();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceForPDF: InvoiceForPDF = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    clientName: invoice.clientName,
    clientAddress: invoice.clientAddress,
    clientPostalCode: invoice.clientPostalCode,
    clientCity: invoice.clientCity,
    clientPhone: invoice.clientPhone,
    clientEmail: invoice.clientEmail,
    products: invoice.products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      priceTTC: p.priceTTC,
      discount: p.discount,
      discountType: p.discountType
    })),
    montantHT: invoice.montantHT,
    montantTTC: invoice.montantTTC,
    montantTVA: invoice.montantTVA,
    montantRemise: invoice.montantRemise,
    paymentMethod: invoice.paymentMethod,
    montantAcompte: invoice.montantAcompte,
    montantRestant: invoice.montantRestant,
    advisorName: invoice.advisorName,
    signature: invoice.signature,
    deliveryMethod: invoice.deliveryMethod,
    deliveryAddress: invoice.deliveryAddress,
    deliveryNotes: invoice.deliveryNotes,
    invoiceNotes: invoice.invoiceNotes,
    termsAccepted: invoice.termsAccepted,
    isSigned: invoice.isSigned,
    signatureDate: invoice.signatureDate,
    depositPaymentMethod: invoice.depositPaymentMethod,
    eventLocation: invoice.eventLocation,
    taxRate: invoice.taxRate,
  };

  // Configuration des marges
  const margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  const pageWidth = 210;
  let yPosition = margins.top;

  // En-tête avec logo
  try {
    const logoPath = '/logo-mycomfort.png';
    doc.addImage(logoPath, 'PNG', margins.left, yPosition, 60, 20);
  } catch (error) {
    console.warn('Logo non trouvé:', error);
  }

  // Informations entreprise (à droite)
  doc.setFontSize(10);
  const companyInfo = [
    'MYCONFORT',
    'Votre spécialiste literie et confort',
    '88, avenue des Ternes',
    '75017 Paris',
    'Tél: 06 61 48 60 23',
    'htconfort@gmail.com',
    'SIRET: 824 313 530 00027'
  ];

  let companyY = yPosition;
  companyInfo.forEach(line => {
    doc.text(line, pageWidth - margins.right - 60, companyY, { align: 'left' });
    companyY += 5;
  });

  yPosition += 35;

  // Titre FACTURE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', margins.left, yPosition);
  
  // Numéro et date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoiceForPDF.invoiceNumber}`, margins.left, yPosition + 8);
  doc.text(`Date: ${invoiceForPDF.invoiceDate}`, margins.left, yPosition + 16);

  yPosition += 35;

  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', margins.left, yPosition);
  
  doc.setFont('helvetica', 'normal');
  yPosition += 8;
  doc.text(invoiceForPDF.clientName, margins.left, yPosition);
  yPosition += 6;
  doc.text(invoiceForPDF.clientAddress, margins.left, yPosition);
  
  if (invoiceForPDF.clientPostalCode && invoiceForPDF.clientCity) {
    yPosition += 6;
    doc.text(`${invoiceForPDF.clientPostalCode} ${invoiceForPDF.clientCity}`, margins.left, yPosition);
  }
  
  if (invoiceForPDF.clientPhone) {
    yPosition += 6;
    doc.text(`Tél: ${invoiceForPDF.clientPhone}`, margins.left, yPosition);
  }

  yPosition += 20;

  // Tableau des produits
  if (invoiceForPDF.products && invoiceForPDF.products.length > 0) {
    const tableData = invoiceForPDF.products.map(product => [
      product.name || '',
      product.quantity?.toString() || '1',
      `${(product.priceTTC || 0).toFixed(2)} €`,
      `${((product.quantity || 1) * (product.priceTTC || 0)).toFixed(2)} €`
    ]);

    autoTable(doc, {
      head: [['Produit', 'Qté', 'Prix unitaire TTC', 'Total TTC']],
      body: tableData,
      startY: yPosition,
      margin: { left: margins.left, right: margins.right },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // Récupérer la position après le tableau
    yPosition = (doc as any).lastAutoTable?.finalY + 10 || yPosition + 50;
  }

  // Totaux
  const totalsX = pageWidth - margins.right - 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (invoiceForPDF.montantHT) {
    doc.text(`Montant HT: ${invoiceForPDF.montantHT.toFixed(2)} €`, totalsX, yPosition, { align: 'right' });
    yPosition += 6;
  }

  if (invoiceForPDF.montantTVA) {
    const taxRate = invoiceForPDF.taxRate || 20;
    doc.text(`TVA (${taxRate}%): ${invoiceForPDF.montantTVA.toFixed(2)} €`, totalsX, yPosition, { align: 'right' });
    yPosition += 6;
  }

  if (invoiceForPDF.montantTTC) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL TTC: ${invoiceForPDF.montantTTC.toFixed(2)} €`, totalsX, yPosition, { align: 'right' });
    yPosition += 10;
  }

  // Informations de paiement
  if (invoiceForPDF.paymentMethod) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAIEMENT:', margins.left, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Mode: ${invoiceForPDF.paymentMethod}`, margins.left, yPosition);
    yPosition += 6;

    if (invoiceForPDF.montantAcompte && invoiceForPDF.montantAcompte > 0) {
      doc.text(`Acompte: ${invoiceForPDF.montantAcompte.toFixed(2)} €`, margins.left, yPosition);
      if (invoiceForPDF.depositPaymentMethod) {
        doc.text(`(${invoiceForPDF.depositPaymentMethod})`, margins.left + 50, yPosition);
      }
      yPosition += 6;
    }

    if (invoiceForPDF.montantRestant && invoiceForPDF.montantRestant > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Restant dû: ${invoiceForPDF.montantRestant.toFixed(2)} €`, margins.left, yPosition);
      yPosition += 10;
    }
  }

  // Signature si présente
  if (invoiceForPDF.signature && invoiceForPDF.isSigned) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE CLIENT:', margins.left, yPosition);
    
    try {
      // Ajouter l'image de signature
      doc.addImage(invoiceForPDF.signature, 'PNG', margins.left, yPosition + 5, 60, 30);
      yPosition += 40;
      
      if (invoiceForPDF.signatureDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Signé le: ${invoiceForPDF.signatureDate}`, margins.left, yPosition);
      }
    } catch (error) {
      console.warn('Erreur signature:', error);
      doc.setFont('helvetica', 'normal');
      doc.text('[Signature présente mais non affichable]', margins.left, yPosition + 5);
    }
  }

  return doc.output('blob');
}

// Export de la fonction pour remplacement progressif
export { generatePdf as generateOptimizedPdf };
