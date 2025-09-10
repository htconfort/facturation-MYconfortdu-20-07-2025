import jsPDF from 'jspdf';
// NOTE: sur certaines installs, l'import par défaut est différent.
// Ce cast évite les erreurs de type si les dts sont absents/anciens.
import autoTableImport from 'jspdf-autotable';
const autoTable = autoTableImport as unknown as (doc: jsPDF, opts: any) => void;

import type { Invoice } from '../types';

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
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'PSSTFRPPXXX',
};

/** —— CGV 15 articles (texte légal officiel MYCONFORT) —— */
const CGV_ITEMS: Array<{ title: string; text: string }> = [
  {
    title: 'Art. 1 - LOI HAMMON',
    text: 'Les achats effectués sur les foires expositions et salon, à l\'exception de ceux faisant l\'objet d\'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.',
  },
  {
    title: 'Art. 2 - Délais de Livraison',
    text: 'Sauf convention expresse, le retard dans les délais de livraison ne peut donner lieu à indemnité ou annulation de la commande, et notamment en cas de force majeure ou événement propre à retarder ou suspendre la livraison des marchandises. Les délais sont donnés à titre indicatif et ne constituent pas un engagement ferme. Ne pouvant pas maîtriser les plannings des transporteurs nous déclinons toute responsabilité en cas de délai dépassé.',
  },
  {
    title: 'Art. 3 - Risques de Transport',
    text: 'Nos fournitures même convenues franco, voyagent aux risques et périls du destinataire, à qui il appartient, en cas d\'avaries ou de pertes, de faire toutes réserves, et d\'exercer tout recours auprès des transporteurs seuls responsables. La date de livraison estimée d\'un produit est basée sur la présence du produit en stock et sur l\'adresse de livraison que vous nous avez fournie et est soumise à la réception de votre paiement de ce produit.',
  },
  {
    title: 'Art. 4 - Acceptation des Conditions',
    text: 'Toute livraison est soumise à l\'acceptation expresse des présentes conditions de vente. Le transporteur dépose les colis à l\'adresse indiquée, mais n\'est pas habilité à monter à l\'étage (CGV du transporteur). Le client aura toute faculté de réceptionner les fournitures au moment de la livraison. Il lui appartient à ce moment d\'en prendre après contrôle l\'entière responsabilité.',
  },
  {
    title: 'Art. 5 - Réclamations',
    text: 'Les réclamations concernant la qualité de la marchandise, à l\'exclusion de tout litige de transport, devront être formulées par écrit dans les huit jours qui suivent la livraison par lettre recommandée avec accusé de réception.',
  },
  {
    title: 'Art. 6 - Retours',
    text: 'Aucun retour de marchandises ne pourra être effectué sans notre consentement écrit, ce consentement n\'impliquant aucune reconnaissance.',
  },
  {
    title: 'Art. 7 - Tailles des Matelas',
    text: 'Étant donné que les mousses viscoélastiques utilisées pour la réalisation de nos matelas sont thermosensibles, cette caractéristique peut faire apparaître des dilatations pouvant faire varier leurs tailles de quelques centimètres (plus ou moins 5 cm). Les tailles standard de matelas sont données à titre indicatif, et ne constituent pas une obligation contractuelle de délivrance pouvant faire l\'objet de non conformité, d\'échange ou d\'annulation de la commande.',
  },
  {
    title: 'Art. 8 - Odeur des Matériaux',
    text: 'Par l\'acceptation expresse des présentes conditions de vente l\'acheteur est informé que la spécificité des mousses viscoélastiques conçues avec des polyols à base naturelle (huile de ricin) ainsi que les matières de conditionnement peuvent émettre une légère odeur qui s\'estompe après déballage, cela ne constitue pas un vice rédhibitoire ou un défaut pouvant faire l\'objet de non conformité au sens de l\'article 1604 et 1641 du code civil.',
  },
  {
    title: 'Art. 9 - Règlements et Remises',
    text: 'Sauf convention expresse, aucun rabais, ristourne ou escompte sur facture ne pourra être exigé par l\'acheteur en cas de règlement comptant. Les conditions de garantie comprennent l\'intégralité des mousses. Les textiles et accessoires ne sont pas soumis à garantie.',
  },
  {
    title: 'Art. 10 - Paiement',
    text: 'Nos factures sont payables selon les modalités suivantes : Par chèque ou virement à réception de facture. Par carte bancaire ou espèce.',
  },
  {
    title: 'Art. 11 - Pénalités de Retard',
    text: 'En cas de non-paiement d\'une facture à son échéance, nous nous réservons le droit d\'augmenter son montant de 10% avec un minimum de 300 € sans préjudice des intérêts de retard. De même, nous pourrons résilier la vente de plein droit et sans sommation par renvoi d\'une simple lettre recommandée.',
  },
  {
    title: 'Art. 12 - Exigibilité',
    text: 'Le non-paiement d\'une seule échéance rend exigible de plein droit le solde dû sur toutes les échéances à venir.',
  },
  {
    title: 'Art. 13 - Livraison Incomplète ou Non-Conforme',
    text: 'Il se peut que le colis soit endommagé ou que le contenu de celui-ci ait été partiellement ou totalement dérobé. Si vous constatez une telle erreur, veuillez le mentionner sur le bon du transporteur et refuser le produit. Dans le cas où vous prendriez connaissance de cette erreur après le départ du transporteur, veuillez nous signaler celle-ci par mail à l\'adresse myconfort66@gmail.com ou par téléphone dans un délai maximum de 72h ouvrables suivant la réception de la commande.',
  },
  {
    title: 'Art. 14 - Litiges',
    text: 'Tout litige, même en cas de recours en garantie ou de pluralité de défendeur est, à défaut d\'accord amiable de la compétence du Tribunal de Commerce de PERPIGNAN dans le ressort duquel se trouve notre siège social. Ou de la compétence des Tribunaux de Commerce dans le ressort duquel se trouve notre prestataire.',
  },
  {
    title: 'Art. 15 - Horaires de Livraison',
    text: 'Nous ne pouvons livrer les produits que du lundi au vendredi (excepté les jours fériés) et une personne âgée de plus de 18 ans doit être présente à l\'adresse de livraison quand le produit est livré. Une fois que vous avez passé une commande, il est difficile de modifier l\'adresse de livraison. Si vous souhaitez discuter d\'une modification de l\'adresse de livraison après avoir passé une commande, veuillez nous contacter dès que possible à l\'adresse myconfort66@gmail.com.',
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

    // Tableau Produits
    const body = (invoiceData.products || []).map(p => {
      const designation = p.name || p.category || '—';
      const qty = Number(p.quantity ?? 0);
      const unitTTC = Number(p.priceTTC ?? 0);
      const totalTTC = qty * unitTTC;
      return [
        designation,
        String(qty),
        unitTTC.toFixed(2) + ' €',
        totalTTC.toFixed(2) + ' €',
      ];
    });

    autoTable(doc, {
      startY: 35 + companyLines.length * 4.6 + 20,
      head: [['Désignation', 'Qté', 'PU TTC', 'Total TTC']],
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
        3: { halign: 'right' },
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

    // ————— PAGE 2 — CGV (2 colonnes)
    doc.addPage('a4', 'portrait');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Conditions Générales de Vente', MARGIN, 20);

    // Deux colonnes : 90 mm chacune (A4 largeur ≈ 210 mm → 210 - 2*15 = 180 mm utiles)
    const colWidth = (w - MARGIN * 2 - 6) / 2; // 3 mm de gouttière de chaque côté
    const leftX = MARGIN;
    const cgvRightX = MARGIN + colWidth + 6;
    let yLeft = 28;
    let yRight = 28;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);

    CGV_ITEMS.forEach(item => {
      const block = [`${item.title}`, item.text];
      const blockLines = doc.splitTextToSize(block.join(' — '), colWidth);

      // Choix de la colonne (remplir gauche, puis droite)
      const lineHeight = 4.4;
      const blockHeight = blockLines.length * lineHeight + 2;

      const canLeft = yLeft + blockHeight < 285; // garder marge bas
      const useLeft = canLeft && yLeft <= yRight;

      if (useLeft) {
        doc.setFont('helvetica', 'bold');
        doc.text(item.title, leftX, yLeft);
        doc.setFont('helvetica', 'normal');
        const txt = doc.splitTextToSize(item.text, colWidth);
        doc.text(txt, leftX, yLeft + 5);
        yLeft += txt.length * lineHeight + 9;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text(item.title, cgvRightX, yRight);
        doc.setFont('helvetica', 'normal');
        const txt = doc.splitTextToSize(item.text, colWidth);
        doc.text(txt, cgvRightX, yRight + 5);
        yRight += txt.length * lineHeight + 9;
      }
    });

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
