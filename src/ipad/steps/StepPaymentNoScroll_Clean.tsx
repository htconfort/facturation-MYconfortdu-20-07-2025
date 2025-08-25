import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import AlmaLogo from '../../assets/images/Alma_orange.png';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepPaymentNoScroll({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();
  
  // Calcul du total
  const getTotalAmount = () => {
    return produits.reduce((total: number, produit: any) => {
      return total + calculateProductTotal(produit.qty, produit.priceTTC, produit.discount, produit.discountType);
    }, 0);
  };
  const totalAmount = getTotalAmount();
  
  // État local pour les sélections
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');
  const [acompte, setAcompte] = useState(paiement?.depositAmount || 0);

  const restePay = totalAmount - acompte;
  const isValidPayment = selectedMethod && acompte >= 0 && acompte <= totalAmount;

  // Helper pour mettre à jour le paiement
  const updatePayment = (method: string) => {
    updatePaiement({ 
      method,
      depositAmount: acompte,
      depositPaymentMethod: method as any
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-2 px-4">
      {/* Header */}
      <div className="bg-[#477A0C] rounded-lg shadow-lg p-4 mb-4 border border-gray-100">
        <h1 className="text-2xl font-bold text-[#F2EFE2] mb-3 flex items-center justify-center">
          <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-2 rounded-full font-bold text-xl">
            💳 MODE DE RÈGLEMENT
          </span>
        </h1>

        <div className="bg-[#F2EFE2] rounded-lg p-4">
          {/* Résumé financier */}
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-[#477A0C]">
                {totalAmount.toFixed(2)}€
              </div>
              <div className="text-sm text-gray-600">Total TTC</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {acompte.toFixed(2)}€
              </div>
              <div className="text-sm text-gray-600">Acompte</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {restePay.toFixed(2)}€
              </div>
              <div className="text-sm text-gray-600">Reste à payer</div>
            </div>
          </div>

          {/* Saisie Acompte */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#477A0C] mb-2">
              Acompte (€) *
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[20, 30, 40, 50].map(pct => {
                const suggested = Math.round((totalAmount * pct) / 100);
                return (
                  <button
                    key={pct}
                    onClick={() => setAcompte(suggested)}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
                  >
                    {pct}% ({suggested}€)
                  </button>
                );
              })}
            </div>
            <input
              type="number"
              value={acompte}
              onChange={(e) => setAcompte(Number(e.target.value))}
              min="0"
              max={totalAmount}
              className="w-full px-3 py-2 text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-[#477A0C] focus:outline-none bg-white text-center"
              placeholder="0"
            />
          </div>

          {/* Méthodes de paiement - COMPACTES */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Espèces */}
            <button
              onClick={() => {
                setSelectedMethod('Espèces');
                updatePayment('Espèces');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod === 'Espèces'
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="text-lg mb-1">💵</div>
              <div className="font-semibold text-sm">Espèces</div>
              <div className="text-xs text-gray-600">Comptant</div>
            </button>

            {/* Carte Bleue */}
            <button
              onClick={() => {
                setSelectedMethod('Carte Bleue');
                updatePayment('Carte Bleue');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod === 'Carte Bleue'
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="text-lg mb-1">💳</div>
              <div className="font-semibold text-sm">Carte Bleue</div>
              <div className="text-xs text-gray-600">Immédiat</div>
            </button>

            {/* Virement */}
            <button
              onClick={() => {
                setSelectedMethod('Virement');
                updatePayment('Virement');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod === 'Virement'
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="text-lg mb-1">🏦</div>
              <div className="font-semibold text-sm">Virement</div>
              <div className="text-xs text-gray-600">Banque</div>
            </button>

            {/* Chèque comptant */}
            <button
              onClick={() => {
                setSelectedMethod('Chèque au comptant');
                updatePayment('Chèque au comptant');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod === 'Chèque au comptant'
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="text-lg mb-1">📝</div>
              <div className="font-semibold text-sm">Chèque comptant</div>
              <div className="text-xs text-gray-600">Immédiat</div>
            </button>

            {/* Alma */}
            <button
              onClick={() => {
                setSelectedMethod('Alma 3x');
                updatePayment('Alma 3x');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod?.startsWith('Alma')
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <img src={AlmaLogo} alt="Alma" className="h-4" />
              </div>
              <div className="font-semibold text-sm">Alma</div>
              <div className="text-xs text-gray-600">2x, 3x, 4x</div>
            </button>

            {/* Chèques à venir */}
            <button
              onClick={() => {
                setSelectedMethod('Chèque à venir');
                updatePayment('Chèque à venir');
              }}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                selectedMethod === 'Chèque à venir'
                  ? 'border-[#477A0C] bg-[#477A0C]/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#477A0C]/50'
              }`}
            >
              <div className="text-lg mb-1">📄</div>
              <div className="font-semibold text-sm">Chèques à venir</div>
              <div className="text-xs text-gray-600">Différé</div>
            </button>
          </div>
        </div>
      </div>

      {/* Boutons navigation */}
      <div className="flex justify-center gap-4 mt-6 mb-4">
        <button
          onClick={onPrev}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          ← Précédent
        </button>
        <button
          onClick={isValidPayment ? onNext : undefined}
          disabled={!isValidPayment}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform shadow-lg ${
            !isValidPayment
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              : 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white hover:scale-105'
          }`}
        >
          {isValidPayment ? '✅ Suivant →' : '🚫 Sélectionner un mode de paiement'}
        </button>
      </div>
    </div>
  );
}
