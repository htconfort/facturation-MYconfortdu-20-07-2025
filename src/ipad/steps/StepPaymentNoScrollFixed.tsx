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

export default function StepPaymentNoScrollFixed({
  onNext,
  onPrev,
}: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);

  // Calcul du total
  const getTotalAmount = () => {
    return produits.reduce((total: number, produit: any) => {
      return (
        total +
        calculateProductTotal(
          produit.qty,
          produit.priceTTC,
          produit.discount,
          produit.discountType
        )
      );
    }, 0);
  };
  const totalAmount = getTotalAmount();

  // État local pour les sélections
  const [selectedMethod, setSelectedMethod] = useState<string>(
    paiement?.method || ''
  );
  const [acompte, setAcompte] = useState(paiement?.depositAmount || 0);

  const restePay = totalAmount - acompte;
  const isValidPayment =
    selectedMethod && acompte >= 0 && acompte <= totalAmount;

  // Pages secondaires
  if (showAlmaPage) {
    return (
      <AlmaDetailsPage
        totalAmount={totalAmount}
        acompte={acompte}
        onBack={() => setShowAlmaPage(false)}
        onSelect={installments => {
          updatePaiement({
            method: `Alma ${installments}x` as
              | 'Alma 2x'
              | 'Alma 3x'
              | 'Alma 4x', // 🎯 CORRECTION: Utiliser la vraie méthode
            depositAmount: acompte,
            nombreFoisAlma: installments,
            note: `Alma ${installments}x`,
          });
          setSelectedMethod(`Alma ${installments}x`);
          setShowAlmaPage(false);
        }}
      />
    );
  }

  if (showChequesPage) {
    return (
      <ChequesDetailsPage
        totalAmount={totalAmount}
        acomptePersonnalise={acompte} // Passer l'acompte défini par l'utilisateur
        onBack={() => setShowChequesPage(false)}
        onComplete={data => {
          // 🎯 Mise à jour complète avec retour automatique
          updatePaiement({
            method: 'Chèque à venir',
            depositAmount: data.acompte, // Acompte calculé ou personnalisé
            nombreChequesAVenir: data.count,
            note: data.notes,
          });
          setSelectedMethod('Chèque à venir');
          setAcompte(data.acompte); // Mettre à jour l'acompte local
          setShowChequesPage(false); // Retour automatique
        }}
      />
    );
  }

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* 🎯 Header fixe - 60px */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          💳 Mode de Règlement
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 4/7 • Total: {totalAmount.toFixed(2)}€ TTC
        </p>
      </div>

      {/* 🎯 Contenu principal - flex-grow */}
      <div className='flex-1 px-6 py-4 flex flex-col justify-center'>
        {/* Résumé financier */}
        <div className='bg-myconfort-green/10 p-4 rounded-xl border border-myconfort-green/30 mb-6'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-lg font-bold text-myconfort-dark'>
                {totalAmount.toFixed(2)}€
              </div>
              <div className='text-sm text-myconfort-dark/70'>Total TTC</div>
            </div>
            <div>
              <div className='text-lg font-bold text-myconfort-blue'>
                {acompte.toFixed(2)}€
              </div>
              <div className='text-sm text-myconfort-dark/70'>Acompte</div>
            </div>
            <div>
              <div className='text-lg font-bold text-orange-600'>
                {restePay.toFixed(2)}€
              </div>
              <div className='text-sm text-myconfort-dark/70'>
                Reste à payer
              </div>
            </div>
          </div>
        </div>

        {/* Saisie Acompte */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-myconfort-dark mb-2'>
            Acompte (€) * - Minimum 10% = {(totalAmount * 0.1).toFixed(2)}€
          </label>
          <div className='grid grid-cols-4 gap-2 mb-3'>
            {/* Suggestions rapides */}
            {[20, 30, 40, 50].map(pct => {
              const suggested = Math.round((totalAmount * pct) / 100);
              return (
                <button
                  key={pct}
                  onClick={() => setAcompte(suggested)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    Math.abs(acompte - suggested) < 1
                      ? 'bg-myconfort-blue text-white border-2 border-myconfort-blue'
                      : 'bg-myconfort-blue/20 hover:bg-myconfort-blue/30 border-2 border-transparent'
                  }`}
                >
                  {pct}% ({suggested}€)
                </button>
              );
            })}
          </div>
          <div className='flex gap-2'>
            <input
              type='number'
              value={acompte}
              onChange={e => setAcompte(Number(e.target.value))}
              min={Math.round(totalAmount * 0.1)}
              max={totalAmount}
              className='flex-1 px-4 py-3 text-xl font-bold border-2 border-gray-300 
                         rounded-xl focus:border-myconfort-green focus:outline-none
                         bg-white shadow-sm text-center'
              placeholder={`Min: ${(totalAmount * 0.1).toFixed(2)}€`}
            />
            <button
              onClick={() => setAcompte(Math.round(totalAmount * 0.1))}
              className='px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white 
                         rounded-xl font-medium transition-colors whitespace-nowrap'
              title='Acompte minimum (10%)'
            >
              10% min
            </button>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className='grid grid-cols-3 gap-4'>
          {/* Espèces */}
          <button
            onClick={() => {
              setSelectedMethod('Espèces');
              updatePaiement({ method: 'Espèces', depositAmount: acompte });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Espèces'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className='text-2xl mb-2'>💵</div>
            <div className='font-semibold'>Espèces</div>
            <div className='text-sm text-gray-600'>Paiement comptant</div>
          </button>

          {/* Carte Bleue */}
          <button
            onClick={() => {
              setSelectedMethod('Carte Bleue');
              updatePaiement({ method: 'Carte Bleue', depositAmount: acompte });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Carte Bleue'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className='text-2xl mb-2'>💳</div>
            <div className='font-semibold'>Carte Bleue</div>
            <div className='text-sm text-gray-600'>Paiement CB</div>
          </button>

          {/* Virement */}
          <button
            onClick={() => {
              setSelectedMethod('Virement');
              updatePaiement({ method: 'Virement', depositAmount: acompte });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Virement'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className='text-2xl mb-2'>🏦</div>
            <div className='font-semibold'>Virement</div>
            <div className='text-sm text-gray-600'>Banque à banque</div>
          </button>

          {/* Chèque au comptant */}
          <button
            onClick={() => {
              setSelectedMethod('Chèque au comptant');
              updatePaiement({
                method: 'Chèque au comptant',
                depositAmount: acompte,
              });
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Chèque au comptant'
                ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                : 'border-gray-300 bg-white hover:border-myconfort-green/50'
            }`}
          >
            <div className='text-2xl mb-2'>📝</div>
            <div className='font-semibold'>Chèque comptant</div>
            <div className='text-sm text-gray-600'>Chèque unique</div>
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
            <div className='flex items-center justify-center mb-2'>
              <img src={AlmaLogo} alt='Alma' className='h-8' />
            </div>
            <div className='font-semibold'>
              {selectedMethod?.startsWith('Alma') ? selectedMethod : 'Alma'}
            </div>
            <div className='text-sm text-gray-600'>
              {selectedMethod?.startsWith('Alma')
                ? 'Configuré ✓'
                : '2x, 3x ou 4x →'}
            </div>
          </button>

          {/* Chèques - Ouvre page secondaire - COULEUR SPÉCIALE */}
          <button
            onClick={() => setShowChequesPage(true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'Chèque à venir'
                ? 'border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-300'
                : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
            }`}
          >
            <div className='text-2xl mb-2'>📄</div>
            <div className='font-semibold text-blue-800'>
              {selectedMethod === 'Chèque à venir'
                ? 'Chèques configurés'
                : 'Chèques à venir'}
            </div>
            <div className='text-sm text-blue-600'>
              {selectedMethod === 'Chèque à venir' ? (
                <div className='space-y-1'>
                  <div>
                    <strong>
                      {paiement?.nombreChequesAVenir || 0} chèques
                    </strong>
                  </div>
                  <div>
                    {(paiement?.nombreChequesAVenir || 0) > 0 &&
                      `${Math.round((totalAmount - acompte) / (paiement?.nombreChequesAVenir || 1))}€ chacun`}
                  </div>
                  <div className='text-xs'>Acompte: {acompte.toFixed(2)}€</div>
                </div>
              ) : (
                'Nombre + montants →'
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 🚀 BOUTONS FLOTTANTS - Dans le cadre iPad, remontés de 2cm */}
      <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
        <button
          onClick={onPrev}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Précédent
        </button>
        <div className='flex flex-col items-center'>
          <div className='bg-white px-3 py-1 rounded-full shadow-lg mb-1'>
            <div className='text-xs text-gray-500 font-manrope'>Étape 4/7</div>
          </div>
        </div>
        <button
          onClick={isValidPayment ? onNext : undefined}
          disabled={!isValidPayment}
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${
            !isValidPayment
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-myconfort-green text-white hover:bg-myconfort-green/90'
          }`}
        >
          {!isValidPayment ? '⚠️ Sélection requise' : 'Suivant →'}
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
  onSelect,
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
    { times: 4, label: '4 fois', fee: '3.5%', amount: restePay / 4 },
  ];

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <div className='flex items-center gap-3'>
          <img src={AlmaLogo} alt='Alma' className='h-8' />
          <div>
            <h1 className='text-2xl font-bold text-myconfort-dark'>
              Paiement Alma
            </h1>
            <p className='text-myconfort-dark/70 text-sm'>
              Reste à payer: {restePay.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Contenu - Options Alma */}
      <div className='flex-1 px-6 py-6 flex flex-col justify-center'>
        <div className='max-w-2xl mx-auto space-y-4'>
          {options.map(option => (
            <button
              key={option.times}
              onClick={() => onSelect(option.times)}
              className='w-full p-6 bg-white rounded-xl border-2 border-gray-300 
                         hover:border-myconfort-green hover:shadow-lg transition-all
                         text-left'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xl font-bold text-myconfort-dark'>
                    Alma {option.label}
                  </div>
                  <div className='text-myconfort-dark/70'>
                    Frais: {option.fee} • {option.amount.toFixed(2)}€ / mois
                  </div>
                </div>
                <div className='text-3xl'>→</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className='px-6 py-4 border-t border-myconfort-dark/10 flex justify-start'>
        <button
          onClick={onBack}
          className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]'
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
  acomptePersonnalise,
  onBack,
  onComplete,
}: {
  totalAmount: number;
  acomptePersonnalise?: number;
  onBack: () => void;
  onComplete: (data: {
    count: number;
    amount: number;
    notes: string;
    acompte: number;
  }) => void;
}) {
  const [chequeCount, setChequeCount] = useState(3);
  const [notes, setNotes] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // 🎯 NOUVELLE LOGIQUE : Utiliser l'acompte personnalisé OU calculer automatiquement
  const acompteMinimum = totalAmount * 0.1;
  const isValid = chequeCount >= 1 && chequeCount <= 10;

  const handleChequeCountChange = (count: number) => {
    setChequeCount(count);
    setIsCalculating(true);

    // 🎯 RETOUR AUTOMATIQUE : Calculer et confirmer immédiatement
    setTimeout(() => {
      let acompteDefinitifFinal: number;
      let montantChequeFinal: number;

      if (acomptePersonnalise && acomptePersonnalise >= totalAmount * 0.1) {
        // Utiliser l'acompte personnalisé
        acompteDefinitifFinal = acomptePersonnalise;
        const montantRestant = totalAmount - acompteDefinitifFinal;
        montantChequeFinal = Math.round(montantRestant / count);
      } else {
        // Calcul automatique
        const montantRond = Math.round(totalAmount / count);
        const totalCheques = montantRond * count;
        const acompteCalc = totalAmount - totalCheques;
        const acompteMin = totalAmount * 0.1;
        acompteDefinitifFinal = Math.max(acompteCalc, acompteMin);
        const montantRestant = totalAmount - acompteDefinitifFinal;
        montantChequeFinal = Math.round(montantRestant / count);
      }

      // Confirmer automatiquement
      onComplete({
        count: count,
        amount: montantChequeFinal,
        acompte: acompteDefinitifFinal,
        notes: `${count} chèques de ${montantChequeFinal}€ + acompte ${acompteDefinitifFinal.toFixed(2)}€ (${acomptePersonnalise ? 'acompte personnalisé' : 'calculé automatiquement'})`,
      });
    }, 500); // Petit délai pour voir la sélection
  };

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          📄 Chèques à venir
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Total: {totalAmount.toFixed(2)}€ • Règle: chèques ronds + acompte 10%
          minimum
        </p>
      </div>

      {/* Contenu */}
      <div className='flex-1 px-6 py-6 flex flex-col justify-center space-y-6'>
        {/* 🎯 10 BOUTONS pour nombre de chèques */}
        <div>
          <label className='block text-lg font-medium text-myconfort-dark mb-3'>
            Nombre de chèques (de 1 à 10) - Sélection automatique
          </label>
          {isCalculating && (
            <div className='mb-3 p-2 bg-blue-100 border border-blue-300 rounded-lg text-center'>
              <span className='text-blue-800 font-medium'>
                🧮 Calcul en cours...
              </span>
            </div>
          )}
          <div className='grid grid-cols-5 gap-2'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
              <button
                key={count}
                onClick={() => handleChequeCountChange(count)}
                disabled={isCalculating}
                className={`py-3 rounded-xl font-bold transition-all ${
                  chequeCount === count
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                    : isCalculating
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {count}x
              </button>
            ))}
          </div>
          <p className='text-sm text-blue-600 mt-2'>
            💡 Cliquez sur un nombre pour calculer automatiquement l'acompte et
            revenir au mode de règlement
          </p>
        </div>

        {/* 🎯 EXPLICATION DU CALCUL AUTOMATIQUE */}
        <div className='bg-blue-50 p-4 rounded-xl border-2 border-blue-200'>
          <h4 className='font-bold text-blue-800 mb-2 flex items-center'>
            <span className='mr-2'>🧮</span>
            Calcul automatique (chèques ronds + acompte 10% minimum)
          </h4>
          <div className='text-sm text-blue-700 space-y-1'>
            <div>
              <strong>Total TTC :</strong> {totalAmount.toFixed(2)}€
            </div>
            <div>
              <strong>Nombre de chèques :</strong> {chequeCount}
            </div>
            <div>
              <strong>Acompte minimum (10%) :</strong>{' '}
              {acompteMinimum.toFixed(2)}€
            </div>
            {(() => {
              let acompteCalculeFinal: number;
              let montantChequeFinal: number;

              if (
                acomptePersonnalise &&
                acomptePersonnalise >= totalAmount * 0.1
              ) {
                // Utiliser l'acompte personnalisé
                acompteCalculeFinal = acomptePersonnalise;
                const montantRestant = totalAmount - acompteCalculeFinal;
                montantChequeFinal = Math.round(montantRestant / chequeCount);
              } else {
                // Calcul automatique
                const montantRond = Math.round(totalAmount / chequeCount);
                const totalCheques = montantRond * chequeCount;
                const acompteCalc = totalAmount - totalCheques;
                const acompteMin = totalAmount * 0.1;
                acompteCalculeFinal = Math.max(acompteCalc, acompteMin);
                const montantRestant = totalAmount - acompteCalculeFinal;
                montantChequeFinal = Math.round(montantRestant / chequeCount);
              }

              const acompteCalculeBrut =
                totalAmount -
                Math.round(totalAmount / chequeCount) * chequeCount;

              return (
                <>
                  <div>
                    <strong>Acompte calculé :</strong>{' '}
                    {acompteCalculeBrut.toFixed(2)}€
                  </div>
                  <div
                    className={`font-bold ${acompteCalculeFinal >= acompteMinimum ? 'text-blue-800' : 'text-orange-600'}`}
                  >
                    <strong>Acompte final :</strong>{' '}
                    {acompteCalculeFinal.toFixed(2)}€
                    {acompteCalculeFinal > acompteCalculeBrut &&
                      ' (ajusté à 10% minimum)'}
                  </div>
                  <div>
                    <strong>Montant par chèque (rond) :</strong>{' '}
                    {montantChequeFinal.toFixed(2)}€
                  </div>
                  <div>
                    <strong>Total des chèques :</strong>{' '}
                    {(montantChequeFinal * chequeCount).toFixed(2)}€
                  </div>
                </>
              );
            })()}
          </div>
          {!isCalculating && (
            <div className='mt-2 p-2 bg-blue-100 rounded-lg'>
              <p className='text-blue-800 text-sm font-medium'>
                ✨ Cliquez sur un nombre ci-dessus pour confirmer et revenir
                automatiquement
              </p>
            </div>
          )}
        </div>

        {/* Notes optionnelles */}
        <div>
          <label className='block text-sm font-medium text-myconfort-dark mb-2'>
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Premier chèque à l'installation, suivants tous les 30 jours..."
            rows={3}
            className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
                       focus:border-myconfort-green focus:outline-none
                       bg-white shadow-sm resize-none'
          />
        </div>
      </div>

      {/* Navigation */}
      <div className='px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center'>
        <button
          onClick={onBack}
          className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]'
        >
          ← Retour
        </button>

        <button
          onClick={
            isValid
              ? () => {
                  // Calculer les valeurs finales
                  let acompteCalculeFinal: number;
                  let montantChequeFinal: number;

                  if (
                    acomptePersonnalise &&
                    acomptePersonnalise >= totalAmount * 0.1
                  ) {
                    // Utiliser l'acompte personnalisé
                    acompteCalculeFinal = acomptePersonnalise;
                    const montantRestant = totalAmount - acompteCalculeFinal;
                    montantChequeFinal = Math.round(
                      montantRestant / chequeCount
                    );
                  } else {
                    // Calcul automatique
                    const montantRond = Math.round(totalAmount / chequeCount);
                    const totalCheques = montantRond * chequeCount;
                    const acompteCalc = totalAmount - totalCheques;
                    const acompteMin = totalAmount * 0.1;
                    acompteCalculeFinal = Math.max(acompteCalc, acompteMin);
                    const montantRestant = totalAmount - acompteCalculeFinal;
                    montantChequeFinal = Math.round(
                      montantRestant / chequeCount
                    );
                  }

                  onComplete({
                    count: chequeCount,
                    amount: montantChequeFinal,
                    acompte: acompteCalculeFinal,
                    notes:
                      notes ||
                      `${chequeCount} chèques de ${montantChequeFinal}€ + acompte ${acompteCalculeFinal.toFixed(2)}€`,
                  });
                }
              : undefined
          }
          disabled={!isValid}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform 
                      shadow-lg min-h-[56px] ${
                        !isValid
                          ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
                          : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
                      }`}
        >
          {!isValid ? 'Sélectionnez un nombre de chèques' : 'Confirmer →'}
        </button>
      </div>
    </div>
  );
}
