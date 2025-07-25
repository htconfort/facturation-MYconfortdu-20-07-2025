import React, { useState } from 'react';
import { FileText, Eye, Trash2, Search, Calendar, User, Mail, Filter, MapPin, Printer, Edit } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { SimpleModalPreview } from './SimpleModalPreview';

interface InvoicesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onDeleteInvoice: (index: number) => void;
  onLoadInvoice: (invoice: Invoice) => void;
}

export const InvoicesListModal: React.FC<InvoicesListModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onDeleteInvoice,
  onLoadInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'client' | 'amount' | 'eventLocation'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'signed' | 'unsigned'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filtrer et trier les factures
  const filteredAndSortedInvoices = React.useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.eventLocation && invoice.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'signed' && invoice.signature) ||
        (filterStatus === 'unsigned' && !invoice.signature);
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
          break;
        case 'number':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'client':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'amount':
          const totalA = a.products.reduce((sum, product) => 
            sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
          const totalB = b.products.reduce((sum, product) => 
            sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
          comparison = totalA - totalB;
          break;
        case 'eventLocation':
          // Tri par lieu d'événement (les factures sans lieu en dernier)
          const locationA = a.eventLocation || '';
          const locationB = b.eventLocation || '';
          comparison = locationA.localeCompare(locationB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [invoices, searchTerm, sortBy, sortOrder, filterStatus]);

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      // Créer un aperçu temporaire pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
        return;
      }

      // Calculer le total pour l'affichage
      const total = calculateInvoiceTotal(invoice);
      
      // Créer le contenu HTML pour l'impression avec la facture sur la première page et les conditions générales sur la deuxième
      const printContent = `
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
              color: #333;
              font-size: 12px;
              line-height: 1.4;
            }
            
            /* Page 1 - Facture */
            .invoice-page {
              padding: 20mm;
              min-height: 100vh;
              page-break-after: always;
            }
            
            .header { 
              background: linear-gradient(135deg, #477A0C, #5A8F0F); 
              color: white; 
              padding: 20px; 
              text-align: center; 
              margin-bottom: 30px;
              border-radius: 8px;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 20px;
              font-weight: normal;
            }
            
            .invoice-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            
            .invoice-details h3,
            .client-info h3 {
              color: #477A0C;
              font-size: 16px;
              margin: 0 0 15px 0;
              border-bottom: 2px solid #477A0C;
              padding-bottom: 5px;
            }
            
            .client-info { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px;
              border-left: 4px solid #477A0C;
            }
            
            .products-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .products-table th, .products-table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            
            .products-table th { 
              background: #477A0C; 
              color: white; 
              font-weight: bold;
              text-align: center;
            }
            
            .products-table td:nth-child(2),
            .products-table td:nth-child(3),
            .products-table td:nth-child(4) {
              text-align: center;
            }
            
            .products-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .total-section { 
              text-align: right; 
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #477A0C;
            }
            
            .total { 
              font-size: 20px; 
              font-weight: bold; 
              color: #477A0C; 
              margin-bottom: 10px;
            }
            
            .signature-info {
              margin: 30px 0;
              padding: 15px;
              background: #e8f5e8;
              border-radius: 8px;
              border-left: 4px solid #28a745;
              text-align: center;
            }
            
            .company-footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 11px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            
            /* Page 2 - Conditions Générales */
            .conditions-page {
              padding: 20mm;
              min-height: 100vh;
            }
            
            .conditions-header h1 {
              text-align: center;
              color: #477A0C;
              margin-bottom: 30px;
              font-size: 22px;
              border-bottom: 3px solid #477A0C;
              padding-bottom: 10px;
            }
            
            .conditions-content {
              font-size: 10px;
              line-height: 1.4;
              columns: 2;
              column-gap: 20px;
            }
            
            .condition-section {
              margin-bottom: 12px;
              break-inside: avoid;
            }
            
            .condition-section h3 {
              color: #477A0C;
              font-size: 11px;
              margin-bottom: 5px;
              font-weight: bold;
            }
            
            .condition-section p {
              margin: 0;
              text-align: justify;
            }
            
            .conditions-footer {
              text-align: center;
              margin-top: 30px;
              font-size: 9px;
              font-style: italic;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0;
              }
              .invoice-page {
                padding: 15mm;
                page-break-after: always;
              }
              .conditions-page {
                padding: 15mm;
              }
              .no-print { 
                display: none !important; 
              }
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: FACTURE -->
          <div class="invoice-page">
            <div class="header">
              <h1>🌸 MYCONFORT</h1>
              <h2>Facture ${invoice.invoiceNumber}</h2>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-details">
                <h3>Informations Facture</h3>
                <p><strong>Numéro:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                ${invoice.eventLocation ? `<p><strong>Lieu d'événement:</strong> ${invoice.eventLocation}</p>` : ''}
                ${invoice.advisorName ? `<p><strong>Conseiller:</strong> ${invoice.advisorName}</p>` : ''}
                ${invoice.clientHousingType ? `<p><strong>Type de logement:</strong> ${invoice.clientHousingType}</p>` : ''}
              </div>
              
              <div class="client-info">
                <h3>Informations Client</h3>
                <p><strong>${invoice.clientName}</strong></p>
                <p>${invoice.clientAddress}</p>
                <p>${invoice.clientPostalCode} ${invoice.clientCity}</p>
                <p><strong>Téléphone:</strong> ${invoice.clientPhone}</p>
                <p><strong>Email:</strong> ${invoice.clientEmail}</p>
              </div>
            </div>
            
            <table class="products-table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Quantité</th>
                  <th>Prix unitaire TTC</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.products.map(product => `
                  <tr>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.quantity}</td>
                    <td>${formatCurrency(product.priceTTC)}</td>
                    <td><strong>${formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total">
                TOTAL TTC: ${formatCurrency(total)}
              </div>
              ${invoice.montantAcompte > 0 ? `
                <div style="font-size: 14px; margin-top: 10px;">
                  <div>Acompte versé: ${formatCurrency(invoice.montantAcompte)}</div>
                  <div style="color: #477A0C; font-weight: bold; font-size: 16px; margin-top: 5px;">
                    Reste à payer: ${formatCurrency(total - invoice.montantAcompte)}
                  </div>
                </div>
              ` : ''}
            </div>
            
            ${invoice.signature ? `
              <div class="signature-info">
                <p><strong>✅ Facture signée électroniquement</strong></p>
                <p style="font-size: 11px; margin-top: 5px;">Cette facture a été signée numériquement par le client</p>
              </div>
            ` : ''}
            
            <div class="company-footer">
              <p><strong>MYCONFORT</strong></p>
              <p>88 Avenue des Ternes, 75017 Paris</p>
              <p>Téléphone: 04 68 50 41 45 • Email: myconfort66@gmail.com</p>
              <p>SIRET: 824 313 530 00027</p>
            </div>
          </div>
          
          <!-- PAGE 2: CONDITIONS GÉNÉRALES -->
          <div class="conditions-page">
            <div class="conditions-header">
              <h1>CONDITIONS GÉNÉRALES DE VENTE</h1>
            </div>
            
            <div class="conditions-content">
              <div class="condition-section">
                <h3>Art. 1 - Livraison</h3>
                <p>Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 2 - Délais de Livraison</h3>
                <p>Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 3 - Risques de Transport</h3>
                <p>Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 4 - Acceptation des Conditions</h3>
                <p>Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 5 - Réclamations</h3>
                <p>Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 6 - Retours</h3>
                <p>Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n'implique aucune reconnaissance.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 7 - Tailles des Matelas</h3>
                <p>Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 8 - Odeur des Matériaux</h3>
                <p>Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 9 - Règlements et Remises</h3>
                <p>Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 10 - Paiement</h3>
                <p>Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 11 - Pénalités de Retard</h3>
                <p>En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 12 - Exigibilité en Cas de Non-Paiement</h3>
                <p>Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 13 - Livraison Incomplète ou Non-Conforme</h3>
                <p>En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 14 - Litiges</h3>
                <p>Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 15 - Horaires de Livraison</h3>
                <p>Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.</p>
              </div>
            </div>

            <div class="conditions-footer">
              Les présentes Conditions générales ont été mises à jour le 23 août 2024
            </div>
          </div>
        </body>
        </html>
      `;
      
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
  };

  const handleDeleteInvoice = (index: number, invoice: Invoice) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?\n\nCette action est irréversible.`)) {
      onDeleteInvoice(index);
    }
  };

  const handleLoadInvoice = (invoice: Invoice) => {
    if (window.confirm(`Charger la facture ${invoice.invoiceNumber} ?\n\nLes données actuelles seront remplacées par cette facture.`)) {
      onLoadInvoice(invoice);
      onClose();
    }
  };

  const calculateInvoiceTotal = (invoice: Invoice) => {
    return invoice.products.reduce((sum, product) => 
      sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="📋 Toutes les Factures MYCONFORT" maxWidth="max-w-7xl">
        <div className="space-y-6">
          {/* Filtres et recherche */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher facture, client, lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
                />
              </div>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="date">Trier par date</option>
                <option value="number">Trier par numéro</option>
                <option value="client">Trier par client</option>
                <option value="amount">Trier par montant</option>
                <option value="eventLocation">Trier par lieu d'événement</option>
              </select>

              {/* Ordre */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>

              {/* Filtre statut */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="all">Toutes les factures</option>
                <option value="signed">Factures signées</option>
                <option value="unsigned">En attente de signature</option>
              </select>
            </div>
          </div>

          {/* Liste des factures */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-[#477A0C] text-[#F2EFE2]">
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">N° Facture</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Client</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Email</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Lieu d'événement</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-bold">Montant TTC</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold">Statut</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedInvoices.map((invoice, index) => {
                  const total = calculateInvoiceTotal(invoice);
                  const originalIndex = invoices.findIndex(inv => 
                    inv.invoiceNumber === invoice.invoiceNumber && 
                    inv.invoiceDate === invoice.invoiceDate
                  );
                  
                  return (
                    <tr key={`${invoice.invoiceNumber}-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-bold text-[#477A0C]">{invoice.invoiceNumber}</div>
                        {invoice.products.length > 0 && (
                          <div className="text-xs text-gray-600 font-semibold">
                            {invoice.products.length} produit{invoice.products.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-black font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-black">{invoice.clientName}</span>
                        </div>
                        {invoice.clientCity && (
                          <div className="text-xs text-gray-600 font-semibold">{invoice.clientCity}</div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-black font-semibold">{invoice.clientEmail}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-black font-semibold">
                            {invoice.eventLocation || (
                              <span className="text-gray-400 italic">Non spécifié</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        <div className="font-bold text-lg text-[#477A0C]">
                          {formatCurrency(total)}
                        </div>
                        {invoice.montantAcompte > 0 && (
                          <div className="text-xs text-orange-600 font-bold">
                            Acompte: {formatCurrency(invoice.montantAcompte)}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {invoice.signature ? (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center justify-center space-x-1">
                            <span>🔒</span>
                            <span>Signée</span>
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                            En attente
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handlePreviewInvoice(invoice)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-all"
                            title="Aperçu de la facture"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(invoice)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-all"
                            title="Imprimer la facture"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLoadInvoice(invoice)}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-all"
                            title="Charger cette facture pour modification"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(originalIndex, invoice)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                            title="Supprimer cette facture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSortedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center">
                      {searchTerm || filterStatus !== 'all' ? (
                        <div>
                          <Filter className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-black font-bold">Aucune facture ne correspond aux critères de recherche</p>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-black font-bold">Aucune facture enregistrée</p>
                          <p className="text-sm mt-1 text-gray-600 font-semibold">Les factures seront automatiquement sauvegardées</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Résumé en bas */}
          {filteredAndSortedInvoices.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-black font-bold">
                <strong>{filteredAndSortedInvoices.length}</strong> facture{filteredAndSortedInvoices.length > 1 ? 's' : ''} affichée{filteredAndSortedInvoices.length > 1 ? 's' : ''} 
                {searchTerm && ` pour "${searchTerm}"`}
                {filterStatus !== 'all' && ` (${filterStatus === 'signed' ? 'signées' : 'en attente'})`}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal d'aperçu simple et élégante */}
      {selectedInvoice && (
        <SimpleModalPreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
        />
      )}
    </>
  );
};
