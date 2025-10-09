import React, { useMemo, useState } from 'react';
import { useHorizontalSwipe } from '../hooks/useSwipe';
import { useInvoiceWizard } from '../store/useInvoiceWizard';

type Props = { children: React.ReactNode };

export default function StepsNavigator({ children }: Props) {
  const {
    goNext,
    goPrev,
    getCurrentStepIndex,
    steps = [],
    completion,
  } = useInvoiceWizard();
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Mouline

  const currentStepIndex = getCurrentStepIndex();

  // Toujours un Set valide, même si completion n'est pas encore hydraté par persist()
  const completed = useMemo(
    () => new Set<string>(completion?.completedStepIds ?? []),
    [completion?.completedStepIds]
  );

  const getStepStatus = (stepId: string, idx: number) => {
    if (completed.has(stepId)) return 'done';
    if (idx === currentStepIndex) return 'current';
    return 'todo';
    // Aucun accès à une valeur potentiellement undefined ici
  };

  useHorizontalSwipe({
    onNext: () => goNext(),
    onPrev: () => goPrev(),
    threshold: 56,
    velocity: 0.15,
    preventScrollOnX: true,
  });

  return (
    <div className='w-full h-screen bg-myconfort-cream flex flex-col overflow-hidden'>
      {/* Spinner de chargement (mouline) */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center z-50 bg-white/80'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-myconfort-blue border-opacity-70 shadow-2xl'></div>
        </div>
      )}

      {/* Header iPad */}
      <header className='w-full px-6 py-3 flex items-center justify-between border-b border-myconfort-dark/10 bg-myconfort-cream flex-shrink-0'>
        <div className='flex items-center gap-4'>
          <h1 className='text-sm font-semibold text-myconfort-dark'>
            iPad Wizard — Étape {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
          </h1>
          
          {/* Bouton info */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className='w-7 h-7 bg-myconfort-dark/80 hover:bg-myconfort-dark text-white rounded-full text-xs font-bold flex items-center justify-center transition-all'
            title={showInfo ? 'Masquer les infos' : 'Afficher les infos'}
          >
            {showInfo ? '×' : 'i'}
          </button>
        </div>

        {/* Timeline */}
        <nav className='flex gap-2'>
          {steps.map((id, idx) => {
            const st = getStepStatus(id, idx);
            const base = 'h-2 w-4 rounded-full transition-all';
            const cls =
              st === 'done'
                ? 'bg-myconfort-green'
                : st === 'current'
                  ? 'bg-myconfort-blue'
                  : 'bg-myconfort-dark/20';
            return (
              <span
                key={id}
                className={`${base} ${cls}`}
                aria-label={`${id} - ${st}`}
              />
            );
          })}
        </nav>
      </header>

      {/* Panel d'informations conditionnel */}
      {showInfo && (
        <div className='absolute top-14 right-4 bg-black/90 text-white text-xs p-4 rounded-lg z-50 max-w-[250px] shadow-xl'>
          <div className='font-mono mb-2 text-sm'>iPad Mode</div>
          <div className='text-white/80 mb-1'>Swipe ← → pour naviguer</div>
          <div className='text-white/80'>Scroll vertical activé</div>
        </div>
      )}

      {/* Contenu principal - SCROLL LIBRE comme page d'accueil */}
      <main className='w-full flex-1 overflow-y-auto overflow-x-hidden' style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </main>
    </div>
  );
}
