// Export des types existants + nouveaux types
export * from './index';

// Types spécifiques aux .cursorrules
export type WizardStep =
  | 'facture'
  | 'client'
  | 'produits'
  | 'paiement'
  | 'livraison'
  | 'signature'
  | 'recap';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeOptions {
  threshold?: number;
  velocity?: number;
  preventScrollOnX?: boolean;
  enabled?: boolean;
}

export interface SwipeCallbacks {
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}
