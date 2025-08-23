import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';
import {
  formatCurrency,
  calculateHT,
  calculateProductTotal,
} from '../utils/calculations';

export interface InvoiceData {
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientPhone: string;
  clientEmail: string;
  clientHousingType?: string;
  clientDoorCode?: string;
  clientSiret?: string;
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation?: string;
  items: Array<{
    description: string;
    category?: string;
    qty: number;
    unitPriceHT: number;
    unitPriceTTC: number;
    discount: number;
    discountType: 'percent' | 'fixed';
    total: number;
  }>;
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
  totalDiscount: number;
  taxRate: number;
  notes?: string;
  advisorName?: string;
  paymentMethod?: string;
  depositAmount?: number;
  montantRestant?: number;
  signature?: string;
  deliveryMethod?: string;
  deliveryNotes?: string;
  nombreChequesAVenir?: number;
}

export class AdvancedPDFService {
  private static readonly COLORS = {
    // Couleurs exactes de l'aperçu HTML fourni
    primary: [104, 159, 56] as const, // #689f38 - Vert principal de l'exemple
    primaryDark: [124, 179, 66] as const, // #7cb342 - Vert dégradé
    cream: [242, 239, 226] as const, // #F2EFE2 - Beige clair
    dark: [51, 51, 51] as const, // #333333 - Texte foncé
    white: [255, 255, 255] as const, // Blanc pur
    grayLight: [248, 248, 248] as const, // #f8f8f8 - Gris très clair
    grayBorder: [221, 221, 221] as const, // #dddddd - Gris bordures
    red: [220, 38, 38] as const, // Rouge pour alertes
    orange: [255, 140, 0] as const, // Orange pour acompte
    blue: [25, 118, 210] as const, // #1976d2 - Bleu pour informations
    green: [76, 175, 80] as const, // #4caf50 - Vert pour succès
  };

  // 🎯 MÉTHODE PRINCIPALE - PDF IDENTIQUE À L'EXEMPLE HTML
  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    console.log("🎨 GÉNÉRATION PDF IDENTIQUE À L'EXEMPLE HTML FOURNI");

    // 🚨 DEBUG CRITIQUE - PRODUITS REÇUS PAR LE SERVICE PDF
    console.log('📄 PDF SERVICE - DONNÉES REÇUES:');
    console.log('🔢 Numéro facture:', invoice.invoiceNumber);
    console.log('👤 Client:', invoice.clientName);
    console.log('🛒 Products originaux:', invoice.products);

    console.log('🛒 ANALYSE DÉTAILLÉE DES PRODUITS:');
    if (!invoice.products || invoice.products.length === 0) {
      console.error('❌ AUCUN PRODUIT REÇU PAR LE PDF SERVICE !');
      console.error('🔍 Propriétés disponibles:', Object.keys(invoice));
    } else {
      invoice.products.forEach((product, index) => {
        console.log(`🏷️ Produit ${index + 1} reçu par PDF:`, {
          name: product.name,
          quantity: product.quantity,
          priceTTC: product.priceTTC,
          discount: product.discount,
          discountType: product.discountType,
          TOUTES_PROPRIETES: product,
        });
      });
    }

    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const invoiceData = this.convertInvoiceData(invoice);

    // Générer le PDF avec le style exact de l'exemple HTML
    this.addHeaderLikeHTML(doc, invoiceData);
    this.addInvoiceInfoLikeHTML(doc, invoiceData);
    this.addClientSectionLikeHTML(doc, invoiceData);
    this.addLogisticsSectionLikeHTML(doc, invoiceData);
    this.addPaymentSectionLikeHTML(doc, invoiceData);
    this.addProductsSectionLikeHTML(doc, invoiceData);
    this.addTotalsLikeHTML(doc, invoiceData);

    // La signature est déjà incluse dans addTotalsLikeHTML
    // Pas besoin d'appeler addSignatureLikeHTML séparément

    this.addFooterLikeHTML(doc);

    console.log("✅ PDF GÉNÉRÉ IDENTIQUE À L'EXEMPLE HTML");
    return doc;
  }

  // 📄 EN-TÊTE COMME L'EXEMPLE HTML
  private static addHeaderLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // Dégradé vert comme dans l'exemple HTML
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 0, 210, 35, 'F');

    // Titre MyCoNfort en noir
    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(22); // Taille 22 comme demandé
    doc.setFont('helvetica', 'bold');
    doc.text('MyCoNfort', 20, 20);

    // Sous-titre en noir
    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Facturation professionnelle avec signature électronique', 20, 28);

    // Bouton signature (coin droit)
    if (data.signature) {
      doc.setFillColor(255, 255, 255, 0.2); // Blanc transparent
      doc.roundedRect(160, 12, 35, 10, 2, 2, 'F');
      doc.setTextColor(...this.COLORS.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNÉE', 177, 18, { align: 'center' });
    }
  }

  // 📋 INFORMATIONS FACTURE COMME L'EXEMPLE HTML
  private static addInvoiceInfoLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // Fond blanc pour les informations
    doc.setFillColor(...this.COLORS.white);
    doc.rect(0, 35, 210, 40, 'F');

    // Informations entreprise (gauche)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MyCoNfort', 20, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes', 20, 56);
    doc.text('75017 Paris, France', 20, 61);
    doc.text('SIRET: 824 313 530 00027', 20, 66);
    doc.text('Tél: 04 68 50 41 45', 20, 71);

    // Informations facture (droite)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Facture: ${data.invoiceNumber}`, 140, 50);
    doc.text(
      `Date: ${new Date(data.invoiceDate).toLocaleDateString('fr-FR')}`,
      140,
      56
    );

    if (data.eventLocation) {
      doc.text(`Lieu: ${data.eventLocation}`, 140, 62);
    }
  }

  // 👤 SECTION CLIENT COMME L'EXEMPLE HTML
  private static addClientSectionLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // En-tête section client (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 75, 210, 12, 'F');

    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 105, 82, { align: 'center' });

    // Fond gris clair pour les informations client
    doc.setFillColor(...this.COLORS.grayLight);
    doc.rect(0, 87, 210, 25, 'F');

    // Informations client en colonnes (comme l'exemple HTML)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Première ligne
    doc.text('Nom complet*', 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 20, 100);

    doc.setFont('helvetica', 'bold');
    doc.text('Adresse*', 60, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientAddress, 60, 100);

    doc.setFont('helvetica', 'bold');
    doc.text('Code postal*', 120, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPostalCode, 120, 100);

    doc.setFont('helvetica', 'bold');
    doc.text('Ville*', 150, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientCity, 150, 100);

    doc.setFont('helvetica', 'bold');
    doc.text('Email*', 180, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientEmail, 180, 100);

    // Deuxième ligne
    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone*', 20, 107);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPhone, 50, 107);

    // Ajout du code porte s'il existe
    if (data.clientDoorCode) {
      doc.setFont('helvetica', 'bold');
      doc.text('Code porte', 120, 107);
      doc.setFont('helvetica', 'normal');
      doc.text(data.clientDoorCode, 150, 107);
    }
  }

  // 🚚 SECTION LOGISTIQUE COMME L'EXEMPLE HTML
  private static addLogisticsSectionLikeHTML(
    doc: jsPDF,
    data: InvoiceData
  ): void {
    let currentY = 115;

    // En-tête logistique (bleu)
    doc.setFillColor(...this.COLORS.blue);
    doc.roundedRect(20, currentY, 170, 8, 2, 2, 'F');

    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS LOGISTIQUES', 105, currentY + 5, {
      align: 'center',
    });

    currentY += 12;

    if (data.deliveryMethod) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Mode de livraison:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.deliveryMethod, 60, currentY);
      currentY += 8;
    }
  }

  // 💳 SECTION PAIEMENT COMME L'EXEMPLE HTML
  private static addPaymentSectionLikeHTML(
    doc: jsPDF,
    data: InvoiceData
  ): void {
    let currentY = 135;

    // En-tête paiement (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.roundedRect(20, currentY, 170, 8, 2, 2, 'F');

    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MODE DE REGLEMENT', 105, currentY + 5, { align: 'center' });

    currentY += 12;

    if (data.paymentMethod) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Méthode de paiement:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.paymentMethod, 70, currentY);
      currentY += 8;
    }

    // Signature client
    doc.setFont('helvetica', 'bold');
    doc.text('Signature client MyCoNfort:', 20, currentY);
    if (data.signature) {
      doc.setTextColor(...this.COLORS.green);
      doc.text('✓ Signature électronique enregistrée', 80, currentY);
    }
  }

  // 📦 SECTION PRODUITS COMME L'EXEMPLE HTML
  private static addProductsSectionLikeHTML(
    doc: jsPDF,
    data: InvoiceData
  ): void {
    let currentY = 160;

    // En-tête produits (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(20, currentY, 170, 12, 'F');

    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Produits & Tarification', 105, currentY + 7, { align: 'center' });

    currentY += 20;

    // Section signature si présente
    if (data.signature) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 105, currentY, { align: 'center' });

      // Cadre pour signature
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setFillColor(...this.COLORS.grayLight);
      doc.roundedRect(20, currentY + 3, 170, 15, 1, 1, 'FD');

      try {
        // Ajouter l'image de signature
        doc.addImage(
          data.signature,
          'PNG',
          85,
          currentY + 5,
          40,
          10,
          undefined,
          'FAST'
        );
      } catch (error) {
        console.warn('Erreur ajout signature:', error);
        doc.setTextColor(153, 153, 153);
        doc.setFontSize(8);
        doc.text('[Signature électronique validée]', 105, currentY + 11, {
          align: 'center',
        });
      }

      currentY += 25;
    }

    // Tableau des produits
    // 🚨 DEBUG CRITIQUE - DONNÉES UTILISÉES POUR LE TABLEAU PDF
    console.log('📊 GÉNÉRATION TABLEAU PDF - data.items reçu:', data.items);
    console.log("📊 Nombre d'items pour le tableau:", data.items.length);
    data.items.forEach((item, index) => {
      console.log(`📊 Item ${index + 1} pour tableau PDF:`, {
        description: item.description,
        qty: item.qty,
        unitPriceHT: item.unitPriceHT,
        unitPriceTTC: item.unitPriceTTC,
        discount: item.discount,
        discountType: item.discountType,
        total: item.total,
        ITEM_COMPLET: item,
      });
    });

    const tableData = data.items.map(item => [
      item.qty.toString(),
      formatCurrency(item.unitPriceHT),
      formatCurrency(item.unitPriceTTC),
      item.discount > 0
        ? item.discountType === 'percent'
          ? `${item.discount}%`
          : formatCurrency(item.discount)
        : '-',
      formatCurrency(item.total),
    ]);

    console.log('📊 DONNÉES FORMATÉES POUR LE TABLEAU:', tableData);

    autoTable(doc, {
      startY: currentY,
      head: [['Quantité', 'PU HT', 'PU TTC', 'Remise', 'Total TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [...this.COLORS.primary],
        textColor: [...this.COLORS.white],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [...this.COLORS.dark],
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [...this.COLORS.grayLight],
      },
      margin: { left: 20, right: 20 },
    });
  }

  // 💰 TOTAUX COMME L'EXEMPLE HTML
  private static addTotalsLikeHTML(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Section totaux
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    let yPos = finalY + 10;

    // Total HT
    doc.text('Total HT:', 130, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.totalHT), 180, yPos, { align: 'right' });
    yPos += 8;

    // Total TTC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...this.COLORS.primary);
    doc.text('TOTAL TTC:', 130, yPos);
    doc.text(formatCurrency(data.totalTTC), 180, yPos, { align: 'right' });

    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...this.COLORS.dark);
      doc.text('Acompte versé:', 130, yPos);
      doc.setTextColor(...this.COLORS.blue);
      doc.text(formatCurrency(data.depositAmount), 180, yPos, {
        align: 'right',
      });

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.COLORS.orange);
      doc.text('RESTE À PAYER:', 130, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 180, yPos, {
        align: 'right',
      });
    }
  }

  // 🦶 PIED DE PAGE COMME L'EXEMPLE HTML
  private static addFooterLikeHTML(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;

    // Pied de page vert
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, pageHeight - 30, 210, 30, 'F');

    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(22); // Taille 22 comme demandé
    doc.setFont('helvetica', 'bold');
    doc.text('MyCoNfort', 105, pageHeight - 20, { align: 'center' });

    doc.setTextColor(0, 0, 0); // Noir pour tout le texte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci pour votre confiance !', 105, pageHeight - 14, {
      align: 'center',
    });

    doc.setTextColor(0, 0, 0); // Noir pour tout le texte
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Votre spécialiste en matelas et literie de qualité',
      105,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      '88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45',
      105,
      pageHeight - 6,
      { align: 'center' }
    );
    doc.text(
      'Email: myconfort@gmail.com - SIRET: 824 313 530 00027',
      105,
      pageHeight - 2,
      { align: 'center' }
    );
  }

  // 🗜️ PDF COMPRESSÉ POUR ENVOI EMAIL
  static async getCompressedPDFForEmail(
    invoice: Invoice
  ): Promise<{ blob: Blob; sizeKB: number; compressed: boolean }> {
    console.log('🗜️ GÉNÉRATION PDF COMPRESSÉ POUR ENVOI EMAIL (MAX 50KB)');

    try {
      // Générer d'abord un PDF standard
      const standardDoc = await this.generateInvoicePDF(invoice);
      const standardBlob = standardDoc.output('blob');
      const standardSizeKB = Math.round(standardBlob.size / 1024);

      console.log('📊 Taille PDF standard:', standardSizeKB, 'KB');

      // Si déjà sous 50KB, retourner tel quel
      if (standardSizeKB <= 50) {
        console.log('✅ PDF déjà sous 50KB, aucune compression nécessaire');
        return {
          blob: standardBlob,
          sizeKB: standardSizeKB,
          compressed: false,
        };
      }

      // Sinon, générer une version compressée
      console.log('🔧 PDF trop volumineux, génération version compressée...');
      const compressedDoc = await this.generateCompressedPDF(invoice);
      const compressedBlob = compressedDoc.output('blob');
      const compressedSizeKB = Math.round(compressedBlob.size / 1024);

      console.log('📊 Taille PDF compressé:', compressedSizeKB, 'KB');

      return {
        blob: compressedBlob,
        sizeKB: compressedSizeKB,
        compressed: true,
      };
    } catch (error) {
      console.error('❌ Erreur génération PDF compressé:', error);
      throw error;
    }
  }

  // 🗜️ VERSION COMPRESSÉE
  private static async generateCompressedPDF(invoice: Invoice): Promise<jsPDF> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const invoiceData = this.convertInvoiceData(invoice);

    // Version simplifiée pour réduire la taille
    this.addCompressedHeader(doc, invoiceData);
    this.addCompressedContent(doc, invoiceData);
    this.addCompressedFooter(doc);

    return doc;
  }

  private static addCompressedHeader(doc: jsPDF, data: InvoiceData): void {
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(10, 10, 190, 15, 'F');

    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(22); // Taille 22
    doc.setFont('helvetica', 'bold');
    doc.text('MyCoNfort', 15, 20);

    doc.setFontSize(10);
    doc.text(`Facture: ${data.invoiceNumber}`, 150, 20);
  }

  private static addCompressedContent(doc: jsPDF, data: InvoiceData): void {
    let y = 35;

    // Client
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 15, y + 5);
    doc.text(data.clientEmail, 15, y + 10);

    y += 20;

    // Produits simplifiés
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUITS:', 15, y);
    y += 5;

    data.items.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${item.qty}x ${item.description} - ${formatCurrency(item.total)}`,
        15,
        y
      );
      y += 5;
    });

    y += 10;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL TTC: ${formatCurrency(data.totalTTC)}`, 15, y);
  }

  private static addCompressedFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(8);
    doc.text('MyCoNfort - Merci de votre confiance !', 105, pageHeight - 10, {
      align: 'center',
    });
  }

  private static convertInvoiceData(invoice: Invoice): InvoiceData {
    // 🔧 CORRECTION CRITIQUE : Mapping dynamique pour gérer toutes les structures possibles
    console.log('🔍 CONVERTINVOICEDATA - Structure reçue:', {
      hasProducts: !!invoice.products,
      hasItems: !!(invoice as any).items,
      hasProduits: !!(invoice as any).produits,
      productsLength: invoice.products?.length || 0,
      itemsLength: (invoice as any).items?.length || 0,
      produitsLength: (invoice as any).produits?.length || 0,
      STRUCTURE_COMPLETE: invoice,
    });

    // Déterminer la source de produits selon ce qui est disponible
    let productsArray: any[] = [];

    if (
      invoice.products &&
      Array.isArray(invoice.products) &&
      invoice.products.length > 0
    ) {
      productsArray = invoice.products;
      console.log('✅ Utilisation de invoice.products:', productsArray);
    } else if (
      (invoice as any).items &&
      Array.isArray((invoice as any).items) &&
      (invoice as any).items.length > 0
    ) {
      productsArray = (invoice as any).items;
      console.log('✅ Utilisation de invoice.items:', productsArray);
    } else if (
      (invoice as any).produits &&
      Array.isArray((invoice as any).produits) &&
      (invoice as any).produits.length > 0
    ) {
      productsArray = (invoice as any).produits;
      console.log('✅ Utilisation de invoice.produits:', productsArray);
    } else {
      console.warn('⚠️ Aucun tableau de produits trouvé dans la structure');
      productsArray = [];
    }

    // Mapping des produits avec détection dynamique des propriétés
    const items = productsArray.map((product, index) => {
      console.log(`🏷️ Mapping produit ${index + 1}:`, {
        name:
          product.name ||
          product.description ||
          product.titre ||
          product.libelle,
        quantity: product.quantity || product.qty || product.quantite || 1,
        priceTTC:
          product.priceTTC ||
          product.price ||
          product.prix ||
          product.unitPrice ||
          0,
        STRUCTURE_PRODUIT: product,
      });

      // Détection intelligente des propriétés
      const name =
        product.name ||
        product.description ||
        product.titre ||
        product.libelle ||
        'Produit sans nom';
      const quantity = product.quantity || product.qty || product.quantite || 1;
      const priceTTC =
        product.priceTTC ||
        product.price ||
        product.prix ||
        product.unitPrice ||
        0;
      const category = product.category || product.categorie || '';
      const discount = product.discount || product.remise || 0;
      const discountType =
        product.discountType || product.typeRemise || 'percentage';

      return {
        description: name,
        category: category,
        qty: quantity,
        unitPriceHT: calculateHT(priceTTC, invoice.taxRate),
        unitPriceTTC: priceTTC,
        discount: discount,
        discountType: discountType,
        total: calculateProductTotal(
          quantity,
          priceTTC,
          discount,
          discountType
        ),
      };
    });

    console.log('✅ MAPPING TERMINÉ - Items générés pour le PDF:', items);
    console.log('📊 Résumé du mapping:', {
      nombreItems: items.length,
      totalCalculé: items.reduce((sum, item) => sum + item.total, 0),
      premiersItems: items.slice(0, 3).map(item => ({
        description: item.description,
        qty: item.qty,
        unitPriceTTC: item.unitPriceTTC,
        total: item.total,
      })),
    });

    const totalTTC = items.reduce((sum, item) => sum + item.total, 0);
    const totalHT = totalTTC / (1 + invoice.taxRate / 100);
    const totalTVA = totalTTC - totalHT;
    const totalDiscount = items.reduce((sum, item) => {
      const originalTotal = item.unitPriceTTC * item.qty;
      return sum + (originalTotal - item.total);
    }, 0);

    return {
      clientName: invoice.clientName,
      clientAddress: invoice.clientAddress,
      clientCity: invoice.clientCity,
      clientPostalCode: invoice.clientPostalCode,
      clientPhone: invoice.clientPhone,
      clientEmail: invoice.clientEmail,
      clientHousingType: invoice.clientHousingType,
      clientDoorCode: invoice.clientDoorCode,
      clientSiret: invoice.clientSiret,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      eventLocation: invoice.eventLocation,
      items,
      totalHT,
      totalTTC,
      totalTVA,
      totalDiscount,
      taxRate: invoice.taxRate,
      notes: invoice.invoiceNotes,
      advisorName: invoice.advisorName,
      paymentMethod: invoice.paymentMethod,
      depositAmount: invoice.montantAcompte,
      montantRestant: totalTTC - (invoice.montantAcompte || 0),
      signature: invoice.signature,
      deliveryMethod: invoice.deliveryMethod,
      deliveryNotes: invoice.deliveryNotes,
      nombreChequesAVenir: invoice.nombreChequesAVenir,
    };
  }

  static async downloadPDF(invoice: Invoice): Promise<void> {
    const doc = await this.generateInvoicePDF(invoice);
    const filename = `facture_${invoice.invoiceNumber}.pdf`;
    doc.save(filename);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    console.log("📎 GÉNÉRATION BLOB PDF IDENTIQUE À L'EXEMPLE HTML");
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }
}
