import { useMemo, useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { productCatalog, productCategories } from '../../data/products';
import { calculateHT, calculateProductTotal } from '../../utils/calculations';
import NumericInput from '../../components/NumericInput';

// On ajoute Diverse pour la saisie libre, comme dans ProductSection
const extendedCategories = [...productCategories, 'Diverse'];

export default function StepProduits({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
}) {
  const { produits, addProduit, updateProduit, removeProduit } =
    useInvoiceWizard();
  const [draft, setDraft] = useState({
    category: '',
    designation: '',
    qty: 1,
    priceTTC: 0,
    discount: 0,
    discountType: 'percent' as 'percent' | 'fixed',
  });

  const taxRate = 20; // TVA fixe à 20%

  // Validation : tous les produits doivent avoir un mode de livraison défini
  const canProceed =
    produits.length > 0 && produits.every(p => p.isPickupOnSite !== undefined);

  const filteredProducts = useMemo(() => {
    if (!draft.category || draft.category === 'Diverse') return [];
    return productCatalog.filter(p => p.category === draft.category);
  }, [draft.category]);

  const totals = useMemo(() => {
    const totalTTC = produits.reduce((sum, p) => {
      return (
        sum +
        calculateProductTotal(
          Number(p.qty || 0),
          Number(p.priceTTC || 0),
          Number(p.discount || 0),
          p.discountType || 'percent'
        )
      );
    }, 0);

    const totalHT = produits.reduce((sum, p) => {
      const productTotalTTC = calculateProductTotal(
        Number(p.qty || 0),
        Number(p.priceTTC || 0),
        Number(p.discount || 0),
        p.discountType || 'percent'
      );
      return sum + calculateHT(productTotalTTC, taxRate);
    }, 0);

    const totalTVA = totalTTC - totalHT;

    const totalRemise = produits.reduce((sum, p) => {
      const originalTotal = Number(p.qty || 0) * Number(p.priceTTC || 0);
      const discountedTotal = calculateProductTotal(
        Number(p.qty || 0),
        Number(p.priceTTC || 0),
        Number(p.discount || 0),
        p.discountType || 'percent'
      );
      return sum + (originalTotal - discountedTotal);
    }, 0);

    return {
      totalHT,
      totalTTC,
      totalTVA,
      totalRemise,
    };
  }, [produits, taxRate]);

  const handleCategoryChange = (category: string) => {
    setDraft(prev => ({
      ...prev,
      category,
      designation: '', // Reset le produit quand on change de catégorie
      priceTTC: 0,
    }));
  };

  const handleProductChange = (productName: string) => {
    const selectedProduct = filteredProducts.find(p => p.name === productName);
    if (selectedProduct) {
      setDraft(prev => ({
        ...prev,
        designation: selectedProduct.name,
        priceTTC: selectedProduct.priceTTC,
      }));
    }
  };

  const handleAdd = () => {
    if (
      !draft.category.trim() ||
      !draft.designation.trim() ||
      draft.qty <= 0 ||
      draft.priceTTC <= 0
    ) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const id = crypto.randomUUID();
    addProduit({
      id,
      designation: draft.designation.trim(),
      category: draft.category,
      qty: Number(draft.qty || 1),
      priceTTC: Number(draft.priceTTC || 0),
      discount: Number(draft.discount || 0),
      discountType: draft.discountType,
      isPickupOnSite: undefined, // À définir obligatoirement (rouge=livrer, vert=emporter)
    });
    setDraft({
      category: '',
      designation: '',
      qty: 1,
      priceTTC: 0,
      discount: 0,
      discountType: 'percent',
    });
  };

  const validateAndNext = () => {
    if (produits.length === 0) {
      alert('Veuillez ajouter au moins un produit avant de continuer.');
      return;
    }

    const productsWithoutDeliveryMode = produits.filter(
      p => p.isPickupOnSite === undefined
    );
    if (productsWithoutDeliveryMode.length > 0) {
      alert(
        `Veuillez définir le mode de livraison pour tous les produits.\n${productsWithoutDeliveryMode.length} produit(s) sans mode de livraison défini.`
      );
      return;
    }

    onNext();
  };

  return (
    <div className='w-full bg-myconfort-cream flex flex-col'>
      {/* 🎯 Header ultra-compact */}
      <div className='px-4 py-1 border-b border-myconfort-dark/10 flex-shrink-0'>
        <h1 className='text-2xl font-bold text-myconfort-dark font-manrope'>
          📦 Produits & Services
        </h1>
        <p className='text-sm text-gray-600'>
          Étape 3/7 • Ajoutez les produits avec quantités et prix
        </p>
      </div>

      {/* 🎯 Contenu principal */}
      <div className='flex-1 px-4 py-2 flex flex-col pb-24'>
        {/* Formulaire d'ajout de produit - ultra-compact */}
        <div className='bg-white rounded-lg p-3 border border-myconfort-dark/10 mb-2'>
          <h3 className='text-base font-medium text-myconfort-dark font-manrope mb-2'>
            ➕ Ajouter un produit
          </h3>

          {/* Grille 3×2 pour optimiser l'espace horizontal */}
          <div className='grid grid-cols-3 gap-2 mb-2'>
            {/* Catégorie (OBLIGATOIRE) */}
            <div className='space-y-1'>
              <label className='flex items-center gap-1 text-sm font-medium text-myconfort-dark font-manrope'>
                Catégorie <span className='text-red-600 font-bold'>*</span>
              </label>
              <select
                value={draft.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className='w-full px-3 py-2 text-sm border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[40px] focus:outline-none focus:ring-0 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
              >
                <option value=''>Sélectionner une catégorie</option>
                {extendedCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Produit (OBLIGATOIRE) */}
            <div className='space-y-1'>
              <label className='flex items-center gap-1 text-sm font-medium text-myconfort-dark font-manrope'>
                Produit <span className='text-red-600 font-bold'>*</span>
              </label>
              {draft.category === 'Diverse' ? (
                <input
                  type='text'
                  placeholder='Saisir le nom du produit...'
                  value={draft.designation}
                  onChange={e =>
                    setDraft(d => ({ ...d, designation: e.target.value }))
                  }
                  disabled={!draft.category}
                  className='w-full px-3 py-2 text-sm border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[40px] focus:outline-none focus:ring-0 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green disabled:bg-gray-100 disabled:text-gray-500'
                />
              ) : (
                <select
                  value={draft.designation}
                  onChange={e => handleProductChange(e.target.value)}
                  disabled={!draft.category}
                  className='w-full px-3 py-2 text-sm border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[40px] focus:outline-none focus:ring-0 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green disabled:bg-gray-100 disabled:text-gray-500'
                >
                  <option value=''>
                    {draft.category
                      ? 'Sélectionner un produit'
                      : "Sélectionner une catégorie d'abord"}
                  </option>
                  {filteredProducts.map(product => (
                    <option key={product.name} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantité (OBLIGATOIRE) */}
            <div className='space-y-1'>
              <label className='flex items-center gap-1 text-sm font-medium text-myconfort-dark font-manrope'>
                Qté <span className='text-red-600 font-bold'>*</span>
              </label>
              <NumericInput
                value={draft.qty}
                onChange={(value) =>
                  setDraft(d => ({ ...d, qty: Number(value) || 1 }))
                }
                min={1}
                className='w-full text-myconfort-dark border-gray-200 hover:border-myconfort-green focus:border-myconfort-green'
                aria-label="Quantité"
              />
            </div>
          </div>

          {/* Ligne 2 : Prix + Remise + Bouton */}
          <div className='grid grid-cols-4 gap-2'>
            {/* Prix TTC (OBLIGATOIRE) */}
            <div className='space-y-1'>
              <label className='flex items-center gap-1 text-sm font-medium text-myconfort-dark font-manrope'>
                Prix TTC (€) <span className='text-red-600 font-bold'>*</span>
              </label>
              <NumericInput
                value={draft.priceTTC}
                onChange={(value) =>
                  setDraft(d => ({
                    ...d,
                    priceTTC: Number(value) || 0,
                  }))
                }
                min={0}
                step="0.01"
                className='w-full text-myconfort-dark border-gray-200 hover:border-myconfort-green focus:border-myconfort-green'
                aria-label="Prix TTC en euros"
              />
            </div>

            {/* Remise (optionnelle) */}
            <div className='space-y-1 col-span-2'>
              <label className='flex items-center gap-1 text-sm font-medium text-gray-600 font-manrope'>
                Remise (optionnel)
                {draft.discount > 0 && (
                  <span className='text-myconfort-green ml-1 font-bold'>✓</span>
                )}
              </label>
              <div className='flex gap-1'>
                <select
                  value={draft.discountType}
                  onChange={e =>
                    setDraft(d => ({
                      ...d,
                      discountType: e.target.value as 'percent' | 'fixed',
                    }))
                  }
                  className='w-12 px-1 py-2 text-sm border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[40px] focus:outline-none focus:ring-0 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                >
                  <option value='percent'>%</option>
                  <option value='fixed'>€</option>
                </select>
                <NumericInput
                  value={draft.discount}
                  onChange={(value) =>
                    setDraft(d => ({
                      ...d,
                      discount: Number(value) || 0,
                    }))
                  }
                  min={0}
                  step="0.01"
                  placeholder="0"
                  className='flex-1 text-myconfort-dark border-gray-200 hover:border-myconfort-green focus:border-myconfort-green'
                  aria-label="Montant de la remise"
                />
              </div>
            </div>

            {/* Bouton Ajouter */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-transparent'>
                Action
              </label>
              <button
                onClick={handleAdd}
                disabled={
                  !draft.category ||
                  !draft.designation ||
                  draft.qty <= 0 ||
                  draft.priceTTC <= 0
                }
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium font-manrope text-white transition-all min-h-[40px] ${
                  !draft.category ||
                  !draft.designation ||
                  draft.qty <= 0 ||
                  draft.priceTTC <= 0
                    ? 'bg-myconfort-coral hover:bg-myconfort-coral/90'
                    : 'bg-myconfort-green hover:bg-myconfort-green/90 shadow-lg'
                }`}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Liste des produits ajoutés */}
        <div className='flex-1 bg-white rounded-lg border border-myconfort-dark/10'>
          <div>
            <table className='w-full text-left'>
              <thead className='bg-myconfort-green text-white sticky top-0'>
                <tr>
                  <th className='px-2 py-2 text-sm font-medium font-manrope'>
                    PRODUIT
                  </th>
                  <th className='px-1 py-2 text-center text-sm font-medium font-manrope'>
                    Qté
                  </th>
                  <th className='px-1 py-2 text-right text-sm font-medium font-manrope'>
                    PU HT
                  </th>
                  <th className='px-1 py-2 text-right text-sm font-medium font-manrope'>
                    PU TTC
                  </th>
                  <th className='px-1 py-2 text-right text-sm font-medium font-manrope'>
                    Remise
                  </th>
                  <th className='px-1 py-2 text-center text-sm font-medium font-manrope'>
                    Livraison
                  </th>
                  <th className='px-1 py-2 text-right text-sm font-medium font-manrope'>
                    Total TTC
                  </th>
                  <th className='px-1 py-2 text-center text-sm font-medium font-manrope'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p, index) => {
                  const puHT = calculateHT(Number(p.priceTTC || 0), taxRate);
                  const totalTTC = calculateProductTotal(
                    Number(p.qty || 0),
                    Number(p.priceTTC || 0),
                    Number(p.discount || 0),
                    p.discountType || 'percent'
                  );

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <td className='px-2 py-2'>
                        <div className='text-sm font-medium font-manrope text-myconfort-dark'>
                          {p.designation}
                        </div>
                        <div className='text-xs text-gray-600'>
                          {p.category || 'Non définie'}
                        </div>
                      </td>
                      <td className='px-1 py-2 text-center'>
                        <NumericInput
                          value={p.qty}
                          onChange={(value) =>
                            updateProduit(p.id, {
                              qty: Number(value) || 1,
                            })
                          }
                          min={1}
                          className='w-12 text-center text-myconfort-dark border-gray-200 hover:border-myconfort-green focus:border-myconfort-green'
                          aria-label="Quantité"
                        />
                      </td>
                      <td className='px-1 py-2 text-right'>
                        <div className='text-sm font-medium font-manrope text-myconfort-dark'>
                          {puHT.toFixed(2)} €
                        </div>
                      </td>
                      <td className='px-1 py-2 text-right'>
                        <NumericInput
                          value={p.priceTTC}
                          onChange={(value) =>
                            updateProduit(p.id, {
                              priceTTC: Number(value) || 0,
                            })
                          }
                          min={0}
                          step="0.01"
                          className='w-16 text-right text-myconfort-dark border-gray-200 hover:border-myconfort-green focus:border-myconfort-green'
                          aria-label="Prix TTC"
                        />
                      </td>
                      <td className='px-1 py-2 text-right'>
                        <div className='flex gap-1'>
                          <select
                            className={`w-8 px-1 py-1 text-xs border rounded font-manrope transition-colors duration-150 focus:outline-none focus:ring-0 ${
                              (p.discount || 0) > 0
                                ? 'border-myconfort-coral bg-red-50 text-red-700 focus:border-myconfort-coral'
                                : 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                            }`}
                            value={p.discountType || 'percent'}
                            onChange={e =>
                              updateProduit(p.id, {
                                discountType: e.target.value as
                                  | 'percent'
                                  | 'fixed',
                              })
                            }
                          >
                            <option value='percent'>%</option>
                            <option value='fixed'>€</option>
                          </select>
                          <NumericInput
                            value={p.discount || 0}
                            onChange={(value) =>
                              updateProduit(p.id, {
                                discount: Number(value) || 0,
                              })
                            }
                            min={0}
                            step="0.01"
                            placeholder="0"
                            className={`w-10 text-right text-xs ${
                              (p.discount || 0) > 0
                                ? 'border-myconfort-coral bg-red-50 text-red-700 focus:border-myconfort-coral'
                                : 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                            }`}
                            aria-label="Remise"
                          />
                        </div>
                      </td>
                      <td className='px-1 py-2 text-center'>
                        <select
                          className={`w-16 px-1 py-1 text-xs font-medium border rounded font-manrope transition-colors duration-150 focus:outline-none focus:ring-0 ${
                            p.isPickupOnSite === undefined
                              ? 'border-yellow-500 bg-yellow-100 text-yellow-800 focus:border-yellow-600'
                              : p.isPickupOnSite
                                ? 'border-myconfort-green bg-green-100 text-green-800 focus:border-myconfort-green'
                                : 'border-myconfort-coral bg-red-100 text-red-800 focus:border-myconfort-coral'
                          }`}
                          value={
                            p.isPickupOnSite === undefined
                              ? ''
                              : p.isPickupOnSite
                                ? 'emporter'
                                : 'livrer'
                          }
                          onChange={e => {
                            if (e.target.value === '') {
                              updateProduit(p.id, {
                                isPickupOnSite: undefined,
                              });
                            } else {
                              updateProduit(p.id, {
                                isPickupOnSite: e.target.value === 'emporter',
                              });
                            }
                          }}
                        >
                          <option value='' className='text-black font-medium'>
                            ⚠️ À choisir
                          </option>
                          <option
                            value='livrer'
                            className='text-black font-medium'
                          >
                            📦 À livrer
                          </option>
                          <option
                            value='emporter'
                            className='text-black font-medium'
                          >
                            🚗 Emporter
                          </option>
                        </select>
                      </td>
                      <td className='px-1 py-2 text-right'>
                        <div className='text-sm font-bold text-myconfort-green font-manrope'>
                          {totalTTC.toFixed(2)} €
                        </div>
                      </td>
                      <td className='px-1 py-2 text-center'>
                        <button
                          onClick={() => removeProduit(p.id)}
                          className='w-6 h-6 rounded bg-myconfort-coral text-white font-bold hover:bg-red-600 transition-all font-manrope text-xs'
                          title='Supprimer'
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {produits.length === 0 && (
                  <tr>
                    <td
                      className='px-6 py-8 text-gray-500 text-center text-sm font-manrope'
                      colSpan={8}
                    >
                      Aucun produit pour l'instant. Utilisez le formulaire
                      ci-dessus pour ajouter des produits.
                    </td>
                  </tr>
                )}
              </tbody>
              {produits.length > 0 && (
                <tfoot className='bg-myconfort-cream sticky bottom-0'>
                  <tr>
                    <td
                      className='px-2 py-1 text-right font-bold text-xs text-myconfort-dark font-manrope'
                      colSpan={6}
                    >
                      <div className='flex justify-end gap-4'>
                        <span>HT: {totals.totalHT.toFixed(2)}€</span>
                        <span>
                          TVA ({taxRate}%): {totals.totalTVA.toFixed(2)}€
                        </span>
                        {totals.totalRemise > 0 && (
                          <span className='text-red-600'>
                            Remise: -{totals.totalRemise.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-1 py-1 text-right font-bold text-sm text-myconfort-green font-manrope'>
                      <strong>TTC: {totals.totalTTC.toFixed(2)} €</strong>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* 🚀 FOOTER FIXE (toujours visible) */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
        <button
          onClick={onPrev}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Précédent
        </button>
        <div className='flex flex-col items-center'>
          <div className='bg-white px-3 py-1 rounded-full shadow-lg mb-1'>
            <div className='text-xs text-gray-500 font-manrope'>Étape 3/7</div>
          </div>
        </div>
        <button
          onClick={validateAndNext}
          disabled={!canProceed}
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${
            !canProceed
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-myconfort-green text-white hover:bg-myconfort-green/90'
          }`}
        >
          {!canProceed ? '⚠️ Produits requis' : 'Suivant →'}
        </button>
      </div>

      {/* Zone pour tester le scroll quand il y a beaucoup de produits */}
      {produits.length >= 2 && (
        <div style={{ height: '400px', background: 'transparent' }}>
          {/* Cette zone invisible force le scroll quand il y a 2+ produits */}
        </div>
      )}

    </div>
  );
}
