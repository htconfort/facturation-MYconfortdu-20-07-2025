import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour créer une barre de scroll custom visible sur iPad
 */
export function useCustomScrollbar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(20);
  const [thumbTop, setThumbTop] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollbar = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Calculer la taille et position du thumb
      const scrollRatio = clientHeight / scrollHeight;
      const newThumbHeight = Math.max(20, clientHeight * scrollRatio);
      const maxThumbTop = clientHeight - newThumbHeight;
      const newThumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;
      
      setThumbHeight(newThumbHeight);
      setThumbTop(isNaN(newThumbTop) ? 0 : newThumbTop);
      
      // Mettre à jour les indicateurs
      setShowTopIndicator(scrollTop > 50);
      setShowBottomIndicator(scrollTop < scrollHeight - clientHeight - 50);
    };

    // Initial update
    updateScrollbar();

    // Écouter le scroll
    container.addEventListener('scroll', updateScrollbar, { passive: true });

    // Observer les changements de taille
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);

    // Observer les changements de contenu
    const mutationObserver = new MutationObserver(updateScrollbar);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      container.removeEventListener('scroll', updateScrollbar);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return {
    scrollContainerRef,
    scrollbarRef,
    thumbRef,
    showTopIndicator,
    showBottomIndicator,
    thumbHeight,
    thumbTop,
  };
}
