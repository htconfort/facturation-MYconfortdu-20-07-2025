// StepPaymentSimple.tsx - Version simplifiée et robuste
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

interface PaymentData {
  method?: string;
  depositAmount?: number;
  depositMethod?: string;
  almaOption?: string;
  almaDuration?: number;
  almaMonthlyAmount?: number;
  chequesCount?: number;
  chequeAmount?: number;
  notes?: string;
}

export default function StepPaymentSimple({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Pages secondaires
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);

  // État local pour l'acompte et les méthodes
  const [acompte, setAcompte] = useState<number>(paiement?.depositAmount || 0);
  const [depositMethod, setDepositMethod] = useState<string>(paiement?.depositMethod || '');
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');

  // Total TTC à partir des lignes
  const totalAmount: number = (produits ?? []).reduce(
    (acc: number, produit: any) =>
      acc + calculateProductTotal(produit.prix || 0, produit.quantite || 1, produit.tva || 20),
    0
  );

  // Reste à payer
  const restePay = useMemo(() => Math.max(0, totalAmount - acompte), [totalAmount, acompte]);

  // Validation
  const isValidPayment = useMemo(() => {
    if (acompte < 0 || acompte > totalAmount) return false;
    if (acompte > 0 && !depositMethod) return false;
    if (restePay > 0 && !selectedMethod) return false;
    return true;
  }, [acompte, totalAmount, depositMethod, restePay, selectedMethod]);

  // Sauvegarde sécurisée
  const savePayment = useCallback((data: Partial<PaymentData>) => {
    try {
      updatePaiement({
        ...paiement,
        ...data,
        depositAmount: acompte,
        depositMethod,
      });
    } catch (error) {
      console.error('Erreur sauvegarde paiement:', error);
    }
  }, [updatePaiement, paiement, acompte, depositMethod]);

  return (
    <div 
      className="w-full h-screen bg-myconfort-cream relative overflow-visible font-manrope"
      style={{ 
        height: '100svh',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      
      {/* ===== HEADER FIXE ===== */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 bg-myconfort-cream border-b border-myconfort-dark/10"
        style={{ height: '80px' }}
      >
        <div className="flex flex-col justify-center h-full px-8">
          <h1 className="text-2xl font-bold text-myconfort-dark mb-2">
            💳 Mode de Règlement
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-sm text-myconfort-dark/80">Étape 4/7</p>
            <div className="bg-myconfort-green/10 px-4 py-2 rounded-full border border-myconfort-green/20">
              <span className="text-myconfort-green font-semibold">
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
          top: '80px',
          bottom: '120px',
          paddingBottom: '40px',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* ===== RÉSUMÉ FINANCIER ===== */}
        <div className="bg-myconfort-green/10 p-6 rounded-2xl border-2 border-myconfort-green/20 mb-8 shadow-sm mt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase tracking-wide">
                Total TTC
              </div>
              <div className="text-2xl font-bold text-myconfort-dark">
                {totalAmount.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase tracking-wide">
                Acompte
              </div>
              <div className={`text-2xl font-bold ${acompte > 0 ? 'text-myconfort-green' : 'text-gray-400'}`}>
                {acompte.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase tracking-wide">
                Reste à payer
              </div>
              <div className="text-2xl font-bold text-myconfort-dark">
                {restePay.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION ACOMPTE ===== */}
        <div className="bg-white p-7 rounded-2xl mb-8 border border-myconfort-green/15 shadow-sm">
          <h3 className="text-xl font-semibold text-myconfort-dark mb-5 flex items-center gap-3">
            💰 Acompte demandé
          </h3>

          {/* Boutons pourcentages */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[20, 30, 40, 50].map(percent => {
              const amount = Math.round(totalAmount * percent / 100);
              return (
                <button
                  key={percent}
                  onClick={() => setAcompte(amount)}
                  className={`p-4 rounded-xl border-2 font-semibold transition-colors min-h-14 flex flex-col justify-center items-center gap-1 ${
                    acompte === amount 
                      ? 'border-myconfort-green bg-myconfort-green/10 text-myconfort-green' 
                      : 'border-myconfort-green/20 bg-white text-myconfort-dark hover:border-myconfort-green/40'
                  }`}
                >
                  <span>{percent}%</span>
                  <span className="text-sm opacity-80">{amount}€</span>
                </button>
              );
            })}
          </div>

          {/* Input personnalisé */}
          <div className="mb-6">
            <label className="block text-base font-semibold text-myconfort-dark mb-3">
              Montant personnalisé (€)
            </label>
            <NumericInput
              value={acompte}
              onChange={setAcompte}
              min={0}
              max={totalAmount}
              placeholder="0.00"
              className="w-full p-4 text-lg rounded-xl border-2 border-myconfort-green/20 bg-white text-myconfort-dark font-semibold focus:border-myconfort-green focus:outline-none"
            />
          </div>

          {/* Mode de règlement de l'acompte */}
          {acompte > 0 && (
            <div>
              <label className="block text-base font-semibold text-myconfort-dark mb-4">
                Mode de règlement de l'acompte *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Espèces', label: 'Espèces', emoji: '💵', subtitle: 'Paiement comptant' },
                  { id: 'Carte Bleue', label: 'Carte Bleue', emoji: '💳', subtitle: 'CB immédiate' },
                  { id: 'Chèque comptant', label: 'Chèque', emoji: '🧾', subtitle: 'Remis maintenant' },
                  { id: 'Virement', label: 'Virement', emoji: '🏦', subtitle: 'Banque à banque' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setDepositMethod(method.id)}
                    className={`p-5 rounded-xl border-2 transition-colors min-h-20 flex flex-col justify-center items-center gap-2 text-center ${
                      depositMethod === method.id 
                        ? 'border-myconfort-green bg-myconfort-green/10 text-myconfort-dark' 
                        : 'border-myconfort-green/20 bg-white text-myconfort-dark hover:border-myconfort-green/40'
                    }`}
                  >
                    <div className="text-2xl">{method.emoji}</div>
                    <div className="font-semibold">{method.label}</div>
                    <div className="text-sm opacity-70">{method.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION RESTE À PAYER ===== */}
        {restePay > 0 && (
          <div className="bg-white p-7 rounded-2xl mb-8 border border-myconfort-green/15 shadow-sm">
            <h3 className="text-xl font-semibold text-myconfort-dark mb-5 flex items-center gap-3">
              💳 Mode de règlement du reste ({restePay.toFixed(2)}€)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Méthodes simples */}
              {[
                { id: 'Espèces', label: 'Espèces', emoji: '💵', subtitle: 'Paiement comptant' },
                { id: 'Virement', label: 'Virement', emoji: '🏦', subtitle: 'Banque à banque' },
                { id: 'Carte Bleue', label: 'Carte Bleue', emoji: '💳', subtitle: 'CB immédiate' },
                { id: 'Chèque au comptant', label: 'Chèque (comptant)', emoji: '🧾', subtitle: 'Remis maintenant' },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    savePayment({ method: method.id, depositAmount: acompte, depositMethod });
                  }}
                  className={`p-5 rounded-xl border-2 transition-colors min-h-20 flex flex-col justify-center items-center gap-2 text-center ${
                    selectedMethod === method.id 
                      ? 'border-myconfort-green bg-myconfort-green/10 text-myconfort-dark' 
                      : 'border-myconfort-green/20 bg-white text-myconfort-dark hover:border-myconfort-green/40'
                  }`}
                >
                  <div className="text-2xl">{method.emoji}</div>
                  <div className="font-semibold">{method.label}</div>
                  <div className="text-sm opacity-70">{method.subtitle}</div>
                </button>
              ))}

              {/* Alma - bouton spécial */}
              <button
                onClick={() => setShowAlmaPage(true)}
                className={`p-5 rounded-xl border-2 transition-colors min-h-20 flex flex-col justify-center items-center gap-2 text-center ${
                  selectedMethod?.startsWith('Alma') 
                    ? 'border-myconfort-green bg-myconfort-green/10' 
                    : 'border-orange-300 bg-orange-50 hover:border-orange-400'
                }`}
              >
                <img src={AlmaLogo} alt="Alma" className="h-8" />
                <div className="font-semibold text-myconfort-dark">
                  {selectedMethod?.startsWith('Alma') ? selectedMethod : 'Alma'}
                </div>
                <div className="text-sm opacity-70 text-myconfort-dark">
                  {selectedMethod?.startsWith('Alma') ? 'Configuré ✓' : '2x, 3x ou 4x →'}
                </div>
              </button>

              {/* Chèques à venir - bouton spécial */}
              <button
                onClick={() => setShowChequesPage(true)}
                className={`p-5 rounded-xl border-2 transition-colors min-h-20 flex flex-col justify-center items-center gap-2 text-center ${
                  selectedMethod === 'Chèque à venir' 
                    ? 'border-myconfort-green bg-myconfort-green/10' 
                    : 'border-myconfort-coral/30 bg-myconfort-coral/5 hover:border-myconfort-coral/50'
                }`}
              >
                <div className="text-2xl">📄</div>
                <div className="font-semibold text-myconfort-dark">Chèques à venir</div>
                <div className="text-sm opacity-70 text-myconfort-dark">
                  {selectedMethod === 'Chèque à venir' && paiement?.nombreChequesAVenir
                    ? `${paiement.nombreChequesAVenir} chèques × ${(restePay / (paiement.nombreChequesAVenir || 1)).toFixed(2)}€`
                    : 'Planifier →'}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== FOOTER FIXE AVEC BOUTONS ===== */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-myconfort-cream border-t border-myconfort-dark/10"
        style={{ height: '120px' }}
      >
        <div className="flex flex-col justify-center h-full px-8">
          {/* Message de validation si nécessaire */}
          {!isValidPayment && (
            <div className="bg-myconfort-coral/10 text-myconfort-coral px-4 py-2 rounded-lg text-sm text-center mb-3 border border-myconfort-coral/20">
              {acompte > totalAmount ? 'L\'acompte ne peut pas dépasser le total' :
               acompte > 0 && !depositMethod ? 'Choisissez le mode de règlement de l\'acompte' :
               restePay > 0 && !selectedMethod ? 'Choisissez le mode de règlement du reste' :
               'Veuillez compléter les informations de paiement'}
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={onPrev}
              className="px-8 py-4 rounded-full border-2 border-myconfort-green bg-white text-myconfort-green font-semibold text-lg hover:bg-myconfort-green/5 transition-colors min-w-32 h-14"
            >
              ← Précédent
            </button>

            <div className="px-6 py-3 bg-myconfort-green/10 rounded-full text-myconfort-green font-semibold">
              Étape 4/7
            </div>

            <button
              onClick={onNext}
              disabled={!isValidPayment}
              className={`px-8 py-4 rounded-full font-semibold text-lg min-w-32 h-14 transition-colors ${
                isValidPayment 
                  ? 'bg-myconfort-green text-white hover:bg-myconfort-green/90 shadow-lg shadow-myconfort-green/30' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
