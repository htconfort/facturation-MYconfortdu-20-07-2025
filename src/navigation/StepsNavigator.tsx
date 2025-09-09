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
    <div className='w-full h-dvh bg-gray-300 flex items-center justify-center overflow-hidden p-4'>
      {/* Spinner de chargement (mouline) */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center z-50'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-myconfort-blue border-opacity-70 bg-white/80 shadow-2xl'></div>
        </div>
      )}
      {/* 🎯 Cadre iPad - Dimensions réduites pour éviter les marges iPad physique */}
      <div className='w-[950px] h-[650px] bg-myconfort-cream border-6 border-black rounded-lg shadow-2xl relative flex flex-col' style={{ overflow: 'visible' }}>
        {/* Bouton info compact en haut à droite */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className='absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full text-xs font-bold z-50 flex items-center justify-center transition-all'
          title={showInfo ? 'Masquer les infos' : 'Afficher les infos iPad'}
        >
          {showInfo ? '×' : 'i'}
        </button>

        {/* Panel d'informations conditionnel */}
        {showInfo && (
          <div className='absolute top-10 right-2 bg-black/90 text-white text-xs p-3 rounded-lg z-40 max-w-[200px]'>
            <div className='font-mono mb-1'>iPad 1024×768</div>
            <div className='text-white/80'>Mode paysage optimisé</div>
            <div className='text-white/80'>Swipe ← → pour naviguer</div>
          </div>
        )}

        {/* Header dans le cadre iPad - ultra compact */}
        <header className='w-full px-3 py-1 flex items-center justify-between border-b border-myconfort-dark/10'>
          <h1 className='text-xs font-medium text-myconfort-dark'>
            Wizard iPad — Étape {Math.min(currentStepIndex + 1, steps.length)}/
            {steps.length || 0}
          </h1>

          {/* Timeline simple et robuste */}
          <nav className='flex gap-1'>
            {steps.map((id, idx) => {
              const st = getStepStatus(id, idx);
              const base = 'h-1 w-3 rounded-full';
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

        {/* Contenu principal dans le cadre iPad - maximum d'espace avec scroll */}
        <main className='w-full flex-1 overflow-visible'>{children}</main>
      </div>
    </div>
  );
}
