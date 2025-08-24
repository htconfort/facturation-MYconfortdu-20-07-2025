import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { chequeFriendlyDeposits } from '../../utils/chequeMath';
import { useMemo } from 'react';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

type PaymentMethodValue =
  | 'Chèque à venir'
  | 'Espèces'
  | 'Virement'
  | 'Carte Bleue'
  | 'Chèque'
  | 'Chèque au comptant'
  | 'Acompte';

// Mode de règlement autorisés pour l'acompte (évite les cast "as")
type DepositPaymentMethod = 'Carte Bleue' | 'Espèces' | 'Chèque';

const paymentMethods: Array<{
  value: PaymentMethodValue;
  label: string;
  icon: string;
  iconType?: 'emoji' | 'svg' | 'png';
  priority?: boolean;
}> = [
  {
    value: 'Chèque à venir',
    label: 'Chèque à venir',
    icon: '/payment-icons/cheque.svg',
    iconType: 'svg',
    priority: true,
  },
  {
    value: 'Espèces',
    label: 'Espèces',
    icon: '/payment-icons/especes.svg',
    iconType: 'svg',
  },
  {
    value: 'Virement',
    label: 'Virement bancaire',
    icon: '/payment-icons/virement.svg',
    iconType: 'svg',
  },
  {
    value: 'Carte Bleue',
    label: 'Carte Bleue',
    icon: '/payment-icons/carte-bleue.svg',
    iconType: 'svg',
  },
  {
    value: 'Chèque',
    label: 'Chèque unique',
    icon: '/payment-icons/cheque.svg',
    iconType: 'svg',
  },
  {
    value: 'Chèque au comptant',
    label: 'Chèque au comptant',
    icon: '/payment-icons/cheque.svg',
    iconType: 'svg',
  },
  {
    value: 'Acompte',
    label: 'Alma',
    icon: '/Alma_orange.png',
    iconType: 'png',
  },
];

// --- helpers ---------------------------------------------------------------
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);
const safeNumber = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const formatEUR = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    n
  );

// Types de remise attendus dans le projet :
type DiscountType = 'percent' | 'fixed';

// Normalisation rétro-compatibilité : certaines données anciennes peuvent encore contenir "amount"
const normalizeDiscountType = (t: unknown): DiscountType =>
  t === 'fixed' ? 'fixed' : t === 'percent' ? 'percent' : 'fixed'; // "amount" => "fixed" par défaut

// TODO ▲ Si TVA ≠ 20 %, remplacer la ligne HT = TTC / (1 + TVA_RATE) par un calcul TVA par ligne.
export default function StepPaiement({ onNext, onPrev, onQuit }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Centralisation du taux de TVA pour future-proof (Phase 2 validée à 20 %)
  const TVA_RATE = 0.2 as const;

  // total TTC (avec remises) — mémoïsé
  const totalTTC = useMemo(() => {
    return produits.reduce((sum, p) => {
      return (
        sum +
        calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          normalizeDiscountType(p.discountType as unknown) // 'amount' hérité → 'fixed'
        )
      );
    }, 0);
  }, [produits]);

  const depositAmount = clamp(safeNumber(paiement.depositAmount), 0, totalTTC);
  const remainingAmount = Math.max(0, totalTTC - depositAmount);
  const nombreCheques = clamp(
    safeNumber(paiement.nombreChequesAVenir || 10),
    1,
    10
  );

  // Variables pour Alma (paiement en plusieurs fois)
  const nombreFoisAlma = clamp(safeNumber(paiement.nombreFoisAlma || 3), 2, 4);

  // 🎯 NOUVELLE LOGIQUE : Chèques ronds + acompte ajusté (minimum 10%)
  // 1. Calculer le montant ROND par chèque sur le total TTC
  const montantChequeRond =
    nombreCheques > 0 ? Math.round(totalTTC / nombreCheques) : 0;

  // 2. Calculer l'acompte automatiquement pour que le total soit exact
  const totalChequesCalcule = montantChequeRond * nombreCheques;
  const acompteCalculeBrut = totalTTC - totalChequesCalcule;

  // 3. ⚠️ RÈGLE IMPORTANTE : Acompte minimum 10% du total TTC
  const acompteMinimum = totalTTC * 0.1;
  const acompteAjuste = Math.max(acompteCalculeBrut, acompteMinimum);

  // 4. Recalculer le montant par chèque si l'acompte a été ajusté
  const montantRestantApresCetAcompte = totalTTC - acompteAjuste;
  const montantChequeDefinitif =
    nombreCheques > 0
      ? Math.round(montantRestantApresCetAcompte / nombreCheques)
      : montantChequeRond;

  // 5. Utiliser le montant définitif pour l'affichage
  const montantParCheque =
    nombreCheques > 0
      ? paiement.method === 'Chèque à venir'
        ? montantChequeDefinitif // ✨ Montant ROND avec acompte 10% minimum
        : remainingAmount / nombreCheques
      : 0;

  // Calcul pour Alma (division du total par le nombre de fois)
  const montantParFoisAlma = nombreFoisAlma > 0 ? totalTTC / nombreFoisAlma : 0;

  // Validation plus sûre (type guard)
  const isValid =
    typeof paiement.method === 'string' && paiement.method.trim().length > 0;

  // Suggestions pour chèques sans virgule
  const chequeSuggestions =
    paiement.method === 'Chèque à venir'
      ? chequeFriendlyDeposits(totalTTC, nombreCheques)
      : [];

  const hasAnyDiscount = produits.some(p => safeNumber(p.discount) > 0);
  const discountsTotal = useMemo(() => {
    return produits.reduce((sum, p) => {
      const original = safeNumber(p.qty) * safeNumber(p.priceTTC);
      const withDiscount = calculateProductTotal(
        p.qty,
        p.priceTTC,
        p.discount || 0,
        normalizeDiscountType(p.discountType as unknown)
      );
      return sum + (original - withDiscount);
    }, 0);
  }, [produits]);

  const handleDepositChange = (amount: number) => {
    const valid = clamp(safeNumber(amount), 0, totalTTC);
    updatePaiement({
      depositAmount: valid,
      remainingAmount: totalTTC - valid,
    });
  };

  const handleNombreChequesChange = (nombre: number) => {
    const nouveauNombre = clamp(safeNumber(nombre), 1, 10);

    // 🎯 NOUVEAU : Calcul automatique de l'acompte avec minimum 10%
    if (paiement.method === 'Chèque à venir') {
      const montantRondParCheque = Math.round(totalTTC / nouveauNombre);
      const totalDesChequesRonds = montantRondParCheque * nouveauNombre;
      const acompteCalculeBrut = totalTTC - totalDesChequesRonds;

      // Règle des 10% minimum
      const acompteMinimum = totalTTC * 0.1;
      const acompteDefinitif = Math.max(acompteCalculeBrut, acompteMinimum);

      // Mettre à jour le nombre de chèques ET l'acompte en une fois
      updatePaiement({
        nombreChequesAVenir: nouveauNombre,
        depositAmount: acompteDefinitif,
      });
    } else {
      updatePaiement({ nombreChequesAVenir: nouveauNombre });
    }
  };

  const handleNombreFoisAlmaChange = (nombreFois: number) => {
    updatePaiement({ nombreFoisAlma: clamp(safeNumber(nombreFois), 2, 4) });
  };

  // Validation pour le mode de règlement de l'acompte
  const validateAndNext = () => {
    // Vérifier si un acompte est défini et si son mode de règlement est obligatoire
    if (depositAmount > 0 && !paiement.depositPaymentMethod) {
      alert(
        "Veuillez sélectionner le mode de règlement pour l'acompte avant de continuer."
      );
      return;
    }

    // Autres validations existantes
    if (!isValid) {
      alert('Veuillez sélectionner un mode de paiement avant de continuer.');
      return;
    }

    onNext();
  };

  return (
    <div className='max-w-6xl mx-auto py-8'>
      {/* Header */}
      <div className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-8 mb-8 border border-gray-100'>
        <h1 className='text-3xl font-bold text-[#F2EFE2] mb-6 flex items-center justify-center'>
          <span className='bg-[#F2EFE2] text-[#477A0C] px-8 py-4 rounded-full font-bold text-2xl'>
            💳 MODALITÉS DE PAIEMENT
          </span>
        </h1>

        {/* Bouton Quitter optionnel si onQuit fourni */}
        {typeof onQuit === 'function' && (
          <div className='flex justify-center mb-4'>
            <button
              type='button'
              onClick={onQuit}
              className='px-4 py-2 rounded-lg border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold'
              aria-label="Quitter l'étape Paiement"
              title="Quitter l'étape Paiement"
            >
              Quitter
            </button>
          </div>
        )}

        <div className='bg-[#F2EFE2] rounded-lg p-8'>
          <p className='text-center text-gray-700 text-lg mb-6'>
            Choisissez le mode de règlement — spécialité : paiement échelonné
          </p>

          <div className='max-w-5xl mx-auto space-y-8'>
            {/* Montant récap */}
            <section className='bg-white rounded-2xl shadow-xl p-6'>
              <h3 className='text-xl font-semibold text-gray-800 mb-4'>
                💰 Montant de la commande
              </h3>
              <div className='bg-gray-50 rounded-xl p-6'>
                <div className='flex justify-between items-center text-lg mb-2'>
                  <span>Total HT</span>
                  <span className='font-semibold'>
                    {formatEUR(totalTTC / (1 + TVA_RATE))}
                  </span>
                </div>
                <div className='flex justify-between items-center text-lg mb-2'>
                  <span>TVA (20%)</span>
                  <span className='font-semibold'>
                    {formatEUR(totalTTC - totalTTC / (1 + TVA_RATE))}
                  </span>
                </div>

                {hasAnyDiscount && (
                  <div className='flex justify-between items-center text-lg mb-2 text-green-600'>
                    <span>Remises appliquées</span>
                    <span className='font-semibold'>
                      -{formatEUR(discountsTotal)}
                    </span>
                  </div>
                )}

                <div className='border-t border-gray-300 pt-2'>
                  <div className='flex justify-between items-center text-2xl font-bold text-[#477A0C]'>
                    <span>Total TTC</span>
                    <span>{formatEUR(totalTTC)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Mode de règlement */}
            <section className='bg-white rounded-2xl shadow-xl p-6'>
              <h3 className='text-xl font-semibold text-gray-800 mb-6'>
                💳 Mode de règlement
              </h3>

              <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl'>
                {paymentMethods.map(method => {
                  const selected = paiement.method === method.value;
                  const base =
                    'p-6 rounded-xl border-2 transition-all transform hover:scale-105 focus:outline-none';
                  const priority = method.priority
                    ? ' border-blue-500 bg-blue-50 shadow-lg'
                    : '';
                  const state = selected
                    ? ' border-[#477A0C] bg-[#477A0C] text-white shadow-2xl ring-4 ring-[#477A0C]/30'
                    : method.priority
                      ? ' hover:border-[#477A0C] hover:bg-green-50'
                      : ' border-gray-200 hover:border-[#477A0C] hover:bg-green-50';

                  return (
                    <button
                      key={method.value}
                      type='button'
                      aria-pressed={selected}
                      aria-label={method.label}
                      title={method.label}
                      onClick={() => {
                        updatePaiement({ method: method.value });
                        // Si Alma est sélectionnée, définir automatiquement le mode de règlement sur Carte Bleue
                        if (method.value === 'Acompte') {
                          updatePaiement({
                            depositPaymentMethod: 'Carte Bleue',
                          });
                        }
                      }}
                      className={`${base}${priority}${state}`}
                    >
                      <div className='mb-2 flex justify-center'>
                        {method.iconType === 'svg' ||
                        method.iconType === 'png' ? (
                          <img
                            src={method.icon}
                            alt={method.label}
                            className='h-12 w-auto'
                          />
                        ) : (
                          <div className='text-3xl'>{method.icon}</div>
                        )}
                      </div>
                      <div
                        className={`font-semibold ${selected ? 'text-white' : 'text-gray-800'}`}
                      >
                        {method.label}
                      </div>
                      {method.priority && (
                        <div
                          className={`mt-1 text-xs font-medium ${
                            selected ? 'text-green-100' : 'text-blue-600'
                          }`}
                        >
                          ⭐ Populaire
                        </div>
                      )}
                      {selected && (
                        <div className='mt-2 text-green-100 font-bold'>
                          ✓ Sélectionné
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Acompte */}
            <section className='bg-white rounded-2xl shadow-xl p-6'>
              <h3 className='text-xl font-semibold text-gray-800 mb-6'>
                💰 Acompte initial
              </h3>

              {/* Choix rapides */}
              <div className='mb-6'>
                <label className='block text-gray-700 font-semibold mb-3'>
                  Acompte suggéré (%)
                </label>
                <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                  {[0, 10, 20, 30, 50].map(percentage => {
                    const amount = (totalTTC * percentage) / 100;
                    const active = Math.abs(depositAmount - amount) < 0.5;
                    return (
                      <button
                        key={percentage}
                        type='button'
                        onClick={() => handleDepositChange(amount)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          active
                            ? 'border-[#477A0C] bg-green-50 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-[#477A0C] hover:bg-green-50'
                        }`}
                      >
                        <div className='font-bold text-lg'>{percentage}%</div>
                        <div className='text-sm text-gray-600'>
                          {formatEUR(amount)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saisie manuelle */}
              <div className='mb-6'>
                <label className='block text-gray-700 font-semibold mb-3'>
                  Montant d&apos;acompte personnalisé
                </label>
                <div className='flex items-center space-x-4'>
                  <input
                    type='number'
                    inputMode='decimal'
                    value={Number.isFinite(depositAmount) ? depositAmount : 0}
                    onChange={e =>
                      handleDepositChange(safeNumber(e.target.value))
                    }
                    className='flex-1 h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all'
                    placeholder='0'
                    max={totalTTC}
                    min={0}
                    step='0.01'
                    aria-label="Montant d'acompte personnalisé"
                    title="Montant d'acompte personnalisé"
                  />
                  <span className='text-xl font-semibold text-gray-600'>€</span>
                </div>
              </div>

              {/* Mode de règlement de l'acompte - OBLIGATOIRE */}
              {depositAmount > 0 && (
                <div className='mb-6'>
                  <label className='block text-gray-700 font-semibold mb-3'>
                    Mode de règlement de l&apos;acompte:{' '}
                    <span className='text-red-600'>*</span>
                  </label>
                  <select
                    value={paiement.depositPaymentMethod || ''}
                    onChange={e => {
                      const value = e.target.value;
                      updatePaiement({
                        depositPaymentMethod:
                          value === ''
                            ? undefined
                            : (value as DepositPaymentMethod),
                      });
                    }}
                    className={`w-full h-16 rounded-xl border-2 px-6 text-lg font-bold focus:ring-4 transition-all ${
                      !paiement.depositPaymentMethod
                        ? 'border-red-500 bg-red-50 text-red-800 focus:border-red-600 focus:ring-red-200'
                        : 'border-green-500 bg-green-50 text-green-800 focus:border-green-600 focus:ring-green-200'
                    }`}
                    aria-label="Mode de règlement de l'acompte"
                  >
                    <option value='' className='text-red-800 font-bold'>
                      ⚠️ Sélectionner le mode de règlement
                    </option>
                    <option
                      value='Carte Bleue'
                      className='text-blue-800 font-bold'
                    >
                      💳 Carte Bleue
                    </option>
                    <option
                      value='Espèces'
                      className='text-green-800 font-bold'
                    >
                      💵 Espèces
                    </option>
                    <option
                      value='Chèque'
                      className='text-purple-800 font-bold'
                    >
                      🧾 Chèque
                    </option>
                  </select>
                  {!paiement.depositPaymentMethod && (
                    <p className='text-red-600 text-sm font-bold mt-2 flex items-center'>
                      ⚠️ Le mode de règlement de l'acompte est obligatoire
                    </p>
                  )}
                </div>
              )}

              {/* Récap visuel */}
              <div className='bg-gray-50 rounded-xl p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='text-center p-4 bg-blue-100 rounded-xl'>
                    <div className='text-2xl font-bold text-blue-800'>
                      {formatEUR(depositAmount)}
                    </div>
                    <div className='text-blue-600 font-semibold'>
                      Acompte à verser
                    </div>
                    <div className='text-sm text-blue-500'>
                      {totalTTC > 0
                        ? `${Math.round((depositAmount / totalTTC) * 100)}%`
                        : '0%'}{' '}
                      du total
                    </div>
                    {depositAmount > 0 && paiement.depositPaymentMethod && (
                      <div className='mt-2 text-xs text-blue-700 font-bold'>
                        {paiement.depositPaymentMethod === 'Carte Bleue' &&
                          '💳 Carte Bleue'}
                        {paiement.depositPaymentMethod === 'Espèces' &&
                          '💵 Espèces'}
                        {paiement.depositPaymentMethod === 'Chèque' &&
                          '🧾 Chèque'}
                      </div>
                    )}
                  </div>
                  <div className='text-center p-4 bg-orange-100 rounded-xl'>
                    <div className='text-2xl font-bold text-orange-800'>
                      {formatEUR(remainingAmount)}
                    </div>
                    <div className='text-orange-600 font-semibold'>
                      Reste à régler
                    </div>
                    <div className='text-sm text-orange-500'>
                      Selon modalités choisies
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Chèques multiples */}
            {paiement.method === 'Chèque à venir' && (
              <section className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-300'>
                <h3 className='text-xl font-semibold text-blue-800 mb-6 flex items-center'>
                  <span className='text-2xl mr-3'>📄</span>
                  Paiement échelonné en chèques
                </h3>

                {/* Nombre de chèques */}
                <div className='mb-6'>
                  <label className='block text-blue-700 font-semibold mb-3'>
                    Nombre de chèques (de 1 à 10)
                  </label>
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        type='button'
                        onClick={() => handleNombreChequesChange(n)}
                        className={`flex-1 min-w-[80px] p-2 rounded-lg border-2 font-bold transition-all text-sm ${
                          nombreCheques === n
                            ? 'border-blue-600 bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                            : 'border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🎯 EXPLICATION DU NOUVEAU CALCUL */}
                {nombreCheques > 0 && (
                  <div className='mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl'>
                    <h4 className='font-bold text-green-800 mb-2 flex items-center'>
                      <span className='mr-2'>🧮</span>
                      Calcul automatique (chèques ronds)
                    </h4>
                    <div className='text-sm text-green-700 space-y-1'>
                      <div>
                        <strong>Total TTC :</strong> {formatEUR(totalTTC)}
                      </div>
                      <div>
                        <strong>Nombre de chèques :</strong> {nombreCheques}
                      </div>
                      <div>
                        <strong>Acompte minimum (10%) :</strong>{' '}
                        {formatEUR(acompteMinimum)}
                      </div>
                      <div>
                        <strong>Acompte calculé :</strong>{' '}
                        {formatEUR(acompteCalculeBrut)}
                      </div>
                      <div
                        className={`font-bold ${acompteAjuste >= acompteMinimum ? 'text-green-800' : 'text-orange-600'}`}
                      >
                        <strong>Acompte final :</strong>{' '}
                        {formatEUR(acompteAjuste)}
                        {acompteAjuste > acompteCalculeBrut &&
                          ' (ajusté à 10% minimum)'}
                      </div>
                      <div>
                        <strong>Montant par chèque (rond) :</strong>{' '}
                        {formatEUR(montantChequeDefinitif)}
                      </div>
                      <div>
                        <strong>Total des chèques :</strong>{' '}
                        {formatEUR(montantChequeDefinitif * nombreCheques)}
                      </div>
                    </div>
                    {acompteAjuste >= 0 && (
                      <button
                        type='button'
                        onClick={() => handleDepositChange(acompteAjuste)}
                        className='mt-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition'
                      >
                        Appliquer cet acompte ({formatEUR(acompteAjuste)})
                      </button>
                    )}
                  </div>
                )}

                {/* Acomptes magiques pour chèques sans virgule */}
                {chequeSuggestions.length > 0 && (
                  <div className='mt-6 space-y-3'>
                    <h4 className='font-semibold text-blue-800 flex items-center gap-2'>
                      🧮 Acomptes pour chèques "ronds" (sans virgule)
                    </h4>
                    <p className='text-sm text-blue-700'>
                      Choisissez un acompte qui rend chaque chèque un{' '}
                      <strong>montant entier d'euros</strong>.
                    </p>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
                      {chequeSuggestions.map(s => {
                        const active =
                          Math.abs((paiement.depositAmount || 0) - s.deposit) <
                          0.5;
                        return (
                          <button
                            key={`${s.nCheques}-${s.deposit}`}
                            type='button'
                            onClick={() => handleDepositChange(s.deposit)}
                            className={`p-3 rounded-xl border-2 text-left transition ${
                              active
                                ? 'border-[#477A0C] bg-green-50 ring-2 ring-green-200'
                                : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                            title={`Avec cet acompte, chaque chèque = ${s.perCheque.toFixed(0)} €`}
                          >
                            <div className='text-xs text-blue-700'>Acompte</div>
                            <div className='font-bold text-blue-900'>
                              {s.deposit.toFixed(2)} €
                            </div>
                            <div className='text-xs text-blue-600'>
                              Chèque:{' '}
                              <strong>{s.perCheque.toFixed(0)} €</strong> ×{' '}
                              {s.nCheques}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Simulation */}
                {remainingAmount > 0 && nombreCheques > 0 && (
                  <div className='bg-white rounded-xl p-6 border border-blue-200'>
                    <h4 className='font-bold text-blue-800 mb-4 flex items-center'>
                      <span className='mr-2'>📊</span>
                      Simulation de votre échéancier
                    </h4>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                      <div className='bg-green-100 p-4 rounded-lg border border-green-300'>
                        <div className='text-sm font-semibold text-green-700'>
                          Acompte initial
                        </div>
                        <div className='text-xl font-bold text-green-800'>
                          {formatEUR(depositAmount)}
                        </div>
                        <div className='text-xs text-green-600'>
                          À la commande
                        </div>
                      </div>

                      {[1, 2, 3]
                        .slice(0, Math.min(nombreCheques, 3))
                        .map(index => (
                          <div
                            key={index}
                            className='bg-blue-100 p-4 rounded-lg border border-blue-300'
                          >
                            <div className='text-sm font-semibold text-blue-700'>
                              Chèque #{index}
                            </div>
                            <div className='text-xl font-bold text-blue-800'>
                              {formatEUR(montantParCheque)}
                            </div>
                            <div className='text-xs text-blue-600'>
                              {index === 1
                                ? 'À 30j'
                                : index === 2
                                  ? 'À 60j'
                                  : 'À 90j'}
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                        <div>
                          <div className='text-sm text-blue-600'>
                            Nombre de chèques
                          </div>
                          <div className='text-lg font-bold text-blue-800'>
                            {nombreCheques}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-blue-600'>
                            Montant par chèque
                          </div>
                          <div className='text-lg font-bold text-blue-800'>
                            {formatEUR(montantParCheque)}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-blue-600'>
                            Total chèques
                          </div>
                          <div className='text-lg font-bold text-blue-800'>
                            {formatEUR(remainingAmount)}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-blue-600'>Durée max</div>
                          <div className='text-lg font-bold text-blue-800'>
                            {nombreCheques} mois
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 p-3 bg-green-50 rounded-lg border border-green-200'>
                      <div className='text-sm text-green-700'>
                        ✅ <strong>Avantage :</strong> aucun frais
                        supplémentaire • flexibilité • confort d&apos;achat
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Section Alma - Paiement en plusieurs fois */}
            {paiement.method === 'Acompte' && (
              <section className='bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-xl p-6 border-2 border-orange-300'>
                <h3 className='text-xl font-semibold text-orange-800 mb-6 flex items-center'>
                  <img
                    src='/Alma_orange.png'
                    alt='Alma'
                    className='h-8 w-auto mr-3'
                  />
                  Paiement Alma en plusieurs fois
                </h3>

                {/* Choix du nombre de fois */}
                <div className='mb-6'>
                  <label className='block text-orange-700 font-semibold mb-3'>
                    Paiement en plusieurs fois (2, 3 ou 4 fois)
                  </label>
                  <div className='grid grid-cols-3 gap-4 mb-4'>
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        type='button'
                        onClick={() => handleNombreFoisAlmaChange(n)}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${
                          nombreFoisAlma === n
                            ? 'border-orange-600 bg-orange-100 text-orange-800 ring-2 ring-orange-300'
                            : 'border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        <div className='text-2xl font-bold'>{n}x</div>
                        <div className='text-sm'>
                          {n === 2
                            ? 'En 2 fois'
                            : n === 3
                              ? 'En 3 fois'
                              : 'En 4 fois'}
                        </div>
                        <div className='text-lg font-bold text-green-600'>
                          {formatEUR(totalTTC / n)}
                        </div>
                        <div className='text-xs text-gray-600'>
                          par versement
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation Alma */}
                {totalTTC > 0 && nombreFoisAlma > 0 && (
                  <div className='bg-white rounded-xl p-6 border border-orange-200'>
                    <h4 className='font-bold text-orange-800 mb-4 flex items-center'>
                      <span className='mr-2'>📊</span>
                      Simulation de votre échéancier Alma
                    </h4>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                      {Array.from({ length: nombreFoisAlma }, (_, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            index === 0
                              ? 'bg-green-100 border-green-300'
                              : 'bg-orange-100 border-orange-300'
                          }`}
                        >
                          <div
                            className={`text-sm font-semibold ${
                              index === 0 ? 'text-green-700' : 'text-orange-700'
                            }`}
                          >
                            {index === 0
                              ? "Aujourd'hui"
                              : `Dans ${index * 30} jours`}
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              index === 0 ? 'text-green-800' : 'text-orange-800'
                            }`}
                          >
                            {formatEUR(montantParFoisAlma)}
                          </div>
                          <div
                            className={`text-xs ${
                              index === 0 ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {index === 0
                              ? 'À la commande'
                              : `Versement ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='bg-orange-50 rounded-lg p-4 border border-orange-200'>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                        <div>
                          <div className='text-sm text-orange-600'>
                            Nombre de versements
                          </div>
                          <div className='text-lg font-bold text-orange-800'>
                            {nombreFoisAlma}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-orange-600'>
                            Montant par versement
                          </div>
                          <div className='text-lg font-bold text-orange-800'>
                            {formatEUR(montantParFoisAlma)}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-orange-600'>Total</div>
                          <div className='text-lg font-bold text-orange-800'>
                            {formatEUR(totalTTC)}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm text-orange-600'>
                            Durée max
                          </div>
                          <div className='text-lg font-bold text-orange-800'>
                            {nombreFoisAlma * 30} jours
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                      <div className='text-sm text-blue-700'>
                        ✅ <strong>Avantage Alma :</strong> paiement sécurisé •
                        frais transparents • validation instantanée
                      </div>
                    </div>

                    <div className='mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                      <div className='text-sm text-yellow-700'>
                        ℹ️ <strong>Information :</strong> Le premier versement
                        est prélevé immédiatement, les suivants à intervalles de
                        30 jours.
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Notes */}
            <section className='bg-white rounded-2xl shadow-xl p-6'>
              <h3 className='text-xl font-semibold text-gray-800 mb-4'>
                📝 Remarques sur le paiement
              </h3>
              <textarea
                value={paiement.note || ''}
                onChange={e => updatePaiement({ note: e.target.value })}
                className='w-full h-24 rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all resize-none'
                placeholder='Instructions particulières, conditions spéciales, échéances personnalisées...'
              />
            </section>

            {/* Navigation - format ultra-compact harmonisé */}
            <div className='flex gap-2 justify-center'>
              <button
                onClick={onPrev}
                className='px-4 py-2 rounded-lg border-2 border-gray-300 text-sm font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all min-h-[40px]'
              >
                ← Produits
              </button>

              {isValid ? (
                <button
                  onClick={validateAndNext}
                  className='px-4 py-2 rounded-lg text-sm font-medium font-manrope transition-all min-h-[40px] bg-myconfort-green text-white hover:bg-myconfort-green/90 shadow-lg'
                >
                  Continuer vers Livraison →
                </button>
              ) : (
                <button
                  disabled
                  className='px-4 py-2 rounded-lg text-sm font-medium font-manrope transition-all min-h-[40px] bg-myconfort-coral text-white cursor-not-allowed opacity-70'
                  title='Veuillez sélectionner un mode de règlement pour continuer'
                >
                  ⚠️ Mode de règlement requis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
