import { useMemo, useState } from "react";
import { useInvoiceWizard } from "../../store/useInvoiceWizard";
import { productCatalog, productCategories } from "../../data/products";
import { calculateHT, calculateProductTotal } from "../../utils/calculations";

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
  const { produits, addProduit, updateProduit, removeProduit } = useInvoiceWizard();
  const [draft, setDraft] = useState({ 
    category: "", 
    designation: "", 
    qty: 1, 
    priceTTC: 0,
    discount: 0,
    discountType: 'percent' as 'percent' | 'fixed'
  });

  const taxRate = 20; // TVA fixe à 20%

  // Validation : tous les produits doivent avoir un mode de livraison défini
  const canProceed = produits.length > 0 && produits.every(p => p.isPickupOnSite !== undefined);

  const filteredProducts = useMemo(() => {
    if (!draft.category || draft.category === 'Diverse') return [];
    return productCatalog.filter(p => p.category === draft.category);
  }, [draft.category]);

  const totals = useMemo(() => {
    const totalTTC = produits.reduce((sum, p) => {
      return sum + calculateProductTotal(
        Number(p.qty || 0),
        Number(p.priceTTC || 0),
        Number(p.discount || 0),
        p.discountType || 'percent'
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
      totalRemise
    };
  }, [produits, taxRate]);

  const handleCategoryChange = (category: string) => {
    setDraft(prev => ({
      ...prev,
      category,
      designation: '', // Reset le produit quand on change de catégorie
      priceTTC: 0
    }));
  };

  const handleProductChange = (productName: string) => {
    const selectedProduct = filteredProducts.find(p => p.name === productName);
    if (selectedProduct) {
      setDraft(prev => ({
        ...prev,
        designation: selectedProduct.name,
        priceTTC: selectedProduct.priceTTC
      }));
    }
  };

  const handleAdd = () => {
    if (!draft.category.trim() || !draft.designation.trim() || draft.qty <= 0 || draft.priceTTC <= 0) {
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
    setDraft({ category: "", designation: "", qty: 1, priceTTC: 0, discount: 0, discountType: 'percent' });
  };

  const validateAndNext = () => {
    if (produits.length === 0) {
      alert('Veuillez ajouter au moins un produit avant de continuer.');
      return;
    }

    const productsWithoutDeliveryMode = produits.filter(p => p.isPickupOnSite === undefined);
    if (productsWithoutDeliveryMode.length > 0) {
      alert(`Veuillez définir le mode de livraison pour tous les produits.\n${productsWithoutDeliveryMode.length} produit(s) sans mode de livraison défini.`);
      return;
    }

    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-8 mb-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-[#F2EFE2] mb-6 flex items-center justify-center">
          <span className="bg-[#F2EFE2] text-[#477A0C] px-8 py-4 rounded-full font-bold text-2xl">
            📦 PRODUITS & SERVICES
          </span>
        </h1>
        
        <div className="bg-[#F2EFE2] rounded-lg p-8">
          <p className="text-center text-gray-700 text-lg mb-6">
            Ajoutez les produits de la commande avec quantités et prix
          </p>

          {/* Ligne d'ajout rapide avec remise */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-[#477A0C] mb-4">➕ Ajouter un produit</h3>
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* Catégorie en premier - plus large */}
            <div className="col-span-3">
              <label className="block text-gray-700 font-semibold mb-2">Catégorie</label>
              <select
                className="w-full h-16 rounded-xl border-2 border-gray-300 px-4 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all bg-white"
                value={draft.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Sélectionner une catégorie</option>
                {extendedCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Produit conditionnel - taille normale */}
            <div className="col-span-3">
              <label className="block text-gray-700 font-semibold mb-2">Produit</label>
              {draft.category === 'Diverse' ? (
                <input
                  className="w-full h-16 rounded-xl border-2 border-gray-300 px-4 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
                  placeholder="Saisir le nom du produit..."
                  value={draft.designation}
                  onChange={(e) => setDraft(d => ({ ...d, designation: e.target.value }))}
                  disabled={!draft.category}
                />
              ) : (
                <select
                  className="w-full h-16 rounded-xl border-2 border-gray-300 px-4 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all bg-white"
                  value={draft.designation}
                  onChange={(e) => handleProductChange(e.target.value)}
                  disabled={!draft.category}
                >
                  <option value="">
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

            <div className="col-span-1">
              <label className="block text-gray-700 font-semibold mb-2">Quantité</label>
              <input
                type="number"
                min={1}
                className="w-full h-16 rounded-xl border-2 border-gray-300 px-4 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
                value={draft.qty}
                onChange={(e) => setDraft((d) => ({ ...d, qty: Number(e.target.value || 1) }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Prix TTC (€)</label>
              <input
                type="number"
                step="0.01"
                className="w-full h-16 rounded-xl border-2 border-gray-300 px-4 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
                value={draft.priceTTC}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, priceTTC: Number(e.target.value || 0) }))
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Remise</label>
              <div className="flex gap-2">
                <select
                  className={`w-16 h-16 rounded-xl border-2 px-2 text-lg transition-all bg-white ${
                    draft.discount > 0 
                      ? 'border-pink-500 bg-pink-50 text-pink-700 focus:border-pink-600' 
                      : 'border-gray-300 focus:border-[#477A0C]'
                  }`}
                  value={draft.discountType}
                  onChange={(e) => setDraft(d => ({ ...d, discountType: e.target.value as 'percent' | 'fixed' }))}
                >
                  <option value="percent">%</option>
                  <option value="fixed">€</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-20 h-16 rounded-xl border-2 px-4 text-xl transition-all ${
                    draft.discount > 0 
                      ? 'border-pink-500 bg-pink-50 text-pink-700 focus:border-pink-600 focus:ring-4 focus:ring-pink-200' 
                      : 'border-gray-300 focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20'
                  }`}
                  value={draft.discount}
                  onChange={(e) => setDraft(d => ({ ...d, discount: Number(e.target.value || 0) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="col-span-1">
              <button
                onClick={handleAdd}
                className="w-full h-16 rounded-xl bg-[#477A0C] text-white text-xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Ajouter le produit"
                disabled={!draft.category || !draft.designation || draft.qty <= 0 || draft.priceTTC <= 0}
              >
                +
              </button>
            </div>
          </div>

          {/* Aperçu du produit avec calculs */}
          {draft.priceTTC > 0 && (
            <div className={`mt-4 p-4 rounded-xl border-2 transition-all ${
              draft.discount > 0 
                ? 'bg-pink-50 border-pink-300 shadow-lg' 
                : 'bg-white border-[#477A0C]/20'
            }`}>
              <div className="text-sm space-y-1">
                <div className="text-gray-600">
                  Prix HT calculé: <strong className="text-gray-800">{calculateHT(draft.priceTTC, taxRate).toFixed(2)} €</strong>
                </div>
                {draft.discount > 0 && (
                  <>
                    <div className="text-gray-600">
                      Prix original: <span className="line-through">{(draft.qty * draft.priceTTC).toFixed(2)} €</span>
                    </div>
                    <div className="text-pink-600 font-semibold">
                      💰 Total avec remise: <strong className="text-pink-700 text-lg">
                        {calculateProductTotal(draft.qty, draft.priceTTC, draft.discount, draft.discountType).toFixed(2)} €
                      </strong>
                    </div>
                    <div className="text-pink-500 text-xs">
                      Économie: {(draft.qty * draft.priceTTC - calculateProductTotal(draft.qty, draft.priceTTC, draft.discount, draft.discountType)).toFixed(2)} €
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tableau produits - Version complète conforme à l'app principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-[#477A0C] text-white">
                <tr>
                  <th className="px-4 py-3 text-lg font-bold">PRODUIT</th>
                  <th className="px-3 py-2 text-center text-lg font-bold">Quantité</th>
                  <th className="px-3 py-2 text-right text-lg font-bold">PU HT</th>
                  <th className="px-3 py-2 text-right text-lg font-bold">PU TTC</th>
                  <th className="px-3 py-2 text-right text-lg font-bold">Remise</th>
                  <th className="px-3 py-2 text-center text-lg font-bold">Livraison</th>
                  <th className="px-3 py-2 text-right text-lg font-bold">Total TTC</th>
                  <th className="px-3 py-2 text-center text-lg font-bold">Actions</th>
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
                    <tr key={p.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="px-4 py-3">
                        <div className="text-black font-bold">{p.designation}</div>
                        <div className="text-sm text-gray-600">Catégorie: {p.category || 'Non définie'}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          className="w-20 h-10 rounded-lg border-2 border-gray-300 px-2 text-center text-lg font-bold focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C]/20"
                          value={p.qty}
                          onChange={(e) => updateProduit(p.id, { qty: Number(e.target.value || 1) })}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="text-lg font-semibold">{puHT.toFixed(2)} €</div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          className="w-28 h-10 rounded-lg border-2 border-gray-300 px-2 text-right text-lg font-bold focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C]/20"
                          value={p.priceTTC}
                          onChange={(e) =>
                            updateProduit(p.id, { priceTTC: Number(e.target.value || 0) })
                          }
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col gap-1">
                          <select
                            className={`w-20 h-8 rounded border text-sm bg-white transition-all ${
                              (p.discount || 0) > 0 
                                ? 'border-pink-500 bg-pink-50 text-pink-700 focus:border-pink-600' 
                                : 'border-gray-300 focus:border-[#477A0C]'
                            }`}
                            value={p.discountType || 'percent'}
                            onChange={(e) => updateProduit(p.id, { discountType: e.target.value as 'percent' | 'fixed' })}
                          >
                            <option value="percent">%</option>
                            <option value="fixed">€</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={`w-20 h-8 rounded border px-2 text-right text-sm transition-all ${
                              (p.discount || 0) > 0 
                                ? 'border-pink-500 bg-pink-50 text-pink-700 focus:border-pink-600 focus:ring-2 focus:ring-pink-200' 
                                : 'border-gray-300 focus:border-[#477A0C] focus:ring-1 focus:ring-[#477A0C]/20'
                            }`}
                            value={p.discount || 0}
                            onChange={(e) => updateProduit(p.id, { discount: Number(e.target.value || 0) })}
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <select
                          className={`w-28 h-12 rounded-lg border-3 px-2 text-sm font-bold focus:ring-4 transition-all shadow-lg ${
                            p.isPickupOnSite === undefined
                              ? 'border-yellow-500 bg-yellow-400 text-black focus:border-yellow-600 focus:ring-yellow-200'
                              : p.isPickupOnSite 
                                ? 'border-green-600 bg-green-600 text-white focus:border-green-700 focus:ring-green-300'
                                : 'border-red-600 bg-red-600 text-white focus:border-red-700 focus:ring-red-300'
                          }`}
                          value={p.isPickupOnSite === undefined ? '' : (p.isPickupOnSite ? 'emporter' : 'livrer')}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              updateProduit(p.id, { isPickupOnSite: undefined });
                            } else {
                              updateProduit(p.id, { isPickupOnSite: e.target.value === 'emporter' });
                            }
                          }}
                        >
                          <option value="" className="text-black font-bold">⚠️ À choisir</option>
                          <option value="livrer" className="text-white font-bold">📦 À livrer</option>
                          <option value="emporter" className="text-white font-bold">🚗 emporter</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="text-lg font-bold text-[#477A0C]">{totalTTC.toFixed(2)} €</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeProduit(p.id)}
                          className="w-10 h-10 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {produits.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-gray-500 text-center text-lg" colSpan={8}>
                      Aucun produit pour l'instant. Utilisez le formulaire ci-dessus pour ajouter des produits.
                    </td>
                  </tr>
                )}
              </tbody>
              {produits.length > 0 && (
                <tfoot className="bg-[#F2EFE2]">
                  <tr>
                    <td className="px-4 py-4 text-right font-bold text-lg text-[#477A0C]" colSpan={4}>
                      Total HT:
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-lg text-[#477A0C]">
                      {totals.totalHT.toFixed(2)} €
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-lg text-[#477A0C]">
                      {totals.totalTTC.toFixed(2)} €
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-right font-bold text-lg text-[#477A0C]" colSpan={4}>
                      TVA ({taxRate}%):
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-lg text-[#477A0C]">
                      {totals.totalTVA.toFixed(2)} €
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-xl text-[#477A0C]">
                      <strong>TOTAL TTC</strong>
                    </td>
                    <td />
                  </tr>
                  {totals.totalRemise > 0 && (
                    <tr className="bg-pink-50 border-t-2 border-pink-200">
                      <td className="px-4 py-3 text-right font-bold text-lg text-pink-600" colSpan={4}>
                        💰 Remise totale appliquée:
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-lg text-pink-700">
                        -{totals.totalRemise.toFixed(2)} €
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-pink-500 italic">
                        Économie !
                      </td>
                      <td />
                    </tr>
                  )}
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Navigation locale */}
        <div className="mt-8 flex gap-4 justify-center">
          <button 
            onClick={onPrev} 
            className="px-8 py-4 rounded-xl border-2 border-gray-300 text-lg font-semibold hover:bg-gray-50 transition-all"
          >
            ← Client
          </button>
          <button 
            onClick={validateAndNext} 
            disabled={!canProceed}
            className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg ${
              !canProceed
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                : 'bg-[#477A0C] text-white hover:bg-green-700'
            }`}
          >
            Continuer vers Paiement →
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
