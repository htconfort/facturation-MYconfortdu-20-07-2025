// StepPaymentWorking.tsx - Version fonctionnelle avec interactivité complète
import { useState, useMemo, useCallback } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import AlmaLogo from '../../assets/images/Alma_orange.png';
import NumericInput from '../../components/NumericInput';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export default function StepPaymentWorking({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Pages secondaires
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);

  // État local pour l'acompte et les méthodes
  const [acompte, setAcompte] = useState<number>(paiement?.depositAmount || 0);
  const [depositMethod, setDepositMethod] = useState<string>(paiement?.depositMethod || '');
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');

  // Total TTC à partir des lignes - WORKING VERSION
  const totalAmount: number = useMemo(() => {
    if (!produits || produits.length === 0) {
      return 0;
    }

    const total = produits.reduce((acc: number, produit: any) => {
      const productTotal = calculateProductTotal(
        produit.prix || 0, 
        produit.quantite || 1, 
        produit.tva || 20
      );
      return acc + productTotal;
    }, 0);

    return total;
  }, [produits]);

  // Reste à payer
  const restePay = useMemo(() => {
    return Math.max(0, totalAmount - acompte);
  }, [totalAmount, acompte]);

  // Validation
  const isValidPayment = useMemo(() => {
    if (acompte < 0 || acompte > totalAmount) return false;
    if (acompte > 0 && !depositMethod) return false;
    if (restePay > 0 && !selectedMethod) return false;
    return true;
  }, [acompte, totalAmount, depositMethod, restePay, selectedMethod]);

  // Sauvegarde
  const savePayment = useCallback((data: any) => {
    try {
      updatePaiement({
        ...paiement,
        ...data,
        depositAmount: acompte,
        depositMethod,
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  }, [updatePaiement, paiement, acompte, depositMethod]);

  // Fonction pour gérer les boutons pourcentages
  const handlePercentageClick = useCallback((percent: number) => {
    const amount = Math.round(totalAmount * percent / 100);
    setAcompte(amount);
  }, [totalAmount]);

  // Fonction pour gérer les changements de NumericInput
  const handleAcompteChange = useCallback((value: string) => {
    const numValue = parseFloat(value) || 0;
    setAcompte(numValue);
  }, []);

  return (
    <div 
      className="w-full h-screen bg-myconfort-cream relative overflow-visible font-manrope"
      style={{ height: '100svh' }}
    >
      
      {/* ===== HEADER FONCTIONNEL ===== */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-myconfort-green to-green-600"
        style={{ height: '90px' }}
      >
        <div className="flex flex-col justify-center h-full px-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            💳 Mode de Règlement
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-90">Étape 4/7</p>
            <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <span className="text-white font-bold text-lg">
                Total : {totalAmount.toFixed(2)}€ TTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENU SCROLLABLE ===== */}
      <div 
        className="absolute left-0 right-0 px-6 overflow-y-auto overflow-x-hidden"
        style={{
          top: '90px',
          bottom: '110px',
          paddingBottom: '20px',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Résumé financier compact */}
        <div className="bg-white/90 backdrop-blur p-5 rounded-xl border border-myconfort-green/20 mb-6 mt-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                Total TTC
              </div>
              <div className="text-xl font-bold text-myconfort-dark">
                {totalAmount.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                Acompte
              </div>
              <div className={`text-xl font-bold ${acompte > 0 ? 'text-myconfort-green' : 'text-gray-400'}`}>
                {acompte.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                Reste
              </div>
              <div className="text-xl font-bold text-myconfort-dark">
                {restePay.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION ACOMPTE FONCTIONNELLE ===== */}
        <div className="bg-white p-6 rounded-xl mb-6 border border-myconfort-green/15 shadow-sm">
          <h3 className="text-lg font-bold text-myconfort-dark mb-4 flex items-center gap-2">
            💰 Acompte
          </h3>

          {/* Boutons pourcentages FONCTIONNELS */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[20, 30, 40, 50].map(percent => {
              const amount = Math.round(totalAmount * percent / 100);
              const isSelected = acompte === amount;
              return (
                <button
                  key={percent}
                  onClick={() => handlePercentageClick(percent)}
                  className={`
                    p-3 rounded-lg border-2 font-bold transition-all duration-200 min-h-14
                    ${isSelected 
                      ? 'border-myconfort-green bg-myconfort-green text-white shadow-lg transform scale-105' 
                      : 'border-myconfort-green/30 bg-white text-myconfort-dark hover:border-myconfort-green hover:bg-myconfort-green/5 active:scale-95'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="text-sm">{percent}%</div>
                  <div className="text-xs opacity-80">{amount}€</div>
                </button>
              );
            })}
          </div>

          {/* Input FONCTIONNEL */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-myconfort-dark mb-2">
              Montant personnalisé (€)
            </label>
            <NumericInput
              value={acompte}
              onChange={handleAcompteChange}
              min={0}
              max={totalAmount}
              placeholder="0.00"
              className="w-full p-4 text-lg rounded-lg border-2 border-myconfort-green/20 bg-white text-myconfort-dark font-bold focus:border-myconfort-green focus:outline-none focus:ring-2 focus:ring-myconfort-green/20"
            />
          </div>

          {/* Mode de règlement acompte FONCTIONNEL */}
          {acompte > 0 && (
            <div>
              <label className="block text-sm font-bold text-myconfort-dark mb-3">
                Mode de règlement acompte *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Espèces', label: 'Espèces', emoji: '💵' },
                  { id: 'Carte Bleue', label: 'Carte', emoji: '💳' },
                  { id: 'Chèque comptant', label: 'Chèque', emoji: '🧾' },
                  { id: 'Virement', label: 'Virement', emoji: '🏦' },
                ].map(method => {
                  const isSelected = depositMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setDepositMethod(method.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 min-h-16 flex flex-col justify-center items-center
                        ${isSelected 
                          ? 'border-myconfort-green bg-myconfort-green text-white shadow-lg' 
                          : 'border-myconfort-green/30 bg-white text-myconfort-dark hover:border-myconfort-green hover:bg-myconfort-green/5 active:scale-95'
                        }
                      `}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <div className="text-lg mb-1">{method.emoji}</div>
                      <div className="font-bold text-sm">{method.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION RESTE À PAYER FONCTIONNELLE ===== */}
        {restePay > 0 && (
          <div className="bg-white p-6 rounded-xl mb-6 border border-myconfort-green/15 shadow-sm">
            <h3 className="text-lg font-bold text-myconfort-dark mb-4 flex items-center gap-2">
              💳 Règlement reste ({restePay.toFixed(2)}€)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Méthodes simples FONCTIONNELLES */}
              {[
                { id: 'Espèces', label: 'Espèces', emoji: '💵' },
                { id: 'Virement', label: 'Virement', emoji: '🏦' },
                { id: 'Carte Bleue', label: 'Carte', emoji: '💳' },
                { id: 'Chèque au comptant', label: 'Chèque', emoji: '🧾' },
              ].map(method => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      savePayment({ method: method.id });
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 min-h-16 flex flex-col justify-center items-center
                      ${isSelected 
                        ? 'border-myconfort-green bg-myconfort-green text-white shadow-lg' 
                        : 'border-myconfort-green/30 bg-white text-myconfort-dark hover:border-myconfort-green hover:bg-myconfort-green/5 active:scale-95'
                      }
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="text-lg mb-1">{method.emoji}</div>
                    <div className="font-bold text-sm">{method.label}</div>
                  </button>
                );
              })}

              {/* Alma FONCTIONNEL */}
              <button
                onClick={() => {
                  setSelectedMethod('Alma 3x');
                  savePayment({ method: 'Alma 3x' });
                }}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 min-h-16 flex flex-col justify-center items-center
                  ${selectedMethod?.startsWith('Alma') 
                    ? 'border-myconfort-green bg-myconfort-green text-white shadow-lg' 
                    : 'border-orange-300 bg-orange-50 text-myconfort-dark hover:border-orange-400 active:scale-95'
                  }
                `}
                style={{ touchAction: 'manipulation' }}
              >
                <img src={AlmaLogo} alt="Alma" className="h-6 mb-1" />
                <div className="font-bold text-sm">
                  {selectedMethod?.startsWith('Alma') ? 'Alma ✓' : 'Alma'}
                </div>
              </button>

              {/* Chèques à venir FONCTIONNEL */}
              <button
                onClick={() => {
                  setSelectedMethod('Chèque à venir');
                  savePayment({ method: 'Chèque à venir' });
                }}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 min-h-16 flex flex-col justify-center items-center
                  ${selectedMethod === 'Chèque à venir' 
                    ? 'border-myconfort-green bg-myconfort-green text-white shadow-lg' 
                    : 'border-myconfort-coral/40 bg-myconfort-coral/10 text-myconfort-dark hover:border-myconfort-coral/60 active:scale-95'
                  }
                `}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="text-lg mb-1">📄</div>
                <div className="font-bold text-sm">
                  {selectedMethod === 'Chèque à venir' ? 'Chèques ✓' : 'Chèques'}
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* ===== FOOTER FONCTIONNEL ===== */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-myconfort-green/20"
        style={{ height: '110px' }}
      >
        <div className="flex flex-col justify-center h-full px-6">
          {/* Message de validation si nécessaire */}
          {!isValidPayment && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm text-center mb-3 border border-red-200">
              {acompte > totalAmount ? 'Acompte > Total' :
               acompte > 0 && !depositMethod ? 'Choisir mode acompte' :
               restePay > 0 && !selectedMethod ? 'Choisir mode reste' :
               'Compléter infos'}
            </div>
          )}

          {/* Boutons de navigation FONCTIONNELS */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={onPrev}
              className="px-6 py-3 rounded-full border-2 border-myconfort-green bg-white text-myconfort-green font-bold hover:bg-myconfort-green/5 transition-all active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              ← Précédent
            </button>

            <div className="px-4 py-2 bg-myconfort-green/10 rounded-full text-myconfort-green font-bold text-sm">
              4/7
            </div>

            <button
              onClick={onNext}
              disabled={!isValidPayment}
              className={`
                px-6 py-3 rounded-full font-bold transition-all
                ${isValidPayment 
                  ? 'bg-myconfort-green text-white hover:bg-myconfort-green/90 shadow-lg active:scale-95' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              style={{ touchAction: 'manipulation' }}
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
