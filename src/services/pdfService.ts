import jsPDF from 'jspdf';
// NOTE: sur certaines installs, l'import par défaut est différent.
// Ce cast évite les erreurs de type si les dts sont absents/anciens.
import autoTableImport from 'jspdf-autotable';
const autoTable = autoTableImport as unknown as (doc: jsPDF, opts: any) => void;

import type { Invoice } from '../types';
import { calculateProductTotal } from '../utils/calculations';

export type PDFBlob = Blob;

type Item = {
  name?: string;
  designation?: string; // tolérance
  quantity?: number;
  priceTTC?: number;
  discount?: number;
  discountType?: 'percent' | 'amount';
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
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  taxRate: number; // ex: 20
  paymentMethod?: string;
  invoiceNotes?: string;
  signature?: string; // data URL de la signature
  isSigned?: boolean;
  signatureDate?: string;
  nombreChequesAVenir?: number; // ✅ Ajout pour les chèques à venir
  montantRestant?: number; // ✅ Ajout pour le montant restant
};

const GREEN: [number, number, number] = [71, 122, 12]; // #477A0C
const MARGIN = 15;

/** —— Paramètres société (à personnaliser) —— */
const COMPANY = {
  name: 'MYCONFORT',
  address1: '88 avenue des Ternes',
  address2: '75017 Paris',
  phone: '+33 6 61 48 60 23',
  email: 'htconfort@gmail.com',
  website: 'htconfort.com',
  siret: '824 313 530 00027',
  iban: (import.meta as any).env?.VITE_COMPANY_IBAN || 'FR76 1660 7000 1708 1216 3980 964',
  bic: (import.meta as any).env?.VITE_COMPANY_BIC || 'CCBPFRPPPPG',
};

/** —— CGV 16 articles (texte légal officiel MYCONFORT - 10 septembre 2025) —— */
const CGV_ITEMS: Array<{ title: string; text: string }> = [
  {
    title: 'Art. 1 - Loi applicable et rétractation',
    text: 'Pas de rétractation en foires/salons (art. L224-59). Pour ventes à distance : 14j sauf produits sur mesure (art. L221-28).',
  },
  {
    title: 'Art. 2 - Délais de livraison',
    text: 'Délais indicatifs. Aucun retard ne justifie annulation ou indemnisation sauf engagement écrit. Force majeure exonératoire.',
  },
  {
    title: 'Art. 3 - Transfert des risques',
    text: 'Transport aux risques du destinataire. Réserves obligatoires sur bon de livraison et confirmation sous 48h. Sans réserves = accepté.',
  },
  {
    title: 'Art. 4 - Acceptation des conditions',
    text: 'Toute commande = acceptation CGV. Livraison rez-de-chaussée uniquement, installation à charge du client.',
  },
  {
    title: 'Art. 5 - Réclamations qualité',
    text: 'Réclamations par recommandé AR sous 8 jours après livraison. Passé ce délai = irrecevable.',
  },
  {
    title: 'Art. 6 - Retours',
    text: 'Aucun retour sans accord écrit. Retour aux frais/risques du client, sans reconnaissance de responsabilité.',
  },
  {
    title: 'Art. 7 - Dimensions des produits',
    text: 'Tolérance ±5 cm. Pas de non-conformité ni recours pour variation dimensionnelle.',
  },
  {
    title: 'Art. 8 - Odeur des matériaux',
    text: 'Mousses naturelles : odeur temporaire normale, pas vice caché (C. civ. art. 1604/1641).',
  },
  {
    title: 'Art. 9 - Garanties',
    text: 'Couvrent seulement structure interne (mousses/âme). Exclus : housses, coutils, fermetures. Garantie annulée si mauvais usage.',
  },
  {
    title: 'Art. 10 - Paiement',
    text: 'Paiement comptant à réception (CB, virement, chèque, espèces). Clause réserve propriété (C. civ. art. 2367).',
  },
  {
    title: 'Art. 11 - Retard de paiement',
    text: 'Intérêts légaux +10pts. Indemnité 40 € (C. com. L441-10). Majoration +10 % min. 300 €. Suspension/annulation possible.',
  },
  {
    title: 'Art. 12 - Exigibilité anticipée',
    text: 'Non-paiement d\'une échéance = exigibilité immédiate du solde total.',
  },
  {
    title: 'Art. 13 - Livraison non conforme',
    text: 'Colis endommagé : refuser avec réserves. Défaut après réception = signal sous 72h (myconfort66@gmail.com).',
  },
  {
    title: 'Art. 14 - Litiges',
    text: 'Tentative amiable obligatoire. À défaut, Tribunal de Commerce de Perpignan compétent.',
  },
  {
    title: 'Art. 15 - Horaires de livraison',
    text: 'Livraison lun-ven (hors fériés). Présence majeure obligatoire. Adresse modifiable uniquement par écrit.',
  },
  {
    title: 'Art. 16 - Modalités de livraison',
    text: 'Rez-de-chaussée uniquement. Client prévenu par email/SMS. Nouvelle présentation facturable en cas d\'absence.',
  },
];

/** Optimise une signature (dataURL) pour réduire sa taille */
async function optimizeSignature(signatureDataUrl: string): Promise<string> {
  try {
    return new Promise((resolve, _reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Dimensions optimales pour signature (max 300x150px)
          const maxWidth = 300;
          const maxHeight = 150;
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Fond blanc pour signature
          ctx!.fillStyle = 'white';
          ctx!.fillRect(0, 0, width, height);

          // Dessiner la signature
          ctx!.drawImage(img, 0, 0, width, height);

          // Convertir en JPEG avec compression (0.8 = 80% qualité)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          console.log('🔧 Signature optimisée:', {
            originalSize: signatureDataUrl.length,
            optimizedSize: optimizedDataUrl.length,
            reduction: `${((1 - optimizedDataUrl.length / signatureDataUrl.length) * 100).toFixed(1)}%`,
            dimensions: `${width}x${height}px`,
          });

          resolve(optimizedDataUrl);
        } catch (error) {
          console.warn('Signature optimization failed, using original:', error);
          resolve(signatureDataUrl);
        }
      };
      img.onerror = () => {
        console.warn(
          'Failed to load signature for optimization, using original'
        );
        resolve(signatureDataUrl);
      };
      img.src = signatureDataUrl;
    });
  } catch (error) {
    console.warn('Signature optimization error:', error);
    return signatureDataUrl;
  }
}

/** Charge un logo en dataURL avec compression optimisée */
async function toDataURL(url?: string) {
  if (!url) return undefined;
  try {
    const blob = await fetch(url).then(r => r.blob());

    // 🔧 OPTIMISATION: Compresser l'image pour réduire la taille du PDF
    return await new Promise<string>((res, rej) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Créer un canvas avec dimensions raisonnables (max 200x100px)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculer les dimensions optimales (max 200x100, garde proportions)
          const maxWidth = 200;
          const maxHeight = 100;
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // 🎨 FOND BLANC: Forcer un fond blanc pour éviter la transparence noire
          ctx!.fillStyle = 'white';
          ctx!.fillRect(0, 0, width, height);

          // Dessiner l'image redimensionnée avec compression
          ctx!.drawImage(img, 0, 0, width, height);

          // Convertir en JPEG avec compression aggressive (0.7 = 70% qualité)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

          console.log('🔧 Logo compressé:', {
            originalSize: blob.size,
            compressedSize: compressedDataUrl.length,
            reduction: `${((1 - compressedDataUrl.length / blob.size) * 100).toFixed(1)}%`,
            dimensions: `${width}x${height}px`,
          });

          res(compressedDataUrl);
        } catch (error) {
          console.warn('Logo compression failed, using original:', error);
          // Fallback: utiliser l'image originale si compression échoue
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = () => rej(new Error('logo load error'));
          fr.readAsDataURL(blob);
        }
      };
      img.onerror = () => rej(new Error('logo load error'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.warn('Logo loading failed:', error);
    return undefined;
  }
}

/** Footer commun (mentions + pagination) */
function drawFooter(doc: jsPDF, pageNumber: number) {
  const w = doc.internal.pageSize.getWidth();
  const y = doc.internal.pageSize.getHeight() - 10;
  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y - 5, w - MARGIN, y - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `${COMPANY.name} — ${COMPANY.address1}, ${COMPANY.address2} — ${COMPANY.email} — ${COMPANY.phone}`,
    MARGIN,
    y
  );
  doc.text(`Page ${pageNumber} / 2`, w - MARGIN, y, { align: 'right' });
}

export const PDFService = {
  /**
   * Génère un PDF facture 2 pages (A4) : page 1 facture, page 2 CGV.
   * Version premium avec en-tête société complet, CGV 15 articles en 2 colonnes,
   * footer avec pagination, remerciements et instructions de paiement.
   * Retourne un Blob prêt à être imprimé / téléchargé / envoyé à n8n.
   */
  async generateInvoicePDF(
    invoice: Invoice,
    _previewRef?: React.RefObject<HTMLDivElement>,
    opts?: { logoUrl?: string }
  ): Promise<PDFBlob> {
    // Mapping robuste Invoice → InvoiceForPDF
    const invoiceData = coerceInvoice(invoice);

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();

    // ————— PAGE 1 — Facture
    const logoUrl = opts?.logoUrl || '/HT-Confort_Full_Green.png';

    // Charger le logo PNG
    const logo = await toDataURL(logoUrl);

    if (logo) {
      // Logo avec dimensions optimisées pour un rendu professionnel
      doc.addImage(logo, 'PNG', MARGIN, 10, 40, 20);
    }

    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('FACTURE', w / 2, 20, { align: 'center' });

    // Bloc Société (gauche)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const companyLines = [
      COMPANY.name,
      COMPANY.address1,
      COMPANY.address2,
      `Tél : ${COMPANY.phone}`,
      `Email : ${COMPANY.email}`,
      `Web : ${COMPANY.website}`,
      `SIRET : ${COMPANY.siret}`,
      `IBAN : ${COMPANY.iban}`,
      `BIC : ${COMPANY.bic}`,
    ];
    companyLines.forEach((l, i) => doc.text(l, MARGIN, 35 + i * 4.6));

    // Infos facture (centre gauche)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      `Facture n° : ${invoiceData.invoiceNumber}`,
      MARGIN,
      35 + companyLines.length * 4.6 + 6
    );
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Date : ${invoiceData.invoiceDate}`,
      MARGIN,
      35 + companyLines.length * 4.6 + 12
    );

    // Bloc Client (droite)
    const clientX = w - 80;
    doc.setFont('helvetica', 'bold');
    doc.text('Client', clientX, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const cData = [
      invoiceData.clientName || '—',
      invoiceData.clientAddress || '—',
      `${invoiceData.clientPostalCode ?? ''} ${invoiceData.clientCity ?? ''}`.trim() ||
        '—',
      invoiceData.clientPhone ? `Tél : ${invoiceData.clientPhone}` : '',
      invoiceData.clientEmail ? `Email : ${invoiceData.clientEmail}` : '',
    ].filter(Boolean);
    cData.forEach((l, i) => doc.text(l, clientX, 40 + i * 4.6));

    // Tableau Produits avec colonne Remise et totaux remisés
    const body = (invoiceData.products || []).map(p => {
      const designation = p.name || p.category || '—';
      const qty = Number(p.quantity ?? 0);
      const unitTTC = Number(p.priceTTC ?? 0);
      const discount = Number(p.discount || 0);
      const discountType = p.discountType === 'amount' ? 'fixed' : 'percent';
      const totalTTC = calculateProductTotal(qty, unitTTC, discount, discountType);
      const discountDisplay =
        discount > 0
          ? `${discount}${discountType === 'percent' ? '%' : '€'}`
          : '-';
      return [
        designation,
        String(qty),
        unitTTC.toFixed(2) + ' €',
        discountDisplay,
        totalTTC.toFixed(2) + ' €',
      ];
    });

    autoTable(doc, {
      startY: 35 + companyLines.length * 4.6 + 20,
      head: [['Désignation', 'Qté', 'PU TTC', 'Remise', 'Total TTC']],
      body,
      theme: 'grid',
      headStyles: {
        fillColor: GREEN as any,
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: MARGIN, right: MARGIN },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
      },
      // Footer à chaque page rendue par autotable
      didDrawPage: () => {
        drawFooter(doc, 1);
      },
      rowPageBreak: 'avoid',
      // Empêche Autotable de déborder trop bas
      tableWidth: w - MARGIN * 2,
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY ?? 120;

    // Totaux (colonne droite)
    const totalDiscount = (invoiceData.products || []).reduce((sum, p) => {
      const qty = Number(p.quantity || 0);
      const unitTTC = Number(p.priceTTC || 0);
      const discount = Number((p as any).discount || 0);
      const discountType = (p as any).discountType === 'amount' ? 'fixed' : 'percent';
      const original = qty * unitTTC;
      const discounted = calculateProductTotal(qty, unitTTC, discount, discountType);
      return sum + (original - discounted);
    }, 0);
    autoTable(doc, {
      startY: afterTableY + 6,
      body: [
        ['Total HT', `${invoiceData.montantHT.toFixed(2)} €`],
        [
          `TVA ${Math.round(invoiceData.taxRate)}%`,
          `${invoiceData.montantTVA.toFixed(2)} €`,
        ],
        ['Total TTC', `${invoiceData.montantTTC.toFixed(2)} €`],
      ],
      theme: 'plain',
      styles: { fontSize: 10, halign: 'right' },
      columnStyles: { 0: { halign: 'left' } },
      margin: { left: w - 100 - MARGIN, right: MARGIN },
    });

    // Affichage informatif de la remise totale appliquée
    if (totalDiscount > 0) {
      autoTable(doc, {
        startY: ((doc as any).lastAutoTable?.finalY ?? afterTableY + 6) + 2,
        body: [['Remise totale appliquée', `- ${totalDiscount.toFixed(2)} €`]],
        theme: 'plain',
        styles: { fontSize: 9, halign: 'right', textColor: [71, 122, 12] },
        columnStyles: { 0: { halign: 'left' } },
        margin: { left: w - 100 - MARGIN, right: MARGIN },
      });
    }

    let y = (doc as any).lastAutoTable.finalY + 8;
    // Mode de règlement
    if (invoiceData.paymentMethod) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mode de règlement', MARGIN, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      doc.text(invoiceData.paymentMethod, MARGIN, y);
      y += 4;
      
      // ✅ Affichage des détails des chèques à venir
      if (invoiceData.nombreChequesAVenir && invoiceData.nombreChequesAVenir > 0 && invoiceData.montantRestant) {
        const montantParCheque = (invoiceData.montantRestant / invoiceData.nombreChequesAVenir).toFixed(2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`• ${invoiceData.nombreChequesAVenir} chèques de ${montantParCheque}€ chacun`, MARGIN + 5, y + 3);
        doc.text(`• Montant total des chèques : ${invoiceData.montantRestant.toFixed(2)}€`, MARGIN + 5, y + 7);
        y += 10;
      }
      y += 2;
    }
    // Remerciements & instructions de paiement
    doc.setFont('helvetica', 'bold');
    doc.text('Merci pour votre confiance 🙏', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const thanks =
      `Paiement par virement : IBAN ${COMPANY.iban} — BIC ${COMPANY.bic}. ` +
      `Indiquez le n° de facture ${invoiceData.invoiceNumber} en référence.`;
    const thanksLines = doc.splitTextToSize(thanks, w - MARGIN * 2);
    doc.text(thanksLines, MARGIN, y + 5);

    // ————— Signature client si présente —————
    if (invoiceData.signature && invoiceData.isSigned) {
      y += 20; // Espacement avant la signature

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Signature client :', MARGIN, y);

      try {
        // 🔧 OPTIMISATION: Compresser la signature avant ajout au PDF
        const optimizedSignature = await optimizeSignature(
          invoiceData.signature
        );
        doc.addImage(optimizedSignature, 'JPEG', MARGIN, y + 5, 50, 25);
        y += 30; // Espacement après la signature

        // Date de signature si disponible
        if (invoiceData.signatureDate) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const signDate = new Date(
            invoiceData.signatureDate
          ).toLocaleDateString('fr-FR');
          doc.text(`Signé le ${signDate}`, MARGIN, y);
          y += 5;
        }
      } catch (_error) {
        // Fallback en cas d'erreur avec l'image
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('✓ Signature électronique enregistrée', MARGIN, y + 5);
        y += 15;
      }
    }

    // ————— Acceptation des CGV —————
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 122, 12); // Vert MYCONFORT
    doc.text('✓ Conditions générales de vente acceptées par le client', MARGIN, y);
    doc.setTextColor(0, 0, 0); // Retour au noir

    // ————— Information légale Article L224-59 —————
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('⚖️ INFORMATION LÉGALE - ARTICLE L224-59', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const legalText =
      "« Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »";
    const legalLines = doc.splitTextToSize(legalText, w - MARGIN * 2);
    doc.text(legalLines, MARGIN, y + 4);

    // ————— PAGE 2 — CGV (2 colonnes optimisées)
    doc.addPage('a4', 'portrait');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Conditions Générales de Vente', MARGIN, 18);

    // Optimisation: colonnes plus larges avec marges réduites
    const cgvMargin = 12; // Réduit de 15 à 12
    const colGutter = 4; // Réduit de 6 à 4
    const colWidth = (w - cgvMargin * 2 - colGutter) / 2;
    const leftX = cgvMargin;
    const cgvRightX = cgvMargin + colWidth + colGutter;
    let yLeft = 25;
    let yRight = 25;

    // Police plus petite et espacement réduit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2); // Réduit de 9.2 à 8.2
    const lineHeight = 3.8; // Réduit de 4.4 à 3.8
    const articleSpacing = 6; // Réduit de 9 à 6

    CGV_ITEMS.forEach(item => {
      // Séparation titre et texte pour une meilleure gestion
      const titleLines = doc.splitTextToSize(item.title, colWidth);
      const textLines = doc.splitTextToSize(item.text, colWidth);
      
      const titleHeight = titleLines.length * lineHeight;
      const textHeight = textLines.length * lineHeight;
      const blockHeight = titleHeight + textHeight + articleSpacing;

      // Vérification si ça rentre dans la colonne gauche
      const canLeft = yLeft + blockHeight < 275; // Limite plus basse pour plus d'espace
      const useLeft = canLeft && yLeft <= yRight;

      if (useLeft) {
        // Colonne gauche
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5); // Titre légèrement plus gros
        doc.text(titleLines, leftX, yLeft);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0); // Texte plus compact
        doc.text(textLines, leftX, yLeft + titleHeight + 2);
        
        yLeft += blockHeight;
      } else {
        // Colonne droite
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(titleLines, cgvRightX, yRight);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0);
        doc.text(textLines, cgvRightX, yRight + titleHeight + 2);
        
        yRight += blockHeight;
      }
    });

    // Date de mise à jour compacte
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100); // Gris
    const dateText = 'Conditions générales mises à jour le 10 septembre 2025';
    const textWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (w - textWidth) / 2, 280); // Centré en bas

    drawFooter(doc, 2);

    // ————— Génération finale avec monitoring de taille —————
    const pdfOutput = new Blob([doc.output('arraybuffer')], {
      type: 'application/pdf',
    });
    const pdfSizeMB = pdfOutput.size / (1024 * 1024);

    console.log('📄 PDF généré:', {
      pages: 2,
      size: `${pdfSizeMB.toFixed(2)} MB`,
      sizeBytes: pdfOutput.size,
      invoiceNumber: invoiceData.invoiceNumber,
      hasLogo: !!logo,
      hasSignature: !!(invoiceData.signature && invoiceData.isSigned),
    });

    // ⚠️ ALERTE si le PDF est trop volumineux (> 5MB)
    if (pdfSizeMB > 5) {
      console.warn(
        `⚠️ PDF très volumineux (${pdfSizeMB.toFixed(2)}MB) - Cela peut causer des problèmes d'envoi!`
      );
      console.warn(
        '💡 Conseil: Vérifiez la taille des images (logo/signature) ou utilisez des formats plus compressés'
      );
    }

    return pdfOutput;
  },

  /**
   * Alias pour generateInvoicePDF pour compatibilité
   */
  async generate(
    invoice: Invoice,
    opts?: { logoUrl?: string }
  ): Promise<PDFBlob> {
    return this.generateInvoicePDF(invoice, undefined, opts);
  },
};

/**
 * Mapping robuste Invoice → InvoiceForPDF avec gestion des variations de schéma.
 * Tolère les différences de noms de champs pour les produits (name/designation).
 */
function coerceInvoice(invoice: Invoice): InvoiceForPDF {
  const products: Item[] = (invoice.products || []).map((prod: any) => {
    return {
      name: prod.name || prod.designation || 'Produit',
      designation: prod.designation || prod.name,
      quantity: Number(prod.quantity) || 1,
      priceTTC: Number(prod.priceTTC) || 0,
      discount: Number(prod.discount) || 0,
      discountType: (prod.discountType === 'amount' ? 'amount' : 'percent') as
        | 'percent'
        | 'amount',
      category: prod.category || '',
    };
  });

  return {
    invoiceNumber: String(invoice.invoiceNumber || 'N/A'),
    invoiceDate: String(
      invoice.invoiceDate || new Date().toLocaleDateString('fr-FR')
    ),
    clientName: String(invoice.clientName || 'Client'),
    clientAddress: String(invoice.clientAddress || ''),
    clientPostalCode: invoice.clientPostalCode
      ? String(invoice.clientPostalCode)
      : undefined,
    clientCity: invoice.clientCity ? String(invoice.clientCity) : undefined,
    clientPhone: invoice.clientPhone ? String(invoice.clientPhone) : undefined,
    clientEmail: invoice.clientEmail ? String(invoice.clientEmail) : undefined,
    products,
    montantHT: Number(invoice.montantHT) || 0,
    montantTVA: Number(invoice.montantTVA) || 0,
    montantTTC: Number(invoice.montantTTC) || 0,
    taxRate: Number(invoice.taxRate) || 20,
    paymentMethod: invoice.paymentMethod
      ? String(invoice.paymentMethod)
      : undefined,
    invoiceNotes: invoice.invoiceNotes
      ? String(invoice.invoiceNotes)
      : undefined,
    signature: invoice.signature ? String(invoice.signature) : undefined,
    isSigned: Boolean(invoice.isSigned),
    signatureDate: invoice.signatureDate
      ? String(invoice.signatureDate)
      : undefined,
    nombreChequesAVenir: Number(invoice.nombreChequesAVenir) || 0, // ✅ Ajout
    montantRestant: Number(invoice.montantRestant) || 0, // ✅ Ajout
  };
}
