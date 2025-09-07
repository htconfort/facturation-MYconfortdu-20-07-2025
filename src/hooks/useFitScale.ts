import { useEffect, useState, useCallback } from 'react';

export function useFitScale(baseW = 1024, baseH = 768, padding = 0) {
  const [scale, setScale] = useState(1);

  const recompute = useCallback(() => {
    // Protection contre les erreurs de fenêtre
    if (typeof window === 'undefined') {
      setScale(1);
      return;
    }
    
    const vw = Math.max(0, window.innerWidth - padding * 2);
    const vh = Math.max(0, window.innerHeight - padding * 2);
    const s = Math.min(vw / baseW, vh / baseH);
    setScale(s > 0 ? s : 1);
  }, [baseW, baseH, padding]);

  useEffect(() => {
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('orientationchange', recompute);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('orientationchange', recompute);
    };
  }, [recompute]);

  return scale;
}
