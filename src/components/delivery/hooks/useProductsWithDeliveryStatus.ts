import { useState, useEffect } from 'react';
import { DeliveryStatus, ProductWithDeliveryStatus } from '../DeliveryStatusSelector';

// Hook personnalisé pour gérer les produits avec statuts
export const useProductsWithDeliveryStatus = (initialProducts: ProductWithDeliveryStatus[] = []) => {
  const [products, setProducts] = useState<ProductWithDeliveryStatus[]>(initialProducts);
  
  // Initialise les statuts manquants
  useEffect(() => {
    const productsWithStatus = products.map(product => ({
      ...product,
      statut_livraison: product.statut_livraison || 'pending' as DeliveryStatus
    }));
    
    if (JSON.stringify(productsWithStatus) !== JSON.stringify(products)) {
      setProducts(productsWithStatus);
    }
  }, [products]);
  
  const addProduct = (product: Omit<ProductWithDeliveryStatus, 'statut_livraison'>) => {
    const newProduct: ProductWithDeliveryStatus = {
      ...product,
      statut_livraison: 'pending'
    };
    setProducts(prev => [...prev, newProduct]);
  };
  
  const updateProductStatus = (index: number, status: DeliveryStatus) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, statut_livraison: status } : product
    ));
  };
  
  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };
  
  const resetProducts = () => {
    setProducts([]);
  };
  
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      delivered: 0,
      to_deliver: 0,
      cancelled: 0
    };
    
    products.forEach(product => {
      counts[product.statut_livraison]++;
    });
    
    return counts;
  };
  
  return {
    products,
    setProducts,
    addProduct,
    updateProductStatus,
    removeProduct,
    resetProducts,
    statusCounts: getStatusCounts(),
    totalProducts: products.length
  };
};
