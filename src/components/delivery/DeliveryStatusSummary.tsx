import React from 'react';
import { Product, DeliveryStatus } from '../../types';
import { StatusBadge } from './StatusBadge';

interface DeliveryStatusSummaryProps {
  products: Product[];
}

export const DeliveryStatusSummary: React.FC<DeliveryStatusSummaryProps> = ({ products }) => {
  // Calcul des statistiques de livraison
  const statusCounts = products.reduce((acc, product) => {
    const status = product.statut_livraison || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<DeliveryStatus, number>);

  const totalProducts = products.length;
  const deliveredCount = statusCounts.delivered || 0;
  const pendingCount = statusCounts.pending || 0;
  const toDeliverCount = statusCounts.to_deliver || 0;
  const cancelledCount = statusCounts.cancelled || 0;

  // Calcul des pourcentages
  const deliveredPercent = totalProducts > 0 ? Math.round((deliveredCount / totalProducts) * 100) : 0;
  const progressPercent = totalProducts > 0 ? Math.round(((deliveredCount + cancelledCount) / totalProducts) * 100) : 0;

  if (totalProducts === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
        📊 Résumé des statuts de livraison
      </h3>
      
      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progression globale</span>
          <span>{progressPercent}% terminé</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pendingCount > 0 && (
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <StatusBadge status="pending" />
              <span className="text-lg font-bold text-orange-600">{pendingCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">En attente</p>
          </div>
        )}

        {toDeliverCount > 0 && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <StatusBadge status="to_deliver" />
              <span className="text-lg font-bold text-blue-600">{toDeliverCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">À livrer</p>
          </div>
        )}

        {deliveredCount > 0 && (
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <StatusBadge status="delivered" />
              <span className="text-lg font-bold text-green-600">{deliveredCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Emporté</p>
          </div>
        )}

        {cancelledCount > 0 && (
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <StatusBadge status="cancelled" />
              <span className="text-lg font-bold text-red-600">{cancelledCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Annulé</p>
          </div>
        )}
      </div>

      {/* Alerte si tous les produits ne sont pas encore traités */}
      {pendingCount > 0 && (
        <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-700">
          ⚠️ {pendingCount} produit(s) en attente de traitement
        </div>
      )}

      {/* Message de félicitations si tout est terminé */}
      {pendingCount === 0 && toDeliverCount === 0 && totalProducts > 0 && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
          ✅ Tous les produits ont été traités !
        </div>
      )}
    </div>
  );
};
