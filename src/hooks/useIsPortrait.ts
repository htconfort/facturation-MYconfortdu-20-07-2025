import { useState, useEffect } from 'react';

/**
 * Hook pour détecter l'orientation portrait/paysage
 * @param defaultValue Valeur par défaut (true = portrait)
 * @returns boolean - true si en mode portrait
 */
export default function useIsPortrait(defaultValue: boolean = true): boolean {
  const [isPortrait, setIsPortrait] = useState(defaultValue);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        // Utilise window.innerHeight vs window.innerWidth pour la détection
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    // Vérification initiale
    checkOrientation();

    // Écoute les changements d'orientation
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isPortrait;
}
