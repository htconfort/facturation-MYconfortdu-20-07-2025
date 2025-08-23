import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoiceWizard, type WizardStep } from '../store/useInvoiceWizard';
import StepFacture from './steps/StepFacture';
import StepClient from './steps/StepClient';
import StepProduits from './steps/StepProduits';
import StepPaiement from './steps/StepPaiement';
import StepLivraison from './steps/StepLivraison';
import StepSignature from './steps/StepSignature';
import StepRecap from './steps/StepRecap';

const steps: WizardStep[] = ['facture', 'client', 'produits', 'paiement', 'livraison', 'signature', 'recap'];

export default function IpadWizard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlStep = (new URLSearchParams(search).get('step') || 'facture') as WizardStep;
  const setStep = useInvoiceWizard(s => s.setStep);
  const step = useInvoiceWizard(s => s.step);

  useEffect(() => { 
    setStep(urlStep); 
  }, [urlStep, setStep]);

  // Détection orientation (iOS ne permet pas lock, on affiche un message si portrait)
  const [orientation, setOrientation] = useState(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
  
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
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
    <div className="fixed inset-0 bg-white overflow-hidden"
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
        <div className="w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-br from-[#477A0C] to-[#5A8F0F]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-[#477A0C] mb-4">Tourne l'iPad en paysage</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Le mode iPad MyConfort est optimisé pour l'orientation paysage afin de profiter 
              pleinement de l'interface tactile.
            </p>
            <div className="mt-6 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                🔄 Rotation automatique activée
              </p>
            </div>
          </div>
        </div>
      ) : (
        <WizardSurface 
          step={step} 
          onGo={(dir) => {
            const idx = steps.indexOf(step);
            const next = steps[idx + (dir === 'next' ? 1 : -1)];
            if (!next) return;
            navigate(`/ipad?step=${next}`);
          }} 
          onQuit={() => navigate('/')} 
        />
      )}
    </div>
  );
}

function WizardSurface({
  step,
  onGo,
  onQuit
}: {
  step: WizardStep;
  onGo: (dir: 'next' | 'prev') => void;
  onQuit: () => void;
}) {
  const stepIndex = steps.indexOf(step);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const { invoiceNumber, invoiceDate, eventLocation, client, produits, paiement } = useInvoiceWizard();
  
  // Fonction de validation qui retourne le statut (pour les couleurs)
  const validateCurrentStep = useCallback((): { isValid: boolean; errorMessage: string } => {
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
          errorMessage = 'Le lieu de l\'événement est obligatoire';
          isValid = false;
        }
        break;
        
      case 'client':
        if (!client.name?.trim() || client.name.trim().length < 3) {
          errorMessage = 'Le nom du client est obligatoire (minimum 3 caractères)';
          isValid = false;
        } else if (!client.email?.trim() || !client.email.includes('@')) {
          errorMessage = 'Un email valide est obligatoire';
          isValid = false;
        } else if (!client.phone?.trim()) {
          errorMessage = 'Le téléphone du client est obligatoire';
          isValid = false;
        } else if (!client.address?.trim()) {
          errorMessage = 'L\'adresse du client est obligatoire';
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
        } else if (!client.doorCode?.trim() && client.doorCode !== 'Pas de digicode') {
          errorMessage = 'Le code porte/digicode est obligatoire (ou cochez "Pas de digicode")';
          isValid = false;
        }
        break;
        
      case 'produits':
        if (produits.length === 0) {
          errorMessage = 'Au moins un produit est obligatoire';
          isValid = false;
        } else if (produits.some(p => p.isPickupOnSite === undefined)) {
          errorMessage = 'Veuillez définir le mode de livraison pour tous les produits';
          isValid = false;
        }
        break;
        
      case 'paiement':
        if (!paiement.method) {
          errorMessage = 'Veuillez sélectionner un mode de paiement';
          isValid = false;
        }
        break;
        
      case 'livraison':
      case 'signature':
      case 'recap':
        // Ces steps n'ont pas de validation obligatoire
        break;
    }

    return { isValid, errorMessage };
  }, [step, invoiceNumber, invoiceDate, eventLocation, client.name, client.email, client.phone, client.address, client.city, client.postalCode, client.housingType, client.doorCode, produits, paiement]);

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
      case 'facture': return <StepFacture {...props} />;
      case 'client': return <StepClient {...props} />;
      case 'produits': return <StepProduits {...props} />;
      case 'paiement': return <StepPaiement {...props} />;
      case 'livraison': return <StepLivraison {...props} />;
      case 'signature': return <StepSignature {...props} />;
      case 'recap': return <StepRecap {...props} />;
      default: return <div>Étape inconnue</div>;
    }
  }, [step, onGo, onQuit, isFirstStep, isLastStep, validateAndGoNext]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Header mince avec gradient MyConfort */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">🌸</div>
          <div>
            <div className="font-bold text-lg">MYCONFORT - Mode iPad</div>
            <div className="text-sm opacity-90">{labelFor(step)}</div>
          </div>
        </div>
        <button 
          onClick={onQuit} 
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          ← Quitter
        </button>
      </div>

      {/* Contenu avec scroll */}
      <div className="pt-16 pb-24 px-8 w-full h-full overflow-auto">
        <div className="max-w-7xl mx-auto">
          {StepComponent}
        </div>
      </div>

      {/* Barre d'action bas : navigation + stepper */}
      <div className="absolute left-0 bottom-0 right-0 h-20 bg-white border-t-2 border-gray-200 flex items-center px-8 justify-between shadow-lg">
        <div className="flex items-center gap-4">
          {/* Bouton Précédent */}
          {!isFirstStep && (
            <NavButton 
              onClick={() => onGo('prev')} 
              label="← Précédent" 
              variant="secondary"
            />
          )}
          
          {/* Bouton Suivant / Terminer */}
          {!isLastStep ? (
            (() => {
              const { isValid } = validateCurrentStep();
              return (
                <NavButton 
                  onClick={validateAndGoNext} 
                  label="Suivant →" 
                  variant={isValid ? "primary" : "danger"}
                />
              );
            })()
          ) : (
            <NavButton 
              onClick={onQuit} 
              label="✅ Terminer" 
              variant="success"
            />
          )}
        </div>
        
        {/* Stepper à droite */}
        <Stepper currentStep={step} />
      </div>
    </div>
  );
}

function NavButton({ 
  onClick, 
  label, 
  variant = 'primary' 
}: { 
  onClick: () => void; 
  label: string; 
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}) {
  const baseClasses = "px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg";
  
  const variantClasses = {
    primary: "bg-[#477A0C] hover:bg-[#5A8F0F] text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}

function Stepper({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((stepName, index) => {
        const isActive = stepName === currentStep;
        const isCompleted = steps.indexOf(currentStep) > index;
        
        return (
          <div key={stepName} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              isActive 
                ? 'bg-[#477A0C] text-white shadow-lg scale-110' 
                : isCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
            }`}>
              {isCompleted ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-1 mx-2 transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function labelFor(s: WizardStep): string {
  switch (s) {
    case 'facture': return 'Informations Facture';
    case 'client': return 'Informations Client';
    case 'produits': return 'Produits & Services';
    case 'paiement': return 'Modalités de Paiement';
    case 'livraison': return 'Livraison & Logistique';
    case 'signature': return 'Signature Électronique';
    case 'recap': return 'Récapitulatif Final';
    default: return 'Étape inconnue';
  }
}
