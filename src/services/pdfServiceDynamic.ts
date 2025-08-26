import type { Invoice, Product } from '../types';

export type PDFBlob = Blob;

// Import dynamique des librairies PDF - chargées uniquement à l'usage
async function loadPdfLibs() {
  const [{ default: jsPDF }, autoTableImport] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  
  // Cast pour compatibilité types
  const autoTable = autoTableImport as unknown as (doc: typeof jsPDF.prototype, opts: any) => void;
  
  return { jsPDF, autoTable };
}

// Fonction principale avec import dynamique
export async function generatePdf(invoice: Invoice): Promise<PDFBlob> {
  // Chargement dynamique - uniquement quand nécessaire
  const { jsPDF, autoTable } = await loadPdfLibs();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Exemple d'utilisation
  doc.text('Facture: ' + (invoice.invoiceNumber || 'N/A'), 20, 20);
  
  // Utilisation d'autoTable si nécessaire
  if (invoice.products && invoice.products.length > 0) {
    autoTable(doc, {
      head: [['Produit', 'Quantité', 'Prix']],
      body: invoice.products.map((product: Product) => [
        product.name || '',
        product.quantity?.toString() || '0',
        product.priceTTC?.toString() || '0'
      ]),
      startY: 30
    });
  }
  
  // Retour du blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

// Fonction alternative pour HTML vers PDF
export async function generatePdfFromHtml(htmlElement: HTMLElement): Promise<PDFBlob> {
  // Import dynamique des libs HTML vers PDF
  const [{ default: jsPDF }, html2canvas, html2pdf] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
    import('html2pdf.js'),
  ]);

  // Utilisation des libs chargées dynamiquement
  const options = {
    margin: 1,
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Exemple d'utilisation avec html2canvas si nécessaire
  const canvas = await html2canvas.default(htmlElement);
  const imgData = canvas.toDataURL('image/png');
  
  const doc = new jsPDF();
  // Correction: utilisation correcte d'addImage avec tous les paramètres requis
  doc.addImage(imgData, 'PNG', 10, 10, 190, 0); // x, y, width, height (0 = auto)

  // Ou utilisation directe d'html2pdf
  const pdfBlob = await html2pdf.default().from(htmlElement).set(options).outputPdf('blob');
  return pdfBlob;
}
