import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Edit3, Calculator, Euro, TrendingUp, CreditCard, Hash, User, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import { Product } from '../types';
import { productCatalog, productCategories } from '../data/products';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';
import { proposerAcomptePourChequesRonds, formatMessageOptimisation, calculerGainTemps, optimisationBenefique } from '../utils/chequeOptimization';

interface ProductSectionProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  taxRate: number;
  invoiceNotes: string;
  onNotesChange: (notes: string) => void;
  acompteAmount: number;
  onAcompteChange: (amount: number) => void;
  // Nouvelles props pour le mode de règlement
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  advisorName: string;
  onAdvisorNameChange: (name: string) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
  signature: string;
  onShowSignaturePad: () => void;
  // Nouveau prop pour les chèques à venir
  nombreChequesAVenir: number;
  onNombreChequesAVenirChange: (nombre: number) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  onUpdate,
  taxRate,
  invoiceNotes,
  onNotesChange,
  acompteAmount,
  onAcompteChange,
  paymentMethod,
  onPaymentMethodChange,
  advisorName,
  onAdvisorNameChange,
  termsAccepted,
  onTermsAcceptedChange,
  signature,
  onShowSignaturePad,
  nombreChequesAVenir,
  onNombreChequesAVenirChange
}) => {
  const [newProduct, setNewProduct] = useState({
    category: '',
    name: '',
    quantity: 1,
    unitPrice: 0,
    priceTTC: 0
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // États des champs numériques en string (jamais en 0)
  // ✅ SUPPRESSION : totalARecevoir local - désormais calculé automatiquement via totals.totalARecevoir
  // const [totalARecevoir, setTotalARecevoir] = useState<string>("");

  const filteredProducts = useMemo(() => {
    return productCatalog.filter(p => p.category === newProduct.category);
  }, [newProduct.category]);

  const totals = useMemo(() => {
    const subtotal = products.reduce((sum, product) => {
      return sum + (product.quantity * calculateHT(product.priceTTC, taxRate));
    }, 0);

    const totalWithTax = products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

    const totalDiscount = products.reduce((sum, product) => {
      const originalTotal = product.priceTTC * product.quantity;
      const discountedTotal = calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
      return sum + (originalTotal - discountedTotal);
    }, 0);

    // Toutes les conversions en nombre se font uniquement pour les calculs
    const acompteNum = Number(acompteAmount || 0);
    // ✅ UTILISATION DIRECTE DU CALCUL : totals.totalARecevoir au lieu de l'état local
    const totalARecevoirNum = Math.max(0, totalWithTax - acompteNum);
    const chequesQuantityNum = Number(nombreChequesAVenir || 0);
    return {
      subtotal,
      totalWithTax,
      totalDiscount,
      taxAmount: totalWithTax - (totalWithTax / (1 + (taxRate / 100))),
      totalPercu: acompteNum,
      totalARecevoir: Math.max(0, totalWithTax - acompteNum),
      // Calcul automatique du montant par chèque basé sur le vrai total à recevoir
      montantParCheque: (totalARecevoirNum && chequesQuantityNum) ? (totalARecevoirNum / chequesQuantityNum) : 0,
      totalCheques: (totalARecevoirNum && chequesQuantityNum) ? totalARecevoirNum : 0
    };
  }, [products, taxRate, acompteAmount, nombreChequesAVenir]);

  // ✨ NOUVEAU : Calcul d'optimisation pour chèques sans centimes
  const optimisation = useMemo(() => {
    if (nombreChequesAVenir <= 0 || totals.totalWithTax <= 0) {
      return null;
    }
    
    const proposition = proposerAcomptePourChequesRonds(totals.totalWithTax, nombreChequesAVenir);
    const estBenefique = optimisationBenefique(totals.totalWithTax, nombreChequesAVenir);
    const gainTemps = calculerGainTemps(nombreChequesAVenir, estBenefique);
    
    return {
      ...proposition,
      message: formatMessageOptimisation(proposition),
      gainTemps,
      estBenefique,
      acompteActuel: acompteAmount || 0,
      peutOptimiser: estBenefique && proposition.acompte !== (acompteAmount || 0)
    };
  }, [totals.totalWithTax, nombreChequesAVenir, acompteAmount]);

  // Fonction pour appliquer l'optimisation - MASQUÉE avec le bloc UI
  // const appliquerOptimisation = () => {
  //   if (optimisation?.acompte !== undefined) {
  //     onAcompteChange(optimisation.acompte);
  //   }
  // };

  // ✨ NOUVEAU : Optimisation automatique quand "Chèques à venir" est sélectionné
  useEffect(() => {
    // Vérifier si la méthode de paiement contient "chèque" et si des chèques sont configurés
    const isChequesPayment = paymentMethod && 
      (paymentMethod.toLowerCase().includes('chèque') || 
       paymentMethod.toLowerCase().includes('cheque'));
    
    // ✨ NOUVEAU : Validation automatique des conditions générales pour les chèques
    if (isChequesPayment && nombreChequesAVenir > 0 && !termsAccepted) {
      onTermsAcceptedChange(true);
    }
    
    // ✨ NOUVEAU : Pré-sélection automatique de 9 chèques quand "Chèques à venir" est choisi
    if (paymentMethod === "Chèques à venir" && (nombreChequesAVenir === 0 || nombreChequesAVenir === null)) {
      handleChequesQuantityFromSelector(9);
    }
    
    // Si on a une méthode de paiement avec chèques, un nombre de chèques > 0, 
    // et qu'une optimisation est possible et bénéfique
    if (isChequesPayment && 
        nombreChequesAVenir > 0 && 
        optimisation && 
        optimisation.estBenefique && 
        optimisation.peutOptimiser) {
      
      // Appliquer automatiquement l'acompte optimisé
      onAcompteChange(optimisation.acompte);
    }
  }, [paymentMethod, nombreChequesAVenir, optimisation?.acompte, optimisation?.estBenefique, optimisation?.peutOptimiser, onAcompteChange, termsAccepted, onTermsAcceptedChange]);

  // 🔒 FONCTION POUR VÉRIFIER SI LES CHAMPS OBLIGATOIRES SONT REMPLIS
  const isPaymentMethodEmpty = () => {
    return !paymentMethod || paymentMethod.trim() === '';
  };

  const areTermsAccepted = () => {
    return termsAccepted === true;
  };

  // Style pour les champs obligatoires
  const getPaymentMethodStyle = () => {
    return `w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold ${
      isPaymentMethodEmpty() 
        ? 'border-red-500 focus:border-red-500' 
        : 'border-[#477A0C] focus:border-[#F55D3E]'
    }`;
  };

  // Gère la saisie de l'acompte
  const handleAcompteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/^0+/, "");
    onAcompteChange(Number(val || "0"));
  };

  // ✅ SUPPRESSION : handleTotalARecevoirChange - Plus besoin, calcul automatique

  // Gère la saisie du nombre de chèques
  const handleChequesQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/^0+/, "");
    onNombreChequesAVenirChange(Number(val || "0"));
  };

  // ✨ NOUVEAU : Fonction pour changer directement le nombre de chèques depuis le sélecteur
  const handleChequesQuantityFromSelector = (quantity: number) => {
    onNombreChequesAVenirChange(quantity);
  };
  const handleCategoryChange = (category: string) => {
    setNewProduct({
      ...newProduct,
      category,
      name: '',
      unitPrice: 0,
      priceTTC: 0
    });
  };

  const handleProductChange = (productName: string) => {
    const selectedProduct = productCatalog.find(p => p.name === productName);
    if (selectedProduct) {
      setNewProduct({
        ...newProduct,
        name: productName,
        priceTTC: selectedProduct.priceTTC,
        unitPrice: selectedProduct.autoCalculateHT 
          ? calculateHT(selectedProduct.priceTTC, taxRate)
          : selectedProduct.price || 0
      });
    }
  };

  const handlePriceTTCChange = (priceTTC: number) => {
    setNewProduct({
      ...newProduct,
      priceTTC,
      unitPrice: calculateHT(priceTTC, taxRate)
    });
  };

  const addProduct = () => {
    if (!newProduct.name || newProduct.quantity <= 0 || newProduct.priceTTC <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedCatalogProduct = productCatalog.find(p => p.name === newProduct.name);
    
    // Pour la catégorie "Diverse", on n'utilise pas autoCalculateHT du catalogue
    const isCustomProduct = newProduct.category === 'Diverse';
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      quantity: newProduct.quantity,
      unitPrice: newProduct.unitPrice,
      priceHT: calculateHT(newProduct.priceTTC, taxRate),
      priceTTC: newProduct.priceTTC,
      discount: 0,
      discountType: 'percent',
      totalHT: calculateHT(newProduct.priceTTC, taxRate) * newProduct.quantity,
      totalTTC: newProduct.priceTTC * newProduct.quantity,
      autoCalculateHT: isCustomProduct ? false : (selectedCatalogProduct?.autoCalculateHT || false),
      isPickupOnSite: false // Par défaut, le produit nécessite une livraison
    };

    // Check if product already exists
    const existingIndex = products.findIndex(p => 
      p.name === product.name && Math.abs(p.priceTTC - product.priceTTC) < 0.01
    );

    if (existingIndex >= 0) {
      const updatedProducts = [...products];
      updatedProducts[existingIndex].quantity += product.quantity;
      onUpdate(updatedProducts);
    } else {
      onUpdate([...products, product]);
    }

    // Reset form
    setNewProduct({
      category: '',
      name: '',
      quantity: 1,
      unitPrice: 0,
      priceTTC: 0
    });
  };

  const removeProduct = (index: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const updatedProducts = products.filter((_, i) => i !== index);
      onUpdate(updatedProducts);
    }
  };

  const updateProduct = (index: number, updates: Partial<Product>) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], ...updates };
    
    // Recalculate unitPrice if priceTTC changed and autoCalculateHT is true
    if (updates.priceTTC && updatedProducts[index].autoCalculateHT) {
      updatedProducts[index].unitPrice = calculateHT(updates.priceTTC, taxRate);
    }
    
    onUpdate(updatedProducts);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
  };

  const stopEditing = () => {
    setEditingIndex(null);
  };

  return (
    <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <ShoppingCart className="mr-3 text-xl" />
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          PRODUITS & TARIFICATION
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
        {/* Add Product Form */}
        <div className="mb-6 bg-white rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
            <div className="md:col-span-3">
              <label className="block text-black font-bold mb-1">Catégorie</label>
              <select
                value={newProduct.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border-2 border-[#477A0C] rounded-lg px-3 py-2 bg-white font-bold focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all text-black"
              >
                <option value="">Sélectionner</option>
                {productCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-black font-bold mb-1">Produit</label>
              {newProduct.category === 'Diverse' ? (
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    name: e.target.value
                  })}
                  placeholder="Saisir le nom du produit..."
                  className="w-full border-2 border-[#477A0C] rounded-lg px-3 py-2 bg-white font-bold focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all text-black"
                  disabled={!newProduct.category}
                />
              ) : (
                <select
                  value={newProduct.name}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-3 py-2 bg-white font-bold focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all text-black"
                  disabled={!newProduct.category}
                >
                  <option value="">
                    {newProduct.category ? 'Sélectionner un produit' : 'Sélectionner une catégorie d\'abord'}
                  </option>
                  {filteredProducts.map(product => (
                    <option key={product.name} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-black font-bold mb-1">Quantité</label>
              <input
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  quantity: parseInt(e.target.value) || 1
                })}
                type="number"
                min="1"
                className="w-full border-2 border-[#477A0C] rounded-lg px-3 py-2 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all text-black"
                onFocus={(e) => e.target.select()}
                onTouchStart={(e) => e.currentTarget.select()}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-black font-bold mb-1">Prix TTC</label>
              <input
                value={newProduct.priceTTC}
                onChange={(e) => handlePriceTTCChange(parseFloat(e.target.value) || 0)}
                type="number"
                step="0.01"
                min="0"
                className="w-full border-2 border-[#477A0C] rounded-lg px-3 py-2 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all text-black"
                onFocus={(e) => e.target.select()}
                onTouchStart={(e) => e.currentTarget.select()}
              />
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={addProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                title="Ajouter le produit"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {newProduct.priceTTC > 0 && (
            <div className="mt-2 text-sm text-black">
              <span className="font-semibold">Prix HT calculé: {formatCurrency(newProduct.unitPrice)}</span>
            </div>
          )}
        </div>
        
        {/* Products Table avec police noire pour contraste */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#477A0C] text-[#F2EFE2]">
                <th className="border border-[#477A0C] px-4 py-3 text-left font-extrabold">
                  PRODUIT
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-center font-bold">
                  EMPORTÉ
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-center font-bold">
                  Quantité
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                  PU HT
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                  PU TTC
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                  Remise
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                  Total TTC
                </th>
                <th className="border border-[#477A0C] px-3 py-2 text-center font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index} className="bg-white">
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="font-bold text-black">{product.name}</div>
                    {product.category && (
                      <div className="text-xs text-gray-600">{product.category}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <select
                      value={product.isPickupOnSite ? 'pickup' : 'delivery'}
                      onChange={(e) => updateProduct(index, { 
                        isPickupOnSite: e.target.value === 'pickup' 
                      })}
                      className={`w-full border border-gray-300 rounded px-2 py-1 text-xs text-white font-bold ${
                        product.isPickupOnSite 
                          ? 'bg-green-400 hover:bg-green-500' 
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <option value="delivery">🚛 À livrer</option>
                      <option value="pickup">📦 Emporté</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-black"
                        onBlur={stopEditing}
                        onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                        onFocus={(e) => e.target.select()}
                        onTouchStart={(e) => e.currentTarget.select()}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="font-bold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-black"
                        onClick={() => startEditing(index)}
                      >
                        {product.quantity}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    <div className="font-bold text-black">
                      {formatCurrency(calculateHT(product.priceTTC, taxRate))}
                    </div>
                    <div className="text-xs text-gray-600">HT</div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.priceTTC}
                        onChange={(e) => updateProduct(index, { priceTTC: parseFloat(e.target.value) || 0 })}
                        className="w-20 text-right border border-gray-300 rounded px-1 py-1 text-black"
                        onBlur={stopEditing}
                        onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                        onFocus={(e) => e.target.select()}
                        onTouchStart={(e) => e.currentTarget.select()}
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        onClick={() => startEditing(index)}
                      >
                        <div className="font-bold text-black">{formatCurrency(product.priceTTC)}</div>
                        <div className="text-xs text-gray-600">TTC</div>
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 bg-[#F55D3E] bg-opacity-20">
                    <div className="flex items-center justify-end space-x-1">
                      <select
                        value={product.discountType}
                        onChange={(e) => updateProduct(index, {
                          discountType: e.target.value as 'percent' | 'fixed'
                        })}
                        className="border border-gray-300 rounded px-1 py-1 text-xs w-12 text-black"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">€</option>
                      </select>
                      <input
                        value={product.discount}
                        onChange={(e) => updateProduct(index, {
                          discount: parseFloat(e.target.value) || 0
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-16 border border-gray-300 rounded px-1 py-1 text-right text-black"
                        onFocus={(e) => e.target.select()}
                        onTouchStart={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                    <span className="text-black">
                      {formatCurrency(calculateProductTotal(
                        product.quantity,
                        product.priceTTC,
                        product.discount,
                        product.discountType
                      ))}
                    </span>
                    {product.discount > 0 && (
                      <div className="text-xs text-gray-600">
                        (-{product.discountType === 'percent' 
                          ? `${product.discount}%` 
                          : formatCurrency(product.discount)
                        })
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => startEditing(index)}
                        className="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded transition-all"
                        title="Modifier"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-white bg-red-500 hover:bg-red-600 p-1 rounded transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    <span className="text-black font-bold">Aucun produit ajouté</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOUVEAU: Patio avec trois bandes de lancement pour les totaux, acompte et mode de règlement */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bande 1: Remarques avec chèques à venir AMÉLIORÉS */}
        <div className="bg-[#FFE4B5] rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="flex items-center mb-3">
            <div className="bg-[#477A0C] text-[#F2EFE2] p-2 rounded-full mr-3">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-black font-bold text-lg">REMARQUES</h3>
          </div>
          
          {/* Zone de texte pour remarques */}
          <div className="mb-4">
            <label className="block text-black font-semibold mb-2">Notes de facture</label>
            <textarea
              value={invoiceNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 h-24 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black"
              placeholder="Notes ou remarques sur la facture..."
            />
          </div>

          {/* Section Chèques à venir AMÉLIORÉE avec calcul automatique */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-bold text-purple-800">CHÈQUES À VENIR</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Total à recevoir - SYNCHRONISÉ AUTOMATIQUEMENT */}
              <div>
                <label className="block text-purple-700 font-semibold mb-1 flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  Total à recevoir (€) - Calculé automatiquement
                </label>
                <input
                  type="text"
                  value={formatCurrency(totals.totalARecevoir)}
                  readOnly
                  className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 bg-purple-100 text-purple-800 font-bold cursor-not-allowed"
                  placeholder="Calculé automatiquement : Total TTC - Acompte"
                />
                <div className="text-xs text-purple-600 mt-1">
                  ✨ Synchronisé avec "TOTAUX & ACOMPTE" ({formatCurrency(totals.totalWithTax)} - {formatCurrency(Number(acompteAmount || 0))})
                </div>
              </div>

              {/* Quantité de chèques */}
              <div>
                <label className="block text-purple-700 font-semibold mb-1 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  Nombre de chèques
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={nombreChequesAVenir || 0}
                  onChange={handleChequesQuantityChange}
                  className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white text-purple-800 font-bold"
                  onFocus={(e) => e.target.select()}
                  onTouchStart={(e) => e.currentTarget.select()}
                />
              </div>

              {/* Montant par chèque - CALCULÉ AUTOMATIQUEMENT */}
              <div>
                <label className="block text-purple-700 font-semibold mb-1 flex items-center">
                  <Calculator className="w-4 h-4 mr-1" />
                  Montant par chèque (calculé)
                </label>
                <input
                  type="text"
                  value={totals.montantParCheque > 0 ? formatCurrency(totals.montantParCheque) : ''}
                  readOnly
                  className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 bg-purple-100 text-purple-800 font-bold cursor-not-allowed"
                  placeholder="Calculé automatiquement"
                />
              </div>
            </div>

            {/* Affichage du calcul automatique - SYNCHRONISÉ */}
            {totals.totalARecevoir > 0 && Number(nombreChequesAVenir) > 0 && (
              <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 font-semibold">Calcul automatique :</span>
                  <span className="text-purple-800 font-bold text-lg">
                    {formatCurrency(totals.montantParCheque)}
                  </span>
                </div>
                <div className="text-xs text-purple-600">
                  {formatCurrency(totals.totalARecevoir)} ÷ {nombreChequesAVenir} chèque{Number(nombreChequesAVenir) > 1 ? 's' : ''} = {formatCurrency(totals.montantParCheque)} par chèque
                </div>
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                  <div className="text-sm text-green-800 font-semibold">
                    ✅ Total des chèques : {formatCurrency(totals.totalCheques)}
                  </div>
                </div>
              </div>
            )}

            {/* ✨ BLOC D'OPTIMISATION MASQUÉ - désactivé par demande utilisateur
            {optimisation && optimisation.estBenefique && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg shadow-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-yellow-500 text-white p-2 rounded-full mr-3">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800">💡 OPTIMISATION CHÈQUES SANS CENTIMES</h4>
                    <p className="text-xs text-yellow-700">Gagnez un temps fou sur l'écriture des chèques !</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-yellow-300">
                    <p className="text-sm font-medium text-gray-800">{optimisation.message}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-red-600 font-semibold text-sm">❌ Actuellement :</span>
                      </div>
                      <div className="text-xs text-red-800">
                        {nombreChequesAVenir} chèques de <strong>{formatCurrency(totals.montantParCheque)}</strong>
                        <br />
                        <span className="text-red-600">→ Centimes à écrire sur chaque chèque</span>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 font-semibold text-sm">✨ Suggestion :</span>
                      </div>
                      <div className="text-xs text-green-800">
                        Acompte : <strong>{formatCurrency(optimisation.acompte)}</strong>
                        <br />
                        {optimisation.nbCheques} chèques de <strong>{optimisation.montantCheque}€ pile</strong>
                        <br />
                        <span className="text-green-600">→ Aucun centime à écrire !</span>
                      </div>
                    </div>
                  </div>

                  {optimisation.gainTemps && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">{optimisation.gainTemps}</span>
                      </div>
                    </div>
                  )}

                  {optimisation.peutOptimiser && (
                    <button
                      onClick={appliquerOptimisation}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      🚀 Appliquer l'optimisation (acompte → {formatCurrency(optimisation.acompte)})
                    </button>
                  )}

                  {!optimisation.peutOptimiser && optimisation.acompte === (acompteAmount || 0) && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                      <span className="text-green-800 font-semibold">🎯 Déjà optimisé ! Parfait pour des chèques sans centimes.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            */}

            {/* Message d'aide - SYNCHRONISATION AUTOMATIQUE */}
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              ✨ <strong>Synchronisation automatique :</strong> Le "Total à recevoir" est automatiquement calculé (Total TTC - Acompte) et synchronisé avec le bloc "TOTAUX & ACOMPTE". Saisissez uniquement le nombre de chèques pour calculer automatiquement le montant par chèque.
            </div>
          </div>
        </div>

        {/* Bande 2: Totaux et Gestion Acompte */}
        <div className="bg-[#89BBFE] rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="flex items-center mb-3">
            <div className="bg-[#477A0C] text-[#F2EFE2] p-2 rounded-full mr-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-black font-bold text-lg">TOTAUX & ACOMPTE</h3>
          </div>
          
          <div className="space-y-3">
            {/* Totaux classiques */}
            <div className="flex justify-between border-b border-gray-300 pb-2">
              <span className="font-semibold text-black">Total HT:</span>
              <span className="font-semibold text-black">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-2">
              <span className="font-semibold text-black">TVA ({taxRate}%):</span>
              <span className="font-semibold text-black">
                {formatCurrency(totals.taxAmount)}
              </span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 border-b border-gray-300 pb-2">
                <span className="font-semibold">Remise totale:</span>
                <span className="font-semibold">
                  -{formatCurrency(totals.totalDiscount)}
                </span>
              </div>
            )}
            
            {/* Total TTC */}
            <div className="flex justify-between bg-[#477A0C] text-[#F2EFE2] p-3 rounded-lg shadow-md">
              <span className="font-bold text-lg">Total TTC:</span>
              <span className="font-bold text-xl">
                {formatCurrency(totals.totalWithTax)}
              </span>
            </div>

            {/* Section Acompte */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
              <div className="flex items-center mb-3">
                <Euro className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-blue-800">GESTION ACOMPTE</h4>
              </div>
              
              <div className="space-y-3">
                {/* Champ acompte versé */}
                <div>
                  <label className="block text-blue-700 font-semibold mb-1 flex items-center">
                    Acompte versé (€)
                    {optimisation && optimisation.estBenefique && (acompteAmount === optimisation.acompte) && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Proposition automatique
                      </span>
                    )}
                  </label>
                  {optimisation && optimisation.estBenefique && (acompteAmount === optimisation.acompte) && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs text-blue-700 flex items-center">
                        <span className="mr-1">💡</span>
                        <strong>Proposition automatique</strong> : Vous pouvez modifier ce montant si nécessaire
                      </div>
                    </div>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={totals.totalWithTax}
                    placeholder="0.00"
                    value={acompteAmount !== undefined && acompteAmount !== null && acompteAmount !== 0 ? acompteAmount : ""}
                    onChange={handleAcompteChange}
                    className={`w-full border-2 rounded-lg px-4 py-2 focus:ring-2 transition-all bg-white text-blue-800 font-bold ${
                      optimisation && optimisation.estBenefique && (acompteAmount === optimisation.acompte)
                        ? 'border-green-400 focus:border-green-500 focus:ring-green-200 bg-green-50'
                        : 'border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    onFocus={(e) => e.target.select()}
                    onTouchStart={(e) => e.currentTarget.select()}
                  />
                  {optimisation && optimisation.estBenefique && (acompteAmount === optimisation.acompte) && (
                    <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center text-sm text-green-800 mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-semibold">
                          🎯 Proposition optimale : {optimisation.nbCheques} chèques de {optimisation.montantCheque}€ pile
                        </span>
                      </div>
                      {optimisation.gainTemps && (
                        <div className="text-xs text-green-700 mb-2">
                          {optimisation.gainTemps}
                        </div>
                      )}
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        ✏️ <strong>Modifiable :</strong> Vous pouvez ajuster ce montant selon les besoins du client
                      </div>
                    </div>
                  )}
                </div>

                {/* Affichage des calculs */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Total perçu */}
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-700 font-semibold text-sm">Total perçu</span>
                    </div>
                    <div className="text-green-800 font-bold text-lg">
                      {formatCurrency(totals.totalPercu)}
                    </div>
                  </div>

                  {/* Total à recevoir */}
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <Calculator className="w-4 h-4 text-orange-600 mr-1" />
                      <span className="text-orange-700 font-semibold text-sm">Total à recevoir</span>
                    </div>
                    <div className="text-orange-800 font-bold text-lg">
                      {formatCurrency(totals.totalARecevoir)}
                    </div>
                  </div>
                </div>

                {/* Barre de progression visuelle */}
                {totals.totalWithTax > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progression du paiement</span>
                      <span>{Math.round((Number(acompteAmount || 0) / totals.totalWithTax) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((Number(acompteAmount || 0) / totals.totalWithTax) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Affichage des chèques à venir dans les totaux */}
            {totals.totalCheques > 0 && (
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-purple-700 font-semibold">Chèques à venir:</span>
                  </div>
                  <span className="text-purple-800 font-bold">
                    {formatCurrency(totals.totalCheques)}
                  </span>
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {nombreChequesAVenir} chèque{Number(nombreChequesAVenir) > 1 ? 's' : ''} de {formatCurrency(totals.montantParCheque)} chacun
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bande 3: MODE DE RÈGLEMENT (INTÉGRÉ) AVEC CHAMPS OBLIGATOIRES */}
        <div className="bg-[#FFE4B5] rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="flex items-center mb-3">
            <div className="bg-[#477A0C] text-[#F2EFE2] p-2 rounded-full mr-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-black font-bold text-lg">MODE DE RÈGLEMENT</h3>
          </div>
          
          <div className="space-y-4">
            {/* 🔒 MÉTHODE DE PAIEMENT OBLIGATOIRE AVEC ESPÈCES */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Méthode de paiement <span className="text-red-600">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                required
                className={getPaymentMethodStyle()}
              >
                <option value="">Sélectionner obligatoirement</option>
                <option value="Chèques à venir">Chèques à venir</option>
                <option value="Virement">Virement bancaire</option>
                <option value="Carte Bleue">Carte Bleue</option>
                <option value="Espèces">Espèces</option>
                <option value="Alma">Alma (paiement en plusieurs fois)</option>
                <option value="PayPal">PayPal</option>
                <option value="Chèque">Chèque</option>
                <option value="Acompte">Acompte</option>
              </select>
              
              {/* ✨ NOUVEAU : Sélecteur nombre de chèques quand "Chèques à venir" est sélectionné */}
              {paymentMethod === "Chèques à venir" && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="form-checkbox h-4 w-4 text-purple-600 rounded"
                    />
                    <span className="text-purple-700 font-semibold">Nombre de fois :</span>
                  </label>
                  <select
                    value={nombreChequesAVenir || 9}
                    onChange={(e) => handleChequesQuantityFromSelector(Number(e.target.value))}
                    className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white text-purple-800 font-bold"
                  >
                    <option value={9}>9 chèques</option>
                    <option value={8}>8 chèques</option>
                    <option value={7}>7 chèques</option>
                    <option value={6}>6 chèques</option>
                    <option value={5}>5 chèques</option>
                    <option value={4}>4 chèques</option>
                    <option value={3}>3 chèques</option>
                    <option value={2}>2 chèques</option>
                  </select>
                  <div className="text-xs text-purple-600 mt-1">
                    🎯 Le nombre de chèques sera automatiquement appliqué dans "Chèques à venir"
                  </div>
                </div>
              )}
              {isPaymentMethodEmpty() && (
                <p className="text-red-600 text-xs mt-1 font-semibold">
                  ⚠️ La méthode de paiement est obligatoire
                </p>
              )}
            </div>
            
            {/* Conseiller */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Conseiller(e)
              </label>
              <input
                value={advisorName}
                onChange={(e) => onAdvisorNameChange(e.target.value)}
                type="text"
                className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                placeholder="Nom du conseiller"
              />
            </div>

            {/* 🔒 CONDITIONS GÉNÉRALES OBLIGATOIRES */}
            <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 rounded-lg p-4 ${
              areTermsAccepted() ? 'border-green-300' : 'border-red-300'
            }`}>
              <label className="flex items-start">
                <input
                  checked={termsAccepted}
                  onChange={(e) => onTermsAcceptedChange(e.target.checked)}
                  type="checkbox"
                  required
                  className={`form-checkbox h-5 w-5 rounded focus:ring-2 mr-3 mt-0.5 ${
                    areTermsAccepted() 
                      ? 'text-[#477A0C] focus:ring-[#477A0C]' 
                      : 'text-red-500 focus:ring-red-500'
                  }`}
                />
                <span className={`font-semibold ${
                  areTermsAccepted() ? 'text-black' : 'text-red-600'
                }`}>
                  J'ai lu et j'accepte les conditions générales de vente <span className="text-red-600">*</span>
                </span>
              </label>
              {areTermsAccepted() ? (
                <div className="mt-2 flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-semibold">✅ Conditions acceptées</span>
                  {paymentMethod && (paymentMethod.toLowerCase().includes('chèque') || paymentMethod.toLowerCase().includes('cheque')) && nombreChequesAVenir > 0 && (
                    <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                      🚀 Auto-validé
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-red-600 text-xs font-semibold">
                  ⚠️ L'acceptation des conditions générales de vente est obligatoire
                </div>
              )}
            </div>

            {/* Signature client */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
              <label className="block text-black font-semibold mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Signature client MYCONFORT
              </label>
              <div className="border-2 border-dashed border-[#477A0C] rounded h-20 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                {signature ? (
                  <div className="text-center">
                    <div className="text-green-600 font-semibold flex items-center justify-center space-x-1">
                      <span>🔒</span>
                      <span>Signature électronique enregistrée</span>
                    </div>
                    <div className="mt-2 h-12 flex items-center justify-center">
                      <img src={signature} alt="Signature" className="max-h-full max-w-full" />
                    </div>
                    <button
                      onClick={onShowSignaturePad}
                      className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 px-3 py-1 bg-blue-100 rounded-lg transition-colors"
                    >
                      ✏️ Modifier la signature
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onShowSignaturePad}
                    className="text-black hover:text-[#477A0C] font-semibold flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <span>✍️</span>
                    <span>Cliquer pour signer électroniquement</span>
                  </button>
                )}
              </div>
              
              {/* Informations sur la signature */}
              <div className="mt-3 text-xs text-blue-600">
                {signature ? (
                  <div className="flex items-center justify-between">
                    <span>✅ Signature valide et sécurisée</span>
                    <span className="text-gray-500">
                      Signée le {new Date().toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ) : (
                  <div className="text-orange-600">
                    ⚠️ Signature recommandée pour valider la commande
                  </div>
                )}
              </div>
            </div>

            {/* 🔒 RÉSUMÉ DES CHAMPS OBLIGATOIRES */}
            <div className={`p-3 rounded-lg border-2 ${
              !isPaymentMethodEmpty() && areTermsAccepted() 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="text-sm font-semibold">
                {!isPaymentMethodEmpty() && areTermsAccepted() ? (
                  <div className="text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ✅ Tous les champs obligatoires sont remplis
                  </div>
                ) : (
                  <div className="text-red-800">
                    ⚠️ Champs obligatoires manquants :
                    <ul className="list-disc list-inside mt-1 text-xs">
                      {isPaymentMethodEmpty() && <li>Méthode de paiement</li>}
                      {!areTermsAccepted() && <li>Acceptation des conditions générales</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
