// src/utils/discount.ts
export type Product = {
  id: string;
  designation: string;
  category: string;
  priceTTC: number;
  qty?: number;
  discount?: number;
  discountType?: 'percent' | 'fixed';
};

export type FairContext = {
  foireActive: boolean;
  eventLocation?: string;
};

/**
 * Détermine le taux de remise automatique pour un produit en contexte foire
 * @param product Produit à évaluer
 * @param context Contexte foire
 * @returns Taux de remise (0.20 = 20%)
 */
export function getFairDiscountRate(product: Product, context: FairContext): number {
  if (!context.foireActive) return 0;
  
  // Détection des matelas (insensible à la casse)
  const category = product.category.toLowerCase();
  const designation = product.designation.toLowerCase();
  
  if (category.includes('matelas') || designation.includes('matelas')) {
    return 0.20; // 20% de remise automatique
  }
  
  return 0;
}

/**
 * Applique une remise automatique au prix
 * @param price Prix original
 * @param rate Taux de remise (0.20 = 20%)
 * @returns Prix remisé arrondi à 2 décimales
 */
export function applyFairDiscount(price: number, rate: number): number {
  return Math.round(price * (1 - rate) * 100) / 100;
}

/**
 * Détermine si le contexte correspond à une foire
 * @param eventLocation Lieu de l'événement
 * @returns true si c'est une foire
 */
export function isFairContext(eventLocation?: string): boolean {
  if (!eventLocation) return false;
  
  const location = eventLocation.toLowerCase();
  return location.includes('foire') || 
         location.includes('salon') || 
         location.includes('exposition') ||
         location.includes('stand');
}

/**
 * Calcule automatiquement la remise pour un produit selon le contexte
 * @param product Produit
 * @param eventLocation Lieu de l'événement
 * @returns Objet avec prix original, taux de remise, et prix final
 */
export function calculateAutoDiscount(product: Product, eventLocation?: string) {
  const context: FairContext = {
    foireActive: isFairContext(eventLocation),
    eventLocation
  };
  
  const autoDiscountRate = getFairDiscountRate(product, context);
  const originalPrice = product.priceTTC;
  const discountedPrice = applyFairDiscount(originalPrice, autoDiscountRate);
  
  return {
    originalPrice,
    autoDiscountRate,
    discountedPrice,
    hasAutoDiscount: autoDiscountRate > 0,
    discountAmount: originalPrice - discountedPrice
  };
}
