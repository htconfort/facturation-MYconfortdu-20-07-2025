import React from 'react';
import {
  DeliveryStatus,
  DeliveryStatusSelector,
  ProductWithDeliveryStatus,
} from './DeliveryStatusSelector';
import { StatusBadge } from './StatusBadge';
import './styles/delivery-status.css';

// Section de gestion des produits avec statuts
export const ProductsWithStatusSection: React.FC<{
  products: ProductWithDeliveryStatus[];
  onProductsChange: (products: ProductWithDeliveryStatus[]) => void;
  readonly?: boolean;
}> = ({ products, onProductsChange, readonly = false }) => {
  const handleStatusChange = (
    productIndex: number,
    newStatus: DeliveryStatus
  ) => {
    const updatedProducts = products.map((product, index) => {
      if (index === productIndex) {
        return {
          ...product,
          statut_livraison: newStatus,
          // Mise à jour de la compatibilité
          emporte:
            newStatus === 'delivered'
              ? 'Emporté'
              : newStatus === 'to_deliver'
                ? 'À livrer'
                : newStatus === 'cancelled'
                  ? 'Annulé'
                  : 'En attente',
        };
      }
      return product;
    });

    onProductsChange(updatedProducts);
  };

  const getGlobalStatus = (): DeliveryStatus => {
    if (products.length === 0) return 'pending';

    const deliveredCount = products.filter(
      p => p.statut_livraison === 'delivered'
    ).length;
    const toDeliverCount = products.filter(
      p => p.statut_livraison === 'to_deliver'
    ).length;
    const cancelledCount = products.filter(
      p => p.statut_livraison === 'cancelled'
    ).length;

    if (deliveredCount === products.length) return 'delivered';
    if (cancelledCount === products.length) return 'cancelled';
    if (toDeliverCount > 0 || deliveredCount > 0) return 'to_deliver';
    return 'pending';
  };

  const globalStatus = getGlobalStatus();

  return (
    <div className='products-with-status-section'>
      <div className='section-header'>
        <h3>📦 Produits et statuts de livraison</h3>
        <div className='global-status'>
          <span className='global-status-label'>Statut global :</span>
          <StatusBadge status={globalStatus} size='medium' />
        </div>
      </div>

      {products.length === 0 ? (
        <div className='no-products'>
          <p>Aucun produit ajouté</p>
        </div>
      ) : (
        <div className='products-list'>
          {products.map((product, index) => (
            <div key={index} className='product-item'>
              <div className='product-info'>
                <div className='product-main'>
                  <h4 className='product-name'>{product.nom}</h4>
                  <span className='product-category'>{product.categorie}</span>
                </div>
                <div className='product-details'>
                  <span className='quantity'>Qté: {product.quantite}</span>
                  <span className='price'>Prix: {product.prix_ttc}€</span>
                  <span className='total'>Total: {product.total_ttc}€</span>
                  {product.remise > 0 && (
                    <span className='discount'>
                      Remise: -{product.remise}
                      {product.type_remise === 'percent' ? '%' : '€'}
                    </span>
                  )}
                </div>
              </div>

              <div className='product-status'>
                {readonly ? (
                  <StatusBadge status={product.statut_livraison} />
                ) : (
                  <DeliveryStatusSelector
                    product={product}
                    productIndex={index}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résumé des statuts */}
      <div className='status-summary'>
        <div className='summary-item'>
          <StatusBadge status='pending' size='small' />
          <span>
            {products.filter(p => p.statut_livraison === 'pending').length}
          </span>
        </div>
        <div className='summary-item'>
          <StatusBadge status='delivered' size='small' />
          <span>
            {products.filter(p => p.statut_livraison === 'delivered').length}
          </span>
        </div>
        <div className='summary-item'>
          <StatusBadge status='to_deliver' size='small' />
          <span>
            {products.filter(p => p.statut_livraison === 'to_deliver').length}
          </span>
        </div>
        <div className='summary-item'>
          <StatusBadge status='cancelled' size='small' />
          <span>
            {products.filter(p => p.statut_livraison === 'cancelled').length}
          </span>
        </div>
      </div>
    </div>
  );
};
