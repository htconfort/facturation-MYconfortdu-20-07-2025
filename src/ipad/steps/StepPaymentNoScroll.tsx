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
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);
  
  // Calcul du total - fonction helper simple
  const getTotalAmount = () => {
    return produits.reduce((total: number, produit: any) => {
      return total + calculateProductTotal(produit.qty, produit.priceTTC, produit.discount, produit.discountType);
    }, 0);
  };
  const totalAmount = getTotalAmount();
  
  // État local pour les sélections
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');
  const [acompte, setAcompte] = useState(paiement?.depositAmount || 0);

interface PaymentData {
  method: string;
  acompte: number;
  almaInstallments?: number; // 2, 3, ou 4 fois
  chequesCount?: number;
  chequeAmount?: number;
  notes?: string;
}

export default function StepPaymentNoScroll({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);
  
  // Calcul du total
  const totalAmount = calculateProductTotal(produits);
  
  // État local pour les sélections
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');
  const [acompte, setAcompte] = useState(paiement?.depositAmount || 0);

  const restePay = totalAmount - acompte;
  const isValidPayment = selectedMethod && acompte >= 0 && acompte <= totalAmount;

  // Pages secondaires
  if (showAlmaPage) {
    return <AlmaDetailsPage 
      totalAmount={totalAmount}
      acompte={acompte}
      onBack={() => setShowAlmaPage(false)} 
      onSelect={(installments) => {
        updatePayment({ 
          method: `Alma ${installments}x`, 
          acompte, 
          almaInstallments: installments 
        });
        setSelectedMethod(`Alma ${installments}x`);
        setShowAlmaPage(false);
      }}
    />;
  }

  if (showChequesPage) {
    return <ChequesDetailsPage 
      totalAmount={totalAmount}
      acompte={acompte}
      onBack={() => setShowChequesPage(false)} 
      onComplete={(data) => {
        updatePayment({ 
          method: 'Chèques à venir', 
          acompte, 
          chequesCount: data.count,
          chequeAmount: data.amount,
          notes: data.notes
        });
        setSelectedMethod('Chèques à venir');
        setShowChequesPage(false);
      }}
    />;
  }

  return (
    <div className="w-full h-dvh bg-myconfort-cream flex flex-col overflow-hidden">
      {/* 🎯 Header fixe - 60px */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          💳 Mode de Règlement
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Étape 4/7 • Total: {totalAmount.toFixed(2)}€ TTC
        </p>
      </div>

      {/* 🎯 Contenu principal - flex-grow */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-center">
        
        {/* Résumé financier */}
        <div className="bg-myconfort-green/10 p-4 rounded-xl border border-myconfort-green/30 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-myconfort-dark">
                {totalAmount.toFixed(2)}€
              </div>
              <div className="text-sm text-myconfort-dark/70">Total TTC</div>
            </div>
            <div>
              <div className="text-lg font-bold text-myconfort-blue">
                {acompte.toFixed(2)}€
              </div>
              <div className="text-sm text-myconfort-dark/70">Acompte</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {restePay.toFixed(2)}€
              </div>
              <div className="text-sm text-myconfort-dark/70">Reste à payer</div>
            </div>
          </div>
        </div>

        {/* Saisie Acompte */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-myconfort-dark mb-2">
            Acompte (€) *
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* Suggestions rapides */}
            {[20, 30, 40, 50].map(pct => {
              const suggested = Math.round((totalAmount * pct) / 100);
              return (
                <button
                  key={pct}
                  onClick={() => setAcompte(suggested)}
                  className="px-3 py-2 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 
                           rounded-lg text-sm font-medium transition-colors"
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
            className="w-full px-4 py-3 text-xl font-bold border-2 border-gray-300 
                       rounded-xl focus:border-myconfort-green focus:outline-none
                       bg-white shadow-sm text-center"
            placeholder="0"
          />
        </div>

        {/* Méthodes de paiement */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Espèces */}
          <button
            onClick={() => {
              setSelectedMethod('Espèces');
              updatePayment({ method: 'Espèces', acompte });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Espèces'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className="text-2xl mb-2">💵</div>
            <div className="font-semibold">Espèces</div>
            <div className="text-sm text-gray-600">Paiement comptant</div>
          </button>

          {/* Virement */}
          <button
            onClick={() => {
              setSelectedMethod('Virement');
              updatePayment({ method: 'Virement', acompte });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Virement'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className="text-2xl mb-2">🏦</div>
            <div className="font-semibold">Virement</div>
            <div className="text-sm text-gray-600">Banque à banque</div>
          </button>

          {/* Alma - Ouvre page secondaire */}
          <button
            onClick={() => setShowAlmaPage(true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod?.startsWith('Alma')
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <img src={AlmaLogo} alt="Alma" className="h-8" />
            </div>
            <div className="font-semibold">
              {selectedMethod?.startsWith('Alma') ? selectedMethod : 'Alma'}
            </div>
            <div className="text-sm text-gray-600">
              {selectedMethod?.startsWith('Alma') ? 'Configuré ✓' : '2x, 3x ou 4x →'}
            </div>
          </button>

          {/* Chèques - Ouvre page secondaire */}
          <button
            onClick={() => setShowChequesPage(true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Chèques à venir'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="font-semibold">
              {selectedMethod === 'Chèques à venir' ? 'Chèques configurés' : 'Chèques à venir'}
            </div>
            <div className="text-sm text-gray-600">
              {selectedMethod === 'Chèques à venir' ? 
                `${payment?.chequesCount || 0} chèques ✓` : 
                'Nombre + montants →'
              }
            </div>
          </button>
        </div>

      </div>

      {/* 🎯 Navigation fixe - 80px */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onPrev}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Précédent
        </button>

        <button
          onClick={isValidPayment ? onNext : undefined}
          disabled={!isValidPayment}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform 
                      shadow-lg min-h-[56px] ${
            !isValidPayment
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
          }`}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

// 🎯 Page secondaire Alma - Choix 2x/3x/4x
function AlmaDetailsPage({ 
  totalAmount, 
  acompte, 
  onBack, 
  onSelect 
}: { 
  totalAmount: number;
  acompte: number;
  onBack: () => void; 
  onSelect: (installments: number) => void; 
}) {
  const restePay = totalAmount - acompte;
  
  const options = [
    { times: 2, label: '2 fois', fee: '1.5%', amount: restePay / 2 },
    { times: 3, label: '3 fois', fee: '2.5%', amount: restePay / 3 },
    { times: 4, label: '4 fois', fee: '3.5%', amount: restePay / 4 }
  ];

  return (
    <div className="w-full h-dvh bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <div className="flex items-center gap-3">
          <img src={AlmaLogo} alt="Alma" className="h-8" />
          <div>
            <h1 className="text-2xl font-bold text-myconfort-dark">Paiement Alma</h1>
            <p className="text-myconfort-dark/70 text-sm">
              Reste à payer: {restePay.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Contenu - Options Alma */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto space-y-4">
          {options.map(option => (
            <button
              key={option.times}
              onClick={() => onSelect(option.times)}
              className="w-full p-6 bg-white rounded-xl border-2 border-gray-300 
                         hover:border-myconfort-green hover:shadow-lg transition-all
                         text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-myconfort-dark">
                    Alma {option.label}
                  </div>
                  <div className="text-myconfort-dark/70">
                    Frais: {option.fee} • {option.amount.toFixed(2)}€ / mois
                  </div>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-start">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}

// 🎯 Page secondaire Chèques - Configuration complète
function ChequesDetailsPage({ 
  totalAmount, 
  acompte, 
  onBack, 
  onComplete 
}: { 
  totalAmount: number;
  acompte: number;
  onBack: () => void; 
  onComplete: (data: { count: number; amount: number; notes: string }) => void; 
}) {
  const restePay = totalAmount - acompte;
  const [chequeCount, setChequeCount] = useState(3);
  const [notes, setNotes] = useState('');
  
  const chequeAmount = Math.floor(restePay / chequeCount);
  const remainder = restePay - (chequeAmount * chequeCount);
  
  const isValid = chequeCount >= 2 && chequeCount <= 10 && chequeAmount > 0;

  return (
    <div className="w-full h-dvh bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📄 Chèques à venir
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Reste à payer: {restePay.toFixed(2)}€
        </p>
      </div>

      {/* Contenu */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-center space-y-6">
        
        {/* Nombre de chèques */}
        <div>
          <label className="block text-lg font-medium text-myconfort-dark mb-3">
            Nombre de chèques
          </label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[2, 3, 4, 5, 6].map(count => (
              <button
                key={count}
                onClick={() => setChequeCount(count)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  chequeCount === count
                    ? 'bg-myconfort-green text-white shadow-lg'
                    : 'bg-white border border-gray-300 hover:border-myconfort-green'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <input
            type="range"
            min="2"
            max="10"
            value={chequeCount}
            onChange={(e) => setChequeCount(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-myconfort-dark mt-2">
            {chequeCount} chèques
          </div>
        </div>

        {/* Calcul automatique */}
        <div className="bg-white p-4 rounded-xl border border-gray-300">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-myconfort-green">
                {chequeAmount}€
              </div>
              <div className="text-sm text-gray-600">Montant par chèque</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {remainder > 0 ? `+${remainder}€` : '✓ Exact'}
              </div>
              <div className="text-sm text-gray-600">
                {remainder > 0 ? 'Sur 1er chèque' : 'Calcul parfait'}
              </div>
            </div>
          </div>
        </div>

        {/* Notes optionnelles */}
        <div>
          <label className="block text-sm font-medium text-myconfort-dark mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Premier chèque à l'installation, suivants tous les 30 jours..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
                       focus:border-myconfort-green focus:outline-none
                       bg-white shadow-sm resize-none"
          />
        </div>

      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Retour
        </button>

        <button
          onClick={isValid ? () => onComplete({ count: chequeCount, amount: chequeAmount, notes }) : undefined}
          disabled={!isValid}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform 
                      shadow-lg min-h-[56px] ${
            !isValid
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
          }`}
        >
          Confirmer →
        </button>
      </div>
    </div>
  );
}
