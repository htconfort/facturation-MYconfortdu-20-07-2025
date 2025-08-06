import { Product, DeliveryStatus } from '../types';

/**
 * Migre automatiquement les produits existants pour ajouter le statut de livraison
 * si celui-ci n'existe pas déjà
 */
export const migrateProductsWithDeliveryStatus = (products: Product[]): Product[] => {
  return products.map(product => {
    // Si le produit n'a pas de statut de livraison, on l'ajoute
    if (!product.statut_livraison) {
      return {
        ...product,
        statut_livraison: product.isPickupOnSite ? 'delivered' : 'pending' as DeliveryStatus
      };
    }
    
    // Si le produit a déjà un statut, on le retourne tel quel
    return product;
  });
};

/**
 * Synchronise le champ isPickupOnSite avec le statut de livraison
 * pour maintenir la compatibilité ascendante
 */
export const synchronizePickupStatus = (product: Product): Product => {
  const updates: Partial<Product> = {};
  
  // Synchronisation du statut de livraison vers isPickupOnSite
  if (product.statut_livraison) {
    updates.isPickupOnSite = product.statut_livraison === 'delivered';
  }
  
  // Synchronisation d'isPickupOnSite vers statut de livraison (si pas déjà défini)
  if (product.isPickupOnSite !== undefined && !product.statut_livraison) {
    updates.statut_livraison = product.isPickupOnSite ? 'delivered' : 'pending';
  }
  
  return { ...product, ...updates };
};

/**
 * Valide la cohérence des statuts de livraison
 */
export const validateDeliveryStatus = (product: Product): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérification de la cohérence entre statut_livraison et isPickupOnSite
  if (product.statut_livraison === 'delivered' && !product.isPickupOnSite) {
    errors.push('Produit marqué comme "emporté" mais isPickupOnSite est false');
  }
  
  if (product.isPickupOnSite && product.statut_livraison !== 'delivered') {
    errors.push('Produit marqué comme pickup mais statut de livraison différent de "delivered"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtient les statistiques de livraison pour une liste de produits
 */
export const getDeliveryStatistics = (products: Product[]) => {
  const stats = products.reduce((acc, product) => {
    const status = product.statut_livraison || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<DeliveryStatus, number>);
  
  const total = products.length;
  const delivered = stats.delivered || 0;
  const pending = stats.pending || 0;
  const to_deliver = stats.to_deliver || 0;
  const cancelled = stats.cancelled || 0;
  
  return {
    total,
    delivered,
    pending,
    to_deliver,
    cancelled,
    deliveredPercent: total > 0 ? Math.round((delivered / total) * 100) : 0,
    completionPercent: total > 0 ? Math.round(((delivered + cancelled) / total) * 100) : 0,
    isComplete: pending === 0 && to_deliver === 0,
    hasIssues: cancelled > 0
  };
};

/**
 * Filtre les produits par statut de livraison
 */
export const filterProductsByDeliveryStatus = (products: Product[], status: DeliveryStatus): Product[] => {
  return products.filter(product => (product.statut_livraison || 'pending') === status);
};

/**
 * Obtient le label d'affichage pour un statut de livraison
 */
export const getDeliveryStatusLabel = (status: DeliveryStatus): string => {
  const labels = {
    pending: '⏳ En attente',
    delivered: '✅ Emporté',
    to_deliver: '📦 À livrer',
    cancelled: '❌ Annulé'
  };
  
  return labels[status] || '❓ Inconnu';
};

/**
 * Obtient la couleur associée à un statut de livraison
 */
export const getDeliveryStatusColor = (status: DeliveryStatus): { color: string; bgColor: string } => {
  const colors = {
    pending: { color: '#FF9800', bgColor: '#FFF3E0' },
    delivered: { color: '#4CAF50', bgColor: '#E8F5E8' },
    to_deliver: { color: '#2196F3', bgColor: '#E3F2FD' },
    cancelled: { color: '#f44336', bgColor: '#FFEBEE' }
  };
  
  return colors[status] || { color: '#757575', bgColor: '#f5f5f5' };
};
