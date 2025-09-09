// StepPaymentProfessional.tsx - Version professionnelle avec scroll garanti
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

export default function StepPaymentProfessional({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Pages secondaires
  const [showAlmaPage, setShowAlmaPage] = useState(false);
  const [showChequesPage, setShowChequesPage] = useState(false);

  // Constantes pour le layout
  const HEADER_H = 100;  // Header plus haut pour le design pro
  const FOOTER_H = 120;  // Footer plus haut pour les gros boutons

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

  // Sauvegarde
  const savePayment = useCallback((data: Partial<PaymentData>) => {
    updatePaiement({
      ...paiement,
      ...data,
      depositAmount: acompte,
      depositMethod,
    });
  }, [updatePaiement, paiement, acompte, depositMethod]);

  // Boutons pourcentages pour l'acompte
  const percentageButtons = [20, 30, 40, 50].map(percent => ({
    percent,
    amount: Math.round(totalAmount * percent / 100)
  }));

  // Méthodes de paiement pour l'acompte
  const depositMethods = [
    { id: 'Espèces', label: 'Espèces', emoji: '💵', subtitle: 'Paiement comptant' },
    { id: 'Carte Bleue', label: 'Carte Bleue', emoji: '💳', subtitle: 'CB immédiate' },
    { id: 'Chèque comptant', label: 'Chèque', emoji: '🧾', subtitle: 'Remis maintenant' },
    { id: 'Virement', label: 'Virement', emoji: '🏦', subtitle: 'Banque à banque' },
  ];

  // Méthodes de paiement pour le reste
  const remainingMethods = [
    { id: 'Espèces', label: 'Espèces', emoji: '💵', subtitle: 'Paiement comptant' },
    { id: 'Virement', label: 'Virement', emoji: '🏦', subtitle: 'Banque à banque' },
    { id: 'Carte Bleue', label: 'Carte Bleue', emoji: '💳', subtitle: 'CB immédiate' },
    { id: 'Chèque au comptant', label: 'Chèque (comptant)', emoji: '🧾', subtitle: 'Remis maintenant' },
  ];

  return (
    <div style={{
      width: '100%',
      height: '100svh',
      backgroundColor: '#F2EFE2',
      position: 'relative',
      overflow: 'visible',
      WebkitTapHighlightColor: 'transparent',
      fontFamily: 'Manrope, sans-serif'
    }}>
      
      {/* ===== HEADER PROFESSIONNEL ===== */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_H,
        background: 'linear-gradient(135deg, #477A0C 0%, #5a8f0f 100%)',
        borderBottom: '3px solid #477A0C',
        boxSizing: 'border-box',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          💳 Mode de Règlement
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontWeight: '500'
          }}>
            Étape 4/7
          </p>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Total : {totalAmount.toFixed(2)}€ TTC
            </span>
          </div>
        </div>
      </div>

      {/* ===== CONTENU SCROLLABLE ===== */}
      <div style={{
        position: 'absolute',
        top: HEADER_H,
        left: 0,
        right: 0,
        bottom: FOOTER_H,
        padding: '32px',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingBottom: `calc(${FOOTER_H}px + 32px)`,
        boxSizing: 'border-box'
      }}>
        
        {/* ===== RÉSUMÉ FINANCIER ===== */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(71, 122, 12, 0.08) 0%, rgba(71, 122, 12, 0.12) 100%)',
          padding: '24px',
          borderRadius: '16px',
          border: '2px solid rgba(71, 122, 12, 0.2)',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(71, 122, 12, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#477A0C',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total TTC
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#14281D'
              }}>
                {totalAmount.toFixed(2)}€
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#477A0C',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Acompte
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: acompte > 0 ? '#477A0C' : '#666'
              }}>
                {acompte.toFixed(2)}€
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#477A0C',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Reste à payer
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#14281D'
              }}>
                {restePay.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION ACOMPTE ===== */}
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '16px',
          marginBottom: '32px',
          border: '1px solid rgba(71, 122, 12, 0.15)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#14281D',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            💰 Acompte demandé
          </h3>

          {/* Boutons pourcentages */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {percentageButtons.map(({ percent, amount }) => (
              <button
                key={percent}
                onClick={() => setAcompte(amount)}
                style={{
                  padding: '16px 8px',
                  borderRadius: '12px',
                  border: acompte === amount ? '2px solid #477A0C' : '2px solid rgba(71, 122, 12, 0.2)',
                  backgroundColor: acompte === amount ? 'rgba(71, 122, 12, 0.1)' : 'white',
                  color: acompte === amount ? '#477A0C' : '#14281D',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '56px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{percent}%</span>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {amount}€
                </span>
              </button>
            ))}
          </div>

          {/* Input personnalisé */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#14281D',
              marginBottom: '12px'
            }}>
              Montant personnalisé (€)
            </label>
            <NumericInput
              value={acompte}
              onChange={setAcompte}
              min={0}
              max={totalAmount}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '18px',
                borderRadius: '12px',
                border: '2px solid rgba(71, 122, 12, 0.2)',
                backgroundColor: 'white',
                color: '#14281D',
                fontWeight: '600'
              }}
            />
          </div>

          {/* Mode de règlement de l'acompte */}
          {acompte > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#14281D',
                marginBottom: '16px'
              }}>
                Mode de règlement de l'acompte *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {depositMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setDepositMethod(method.id)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: depositMethod === method.id ? '2px solid #477A0C' : '2px solid rgba(71, 122, 12, 0.2)',
                      backgroundColor: depositMethod === method.id ? 'rgba(71, 122, 12, 0.1)' : 'white',
                      color: '#14281D',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{method.emoji}</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{method.label}</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>{method.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION RESTE À PAYER ===== */}
        {restePay > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '28px',
            borderRadius: '16px',
            marginBottom: '32px',
            border: '1px solid rgba(71, 122, 12, 0.15)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#14281D',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              💳 Mode de règlement du reste ({restePay.toFixed(2)}€)
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              alignContent: 'start',
              paddingBottom: 16
            }}>
              {/* Méthodes simples */}
              {remainingMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    savePayment({ method: method.id, depositAmount: acompte, depositMethod });
                  }}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: selectedMethod === method.id ? '2px solid #477A0C' : '2px solid rgba(71, 122, 12, 0.2)',
                    backgroundColor: selectedMethod === method.id ? 'rgba(71, 122, 12, 0.1)' : 'white',
                    color: '#14281D',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{method.emoji}</div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{method.label}</div>
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>{method.subtitle}</div>
                </button>
              ))}

              {/* Alma - bouton spécial */}
              <button
                onClick={() => setShowAlmaPage(true)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: selectedMethod?.startsWith('Alma') ? '2px solid #477A0C' : '2px solid rgba(255, 165, 0, 0.3)',
                  backgroundColor: selectedMethod?.startsWith('Alma') ? 'rgba(71, 122, 12, 0.1)' : 'rgba(255, 165, 0, 0.05)',
                  color: '#14281D',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'center'
                }}
              >
                <img src={AlmaLogo} alt="Alma" style={{ height: '32px' }} />
                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                  {selectedMethod?.startsWith('Alma') ? selectedMethod : 'Alma'}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                  {selectedMethod?.startsWith('Alma') ? 'Configuré ✓' : '2x, 3x ou 4x →'}
                </div>
              </button>

              {/* Chèques à venir - bouton spécial */}
              <button
                onClick={() => setShowChequesPage(true)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: selectedMethod === 'Chèque à venir' ? '2px solid #477A0C' : '2px solid rgba(245, 93, 62, 0.3)',
                  backgroundColor: selectedMethod === 'Chèque à venir' ? 'rgba(71, 122, 12, 0.1)' : 'rgba(245, 93, 62, 0.05)',
                  color: '#14281D',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px' }}>📄</div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>Chèques à venir</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                  {selectedMethod === 'Chèque à venir' && paiement?.nombreChequesAVenir
                    ? `${paiement.nombreChequesAVenir} chèques × ${(restePay / (paiement.nombreChequesAVenir || 1)).toFixed(2)}€`
                    : 'Planifier →'}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== FOOTER PROFESSIONNEL ===== */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: FOOTER_H,
        backgroundColor: 'white',
        borderTop: '3px solid #477A0C',
        boxSizing: 'border-box',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 32px',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Indicateur de validation */}
        {!isValidPayment && (
          <div style={{
            backgroundColor: 'rgba(245, 93, 62, 0.1)',
            color: '#F55D3E',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: '12px',
            border: '1px solid rgba(245, 93, 62, 0.2)'
          }}>
            {acompte > totalAmount ? 'L\'acompte ne peut pas dépasser le total' :
             acompte > 0 && !depositMethod ? 'Choisissez le mode de règlement de l\'acompte' :
             restePay > 0 && !selectedMethod ? 'Choisissez le mode de règlement du reste' :
             'Veuillez compléter les informations de paiement'}
          </div>
        )}

        {/* Boutons de navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px'
        }}>
          <button
            onClick={onPrev}
            style={{
              padding: '16px 32px',
              borderRadius: '30px',
              border: '2px solid #477A0C',
              backgroundColor: 'white',
              color: '#477A0C',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '140px',
              minHeight: '56px'
            }}
          >
            ← Précédent
          </button>

          <div style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(71, 122, 12, 0.1)',
            borderRadius: '20px',
            color: '#477A0C',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Étape 4/7
          </div>

          <button
            onClick={onNext}
            disabled={!isValidPayment}
            style={{
              padding: '16px 32px',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: isValidPayment ? '#477A0C' : '#ccc',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isValidPayment ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              minWidth: '140px',
              minHeight: '56px',
              boxShadow: isValidPayment ? '0 4px 12px rgba(71, 122, 12, 0.3)' : 'none'
            }}
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
