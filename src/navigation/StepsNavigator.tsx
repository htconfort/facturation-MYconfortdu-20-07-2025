import React, { useMemo } from 'react';
import { useHorizontalSwipe } from '../hooks/useSwipe';
import { useInvoiceWizard } from '../store/useInvoiceWizard';

type Props = { children: React.ReactNode };

export default function StepsNavigator({ children }: Props) {
  const { goNext, goPrev, getCurrentStepIndex, steps = [], completion } = useInvoiceWizard();

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
    <div className="w-full h-dvh bg-myconfort-cream overflow-hidden">
      <header className="w-full px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-myconfort-dark">
          Wizard iPad — Étape {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
        </h1>

        {/* Timeline simple et robuste */}
        <nav className="flex gap-2">
          {steps.map((id, idx) => {
            const st = getStepStatus(id, idx);
            const base = 'h-2 w-6 rounded-full';
            const cls =
              st === 'done' ? 'bg-myconfort-green'
              : st === 'current' ? 'bg-myconfort-blue'
              : 'bg-myconfort-dark/20';
            return <span key={id} className={`${base} ${cls}`} aria-label={`${id} - ${st}`} />;
          })}
        </nav>
      </header>

      <main className="w-full h-[calc(100dvh-56px)]">{children}</main>
    </div>
  );
}
