import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { chequeFriendlyDeposits } from '../../utils/chequeMath';
import { useMemo } from 'react';

// Copie brute de StepPaiement pour expérimentation
// Étape 5 : StepPaiementClone

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

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);
const safeNumber = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const formatEUR = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    n
  );

type DiscountType = 'percent' | 'fixed';
const normalizeDiscountType = (t: unknown): DiscountType =>
  t === 'fixed' ? 'fixed' : t === 'percent' ? 'percent' : 'fixed';

export default function StepPaiementClone({ onNext, onPrev, onQuit }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();
  const TVA_RATE = 0.2 as const;
  const totalTTC = useMemo(() => {
    return produits.reduce((sum, p) => {
      return (
        sum +
        calculateProductTotal(
          p.qty,
          p.priceTTC,
          p.discount || 0,
          normalizeDiscountType(p.discountType as unknown)
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
  const nombreFoisAlma = clamp(safeNumber(paiement.nombreFoisAlma || 3), 2, 4);
  const montantChequeRond =
    nombreCheques > 0 ? Math.round(totalTTC / nombreCheques) : 0;
  const totalChequesCalcule = montantChequeRond * nombreCheques;
  const acompteCalculeBrut = totalTTC - totalChequesCalcule;
  const acompteMinimum = totalTTC * 0.1;
  const acompteAjuste = Math.max(acompteCalculeBrut, acompteMinimum);
  const montantRestantApresCetAcompte = totalTTC - acompteAjuste;
  const montantChequeDefinitif =
    nombreCheques > 0
      ? Math.round(montantRestantApresCetAcompte / nombreCheques)
      : montantChequeRond;
  const montantParCheque =
    nombreCheques > 0
      ? paiement.method === 'Chèque à venir'
        ? montantChequeDefinitif
        : remainingAmount / nombreCheques
      : 0;
  const montantParFoisAlma = nombreFoisAlma > 0 ? totalTTC / nombreFoisAlma : 0;
  const isValid =
    typeof paiement.method === 'string' && paiement.method.trim().length > 0;
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
    if (paiement.method === 'Chèque à venir') {
      const montantRondParCheque = Math.round(totalTTC / nouveauNombre);
      const totalDesChequesRonds = montantRondParCheque * nouveauNombre;
      const acompteCalculeBrut = totalTTC - totalDesChequesRonds;
      const acompteMinimum = totalTTC * 0.1;
      const acompteDefinitif = Math.max(acompteCalculeBrut, acompteMinimum);
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

  const validateAndNext = () => {
    if (depositAmount > 0 && !paiement.depositPaymentMethod) {
      alert(
        "Veuillez sélectionner le mode de règlement pour l'acompte avant de continuer."
      );
      return;
    }
    if (!isValid) {
      alert('Veuillez sélectionner un mode de paiement avant de continuer.');
      return;
    }
    onNext();
  };

  return (
    <div className='max-w-6xl mx-auto py-8'>
      {/* ...existing code... (copie brute de StepPaiement) */}
    </div>
  );
}
