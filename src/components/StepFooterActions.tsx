type Props = {
  isValid: boolean;          // true = on peut avancer
  onPrev: () => void;        // action "Précédent"
  onNext: () => void;        // action "Suivant" (ne sera appelée que si isValid)
  className?: string;        // optionnel pour ajuster le layout
};

export default function StepFooterActions({ isValid, onPrev, onNext, className }: Props) {
  const handleNext = () => {
    if (!isValid) return;    // blocage si la step n'est pas valide
    onNext();
  };

  return (
    <div className={`mt-6 flex items-center justify-between gap-3 ${className ?? ''}`} style={{zIndex: 1000, position: 'relative'}}>
      {/* DEBUG - Indicateur visuel temporaire */}
      <div className="absolute -top-4 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
        BOUTONS NAVIGATION
      </div>
      
      {/* Précédent */}
      <button
        type="button"
        onClick={onPrev}
        className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[.99] transition"
      >
        ← Précédent
      </button>

      {/* Suivant : rouge si invalide, vert si valide */}
      <button
        type="button"
        aria-disabled={!isValid}
        onClick={handleNext}
        className={[
          "inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold shadow-sm active:scale-[.99] transition",
          isValid
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-red-600/90 text-white cursor-not-allowed"
        ].join(' ')}
        title={isValid ? "Continuer" : "Complétez les infos de paiement pour continuer"}
      >
        {isValid ? "Suivant →" : "Compléter pour continuer"}
      </button>
    </div>
  );
}
