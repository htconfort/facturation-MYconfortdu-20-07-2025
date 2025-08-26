import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapSimple({ onNext, onPrev }: StepProps) {
  const {
    client,
    produits,
    paiement,
    livraison,
    invoiceNumber,
    invoiceDate,
    eventLocation,
    signature,
    termsAccepted
  } = useInvoiceWizard();

  const [isProcessing, setIsProcessing] = useState(false);

  // Calcul du total
  const total = produits.reduce((sum, p) => {
    const productTotal = p.priceTTC * p.qty;
    const discountAmount = p.discountType === 'percent' 
      ? (productTotal * p.discount) / 100 
      : p.discount;
    return sum + (productTotal - discountAmount);
  }, 0);

  const handleFinish = () => {
    setIsProcessing(true);
    
    // Simulation du traitement
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 2000);
  };

  if (isProcessing) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Génération de la facture...</h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📄 Récapitulatif de la facture
          <span className="text-lg font-normal text-blue-600">#{invoiceNumber}</span>
        </h1>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Informations facture */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📋 Informations facture
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Numéro :</span>
                <span className="ml-2 text-gray-800">{invoiceNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date :</span>
                <span className="ml-2 text-gray-800">{invoiceDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Lieu :</span>
                <span className="ml-2 text-gray-800">{eventLocation}</span>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              👤 Client
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Nom :</span>
                <span className="ml-2 text-gray-800">{client.name || 'Non renseigné'}</span>
              </div>
              {client.email && (
                <div>
                  <span className="font-medium text-gray-600">Email :</span>
                  <span className="ml-2 text-gray-800">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div>
                  <span className="font-medium text-gray-600">Téléphone :</span>
                  <span className="ml-2 text-gray-800">{client.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Produits */}
          <div className="bg-white rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📦 Produits ({produits.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Désignation</th>
                    <th className="text-center py-2 text-gray-600">Qté</th>
                    <th className="text-right py-2 text-gray-600">Prix TTC</th>
                    <th className="text-right py-2 text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((produit, index) => {
                    const productTotal = produit.priceTTC * produit.qty;
                    const discountAmount = produit.discountType === 'percent' 
                      ? (productTotal * produit.discount) / 100 
                      : produit.discount;
                    const finalTotal = productTotal - discountAmount;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800">{produit.designation}</td>
                        <td className="py-3 text-center text-gray-800">{produit.qty}</td>
                        <td className="py-3 text-right text-gray-800">{produit.priceTTC.toFixed(2)} €</td>
                        <td className="py-3 text-right font-medium text-gray-800">{finalTotal.toFixed(2)} €</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="py-4 text-right font-bold text-gray-800">Total TTC :</td>
                    <td className="py-4 text-right font-bold text-xl text-blue-600">{total.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              💳 Paiement
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Mode :</span>
                <span className="ml-2 text-gray-800">{paiement.method || 'Non défini'}</span>
              </div>
              {paiement.depositAmount && (
                <div>
                  <span className="font-medium text-gray-600">Acompte :</span>
                  <span className="ml-2 text-gray-800">{paiement.depositAmount.toFixed(2)} €</span>
                </div>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              🚚 Livraison
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Mode :</span>
                <span className="ml-2 text-gray-800">{livraison.deliveryMethod || 'Non défini'}</span>
              </div>
              {livraison.deliveryNotes && (
                <div>
                  <span className="font-medium text-gray-600">Notes :</span>
                  <span className="ml-2 text-gray-800">{livraison.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              ✍️ Signature
            </h2>
            <div className="flex items-center gap-4">
              {signature?.dataUrl ? (
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <img 
                      src={signature.dataUrl} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">✅ Signée</div>
                    <div className="text-xs text-gray-500">
                      {signature.timestamp && new Date(signature.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-orange-600">⚠️ Signature manquante</div>
              )}
              
              <div className="ml-auto">
                <div className={`font-medium ${termsAccepted ? 'text-green-600' : 'text-orange-600'}`}>
                  {termsAccepted ? '✅ CGV acceptées' : '⚠️ CGV non acceptées'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={onPrev}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Précédent
          </button>
          
          <button
            onClick={handleFinish}
            disabled={!signature?.dataUrl || !termsAccepted}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            🎉 Finaliser la facture
          </button>
        </div>
      </div>
    </div>
  );
}
