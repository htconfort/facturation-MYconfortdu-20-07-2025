import { useEffect, useRef } from 'react';

/**
 * Hook pour gérer les indicateurs de scroll sur iPad
 * Affiche des indicateurs visuels quand il y a du contenu scrollable
 */
export function useScrollIndicators() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topIndicatorRef = useRef<HTMLDivElement>(null);
  const bottomIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const topIndicator = topIndicatorRef.current;
    const bottomIndicator = bottomIndicatorRef.current;

    if (!container || !topIndicator || !bottomIndicator) return;

    const updateIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Indicateur du haut : visible si on peut scroller vers le haut
      const canScrollUp = scrollTop > 10;
      topIndicator.classList.toggle('scroll-indicator-hidden', !canScrollUp);
      
      // Indicateur du bas : visible si on peut scroller vers le bas
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 10;
      bottomIndicator.classList.toggle('scroll-indicator-hidden', !canScrollDown);
    };

    // Vérifier initialement
    updateIndicators();

    // Écouter les événements de scroll
    container.addEventListener('scroll', updateIndicators, { passive: true });
    
    // Vérifier après redimensionnement ou changement de contenu
    const resizeObserver = new ResizeObserver(updateIndicators);
    resizeObserver.observe(container);

    // Vérifier après changement de contenu
    const mutationObserver = new MutationObserver(updateIndicators);
    mutationObserver.observe(container, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      container.removeEventListener('scroll', updateIndicators);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return {
    scrollContainerRef,
    topIndicatorRef,
    bottomIndicatorRef,
  };
}
