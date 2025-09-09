// StepPaymentNoScroll.tsx
import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import AlmaLogo from '../../assets/images/Alma_orange.png';
import FloatingFooter from '../../components/ui/FloatingFooter';
import NumericInput from '../../components/NumericInput';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

interface PaymentData {
  method:
    | ''
    | 'Carte Bleue'
    | 'Espèces'
    | 'Virement'
    | 'Chèque'
    | 'Chèque au comptant'
    | 'Chèques (3 fois)'
    | 'Chèque à venir'
    | 'Acompte'
    | 'Alma 2x'
    | 'Alma 3x'
    | 'Alma 4x';
  depositAmount?: number;
  depositMethod?: 'Espèces' | 'Carte Bleue' | 'Chèque comptant' | 'Virement';
  almaInstallments?: number; // 2,3,4
  chequesCount?: number; // 2..10
  chequeAmount?: number;
  notes?: string;
}

export default function StepPaymentNoScroll({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // pages secondaires
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);

  // total TTC à partir des lignes
  const totalAmount: number = (produits ?? []).reduce(
    (
      acc: number,
      p: {
        qty?: number;
        priceTTC?: number;
        discount?: number;
        discountType?: 'fixed' | 'percent';
      }
    ) =>
      acc +
      calculateProductTotal(
        p?.qty || 0,
        p?.priceTTC || 0,
        p?.discount || 0,
        p?.discountType || 'fixed'
      ),
    0
  );

  // état local
  const [selectedMethod, setSelectedMethod] = useState<PaymentData['method']>(
    (paiement?.method as PaymentData['method']) || ''
  );
  const [acompte, setAcompte] = useState<number>(
    (paiement as PaymentData)?.depositAmount || 0
  );
  const [depositMethod, setDepositMethod] = useState<PaymentData['depositMethod']>(
    (paiement as PaymentData)?.depositMethod || 'Espèces'
  );

  const restePay = Math.max(
    0,
    totalAmount - (Number.isFinite(acompte) ? acompte : 0)
  );
  const isValidPayment =
    !!selectedMethod && acompte >= 0 && acompte <= totalAmount && (acompte === 0 || !!depositMethod);

  // helpers
  const savePayment = (data: Partial<PaymentData>) => {
    updatePaiement({
      ...paiement,
      ...data,
      method: (data.method ?? selectedMethod) as PaymentData['method'],
      depositAmount: data.depositAmount ?? acompte,
      depositMethod: data.depositMethod ?? depositMethod,
    });
  };

  // FOOTER / safe-area handling - Version robuste iPad
  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;
  const contentPadBottom = `calc(${FOOTER_H}px + ${footerPadBottom} + 16px)`;

  // secondary pages
  if (showAlmaPage) {
    return (
      <AlmaDetailsPage
        totalAmount={totalAmount}
        acompte={acompte}
        onBack={() => setShowAlmaPage(false)}
        onSelect={installments => {
          const method = `Alma ${installments}x` as PaymentData['method'];
          setSelectedMethod(method);
          savePayment({
            method,
            depositAmount: acompte,
            depositMethod,
            almaInstallments: installments,
          });
          setShowAlmaPage(false);
        }}
      />
    );
  }

  if (showChequesPage) {
    return (
      <ChequesDetailsPage
        totalAmount={totalAmount}
        acompte={acompte}
        defaultCount={Math.min(
          Math.max((paiement as PaymentData)?.chequesCount || 3, 2),
          10
        )}
        defaultNotes={(paiement as PaymentData)?.notes || ''}
        onBack={() => setShowChequesPage(false)}
        onComplete={data => {
          setSelectedMethod('Chèque à venir');
          savePayment({
            method: 'Chèque à venir',
            depositAmount: acompte,
            depositMethod,
            chequesCount: data.count,
            chequeAmount: data.amount,
            notes: data.notes,
          });
          // ✅ CORRECTION: Sauvegarder aussi dans la structure attendue par le store
          updatePaiement({
            method: 'Chèque à venir',
            depositAmount: acompte,
            depositMethod,
            nombreChequesAVenir: data.count, // ← Utiliser nombreChequesAVenir
            note: data.notes, // ← Utiliser 'note' au lieu de 'notes'
          });
          setShowChequesPage(false);
        }}
      />
    );
  }

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10 flex-shrink-0'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          💳 Mode de Règlement
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 4/7 • Total : {totalAmount.toFixed(2)}€ TTC
        </p>
      </div>

      {/* Content scrollable */}
      <div className='flex-1 px-6 py-4 flex flex-col pb-24 min-h-0'>
        {/* summary */}
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
              <div className='text-sm text-myconfort-dark/70'>
                Acompte {acompte > 0 && depositMethod && `(${depositMethod})`}
              </div>
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

        {/* Acompte */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-myconfort-dark mb-2'>
            Acompte (€) *
          </label>
          <div className='grid grid-cols-4 gap-2 mb-3'>
            {[20, 30, 40, 50].map(pct => {
              const suggested = Math.round((totalAmount * pct) / 100);
              return (
                <button
                  key={pct}
                  type='button'
                  onClick={() => setAcompte(suggested)}
                  className='px-3 py-2 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 rounded-lg text-sm font-medium transition-colors'
                >
                  {pct}% ({suggested}€)
                </button>
              );
            })}
          </div>
          <NumericInput
            value={acompte}
            onChange={(value) => setAcompte(Number(value) || 0)}
            min={0}
            max={totalAmount}
            placeholder="0"
            className='w-full text-xl font-bold border-gray-300 focus:border-myconfort-green bg-white shadow-sm text-center'
            aria-label="Montant de l'acompte"
          />
        </div>

        {/* Mode de règlement de l'acompte */}
        {acompte > 0 && (
          <div className='mb-6'>
            <label className='block text-sm font-medium text-myconfort-dark mb-3'>
              Mode de règlement de l'acompte *
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => {
                  setDepositMethod('Espèces');
                  savePayment({ depositMethod: 'Espèces' });
                }}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  depositMethod === 'Espèces'
                    ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-myconfort-green/50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>💵</span>
                  <div className='font-semibold text-sm'>Espèces</div>
                </div>
              </button>

              <button
                type='button'
                onClick={() => {
                  setDepositMethod('Carte Bleue');
                  savePayment({ depositMethod: 'Carte Bleue' });
                }}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  depositMethod === 'Carte Bleue'
                    ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-myconfort-green/50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>💳</span>
                  <div className='font-semibold text-sm'>Carte Bleue</div>
                </div>
              </button>

              <button
                type='button'
                onClick={() => {
                  setDepositMethod('Chèque comptant');
                  savePayment({ depositMethod: 'Chèque comptant' });
                }}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  depositMethod === 'Chèque comptant'
                    ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-myconfort-green/50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>🧾</span>
                  <div className='font-semibold text-sm'>Chèque comptant</div>
                </div>
              </button>

              <button
                type='button'
                onClick={() => {
                  setDepositMethod('Virement');
                  savePayment({ depositMethod: 'Virement' });
                }}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  depositMethod === 'Virement'
                    ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-myconfort-green/50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>🏦</span>
                  <div className='font-semibold text-sm'>Virement</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Payment methods (6) */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {/* Espèces */}
          <PaymentCard
            active={selectedMethod === 'Espèces'}
            title='Espèces'
            subtitle='Paiement comptant'
            emoji='💵'
            onClick={() => {
              setSelectedMethod('Espèces');
              savePayment({ method: 'Espèces', depositAmount: acompte, depositMethod });
            }}
          />

          {/* Virement */}
          <PaymentCard
            active={selectedMethod === 'Virement'}
            title='Virement'
            subtitle='Banque à banque'
            emoji='🏦'
            onClick={() => {
              setSelectedMethod('Virement');
              savePayment({ method: 'Virement', depositAmount: acompte, depositMethod });
            }}
          />

          {/* Carte bleue */}
          <PaymentCard
            active={selectedMethod === 'Carte Bleue'}
            title='Carte bleue'
            subtitle='CB comptant'
            emoji='💳'
            onClick={() => {
              setSelectedMethod('Carte Bleue');
              savePayment({ method: 'Carte Bleue', depositAmount: acompte, depositMethod });
            }}
          />

          {/* Alma */}
          <PaymentCard
            active={selectedMethod?.startsWith('Alma')}
            title={selectedMethod?.startsWith('Alma') ? selectedMethod : 'Alma'}
            subtitle={
              selectedMethod?.startsWith('Alma')
                ? 'Configuré ✓'
                : '2x, 3x ou 4x →'
            }
            custom={<img src={AlmaLogo} alt='Alma' className='h-6' />}
            onClick={() => setShowAlmaPage(true)}
          />

          {/* Chèque comptant */}
          <PaymentCard
            active={selectedMethod === 'Chèque au comptant'}
            title='Chèque (comptant)'
            subtitle='Remis à la commande'
            emoji='🧾'
            onClick={() => {
              setSelectedMethod('Chèque au comptant');
              savePayment({
                method: 'Chèque au comptant',
                depositAmount: acompte,
                depositMethod,
              });
            }}
          />

          {/* Chèques à venir */}
          <PaymentCard
            active={selectedMethod === 'Chèque à venir'}
            title='Chèques à venir'
            subtitle={
              selectedMethod === 'Chèque à venir' && paiement?.nombreChequesAVenir
                ? `${paiement.nombreChequesAVenir} chèques de ${(restePay / (paiement.nombreChequesAVenir || 1)).toFixed(2)}€ chacun`
                : selectedMethod === 'Chèque à venir'
                ? `${(paiement as PaymentData)?.chequesCount || 3} chèques × ${((paiement as PaymentData)?.chequeAmount || 0).toFixed(2)}€`
                : 'Planifier le paiement échelonné →'
            }
            emoji='📄'
            highlight='amber'
            onClick={() => setShowChequesPage(true)}
          />
        </div>
      </div>

      {/* FOOTER FIXE (toujours visible) */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
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
          onClick={isValidPayment ? onNext : () => {}}
          disabled={!isValidPayment}
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${
            !isValidPayment
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-myconfort-green text-white hover:bg-myconfort-green/90'
          }`}
        >
          {!isValidPayment ? '⚠️ Paiement requis' : 'Suivant →'}
        </button>
      </div>

    </div>
  );
}

/* ------------------ Small PaymentCard component ------------------ */
function PaymentCard({
  active,
  title,
  subtitle,
  emoji,
  custom,
  onClick,
  highlight,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  emoji?: string;
  custom?: React.ReactNode;
  onClick: () => void;
  highlight?: 'amber';
}) {
  const activeCls =
    highlight === 'amber'
      ? 'border-amber-500 bg-amber-50 shadow-lg'
      : 'border-myconfort-green bg-myconfort-green/10 shadow-lg';

  return (
    <button
      type='button'
      onClick={onClick}
      className={`p-3 rounded-xl border-2 transition-all w-full text-left ${
        active
          ? activeCls
          : 'border-gray-300 bg-white hover:border-myconfort-green/50'
      }`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {custom ? custom : <span className='text-xl'>{emoji}</span>}
          <div className='font-semibold text-sm'>{title}</div>
        </div>
        <div className='text-xs text-gray-600'>{subtitle}</div>
      </div>
    </button>
  );
}

/* ---------------- PAGES SECONDAIRES ---------------- */
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
  const restePay = Math.max(0, totalAmount - acompte);
  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;
  const contentPadBottom = `calc(${FOOTER_H}px + ${footerPadBottom} + 16px)`;

  const options = [
    { times: 2, label: '2 fois', fee: '1.5%', amount: restePay / 2 },
    { times: 3, label: '3 fois', fee: '2.5%', amount: restePay / 3 },
    { times: 4, label: '4 fois', fee: '3.5%', amount: restePay / 4 },
  ];

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col'>
      <div className='px-6 py-4 border-b border-myconfort-dark/10 flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <img src={AlmaLogo} alt='Alma' className='h-8' />
          <div>
            <h1 className='text-2xl font-bold text-myconfort-dark'>
              Paiement Alma
            </h1>
            <p className='text-myconfort-dark/70 text-sm'>
              Reste à payer : {restePay.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 px-6 py-6 flex flex-col pb-24 min-h-0'>
        <div className='max-w-2xl mx-auto space-y-4'>
          {options.map(option => (
            <button
              key={option.times}
              type='button'
              onClick={() => onSelect(option.times)}
              className='w-full p-6 bg-white rounded-xl border-2 border-gray-300 hover:border-myconfort-green hover:shadow-lg transition-all text-left'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xl font-bold text-myconfort-dark'>
                    Alma {option.label}
                  </div>
                  <div className='text-myconfort-dark/70'>
                    Frais : {option.fee} • {option.amount.toFixed(2)}€ / mois
                  </div>
                </div>
                <div className='text-3xl'>→</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER FIXE */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'>
        <button
          onClick={onBack}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}

function ChequesDetailsPage({
  totalAmount,
  acompte,
  defaultCount = 3,
  defaultNotes = '',
  onBack,
  onComplete,
}: {
  totalAmount: number;
  acompte: number;
  defaultCount?: number;
  defaultNotes?: string;
  onBack: () => void;
  onComplete: (data: { count: number; amount: number; notes: string }) => void;
}) {
  const restePay = Math.max(0, totalAmount - acompte);
  const [chequeCount, setChequeCount] = useState<number>(defaultCount);
  const [notes, setNotes] = useState<string>(defaultNotes);

  // montant par chèque (arrondi inférieur) et reste sur 1er chèque
  const perCheque = Math.floor(restePay / chequeCount);
  const remainder = restePay - perCheque * chequeCount;
  const isValid = chequeCount >= 2 && chequeCount <= 10 && perCheque > 0;

  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;
  const contentPadBottom = `calc(${FOOTER_H}px + ${footerPadBottom} + 16px)`;

  // tabs 2..10
  const tabs = Array.from({ length: 9 }, (_, i) => i + 2);

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col'>
      {/* Header amber */}
      <div className='px-6 py-4 border-b border-amber-500/30 bg-amber-50 flex-shrink-0'>
        <h1 className='text-2xl font-bold text-amber-700'>
          📄 Chèques à venir
        </h1>
        <p className='text-amber-700/80 text-sm'>
          Reste à payer : {restePay.toFixed(2)}€
        </p>
      </div>

      <div className='flex-1 px-6 py-6 space-y-6 flex flex-col pb-24 min-h-0'>
        {/* tabs 2..10 */}
        <div>
          <div className='flex flex-wrap gap-2'>
            {tabs.map(n => (
              <button
                key={n}
                type='button'
                onClick={() => setChequeCount(n)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  chequeCount === n
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white border border-amber-500/40 text-amber-700 hover:bg-amber-50'
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
          <div className='text-sm text-amber-800 mt-2'>
            Choisissez le nombre de chèques (2 à 10)
          </div>
        </div>

        {/* calculation */}
        <div className='bg-white p-4 rounded-xl border border-amber-500/30'>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-amber-700'>
                {perCheque}€
              </div>
              <div className='text-sm text-amber-800/80'>
                Montant par chèque
              </div>
            </div>
            <div>
              <div className='text-lg font-bold text-amber-700'>
                {remainder > 0 ? `+${remainder}€` : '✓ Exact'}
              </div>
              <div className='text-sm text-amber-800/80'>
                {remainder > 0
                  ? 'À ajouter sur le 1er chèque'
                  : 'Répartition parfaite'}
              </div>
            </div>
          </div>
        </div>

        {/* notes */}
        <div>
          <label className='block text-sm font-medium text-amber-800 mb-2'>
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Ex : premier chèque à l'installation, suivants tous les 30 jours…"
            className='w-full px-4 py-3 border-2 border-amber-500/30 rounded-xl focus:border-amber-500 focus:outline-none bg-white shadow-sm resize-none'
          />
        </div>
      </div>

      {/* FOOTER FIXE pour page Chèques */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
        <button
          onClick={onBack}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Retour
        </button>
        <button
          onClick={
            isValid
              ? () => onComplete({ count: chequeCount, amount: perCheque, notes })
              : () => {}
          }
          disabled={!isValid}
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${
            !isValid
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          Confirmer →
        </button>
      </div>
    </div>
  );
}
