import React, { useMemo } from 'react';
import { useInvoiceWizard, WizardStep } from '../store/useInvoiceWizard';
import { useHorizontalSwipe } from '../hooks/useSwipe';
import { 
  FileText, 
  User, 
  Package, 
  CreditCard, 
  Truck, 
  PenTool, 
  CheckSquare,
  LucideIcon
} from 'lucide-react';

interface StepConfig {
  key: WizardStep;
  label: string;
  icon: LucideIcon;
  shortLabel: string; // For narrow screens
}

const STEPS_CONFIG: StepConfig[] = [
  { key: 'facture', label: 'Facture', icon: FileText, shortLabel: 'Fact.' },
  { key: 'client', label: 'Client', icon: User, shortLabel: 'Client' },
  { key: 'produits', label: 'Produits', icon: Package, shortLabel: 'Prod.' },
  { key: 'paiement', label: 'Paiement', icon: CreditCard, shortLabel: 'Paie.' },
  { key: 'livraison', label: 'Livraison', icon: Truck, shortLabel: 'Livr.' },
  { key: 'signature', label: 'Signature', icon: PenTool, shortLabel: 'Sign.' },
  { key: 'recap', label: 'Récapitulatif', icon: CheckSquare, shortLabel: 'Récap' }
];

interface StepsNavigatorProps {
  /** Container className for the navigator */
  className?: string;
  /** Enable/disable swipe navigation */
  swipeEnabled?: boolean;
}

/**
 * Horizontal steps navigator optimized for iPad landscape
 * Features:
 * - Touch-friendly 56px+ targets
 * - Swipe navigation between steps  
 * - Visual step completion indicators
 * - Responsive labels for various screen sizes
 */
export const StepsNavigator: React.FC<StepsNavigatorProps> = ({
  className = '',
  swipeEnabled = true
}) => {
  const { 
    step: currentStep, 
    completion,
    goNext, 
    goPrev,
    setStep
  } = useInvoiceWizard();

  // ✅ Set safe (même si completion est undefined)
  const completed = useMemo(
    () => new Set<string>(completion?.completedStepIds ?? []),
    [completion?.completedStepIds]
  );

  // ✅ Helper status safe
  const getStepStatus = (stepId: WizardStep) => {
    if (completed.has(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  // Swipe navigation
  useHorizontalSwipe({
    enabled: swipeEnabled,
    onNext: goNext,
    onPrev: goPrev,
    threshold: 56,
    velocity: 0.15,
    preventScrollOnX: true,
  });

  const getStepStyles = (status: 'current' | 'completed' | 'pending') => {
    const base = `
      flex flex-col items-center justify-center gap-2 
      min-h-[56px] px-3 py-2 rounded-lg
      transition-all duration-150 ease-out
      touch-manipulation cursor-pointer
      border-2
    `;

    switch (status) {
      case 'current':
        return `${base} 
          bg-myconfort-green text-white border-myconfort-green
          shadow-md transform scale-105`;
      
      case 'completed':
        return `${base} 
          bg-myconfort-cream text-myconfort-dark border-myconfort-green
          hover:bg-green-50 active:bg-green-100`;
      
      case 'pending':
        return `${base} 
          bg-white text-gray-600 border-gray-200
          hover:bg-gray-50 active:bg-gray-100`;
    }
  };

  const getIconStyles = (status: 'current' | 'completed' | 'pending') => {
    switch (status) {
      case 'current':
        return 'text-white';
      case 'completed':
        return 'text-myconfort-green';
      case 'pending':
        return 'text-gray-400';
    }
  };

  const getTextStyles = (status: 'current' | 'completed' | 'pending') => {
    const base = 'text-sm font-medium font-manrope text-center leading-tight';
    
    switch (status) {
      case 'current':
        return `${base} text-white font-semibold`;
      case 'completed':
        return `${base} text-myconfort-dark`;
      case 'pending':
        return `${base} text-gray-500`;
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-between gap-2 
        px-4 py-3 bg-white border-b border-gray-100
        overflow-x-auto scrollbar-hide
        ${className}
      `}
      role="tablist"
      aria-label="Étapes de facturation"
    >
      {STEPS_CONFIG.map((stepConfig, index) => {
        const status = getStepStatus(stepConfig.key);
        const IconComponent = stepConfig.icon;
        
        return (
          <button
            key={stepConfig.key}
            onClick={() => setStep(stepConfig.key)}
            className={getStepStyles(status)}
            role="tab"
            aria-selected={status === 'current'}
            aria-label={`Étape ${index + 1}: ${stepConfig.label}`}
            tabIndex={status === 'current' ? 0 : -1}
          >
            <IconComponent 
              size={20} 
              className={getIconStyles(status)} 
            />
            
            {/* Responsive text - full label on larger screens, short on smaller */}
            <span className={`${getTextStyles(status)} hidden sm:block`}>
              {stepConfig.label}
            </span>
            <span className={`${getTextStyles(status)} block sm:hidden`}>
              {stepConfig.shortLabel}
            </span>
            
            {/* Step number indicator for accessibility */}
            <span className="sr-only">
              Étape {index + 1} sur {STEPS_CONFIG.length}
            </span>
          </button>
        );
      })}
      
      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div 
          className="h-full bg-myconfort-green transition-all duration-300 ease-out"
          style={{ 
            width: `${((STEPS_CONFIG.findIndex(s => s.key === currentStep) + 1) / STEPS_CONFIG.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};
