// StepPaymentFixed.tsx - Solution ultra-simple avec scroll garanti
import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import type { PartialPayment } from '../../store/useInvoiceWizard';
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
  almaInstallments?: number;
  chequesCount?: number;
  chequeAmount?: number;
  notes?: string;
}

export default function StepPaymentFixed({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Pages secondaires
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);
  const [showPartialPage, setShowPartialPage] = useState(false);

  // Constantes pour le layout
  const HEADER_H = 80;   // hauteur header (px) - augmentée pour plus d'espace
  const FOOTER_H = 100;  // hauteur footer (px) - augmentée pour plus d'espace

  // Total TTC à partir des lignes
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

  // État local
  const [selectedMethod, setSelectedMethod] = useState<PaymentData['method']>(
    (paiement?.method as PaymentData['method']) || ''
  );
  const [acompte, setAcompte] = useState<number>(
    (paiement as PaymentData)?.depositAmount || 0
  );
  const [depositMethod, setDepositMethod] = useState<PaymentData['depositMethod']>(
    (paiement as PaymentData)?.depositMethod || 'Espèces'
  );
  // Flag explicite une fois le panneau "Chèques à venir" complété
  const [chequesConfigured, setChequesConfigured] = useState<boolean>(
    (paiement?.method as PaymentData['method']) === 'Chèque à venir'
  );

  const restePay = Math.max(
    0,
    totalAmount - (Number.isFinite(acompte) ? acompte : 0)
  );
  const isValidPayment =
    !!selectedMethod &&
    acompte >= 0 &&
    acompte <= totalAmount &&
    (acompte === 0 || !!depositMethod) &&
    // Si chèque à venir, s'assurer que la config a bien été validée
    (selectedMethod !== 'Chèque à venir' || chequesConfigured === true);

  // Helpers
  const savePayment = (data: Partial<PaymentData>) => {
    updatePaiement({
      ...paiement,
      ...data,
      method: (data.method ?? selectedMethod) as PaymentData['method'],
      depositAmount: data.depositAmount ?? acompte,
      depositMethod: data.depositMethod ?? depositMethod,
    });
  };

  // Pages secondaires
  if (showPartialPage) {
    return (
      <PartialPaymentPage
        totalAmount={restePay}
        onBack={() => setShowPartialPage(false)}
        onSave={partialPayments => {
          savePayment({
            method: 'Règlement Partiel',
            depositAmount: acompte,
            depositMethod,
            partialPayments,
          });
          setSelectedMethod('Règlement Partiel');
          setShowPartialPage(false);
        }}
        existingPartialPayments={paiement?.partialPayments || []}
      />
    );
  }

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
          updatePaiement({
            method: 'Chèque à venir',
            depositAmount: acompte,
            depositMethod,
            nombreChequesAVenir: data.count,
            note: data.notes,
            chequeLocation: data.chequeLocation,
          });
          setChequesConfigured(true);
          setShowChequesPage(false);
        }}
      />
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100svh',             // <- au lieu de 100%
      backgroundColor: '#F2EFE2',
      position: 'relative',
      overflow: 'visible',           // <- NE PAS bloquer le scroll interne
      WebkitTapHighlightColor: 'transparent'
    }}>
      {/* Header fixe */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid rgba(20, 40, 29, 0.1)',
        backgroundColor: '#F2EFE2',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: HEADER_H,            // <-- fige la hauteur pour calc précis
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#14281D',
          margin: 0,
          marginBottom: '4px'
        }}>
          💳 Mode de Règlement
        </h1>
        <p style={{
          color: 'rgba(20, 40, 29, 0.7)',
          fontSize: '14px',
          margin: 0
        }}>
          Étape 4/7 • Total : {totalAmount.toFixed(2)}€ TTC
        </p>
      </div>

      {/* --- CONTENU SCROLLABLE (calé entre header et footer) --- */}
      <div style={{
        position: 'absolute',
        top: HEADER_H,                              // 80px
        left: 0,
        right: 0,
        bottom: FOOTER_H,                           // 100px
        padding: '16px',
        overflowY: 'auto',                         // <- Scroll automatique si nécessaire
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingBottom: `calc(${FOOTER_H}px + 32px)`, // espace suffisant pour les notes
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 180px)'            // hauteur minimale garantie
      }}>
        {/* Résumé */}
        <div style={{
          backgroundColor: 'rgba(71, 122, 12, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(71, 122, 12, 0.3)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#14281D'
              }}>
                {totalAmount.toFixed(2)}€
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(20, 40, 29, 0.7)'
              }}>
                Total TTC
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#89BBFE'
              }}>
                {acompte.toFixed(2)}€
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(20, 40, 29, 0.7)'
              }}>
                Acompte {acompte > 0 && depositMethod && `(${depositMethod})`}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#F55D3E'
              }}>
                {restePay.toFixed(2)}€
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(20, 40, 29, 0.7)'
              }}>
                Reste à payer
              </div>
            </div>
          </div>
        </div>

        {/* Acompte */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#14281D',
            marginBottom: '6px'
          }}>
            Acompte (€) *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {/* Modes acompte en carrés compacts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '8px' }}>
              {[
                { key: 'Espèces', label: 'E' },
                { key: 'Carte Bleue', label: 'CB' },
                { key: 'Chèque comptant', label: 'CH' },
              ].map(({ key, label }) => {
                const isActive = depositMethod === key;
                const disabled = (acompte || 0) <= 0;
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={key}
                    onClick={() => {
                      setDepositMethod(key as PaymentData['depositMethod']);
                      if ((acompte || 0) > 0) {
                        savePayment({ depositMethod: key as PaymentData['depositMethod'] });
                      }
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? '#477A0C' : '#D1D5DB'}`,
                      backgroundColor: isActive ? 'rgba(71, 122, 12, 0.12)' : 'white',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      opacity: disabled && !isActive ? 0.5 : 1
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#14281D' }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Montant acompte compact */}
            <div style={{ width: '140px' }}>
              <NumericInput
                value={acompte}
                onChange={(value) => setAcompte(Number(value) || 0)}
                min={0}
                max={totalAmount}
                placeholder="0"
                className="w-full h-10 text-base font-semibold border-gray-300 focus:border-myconfort-green bg-white shadow-sm text-center"
                aria-label="Montant de l'acompte"
              />
            </div>
          </div>
        </div>


        {/* --- ZONE PROBLÉMATIQUE → conteneur dédié scroll-friendly --- */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#14281D',
            marginBottom: '8px'
          }}>
            Mode de règlement du reste *
          </label>

          {/* Astuce : on autorise la grille à grandir, et c'est le conteneur principal
             (ci-dessus) qui scroll. On ajoute un petit padding-bottom local pour
             éviter tout recouvrement par bordure/bottom fade éventuel. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            alignContent: 'start',
            paddingBottom: 8
          }}>
              {/* Espèces */}
              <PaymentCard
                active={selectedMethod === 'Espèces'}
                title="Espèces"
                subtitle="Paiement comptant"
                emoji="💵"
                onClick={() => {
                  setSelectedMethod('Espèces');
                  savePayment({ method: 'Espèces', depositAmount: acompte, depositMethod });
                }}
              />

              {/* Virement */}
              <PaymentCard
                active={selectedMethod === 'Virement'}
                title="Virement"
                subtitle="Banque à banque"
                emoji="🏦"
                onClick={() => {
                  setSelectedMethod('Virement');
                  savePayment({ method: 'Virement', depositAmount: acompte, depositMethod });
                }}
              />

              {/* Carte bleue */}
              <PaymentCard
                active={selectedMethod === 'Carte Bleue'}
                title="Carte bleue"
                subtitle="CB comptant"
                emoji="💳"
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
                custom={<img src={AlmaLogo} alt="Alma" style={{ height: '24px' }} />}
                onClick={() => setShowAlmaPage(true)}
              />

              {/* Chèque comptant */}
              <PaymentCard
                active={selectedMethod === 'Chèque au comptant'}
                title="Chèque (comptant)"
                subtitle="Remis à la commande"
                emoji="🧾"
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
                title="Chèques à venir"
                subtitle={
                  selectedMethod === 'Chèque à venir' && paiement?.nombreChequesAVenir
                    ? `${paiement.nombreChequesAVenir} chèques de ${(restePay / (paiement.nombreChequesAVenir || 1)).toFixed(2)}€ chacun`
                    : selectedMethod === 'Chèque à venir'
                    ? `${(paiement as PaymentData)?.chequesCount || 3} chèques × ${((paiement as PaymentData)?.chequeAmount || 0).toFixed(2)}€`
                    : 'Planifier le paiement échelonné →'
                }
                emoji="📄"
                highlight="amber"
                onClick={() => setShowChequesPage(true)}
              />

              {/* 🆕 Lieu de remise du chèque - visible uniquement si "Chèque à venir" sélectionné */}
              {selectedMethod === 'Chèque à venir' && (
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '2px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#B45309',
                    marginBottom: '12px'
                  }}>
                    Lieu de remise du chèque
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newLocation = paiement?.chequeLocation === 'bureau' ? undefined : 'bureau';
                        updatePaiement({ chequeLocation: newLocation });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: paiement?.chequeLocation === 'bureau' ? '2px solid #F59E0B' : '2px solid rgba(245, 158, 11, 0.3)',
                        backgroundColor: paiement?.chequeLocation === 'bureau' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={paiement?.chequeLocation === 'bureau'}
                        readOnly
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#F59E0B',
                          cursor: 'pointer',
                          pointerEvents: 'none'
                        }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: paiement?.chequeLocation === 'bureau' ? '#B45309' : '#6B7280'
                      }}>
                        Au bureau
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newLocation = paiement?.chequeLocation === 'sur_place' ? undefined : 'sur_place';
                        updatePaiement({ chequeLocation: newLocation });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: paiement?.chequeLocation === 'sur_place' ? '2px solid #F59E0B' : '2px solid rgba(245, 158, 11, 0.3)',
                        backgroundColor: paiement?.chequeLocation === 'sur_place' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={paiement?.chequeLocation === 'sur_place'}
                        readOnly
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#F59E0B',
                          cursor: 'pointer',
                          pointerEvents: 'none'
                        }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: paiement?.chequeLocation === 'sur_place' ? '#B45309' : '#6B7280'
                      }}>
                        Sur place
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Règlement Partiel - NOUVEAU */}
              <PaymentCard
                active={selectedMethod === 'Règlement Partiel'}
                title="Règlement Partiel"
                subtitle={
                  selectedMethod === 'Règlement Partiel' && paiement?.partialPayments?.length
                    ? `${paiement.partialPayments.length} paiements configurés`
                    : 'Diviser entre plusieurs personnes →'
                }
                emoji="👥"
                highlight="blue"
                onClick={() => setShowPartialPage(true)}
              />
          </div>

          {/* 🆕 Champ de notes générales */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '16px',
            marginTop: '20px',
            border: '2px solid rgba(71, 122, 12, 0.2)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#477A0C',
              marginBottom: '12px'
            }}>
              📝 Notes générales (optionnel)
            </label>
            <textarea
              value={paiement?.note || ''}
              onChange={e => updatePaiement({ note: e.target.value })}
              rows={4}
              placeholder="Ajoutez des notes spécifiques pour cette facture..."
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid rgba(71, 122, 12, 0.3)',
                borderRadius: '12px',
                backgroundColor: '#F9FAFB',
                resize: 'vertical',
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                minHeight: '120px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#477A0C'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(71, 122, 12, 0.3)'}
            />
            <div style={{
              fontSize: '12px',
              color: '#6B7280',
              marginTop: '8px',
              textAlign: 'right'
            }}>
              {paiement?.note?.length || 0} caractères
            </div>
          </div>
        </div>

        {/* ❌ Supprimé : le faux spacer 100px (inutile grâce au paddingBottom) */}
        {/* <div style={{ height: '100px' }} /> */}
      </div>

      {/* Footer fixe aligné Step 3 */}
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
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${isValidPayment ? 'bg-myconfort-green text-white hover:bg-myconfort-green/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          title={!isValidPayment && selectedMethod === 'Chèque à venir' && !chequesConfigured ? 'Configurer les chèques (1x..10x)' : ''}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

/* ------------------ PaymentCard component ------------------ */
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
  highlight?: 'amber' | 'blue';
}) {
  const activeColor = highlight === 'amber' ? '#F59E0B' : highlight === 'blue' ? '#3B82F6' : '#477A0C';
  const activeBg = highlight === 'amber' ? 'rgba(245, 158, 11, 0.1)' : highlight === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(71, 122, 12, 0.1)';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px',
        borderRadius: '12px',
        border: `2px solid ${active ? activeColor : '#D1D5DB'}`,
        backgroundColor: active ? activeBg : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: active ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'rgba(71, 122, 12, 0.5)';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#D1D5DB';
        }
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {custom ? custom : <span style={{ fontSize: '20px' }}>{emoji}</span>}
        <div style={{
          fontWeight: '600',
          fontSize: '14px',
          color: '#14281D'
        }}>
          {title}
        </div>
      </div>
      <div style={{
        fontSize: '12px',
        color: '#6B7280'
      }}>
        {subtitle}
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

  const options = [
    { times: 2, label: '2 fois', fee: '1.5%', amount: restePay / 2 },
    { times: 3, label: '3 fois', fee: '2.5%', amount: restePay / 3 },
    { times: 4, label: '4 fois', fee: '3.5%', amount: restePay / 4 },
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#F2EFE2',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header fixe */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(20, 40, 29, 0.1)',
        backgroundColor: '#F2EFE2',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img src={AlmaLogo} alt="Alma" style={{ height: '32px' }} />
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#14281D',
              margin: 0,
              marginBottom: '4px'
            }}>
              Paiement Alma
            </h1>
            <p style={{
              color: 'rgba(20, 40, 29, 0.7)',
              fontSize: '14px',
              margin: 0
            }}>
              Reste à payer : {restePay.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: 0,
        right: 0,
        bottom: '100px',
        padding: '24px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{
          maxWidth: '512px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {options.map(option => (
            <button
              key={option.times}
              type="button"
              onClick={() => onSelect(option.times)}
              style={{
                width: '100%',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #D1D5DB',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#477A0C';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#14281D'
                  }}>
                    Alma {option.label}
                  </div>
                  <div style={{
                    color: 'rgba(20, 40, 29, 0.7)'
                  }}>
                    Frais : {option.fee} • {option.amount.toFixed(2)}€ / mois
                  </div>
                </div>
                <div style={{ fontSize: '24px' }}>→</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer fixe */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F2EFE2',
        borderTop: '1px solid rgba(20, 40, 29, 0.1)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            borderRadius: '25px',
            backgroundColor: 'white',
            border: '2px solid #D1D5DB',
            fontSize: '16px',
            fontWeight: '500',
            color: '#14281D',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
  onComplete: (data: { count: number; amount: number; notes: string; chequeLocation?: 'bureau' | 'sur_place' }) => void;
}) {
  const restePay = Math.max(0, totalAmount - acompte);
  const [chequeCount, setChequeCount] = useState<number>(defaultCount);
  const [notes, setNotes] = useState<string>(defaultNotes);
  const [chequeLocation, setChequeLocation] = useState<'bureau' | 'sur_place' | ''>('');

  // Montant par chèque (arrondi inférieur) et reste sur 1er chèque
  const perCheque = Math.floor(restePay / chequeCount);
  const remainder = restePay - perCheque * chequeCount;
  const isValid = chequeCount >= 1 && chequeCount <= 10 && perCheque > 0;

  // Tabs 1..10 (ajout de 1x pour un seul chèque)
  const tabs = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#F2EFE2',
      position: 'relative',
      overflow: 'auto'  // Permet le scroll sur iPad
    }}>
      {/* Header fixe */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#B45309',
          margin: 0,
          marginBottom: '4px'
        }}>
          📄 Chèques à venir
        </h1>
        <p style={{
          color: 'rgba(180, 83, 9, 0.8)',
          fontSize: '14px',
          margin: 0
        }}>
          Reste à payer : {restePay.toFixed(2)}€
        </p>
      </div>

      {/* Contenu scrollable */}
      <div style={{
        marginTop: '80px',               // Espace pour le header
        marginBottom: '140px',           // Espace pour le footer
        padding: '24px',
        overflowY: 'scroll',             // Force le scroll vertical
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        paddingBottom: '80px',           // Espace important pour les notes
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 220px)' // Hauteur minimale garantie
      }}>
        {/* Tabs 2..10 */}
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {tabs.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setChequeCount(n)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  border: chequeCount === n ? 'none' : '1px solid rgba(245, 158, 11, 0.4)',
                  cursor: 'pointer',
                  backgroundColor: chequeCount === n ? '#F59E0B' : 'white',
                  color: chequeCount === n ? 'white' : '#B45309',
                  boxShadow: chequeCount === n ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (chequeCount !== n) {
                    e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (chequeCount !== n) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {n}x
              </button>
            ))}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#B45309',
            marginTop: '8px'
          }}>
            Choisissez le nombre de chèques (1 à 10)
          </div>
        </div>

        {/* Calcul */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#B45309'
              }}>
                {perCheque}€
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(180, 83, 9, 0.8)'
              }}>
                Montant par chèque
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#B45309'
              }}>
                {remainder > 0 ? `+${remainder}€` : '✓ Exact'}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(180, 83, 9, 0.8)'
              }}>
                {remainder > 0
                  ? 'À ajouter sur le 1er chèque'
                  : 'Répartition parfaite'}
              </div>
            </div>
          </div>
        </div>

        {/* Lieu de remise du chèque */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#B45309',
            marginBottom: '12px'
          }}>
            Lieu de remise du chèque
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => setChequeLocation(chequeLocation === 'bureau' ? '' : 'bureau')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                border: chequeLocation === 'bureau' ? '2px solid #F59E0B' : '2px solid rgba(245, 158, 11, 0.3)',
                backgroundColor: chequeLocation === 'bureau' ? 'rgba(245, 158, 11, 0.1)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={chequeLocation === 'bureau'}
                readOnly
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#F59E0B',
                  cursor: 'pointer',
                  pointerEvents: 'none'
                }}
              />
              <span style={{
                fontSize: '16px',
                fontWeight: '500',
                color: chequeLocation === 'bureau' ? '#B45309' : '#6B7280'
              }}>
                Au bureau
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChequeLocation(chequeLocation === 'sur_place' ? '' : 'sur_place')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                border: chequeLocation === 'sur_place' ? '2px solid #F59E0B' : '2px solid rgba(245, 158, 11, 0.3)',
                backgroundColor: chequeLocation === 'sur_place' ? 'rgba(245, 158, 11, 0.1)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={chequeLocation === 'sur_place'}
                readOnly
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#F59E0B',
                  cursor: 'pointer',
                  pointerEvents: 'none'
                }}
              />
              <span style={{
                fontSize: '16px',
                fontWeight: '500',
                color: chequeLocation === 'sur_place' ? '#B45309' : '#6B7280'
              }}>
                Sur place
              </span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#B45309',
            marginBottom: '12px'
          }}>
            📝 Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Ex : premier chèque à l'installation, suivants tous les 30 jours…"
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              backgroundColor: 'white',
              resize: 'vertical',
              fontSize: '16px',
              fontFamily: 'inherit',
              outline: 'none',
              minHeight: '120px',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#F59E0B'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'}
          />
          <div style={{
            fontSize: '12px',
            color: '#6B7280',
            marginTop: '8px',
            textAlign: 'right'
          }}>
            {notes.length} caractères
          </div>
        </div>
      </div>

      {/* Footer fixe */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderTop: '1px solid rgba(245, 158, 11, 0.3)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 10,
        height: '120px',                // Hauteur fixe du footer
        boxSizing: 'border-box'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            borderRadius: '25px',
            backgroundColor: 'white',
            border: '2px solid #D1D5DB',
            fontSize: '16px',
            fontWeight: '500',
            color: '#14281D',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          ← Retour
        </button>
        <button
          onClick={
            isValid
              ? () => onComplete({ count: chequeCount, amount: perCheque, notes, chequeLocation: chequeLocation || undefined })
              : () => {}
          }
          disabled={!isValid}
          style={{
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: isValid ? '#F59E0B' : '#EF4444',
            color: 'white',
            border: 'none',
            opacity: isValid ? 1 : 0.9
          }}
          onMouseOver={(e) => {
            if (isValid) {
              e.currentTarget.style.backgroundColor = '#D97706';
            }
          }}
          onMouseOut={(e) => {
            if (isValid) {
              e.currentTarget.style.backgroundColor = '#F59E0B';
            }
          }}
        >
          Confirmer →
        </button>
      </div>
    </div>
  );
}

/* ------------------ PartialPaymentPage Component ------------------ */
function PartialPaymentPage({
  totalAmount,
  onBack,
  onSave,
  existingPartialPayments = [],
}: {
  totalAmount: number;
  onBack: () => void;
  onSave: (partialPayments: PartialPayment[]) => void;
  existingPartialPayments: PartialPayment[];
}) {
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>(
    existingPartialPayments.length > 0 
      ? existingPartialPayments 
      : [{ method: 'Carte Bleue', amount: 0, personName: '' }]
  );

  const currentTotal = partialPayments.reduce((sum, p) => sum + p.amount, 0);
  const isValid = Math.abs(currentTotal - totalAmount) < 0.01 && partialPayments.every(p => p.amount > 0);

  const addPayment = () => {
    setPartialPayments([...partialPayments, { method: 'Espèces', amount: 0, personName: '' }]);
  };

  const removePayment = (index: number) => {
    if (partialPayments.length > 1) {
      setPartialPayments(partialPayments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: keyof PartialPayment, value: string | number) => {
    const updated = [...partialPayments];
    if (field === 'amount') {
      updated[index] = { ...updated[index], [field]: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPartialPayments(updated);
  };

  const paymentMethods: PartialPayment['method'][] = ['Carte Bleue', 'Espèces', 'Virement', 'Chèque au comptant'];

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-myconfort-dark">👥 Règlement Partiel</h1>
            <p className="text-sm text-myconfort-dark/70">
              Total à répartir : {totalAmount.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Résumé */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total configuré :</span>
              <span className={`font-bold text-lg ${
                Math.abs(currentTotal - totalAmount) < 0.01 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentTotal.toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Reste à répartir :</span>
              <span className={`font-medium ${
                Math.abs(totalAmount - currentTotal) < 0.01 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {(totalAmount - currentTotal).toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Liste des paiements */}
          <div className="space-y-4">
            {partialPayments.map((payment, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-myconfort-dark">
                    Paiement #{index + 1}
                  </h3>
                  {partialPayments.length > 1 && (
                    <button
                      onClick={() => removePayment(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Méthode de paiement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Méthode
                    </label>
                    <select
                      value={payment.method}
                      onChange={e => updatePayment(index, 'method', e.target.value as PartialPayment['method'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.amount || ''}
                      onChange={e => updatePayment(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Nom de la personne */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personne (optionnel)
                    </label>
                    <input
                      type="text"
                      value={payment.personName || ''}
                      onChange={e => updatePayment(index, 'personName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nom de la personne"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton ajouter */}
          <button
            onClick={addPayment}
            className="w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-colors"
          >
            ➕ Ajouter un paiement
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-4 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
          >
            ← Retour
          </button>
          <button
            onClick={() => onSave(partialPayments)}
            disabled={!isValid}
            className={`flex-1 px-6 py-3 font-medium rounded-xl transition-colors ${
              isValid
                ? 'bg-myconfort-green hover:bg-myconfort-green/90 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isValid ? '✓ Valider' : '⚠️ Montants incorrects'}
          </button>
        </div>
      </div>
    </div>
  );
}
