import { Product, Invoice } from '../types';
import { calculateProductTotal } from './calculations';

export const calculateInvoiceTotals = (
  products: Product[], 
  taxRate: number, 
  depositAmount: number = 0,
  paymentMethod: string = ''
): Pick<Invoice, 'montantHT' | 'montantTTC' | 'montantTVA' | 'montantRemise' | 'montantAcompte' | 'montantRestant'> => {
  
  // Calculer les totaux des produits
  const totals = products.reduce((acc, product) => {
    const totalProductTTC = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
    
    const totalProductHT = totalProductTTC / (1 + (taxRate / 100));
    const originalTotal = product.priceTTC * product.quantity;
    const discountAmount = originalTotal - totalProductTTC;
    
    return {
      totalHT: acc.totalHT + totalProductHT,
      totalTTC: acc.totalTTC + totalProductTTC,
      totalDiscount: acc.totalDiscount + discountAmount
    };
  }, { totalHT: 0, totalTTC: 0, totalDiscount: 0 });
  
  const montantTVA = totals.totalTTC - totals.totalHT;
  
  // Logique améliorée pour le calcul du montant restant
  let montantRestant: number;
  
  // Modes de paiement immédiats (paiement complet)
  const isImmediatePayment = ['espèces', 'carte bleue', 'carte bancaire', 'virement', 'carte'].includes(
    paymentMethod.toLowerCase().trim()
  );
  
  if (isImmediatePayment && depositAmount === 0) {
    // Paiement immédiat sans acompte = facture entièrement payée
    montantRestant = 0;
  } else {
    // Autres cas : chèque, ou paiement avec acompte
    montantRestant = Math.max(0, totals.totalTTC - depositAmount);
  }
  
  return {
    montantHT: totals.totalHT,
    montantTTC: totals.totalTTC,
    montantTVA: montantTVA,
    montantRemise: totals.totalDiscount,
    montantAcompte: depositAmount,
    montantRestant: montantRestant
  };
};

export const calculateProductTotals = (product: Omit<Product, 'totalHT' | 'totalTTC'>, taxRate: number): Pick<Product, 'totalHT' | 'totalTTC'> => {
  const totalTTC = calculateProductTotal(
    product.quantity,
    product.priceTTC,
    product.discount,
    product.discountType
  );
  
  const totalHT = totalTTC / (1 + (taxRate / 100));
  
  return {
    totalHT,
    totalTTC
  };
};
