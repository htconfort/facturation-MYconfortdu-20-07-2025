import React from 'react';
import './styles/delivery-status.css';

// Types pour les statuts de livraison
export type DeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'to_deliver'
  | 'cancelled';

// Interface pour les produits avec statuts
export interface ProductWithDeliveryStatus {
  nom: string;
  quantite: number;
  prix_ttc: number;
  total_ttc: number;
  categorie: string;
  remise: number;
  type_remise: 'percent' | 'fixed';

  // NOUVEAUX CHAMPS
  statut_livraison: DeliveryStatus;
  emporte?: boolean | string; // Maintient la compatibilité
}

// Composant pour sélectionner le statut d'un produit
export const DeliveryStatusSelector: React.FC<{
  product: ProductWithDeliveryStatus;
  productIndex: number;
  onStatusChange: (index: number, status: DeliveryStatus) => void;
  disabled?: boolean;
}> = ({ product, productIndex, onStatusChange, disabled = false }) => {
  const statusOptions = [
    {
      value: 'pending' as DeliveryStatus,
      label: '⏳ En attente',
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      value: 'delivered' as DeliveryStatus,
      label: '✅ Emporté',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
    },
    {
      value: 'to_deliver' as DeliveryStatus,
      label: '📦 À livrer',
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
    {
      value: 'cancelled' as DeliveryStatus,
      label: '❌ Annulé',
      color: '#f44336',
      bgColor: '#FFEBEE',
    },
  ];

  const currentOption =
    statusOptions.find(opt => opt.value === product.statut_livraison) ||
    statusOptions[0];

  return (
    <div className='delivery-status-selector'>
      <label htmlFor={`status-${productIndex}`} className='status-label'>
        Statut de livraison :
      </label>
      <select
        id={`status-${productIndex}`}
        value={product.statut_livraison}
        onChange={e =>
          onStatusChange(productIndex, e.target.value as DeliveryStatus)
        }
        disabled={disabled}
        className='status-select'
        style={{
          backgroundColor: currentOption.bgColor,
          color: currentOption.color,
          borderColor: currentOption.color,
        }}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className='status-indicator' style={{ color: currentOption.color }}>
        {currentOption.label}
      </div>
    </div>
  );
};
