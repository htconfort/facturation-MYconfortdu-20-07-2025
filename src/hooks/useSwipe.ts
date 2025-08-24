import { useEffect, useRef } from 'react';

export type SwipeAxis = 'x' | 'y' | 'both';
export type SwipeDir = 'left' | 'right' | 'up' | 'down';

export interface UseSwipeOptions {
  enabled?: boolean;
  axis?: SwipeAxis;
  threshold?: number; // distance min en px
  velocity?: number; // px/ms min
  preventScrollOnX?: boolean; // true => touchmove { passive:false } + preventDefault()
  onSwipe?: (dir: SwipeDir) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

export function useSwipe({
  enabled = true,
  axis = 'both',
  threshold = 60,
  velocity = 0.2,
  preventScrollOnX = true,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: UseSwipeOptions = {}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startT = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onStart = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      startX.current = t.clientX;
      startY.current = t.clientY;
      startT.current = now();
      active.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active.current) return;
      if (preventScrollOnX && (axis === 'x' || axis === 'both'))
        e.preventDefault();
    };

    const onEnd = (e: TouchEvent) => {
      if (!active.current) return;
      active.current = false;

      const t = e.changedTouches?.[0];
      if (!t) return;

      const dt = now() - startT.current;
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      const ax = Math.abs(dx),
        ay = Math.abs(dy);
      const main = ax >= ay ? ax : ay;
      const v = dt > 0 ? main / dt : 0;

      if (main < threshold || v < velocity) return;

      if ((axis === 'x' || axis === 'both') && ax >= ay) {
        if (dx < 0) {
          onSwipe?.('left');
          onSwipeLeft?.();
        } else {
          onSwipe?.('right');
          onSwipeRight?.();
        }
        return;
      }
      if ((axis === 'y' || axis === 'both') && ay > ax) {
        if (dy < 0) {
          onSwipe?.('up');
          onSwipeUp?.();
        } else {
          onSwipe?.('down');
          onSwipeDown?.();
        }
      }
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, {
      passive: !preventScrollOnX,
    }); // => false par défaut
    document.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove as EventListener);
      document.removeEventListener('touchend', onEnd);
    };
  }, [
    enabled,
    axis,
    threshold,
    velocity,
    preventScrollOnX,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  ]);
}

/** Helper horizontal pour wizard (left => next, right => prev) */
export function useHorizontalSwipe(opts: {
  enabled?: boolean;
  threshold?: number;
  velocity?: number;
  preventScrollOnX?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const {
    enabled = true,
    threshold = 60,
    velocity = 0.2,
    preventScrollOnX = true,
    onNext,
    onPrev,
  } = opts || {};
  useSwipe({
    enabled,
    axis: 'x',
    threshold,
    velocity,
    preventScrollOnX,
    onSwipeLeft: () => onNext?.(),
    onSwipeRight: () => onPrev?.(),
  });
}
