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
  siret: 'XXXX XXX XXX',
  tva: 'FRXX XXXXXXXXX',
  rcs: 'RCS Paris XXXXX',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'PSSTFRPPXXX',
};

/** —— CGV 15 articles (texte exemple compact à adapter) —— */
const CGV_ITEMS: Array<{ title: string; text: string }> = [
  {
    title: '1. Objet',
    text: 'Les présentes conditions régissent les ventes de MYCONFORT.',
  },
  {
    title: '2. Produits',
    text: "Descriptions et caractéristiques indicatives ; tolérances d'usage.",
  },
  {
    title: '3. Prix',
    text: 'Prix TTC en euros, TVA 20 % ; offres valables dans la limite des stocks.',
  },
  {
    title: '4. Commande',
    text: 'Validation après paiement ou acompte ; confirmation par email.',
  },
  {
    title: '5. Paiement',
    text: 'CB Banque Populaire, virement, chèques ; pénalités de retard légales.',
  },
  {
    title: '6. Acompte',
    text: 'Acompte non remboursable sauf obligation légale ; solde à la livraison.',
  },
  {
    title: '7. Livraison',
    text: "Délais indicatifs 48 h ouvrées ; pas de reprise d'anciens matelas.",
  },
  {
    title: '8. Réception',
    text: 'Réserves à formuler à la livraison ; défauts apparents sous 48 h.',
  },
  {
    title: '9. Garantie',
    text: "Jusqu'à 15 ans selon référence ; exclusions: mauvaise utilisation/usure.",
  },
  {
    title: '10. Retours',
    text: 'Hors droit de rétractation légal non applicable aux biens personnalisés.',
  },
  {
    title: '11. SAV',
    text: 'Service client Saint-Hippolyte — htconfort@me.com — 06 61 48 60 23.',
  },
  {
    title: '12. Données',
    text: "Traitements RGPD ; droit d'accès/rectification/suppression.",
  },
  {
    title: '13. Force majeure',
    text: "Suspension/exonération en cas d'événement irrésistible et imprévisible.",
  },
  {
    title: '14. Droit applicable',
    text: 'Droit français ; tentative amiable avant toute action.',
  },
  {
    title: '15. Juridiction',
    text: "Tribunaux compétents du ressort du siège social en cas d'échec amiable.",
  },
];

/** Charge un logo en dataURL (optionnel) */
async function toDataURL(url?: string) {
  if (!url) return undefined;
  const blob = await fetch(url).then(r => r.blob());
  return await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = () => rej(new Error('logo load error'));
    fr.readAsDataURL(blob);
  });
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
    const logo = await toDataURL(
      opts?.logoUrl || (window as any).__MYCONFORT_LOGO__
    );
    if (logo) doc.addImage(logo, 'PNG', MARGIN, 10, 28, 12);

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
      `SIRET : ${COMPANY.siret} — TVA : ${COMPANY.tva}`,
      `RCS : ${COMPANY.rcs}`,
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
      y += 6;
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

    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
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
  };
}
