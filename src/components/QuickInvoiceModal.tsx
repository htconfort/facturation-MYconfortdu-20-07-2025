import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Save, Mail, FileText, Calculator, ChevronDown } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { generateInvoiceNumber } from '../utils/calculations';
import { productCatalog } from '../data/products';

interface QuickInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  onSendEmail?: (invoice: Invoice) => void;
}

export const QuickInvoiceModal: React.FC<QuickInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSendEmail,
}) => {
  const [formData, setFormData] = useState({
    // Client
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    
    // Produit simple
    productDescription: '',
    productPrice: '',
    quantity: '1',
    
    // Paiement
    paymentMethod: 'Espèces',
    
    // Conseillère/Vendeuse
    advisorName: '',
    
    // Notes
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filtrer les produits du catalogue
  const filteredProducts = productCatalog.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Sélectionner un produit du catalogue
  const selectProduct = (product: any) => {
    setFormData(prev => ({
      ...prev,
      productDescription: product.name,
      productPrice: product.priceTTC.toString()
    }));
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const calculateTotals = () => {
    const price = parseFloat(formData.productPrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    const totalTTC = price * qty;
    const totalHT = totalTTC / 1.2; // Déconversion TVA 20%
    const tva = totalTTC - totalHT;
    
    return { totalHT, tva, totalTTC };
  };

  const createQuickInvoice = (): Invoice => {
    const { totalHT, tva, totalTTC } = calculateTotals();
    
    return {
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      eventLocation: 'Vente directe',
      taxRate: 20,

      // Client
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientAddress: '',
      clientAddressLine2: '',
      clientPostalCode: '',
      clientCity: '',
      clientHousingType: '',
      clientDoorCode: '',
      clientSiret: '',

      // Produit simple converti en format standard
      products: [{
        name: formData.productDescription,
        category: 'Vente directe',
        size: '',
        price: totalTTC, // Prix TTC unitaire
        quantity: parseInt(formData.quantity) || 1,
        total: totalTTC * (parseInt(formData.quantity) || 1),
        description: formData.productDescription,
        priceTTC: totalTTC,
        priceHT: totalHT,
        totalTTC: totalTTC * (parseInt(formData.quantity) || 1),
        totalHT: totalHT * (parseInt(formData.quantity) || 1),
        discount: 0,
        discountType: 'fixed',
      }],

      montantHT: totalHT * (parseInt(formData.quantity) || 1),
      montantTTC: totalTTC * (parseInt(formData.quantity) || 1),
      montantTVA: tva * (parseInt(formData.quantity) || 1),
      montantRemise: 0,

      // Paiement par défaut
      paymentMethod: formData.paymentMethod,
      montantAcompte: 0,
      depositPaymentMethod: '',
      montantRestant: totalTTC * (parseInt(formData.quantity) || 1),

      // Livraison
      deliveryMethod: 'Emporté immédiatement',
      deliveryAddress: '',
      deliveryNotes: '',

      // Signature
      signature: '',
      isSigned: false,
      signatureDate: undefined,

      // Notes
      invoiceNotes: formData.notes,
      advisorName: formData.advisorName || 'Facture rapide',
      termsAccepted: true,

      // Chèques
      nombreChequesAVenir: 0,

      // Métadonnées
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async () => {
    if (!formData.clientName || !formData.productDescription || !formData.productPrice || !formData.advisorName) {
      alert('Veuillez remplir tous les champs obligatoires (Client, Produit, Prix et Conseillère/Vendeuse)');
      return;
    }

    setIsLoading(true);
    
    try {
      const invoice = createQuickInvoice();
      await onSave(invoice);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          productDescription: '',
          productPrice: '',
          quantity: '1',
          paymentMethod: 'Espèces',
          advisorName: '',
          notes: '',
        });
        setProductSearch('');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndEmail = async () => {
    if (!formData.clientEmail) {
      alert('Veuillez renseigner l\'email du client pour l\'envoi automatique');
      return;
    }
    
    await handleSave();
    
    if (onSendEmail) {
      const invoice = createQuickInvoice();
      try {
        await onSendEmail(invoice);
      } catch (error) {
        console.error('Erreur lors de l\'envoi email:', error);
      }
    }
  };

  const { totalHT, tva, totalTTC } = calculateTotals();
  const isFormValid = formData.clientName && formData.productDescription && formData.productPrice && formData.advisorName;

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Facture créée !</h3>
          <p className="text-gray-600">La facture a été sauvegardée avec succès</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative">
        {/* En-tête avec icône */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Facture Rapide</h2>
                <p className="text-orange-100">Création express pour vente immédiate</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Section Client */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Informations Client
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom et prénom *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="jean.dupont@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Section Produit */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
              Produit / Service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description du produit *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch || formData.productDescription}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      handleInputChange('productDescription', e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="Rechercher ou saisir un produit..."
                  />
                  <ChevronDown 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                  />
                </div>
                
                {/* Dropdown des produits */}
                {showProductDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <div
                          key={index}
                          onClick={() => selectProduct(product)}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.category}</div>
                            </div>
                            <div className="text-green-600 font-bold">{product.priceTTC}€ TTC</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-center">
                        Aucun produit trouvé
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire TTC (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.productPrice}
                  onChange={(e) => handleInputChange('productPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  placeholder="49.90"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Prix TTC (TVA 20% incluse) • Prix HT calculé automatiquement
                </div>
              </div>
            </div>
          </div>

          {/* Calcul automatique */}
          {isFormValid && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcul automatique
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Total HT</div>
                  <div className="text-lg font-bold">{totalHT.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">TVA 20%</div>
                  <div className="text-lg font-bold">{tva.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total TTC</div>
                  <div className="text-2xl font-bold text-green-600">{totalTTC.toFixed(2)} €</div>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-gray-500">
                Prix saisi: {formData.productPrice}€ TTC × {formData.quantity} = {totalTTC.toFixed(2)}€ TTC
              </div>
            </div>
          )}

          {/* Notes et Mode de Paiement */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Mode de paiement et Notes
            </h3>
            
            {/* Sélection mode de paiement */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <div className="flex flex-wrap gap-2">
                {['Espèces', 'CB', 'Chèque'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleInputChange('paymentMethod', method)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      formData.paymentMethod === method
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {formData.paymentMethod === method && <span>✅</span>}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Conseillère/Vendeuse */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conseillère/Vendeuse *
              </label>
              <input
                type="text"
                value={formData.advisorName}
                onChange={(e) => handleInputChange('advisorName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black font-semibold"
                placeholder="Nom de la conseillère/vendeuse"
              />
            </div>

            {/* Notes optionnelles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes complémentaires (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                rows={3}
                placeholder="Ex: Remise accordée, conditions particulières, etc."
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
            
            <button
              onClick={handleSaveAndEmail}
              disabled={!isFormValid || !formData.clientEmail || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
              <span>Sauvegarder + Email</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2">
            * Champs obligatoires • Prix en TTC (TVA 20% incluse) • ✅ Espèces • ✅ CB • ✅ Chèque • Livraison: Emporté immédiatement
          </div>
        </div>
      </div>
    </Modal>
  );
};
