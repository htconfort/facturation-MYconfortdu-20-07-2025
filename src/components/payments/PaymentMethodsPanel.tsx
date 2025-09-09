// src/components/payments/PaymentMethodsPanel.tsx
import { ReactNode, useMemo } from "react";

type Props = {
  children: ReactNode;         // tes boutons/tiles Alma, CB, Espèces, Chèque à venir, etc.
  isPortrait?: boolean;        // si tu as déjà le hook useIsPortrait, passe-le ici
  topOffsetPx?: number;        // si tu as un header sticky, pour affiner le calc
  bottomOffsetPx?: number;     // si tu as un footer / bandeau actions
};

export default function PaymentMethodsPanel({
  children,
  isPortrait = true,
  topOffsetPx = 72,     // ajuste selon ton AppShell (header)
  bottomOffsetPx = 84,  // ajuste si tu as un footer actions (Valider/Continuer)
}: Props) {
  // Hauteur max responsive : on s'adapte au mode portrait/paysage
  const maxHeightStyle = useMemo(() => {
    // Utilise 100svh (safe viewport) si dispo, sinon 100vh.
    // On réserve un peu d'espace pour les autres blocs (acompte, totaux, CTA).
    const base = "100svh"; // iOS friendly
    const reservePortrait = 280;  // espace pour totaux + acompte + marges
    const reserveLandscape = 220; // un peu moins en paysage
    const reserve = (isPortrait ? reservePortrait : reserveLandscape) + topOffsetPx + bottomOffsetPx;
    return { maxHeight: `calc(${base} - ${reserve}px)` };
  }, [isPortrait, topOffsetPx, bottomOffsetPx]);

  return (
    <div className="relative w-full" style={maxHeightStyle}>
      <div
        className="
          overflow-y-auto overscroll-contain
          pr-3 -mr-3
          scroll-smooth
        "
        // Important : ce style empêche un parent d'écraser le scroll avec contain
        style={{ 
          contain: "layout paint",
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>

      {/* Fades haut/bas pour indiquer le scroll - adaptés à la charte MyConfort */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-myconfort-cream/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-myconfort-cream/90 to-transparent" />
    </div>
  );
}
