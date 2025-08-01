import React, { useState } from 'react';
import { FileText, Eye, Trash2, Search, Calendar, User, Mail, Filter, MapPin, Edit, ArrowLeft } from 'lucide-react';
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
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold">Email</th>
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
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {invoice.emailSent ? (
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-2xl" title="Email envoyé avec succès">✅</span>
                            {invoice.emailSentDate && (
                              <span className="text-xs text-green-600 font-semibold">
                                {new Date(invoice.emailSentDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl" title="Email non envoyé">❌</span>
                            <span className="text-xs text-red-600 font-semibold">Non envoyé</span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-blue-600 font-medium mb-1">Voir</span>
                            <button
                              onClick={() => handlePreviewInvoice(invoice)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-all"
                              title="Aperçu de la facture"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-xs text-purple-600 font-medium mb-1">Charger</span>
                            <button
                              onClick={() => handleLoadInvoice(invoice)}
                              className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-all"
                              title="Charger cette facture pour modification"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-xs text-red-600 font-medium mb-1">Supprimer</span>
                            <button
                              onClick={() => handleDeleteInvoice(originalIndex, invoice)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                              title="Supprimer cette facture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
          
          {/* Bouton retour pour iPad */}
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="bg-[#477A0C] hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-bold shadow-lg transition-all hover:scale-105"
              title="Retour au formulaire principal"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
          </div>
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
