import { describe, it, expect, vi, beforeAll } from 'vitest';
import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import { useSwipe, useHorizontalSwipe } from '../useSwipe';

// Polyfill simple pour TouchEvent en jsdom
beforeAll(() => {
  if (typeof (globalThis as any).TouchEvent === 'undefined') {
    (globalThis as any).TouchEvent = class extends Event {
      changedTouches: any[];
      touches: any[];
      constructor(type: string, init: any = {}) {
        super(type, init);
        this.changedTouches = init?.changedTouches || [];
        this.touches = init?.touches || [];
      }
    } as any;
  }
  if (typeof (globalThis as any).Touch === 'undefined') {
    (globalThis as any).Touch = function (init: any) {
      return init;
    } as any;
  }
});

function fireTouch(
  target: Element | Document,
  type: 'touchstart' | 'touchmove' | 'touchend',
  x: number,
  y: number
) {
  const touch: any = { identifier: 1, target, clientX: x, clientY: y };
  const evt = new (globalThis as any).TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch],
  });
  (target as any).dispatchEvent(evt);
}

function WithSwipe({
  onSwipe,
  enabled = true,
}: {
  onSwipe: (d: string) => void;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSwipe({
    enabled,
    onSwipe,
    preventScrollOnX: true,
    threshold: 30,
    velocity: 0,
  });
  return React.createElement('div', { 'data-testid': 'zone', ref });
}

describe('useSwipe', () => {
  it('attache et détache les listeners quand enabled=true', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const rmSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      React.createElement(WithSwipe, { onSwipe: () => {}, enabled: true })
    );
    expect(addSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
      expect.anything()
    );
    expect(addSpy).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function),
      expect.anything()
    );
    expect(addSpy).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function),
      expect.anything()
    );

    unmount();
    expect(rmSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(rmSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(rmSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('détecte un swipe left', () => {
    const cb = vi.fn();
    render(React.createElement(WithSwipe, { onSwipe: cb }));
    fireTouch(document, 'touchstart', 200, 100);
    fireTouch(document, 'touchmove', 140, 100);
    fireTouch(document, 'touchend', 130, 100);
    expect(cb).toHaveBeenCalledWith('left');
  });

  it('détecte un swipe up', () => {
    const cb = vi.fn();
    render(React.createElement(WithSwipe, { onSwipe: cb }));
    fireTouch(document, 'touchstart', 100, 200);
    fireTouch(document, 'touchmove', 100, 150);
    fireTouch(document, 'touchend', 100, 120);
    expect(cb).toHaveBeenCalledWith('up');
  });
});

describe('useHorizontalSwipe', () => {
  function WithHS({
    onNext,
    onPrev,
  }: {
    onNext: () => void;
    onPrev: () => void;
  }) {
    useHorizontalSwipe({ onNext, onPrev, threshold: 30, velocity: 0 });
    return React.createElement('div');
  }

  it('appelle onNext pour swipe left et onPrev pour swipe right', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    render(React.createElement(WithHS, { onNext, onPrev }));

    fireTouch(document, 'touchstart', 200, 100);
    fireTouch(document, 'touchmove', 150, 100);
    fireTouch(document, 'touchend', 120, 100);
    expect(onNext).toHaveBeenCalled();

    fireTouch(document, 'touchstart', 100, 100);
    fireTouch(document, 'touchmove', 140, 100);
    fireTouch(document, 'touchend', 160, 100);
    expect(onPrev).toHaveBeenCalled();
  });
});
