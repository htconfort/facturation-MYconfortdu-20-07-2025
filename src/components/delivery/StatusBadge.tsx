import React from 'react';
import { DeliveryStatus } from './DeliveryStatusSelector';
import './styles/delivery-status.css';

// Badge de statut compact
export const StatusBadge: React.FC<{
  status: DeliveryStatus;
  size?: 'small' | 'medium' | 'large';
}> = ({ status, size = 'medium' }) => {
  const statusConfig = {
    pending: { icon: '⏳', label: 'En attente', color: '#FF9800', bg: '#FFF3E0' },
    delivered: { icon: '✅', label: 'Emporté', color: '#4CAF50', bg: '#E8F5E8' },
    to_deliver: { icon: '📦', label: 'À livrer', color: '#2196F3', bg: '#E3F2FD' },
    cancelled: { icon: '❌', label: 'Annulé', color: '#f44336', bg: '#FFEBEE' }
  };
  
  const config = statusConfig[status];
  const sizeClass = `status-badge-${size}`;
  
  return (
    <span 
      className={`status-badge ${sizeClass}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}40`
      }}
    >
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.label}</span>
    </span>
  );
};
