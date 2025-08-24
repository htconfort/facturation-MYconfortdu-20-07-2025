import React, { useState } from 'react';
import { SecondaryPageLayout } from '../../components/SecondaryPageLayout';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { Package, Euro, Percent, Hash, Plus, Minus } from 'lucide-react';

interface ProductDetailsScreenProps {
  /** Product ID to edit, or undefined for new product */
  productId?: string;
}

/**
 * Page secondaire pour ajouter/modifier un produit
 * Accessible depuis l'étape produits
 */
export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  productId
}) => {
  const { draft, addProduct, updateProduct, closeSecondaryPage } = useInvoiceWizard();
  
  // Find existing product or create new one
  const existingProduct = productId 
    ? draft.produits.find(p => p.id === productId)
    : null;
  
  const [formData, setFormData] = useState({
    nom: existingProduct?.nom || '',
    description: existingProduct?.description || '',
    quantite: existingProduct?.quantite || 1,
    prixUnitaire: existingProduct?.prixUnitaire || 0,
    tva: existingProduct?.tva || 20, // 20% par défaut
    isPickupOnSite: existingProduct?.isPickupOnSite || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total including VAT
  const totalHT = formData.quantite * formData.prixUnitaire;
  const montantTVA = totalHT * (formData.tva / 100);
  const totalTTC = totalHT + montantTVA;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du produit est obligatoire';
    }

    if (formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }

    if (formData.prixUnitaire <= 0) {
      newErrors.prixUnitaire = 'Le prix unitaire doit être supérieur à 0';
    }

    if (formData.tva < 0 || formData.tva > 100) {
      newErrors.tva = 'Le taux de TVA doit être entre 0 et 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const productData = {
      id: productId || `prod-${Date.now()}`,
      nom: formData.nom,
      description: formData.description,
      quantite: formData.quantite,
      prixUnitaire: formData.prixUnitaire,
      tva: formData.tva,
      total: totalTTC,
      isPickupOnSite: formData.isPickupOnSite
    };

    if (productId) {
      updateProduct(productId, productData);
    } else {
      addProduct(productData);
    }

    closeSecondaryPage();
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, formData.quantite + delta);
    setFormData(prev => ({ ...prev, quantite: newQuantity }));
  };

  return (
    <SecondaryPageLayout
      title={productId ? 'Modifier le produit' : 'Ajouter un produit'}
      onBack={closeSecondaryPage}
      headerContent={
        <button
          onClick={handleSave}
          className="
            px-6 py-3 min-h-[56px]
            bg-myconfort-green text-white
            rounded-lg font-medium font-manrope
            hover:bg-green-700 active:bg-green-800
            transition-colors duration-150
            touch-manipulation
          "
        >
          {productId ? 'Modifier' : 'Ajouter'}
        </button>
      }
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Product Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-myconfort-green rounded-full">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-myconfort-dark font-manrope">
              Informations produit
            </h2>
          </div>

          {/* Nom du produit */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Hash className="w-5 h-5 text-myconfort-green" />
              Nom du produit
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className={`
                w-full px-4 py-4 text-lg min-h-[56px]
                border-2 rounded-lg font-manrope
                transition-colors duration-150
                ${errors.nom 
                  ? 'border-myconfort-coral bg-red-50' 
                  : 'border-gray-200 bg-white hover:border-myconfort-green focus:border-myconfort-green'
                }
                focus:outline-none focus:ring-0
              `}
              placeholder="Ex: Pompe à chaleur air/eau"
            />
            {errors.nom && (
              <p className="text-myconfort-coral text-sm font-medium">{errors.nom}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-lg font-medium text-myconfort-dark font-manrope">
              Description (optionnelle)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="
                w-full px-4 py-4 text-lg
                border-2 border-gray-200 rounded-lg font-manrope
                bg-white hover:border-myconfort-green focus:border-myconfort-green
                transition-colors duration-150
                focus:outline-none focus:ring-0
                resize-none
              "
              placeholder="Détails techniques, garantie, etc."
            />
          </div>

          {/* Pickup option */}
          <div className="flex items-center gap-3 p-4 bg-myconfort-cream rounded-lg">
            <input
              type="checkbox"
              id="pickup-on-site"
              checked={formData.isPickupOnSite}
              onChange={(e) => setFormData(prev => ({ ...prev, isPickupOnSite: e.target.checked }))}
              className="w-5 h-5 text-myconfort-green rounded"
            />
            <label htmlFor="pickup-on-site" className="font-medium text-myconfort-dark font-manrope">
              Produit à emporter (pas de livraison)
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-myconfort-blue rounded-full">
              <Euro className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-myconfort-dark font-manrope">
              Tarification
            </h2>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <label className="text-lg font-medium text-myconfort-dark font-manrope">
              Quantité
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="
                  w-12 h-12 flex items-center justify-center
                  border-2 border-gray-200 rounded-lg
                  hover:border-myconfort-green hover:bg-myconfort-green hover:text-white
                  transition-colors duration-150
                  touch-manipulation
                "
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <input
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseInt(e.target.value) || 1 }))}
                min="1"
                className={`
                  flex-1 px-4 py-4 text-lg text-center min-h-[56px]
                  border-2 rounded-lg font-manrope font-semibold
                  transition-colors duration-150
                  ${errors.quantite 
                    ? 'border-myconfort-coral bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-myconfort-green focus:border-myconfort-green'
                  }
                  focus:outline-none focus:ring-0
                `}
              />
              
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="
                  w-12 h-12 flex items-center justify-center
                  border-2 border-gray-200 rounded-lg
                  hover:border-myconfort-green hover:bg-myconfort-green hover:text-white
                  transition-colors duration-150
                  touch-manipulation
                "
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {errors.quantite && (
              <p className="text-myconfort-coral text-sm font-medium">{errors.quantite}</p>
            )}
          </div>

          {/* Prix unitaire */}
          <div className="space-y-2">
            <label className="text-lg font-medium text-myconfort-dark font-manrope">
              Prix unitaire HT (€)
            </label>
            <input
              type="number"
              value={formData.prixUnitaire}
              onChange={(e) => setFormData(prev => ({ ...prev, prixUnitaire: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
              className={`
                w-full px-4 py-4 text-lg min-h-[56px]
                border-2 rounded-lg font-manrope
                transition-colors duration-150
                ${errors.prixUnitaire 
                  ? 'border-myconfort-coral bg-red-50' 
                  : 'border-gray-200 bg-white hover:border-myconfort-green focus:border-myconfort-green'
                }
                focus:outline-none focus:ring-0
              `}
              placeholder="0.00"
            />
            {errors.prixUnitaire && (
              <p className="text-myconfort-coral text-sm font-medium">{errors.prixUnitaire}</p>
            )}
          </div>

          {/* TVA */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Percent className="w-5 h-5 text-myconfort-green" />
              Taux de TVA (%)
            </label>
            <select
              value={formData.tva}
              onChange={(e) => setFormData(prev => ({ ...prev, tva: parseFloat(e.target.value) }))}
              className={`
                w-full px-4 py-4 text-lg min-h-[56px]
                border-2 rounded-lg font-manrope
                transition-colors duration-150
                ${errors.tva 
                  ? 'border-myconfort-coral bg-red-50' 
                  : 'border-gray-200 bg-white hover:border-myconfort-green focus:border-myconfort-green'
                }
                focus:outline-none focus:ring-0
              `}
            >
              <option value={0}>0% (exonéré)</option>
              <option value={5.5}>5,5% (taux réduit)</option>
              <option value={10}>10% (taux intermédiaire)</option>
              <option value={20}>20% (taux normal)</option>
            </select>
            {errors.tva && (
              <p className="text-myconfort-coral text-sm font-medium">{errors.tva}</p>
            )}
          </div>

          {/* Calcul des totaux */}
          <div className="p-4 bg-myconfort-cream rounded-lg space-y-3">
            <h3 className="font-semibold text-myconfort-dark font-manrope">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total HT ({formData.quantite} × {formData.prixUnitaire.toFixed(2)}€):</span>
                <span className="font-medium">{totalHT.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({formData.tva}%):</span>
                <span className="font-medium">{montantTVA.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC:</span>
                <span className="text-myconfort-green">{totalTTC.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecondaryPageLayout>
  );
};
