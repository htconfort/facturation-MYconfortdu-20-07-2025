import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import FloatingFooter from '../../components/ui/FloatingFooter';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapNoScrollFixed({ onNext, onPrev }: StepProps) {
  const { client, produits, paiement, livraison, invoiceNumber, invoiceDate } = useInvoiceWizard();
  
  // Calcul du total TTC de manière sécurisée
  const totalTTC = (produits || []).reduce((sum, p) => {
    if (!p || typeof p.qty !== 'number' || typeof p.priceTTC !== 'number') {
      return sum;
    }
    return sum + calculateProductTotal(
      p.qty || 0, 
      p.priceTTC || 0, 
      p.discount || 0, 
      p.discountType || 'fixed'
    );
  }, 0);

  const [showDetails, setShowDetails] = useState(false);

  // FOOTER / safe-area handling - Version robuste iPad
  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;
  const contentPadBottom = `calc(${FOOTER_H}px + ${footerPadBottom} + 16px)`;

  return (
    <div className='w-full min-h-[100svh] bg-myconfort-cream relative overflow-x-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          📋 Récapitulatif Final
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 7/8 • Vérification avant finalisation
        </p>
      </div>

      {/* Content */}
      <div className='px-6 py-6' style={{ paddingBottom: contentPadBottom }}>
        {/* Résumé principal */}
        <div className='bg-myconfort-green/10 p-6 rounded-xl border border-myconfort-green/30 mb-6'>
          <h2 className='text-xl font-bold text-myconfort-dark mb-4'>
            📊 Résumé de la facture
          </h2>
          
          <div className='grid grid-cols-2 gap-6 mb-6'>
            {/* Colonne Gauche - Infos client */}
            <div>
              <h3 className='font-bold text-myconfort-blue mb-2'>👤 Client</h3>
              <p className='text-sm text-myconfort-dark'>
                <strong>Nom:</strong> {client?.name || 'Non renseigné'}
              </p>
              <p className='text-sm text-myconfort-dark'>
                <strong>Email:</strong> {client?.email || 'Non renseigné'}
              </p>
              <p className='text-sm text-myconfort-dark'>
                <strong>Téléphone:</strong> {client?.phone || 'Non renseigné'}
              </p>
              <p className='text-sm text-myconfort-dark'>
                <strong>Adresse:</strong> {client?.address || 'Non renseigné'}
              </p>
            </div>

            {/* Colonne Droite - Infos facture */}
            <div>
              <h3 className='font-bold text-myconfort-blue mb-2'>📄 Facture</h3>
              <p className='text-sm text-myconfort-dark'>
                <strong>Numéro:</strong> {invoiceNumber || 'À générer'}
              </p>
              <p className='text-sm text-myconfort-dark'>
                <strong>Date:</strong> {invoiceDate || new Date().toLocaleDateString()}
              </p>
              <p className='text-sm text-myconfort-dark'>
                <strong>Produits:</strong> {(produits || []).length} article(s)
              </p>
              <p className='text-lg font-bold text-myconfort-green'>
                <strong>Total TTC:</strong> {totalTTC.toFixed(2)}€
              </p>
            </div>
          </div>

          {/* Paiement */}
          <div className='border-t pt-4'>
            <h3 className='font-bold text-myconfort-blue mb-2'>💳 Paiement</h3>
            <p className='text-sm text-myconfort-dark'>
              <strong>Mode:</strong> {paiement?.method || 'Non défini'}
            </p>
            {paiement?.depositAmount && (
              <p className='text-sm text-myconfort-dark'>
                <strong>Acompte:</strong> {paiement.depositAmount}€
              </p>
            )}
          </div>

          {/* Livraison */}
          <div className='border-t pt-4 mt-4'>
            <h3 className='font-bold text-myconfort-blue mb-2'>🚚 Livraison</h3>
            <p className='text-sm text-myconfort-dark'>
              <strong>Mode:</strong> {livraison?.deliveryMethod || 'Non défini'}
            </p>
            {livraison?.deliveryAddress && (
              <p className='text-sm text-myconfort-dark'>
                <strong>Adresse:</strong> {livraison.deliveryAddress}
              </p>
            )}
            {livraison?.deliveryNotes && (
              <p className='text-sm text-myconfort-dark'>
                <strong>Notes:</strong> {livraison.deliveryNotes}
              </p>
            )}
          </div>
        </div>

        {/* Détails produits */}
        <div className='bg-white p-4 rounded-xl border border-gray-200 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-bold text-myconfort-dark'>🛍️ Produits commandés</h3>
            <button
              type='button'
              onClick={() => setShowDetails(!showDetails)}
              className='px-3 py-1 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 rounded-lg text-sm font-medium transition-colors'
            >
              {showDetails ? 'Masquer' : 'Voir détails'}
            </button>
          </div>

          {showDetails ? (
            <div className='space-y-2'>
              {(produits || []).map((produit, index) => (
                <div key={index} className='flex items-center justify-between py-2 border-b border-gray-100 last:border-0'>
                  <div>
                    <p className='font-medium text-sm'>{produit.designation || `Produit ${index + 1}`}</p>
                    <p className='text-xs text-gray-600'>Qté: {produit.qty || 0} × {(produit.priceTTC || 0).toFixed(2)}€</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-sm'>
                      {calculateProductTotal(
                        produit.qty || 0,
                        produit.priceTTC || 0,
                        produit.discount || 0,
                        produit.discountType || 'fixed'
                      ).toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-600 text-center py-4'>
              {(produits || []).length} produit(s) • Total: {totalTTC.toFixed(2)}€
            </p>
          )}
        </div>

        {/* Actions */}
        <div className='bg-myconfort-blue/10 p-4 rounded-xl border border-myconfort-blue/30'>
          <h3 className='font-bold text-myconfort-blue mb-3 text-center'>
            ✅ Récapitulatif validé
          </h3>
          <p className='text-sm text-myconfort-dark text-center mb-4'>
            Toutes les informations sont correctes. Vous pouvez passer à l'étape suivante.
          </p>
          
          <div className='text-center'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm'>
              <span>🎉</span>
              <span>Prêt pour la finalisation</span>
            </div>
          </div>
        </div>
      </div>

      {/* FloatingFooter */}
      <FloatingFooter
        leftLabel='← Précédent'
        onLeft={onPrev}
        rightLabel='Finaliser →'
        onRight={onNext}
      />
    </div>
  );
}
