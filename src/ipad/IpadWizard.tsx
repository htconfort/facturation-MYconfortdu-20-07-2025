import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoiceWizard, type WizardStep } from '../store/useInvoiceWizard';
import StepsNavigator from '../navigation/StepsNavigator';
import StepFacture from './steps/StepFacture';
// import StepClient from './steps/StepClient'; //  remplacé par NoScroll
import StepClientNoScroll from './steps/StepClientNoScroll';
import StepProduits from './steps/StepProduits';
// import StepPaiement from './steps/StepPaiement'; // remplacé par NoScroll
import StepPaymentNoScroll from './steps/StepPaymentNoScroll';
// import StepLivraison from './steps/StepLivraison'; // remplacé par NoScroll
import StepLivraisonNoScroll from './steps/StepLivraisonNoScroll';
// import StepSignature from './steps/StepSignature'; // remplacé par NoScroll
import StepSignatureNoScroll from './steps/StepSignatureNoScroll';
// import StepRecap from './steps/StepRecap'; // remplacé par NoScroll - TEMPORAIREMENT REMPLACÉ
// import StepRecapNoScroll from './steps/StepRecapNoScroll'; // Version avec bugs
import StepRecapNoScrollFixed from './steps/StepRecapNoScrollFixed'; // 🔧 Version corrigée
import StepNouvellesCommandes from './steps/StepNouvellesCommandes';

const steps: WizardStep[] = [
  'facture',
  'client',
  'produits',
  'paiement',
  'paiement-clone',
  'livraison',
  'signature',
  'recap',
  'nouvelles-commandes',
];

export default function IpadWizard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlStep = (new URLSearchParams(search).get('step') ||
    'facture') as WizardStep;
  const setStep = useInvoiceWizard(s => s.setStep);
  const step = useInvoiceWizard(s => s.step);

  useEffect(() => {
    setStep(urlStep);
  }, [urlStep, setStep]);

  // Détection orientation (iOS ne permet pas lock, on affiche un message si portrait)
  const [orientation, setOrientation] = useState(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isPortrait = orientation === 'portrait';

  // Plein écran visuel (fixe), compatible iOS Safari
  return (
    <div
      className='fixed inset-0 bg-white overflow-hidden'
      style={{
        width: '100vw',
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {isPortrait ? (
        <div className='w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-br from-[#477A0C] to-[#5A8F0F]'>
          <div className='bg-white rounded-2xl p-8 shadow-2xl max-w-md'>
            <div className='text-6xl mb-4'>📱</div>
            <h1 className='text-2xl font-bold text-[#477A0C] mb-4'>
              Tourne l'iPad en paysage
            </h1>
            <p className='text-gray-600 text-lg leading-relaxed'>
              Le mode iPad MyConfort est optimisé pour l'orientation paysage
              afin de profiter pleinement de l'interface tactile.
            </p>
            <div className='mt-6 p-3 bg-green-50 rounded-lg'>
              <p className='text-sm text-green-800 font-medium'>
                🔄 Rotation automatique activée
              </p>
            </div>
          </div>
        </div>
      ) : (
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
      )}
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

  // Fonction de validation qui retourne le statut (pour les couleurs)
  const validateCurrentStep = useCallback((): {
    isValid: boolean;
    errorMessage: string;
  } => {
    let isValid = true;
    let errorMessage = '';

    switch (step) {
      case 'facture':
        if (!invoiceNumber.trim()) {
          errorMessage = 'Le numéro de facture est obligatoire';
          isValid = false;
        } else if (!invoiceDate) {
          errorMessage = 'La date de facture est obligatoire';
          isValid = false;
        } else if (!eventLocation.trim()) {
          errorMessage = "Le lieu de l'événement est obligatoire";
          isValid = false;
        }
        break;

      case 'client':
        if (!client.name?.trim() || client.name.trim().length < 3) {
          errorMessage =
            'Le nom du client est obligatoire (minimum 3 caractères)';
          isValid = false;
        } else if (!client.email?.trim() || !client.email.includes('@')) {
          errorMessage = 'Un email valide est obligatoire';
          isValid = false;
        } else if (!client.phone?.trim()) {
          errorMessage = 'Le téléphone du client est obligatoire';
          isValid = false;
        } else if (!client.address?.trim()) {
          errorMessage = "L'adresse du client est obligatoire";
          isValid = false;
        } else if (!client.city?.trim()) {
          errorMessage = 'La ville du client est obligatoire';
          isValid = false;
        } else if (!client.postalCode?.trim()) {
          errorMessage = 'Le code postal est obligatoire';
          isValid = false;
        } else if (!client.housingType?.trim()) {
          errorMessage = 'Le type de logement est obligatoire';
          isValid = false;
        } else if (
          !client.doorCode?.trim() &&
          client.doorCode !== 'Pas de digicode'
        ) {
          errorMessage =
            'Le code porte/digicode est obligatoire (ou cochez "Pas de digicode")';
          isValid = false;
        }
        break;

      case 'produits':
        if (produits.length === 0) {
          errorMessage = 'Au moins un produit est obligatoire';
          isValid = false;
        } else if (produits.some(p => p.isPickupOnSite === undefined)) {
          errorMessage =
            'Veuillez définir le mode de livraison pour tous les produits';
          isValid = false;
        }
        break;

      case 'paiement':
      case 'paiement-clone':
        if (!paiement.method) {
          errorMessage = 'Veuillez sélectionner un mode de paiement';
          isValid = false;
        }
        break;

      case 'livraison':
      case 'signature':
      case 'recap':
      case 'nouvelles-commandes':
        // Ces steps n'ont pas de validation obligatoire
        break;
    }

    return { isValid, errorMessage };
  }, [
    step,
    invoiceNumber,
    invoiceDate,
    eventLocation,
    client.name,
    client.email,
    client.phone,
    client.address,
    client.city,
    client.postalCode,
    client.housingType,
    client.doorCode,
    produits,
    paiement,
  ]);

  // Fonction de validation et navigation
  const validateAndGoNext = useCallback(() => {
    const { isValid, errorMessage } = validateCurrentStep();

    if (isValid) {
      onGo('next');
    } else {
      alert(errorMessage);
    }
  }, [validateCurrentStep, onGo]);

  const StepComponent = useMemo(() => {
    const props = {
      onNext: validateAndGoNext, // Le bouton interne du step utilisera aussi la validation
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
      case 'paiement-clone':
        return <StepPaymentNoScroll {...props} />;
      case 'livraison':
        return <StepLivraisonNoScroll {...props} />;
      case 'signature':
        return <StepSignatureNoScroll {...props} />;
      case 'recap':
        return <StepRecapNoScrollFixed {...props} />;
      case 'nouvelles-commandes':
        return <StepNouvellesCommandes {...props} />;
      default:
        return <div>Étape inconnue</div>;
    }
  }, [step, onGo, onQuit, isFirstStep, isLastStep, validateAndGoNext]);

  return (
    <div className='w-full h-full flex flex-col overflow-hidden'>
      {/* Header ultra-compact - 28px seulement */}
      <div className='h-7 flex items-center justify-between px-3 bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] text-white text-xs'>
        <div className='flex items-center gap-1'>
          <div className='text-sm'>🌸</div>
          <span className='font-medium truncate'>{labelFor(step)}</span>
        </div>
        <button
          onClick={onQuit}
          className='bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs transition-all'
        >
          Quitter
        </button>
      </div>

      {/* Contenu principal - utilise tout l'espace restant */}
      <div className='flex-1 overflow-hidden'>{StepComponent}</div>

      {/* Footer avec navigation agrandie - 48px pour les boutons plus gros */}
      <div className='h-12 bg-white border-t border-gray-200 flex items-center justify-between px-3'>
        <div className='flex items-center'>
          {!isFirstStep && (
            <button
              onClick={() => onGo('prev')}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all min-h-[32px]'
            >
              ← Précédent
            </button>
          )}
        </div>

        {/* Stepper compact */}
        <div className='flex gap-0.5'>
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${
                idx === stepIndex
                  ? 'bg-[#477A0C]'
                  : idx < stepIndex
                    ? 'bg-green-400'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className='flex items-center'>
          {!isLastStep && (
            <button
              onClick={validateAndGoNext}
              className='px-4 py-2 bg-[#477A0C] hover:bg-[#5A8F0F] text-white rounded-lg text-sm font-medium transition-all shadow-sm min-h-[32px]'
            >
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(s: WizardStep): string {
  switch (s) {
    case 'facture':
      return 'Facture';
    case 'client':
      return 'Client';
    case 'produits':
      return 'Produits';
    case 'paiement':
    case 'paiement-clone':
      return 'Paiement';
    case 'livraison':
      return 'Livraison';
    case 'signature':
      return 'Signature';
    case 'recap':
      return 'Récap';
    case 'nouvelles-commandes':
      return 'Nouvelles commandes';
    default:
      return 'Étape';
  }
}
