import { useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoiceWizard, type WizardStep } from '../store/useInvoiceWizard';
import StepsNavigator from '../navigation/StepsNavigator';
import './ipad-orientation.css';

// Import des composants d'étapes
import StepFacture from './steps/StepFacture';
import StepClientNoScroll from './steps/StepClientNoScroll';
import StepProduits from './steps/StepProduits';
import StepPaymentScrollable from './steps/StepPaymentScrollable';
import StepLivraisonNoScroll from './steps/StepLivraisonNoScroll';
import StepSignatureNoScroll from './steps/StepSignatureNoScroll';
import StepRecapSimple from './steps/StepRecapSimple';
import StepNouvellesCommandes from './steps/StepNouvellesCommandes';

const steps: WizardStep[] = [
  'facture',
  'client',
  'produits',
  'paiement',
  'livraison',
  'signature',
  'recap',
  'nouvelles-commandes',
];

export default function IpadWizardComplete() {
  const navigate = useNavigate();
  const { search } = useLocation();
  
  const urlStep = (new URLSearchParams(search).get('step') || 'facture') as WizardStep;
  const setStep = useInvoiceWizard(s => s.setStep);
  const step = useInvoiceWizard(s => s.step);
  const reset = useInvoiceWizard(s => s.reset);

  useEffect(() => {
    setStep(urlStep);
    
    if (urlStep === 'facture' && search.includes('step=facture')) {
      reset();
    }
  }, [urlStep, setStep, reset, search]);

  return (
    <div data-ui="ipad-wizard-complete" className='relative w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Wizard principal */}
      <div className="wizard h-full">
        <StepsNavigator>
          <WizardSurface
            step={step}
            onGo={dir => {
              const idx = steps.indexOf(step);
              const next = steps[idx + (dir === 'next' ? 1 : -1)];
              if (!next) return;
              navigate(`/ipad?step=${next}`);
            }}
            onQuit={() => navigate('/')}
          />
        </StepsNavigator>
      </div>
    </div>
  );
}


function WizardSurface({
  step,
  onGo,
  onQuit,
}: {
  step: WizardStep;
  onGo: (dir: 'next' | 'prev') => void;
  onQuit: () => void;
}) {
  const stepIndex = steps.indexOf(step);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const {
    invoiceNumber,
    invoiceDate,
    eventLocation,
    client,
    produits,
    paiement,
  } = useInvoiceWizard();

  // Validation des étapes
  const validateCurrentStep = useCallback((): {
    isValid: boolean;
    canProceed: boolean;
    message?: string;
  } => {
    switch (step) {
      case 'facture':
        // Pour StepFacture, laissons la validation se faire dans le composant lui-même
        return {
          isValid: true,
          canProceed: true,
        };

      case 'client':
        const hasClientName = client.name.trim().length > 2;
        return {
          isValid: hasClientName,
          canProceed: hasClientName,
        };

      case 'produits':
        const hasProducts = produits.length > 0;
        const allProductsValid = produits.every(
          p => p.designation.trim().length > 0 && p.priceTTC > 0
        );
        return {
          isValid: hasProducts && allProductsValid,
          canProceed: hasProducts && allProductsValid,
        };

      case 'paiement':
        const hasPaymentMethod = paiement.method !== '';
        return {
          isValid: hasPaymentMethod,
          canProceed: hasPaymentMethod,
        };

      default:
        return { isValid: true, canProceed: true };
    }
  }, [step, invoiceNumber, invoiceDate, eventLocation, client, produits, paiement]);

  const validateAndGoNext = useCallback(() => {
    const validation = validateCurrentStep();
    if (validation.canProceed) {
      onGo('next');
    } else {
      alert(validation.message || 'Veuillez compléter les champs requis');
    }
  }, [validateCurrentStep, onGo]);

  const labelFor = useCallback((s: WizardStep): string => {
    switch (s) {
      case 'facture': return '📋 Facture';
      case 'client': return '👤 Client';
      case 'produits': return '📦 Produits';
      case 'paiement': return '💳 Paiement';
      case 'livraison': return '🚚 Livraison';
      case 'signature': return '✍️ Signature';
      case 'recap': return '📄 Récapitulatif';
      case 'nouvelles-commandes': return '🆕 Nouvelles commandes';
      default: return s;
    }
  }, []);

  const renderStep = useMemo(() => {
    const props = {
      onNext: validateAndGoNext,
      onPrev: () => onGo('prev'),
      onQuit,
      isFirstStep,
      isLastStep,
    };

    switch (step) {
      case 'facture':
        return <StepFacture {...props} />;
      case 'client':
        return <StepClientNoScroll {...props} />;
      case 'produits':
        return <StepProduits {...props} />;
      case 'paiement':
        return <StepPaymentScrollable {...props} />;
      case 'livraison':
        return <StepLivraisonNoScroll {...props} />;
      case 'signature':
        return <StepSignatureNoScroll {...props} />;
      case 'recap':
        return <StepRecapSimple {...props} />;
      case 'nouvelles-commandes':
        return <StepNouvellesCommandes {...props} />;
      default:
        return <div>Étape inconnue</div>;
    }
  }, [step, onGo, onQuit, isFirstStep, isLastStep, validateAndGoNext]);

  return (
    <div className='w-full h-full flex flex-col'>
      {/* Header compact - fixe */}
      <div className='h-7 flex items-center justify-between px-3 bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] text-white text-xs flex-shrink-0'>
        <div className='flex items-center gap-1'>
          <div className='text-sm'>🌸</div>
          <span className='font-medium truncate'>{labelFor(step)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => {
              const state = useInvoiceWizard.getState();
              state.reset();
              window.location.href = '/ipad?step=facture';
            }}
            className='bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs transition-all'
            title='Nouvelle facture'
          >
            🆕
          </button>
          <button
            onClick={onQuit}
            className='bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs transition-all'
          >
            Quitter
          </button>
        </div>
      </div>

      {/* Contenu de l'étape - scroll géré par StepsNavigator */}
      <div className='flex-1 p-2'>
        {renderStep}
      </div>
    </div>
  );
}
