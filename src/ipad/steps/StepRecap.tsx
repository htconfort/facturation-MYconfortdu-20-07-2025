import { useMemo } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecap({ onPrev }: StepProps) {
  const { client, produits, paiement, livraison, signature } = useInvoiceWizard();

  const totals = useMemo(() => {
    const totalTTC = produits.reduce((sum, p) => {
      return sum + calculateProductTotal(
        Number(p.qty || 0),
        Number(p.priceTTC || 0),
        Number(p.discount || 0),
        p.discountType || 'percent'
      );
    }, 0);

    const totalHT = totalTTC / 1.2; // TVA 20%
    const totalTVA = totalTTC - totalHT;

    return { totalHT, totalTVA, totalTTC };
  }, [produits]);

  const formatEUR = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const produitsALivrer = produits.filter(p => !p.isPickupOnSite);
  const produitsAEmporter = produits.filter(p => p.isPickupOnSite);

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#477A0C] mb-2">📋 Récapitulatif Final</h2>
        <p className="text-gray-600 text-lg">
          Vérification complète avant génération de la facture
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Informations client */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Informations Client
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Nom :</strong> {client.name}
            </div>
            <div>
              <strong>Email :</strong> {client.email}
            </div>
            <div>
              <strong>Téléphone :</strong> {client.phone}
            </div>
            <div>
              <strong>Adresse :</strong> {client.address}
              {client.addressLine2 && <div className="text-gray-600">{client.addressLine2}</div>}
            </div>
            <div>
              <strong>Code postal :</strong> {client.postalCode}
            </div>
            <div>
              <strong>Ville :</strong> {client.city}
            </div>
            {client.siret && (
              <div>
                <strong>SIRET :</strong> {client.siret}
              </div>
            )}
            {client.housingType && (
              <div>
                <strong>Type de logement :</strong> {client.housingType}
              </div>
            )}
          </div>
        </section>

        {/* Produits commandés */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📦</span>
            Produits Commandés
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold">Désignation</th>
                  <th className="text-center py-3 px-2 font-semibold">Qté</th>
                  <th className="text-right py-3 px-2 font-semibold">Prix unit. TTC</th>
                  <th className="text-right py-3 px-2 font-semibold">Remise</th>
                  <th className="text-center py-3 px-2 font-semibold">Livraison</th>
                  <th className="text-right py-3 px-2 font-semibold">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((produit) => (
                  <tr key={produit.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <div className="font-medium">{produit.designation}</div>
                      {produit.category && <div className="text-sm text-gray-500">{produit.category}</div>}
                    </td>
                    <td className="text-center py-3 px-2">{produit.qty}</td>
                    <td className="text-right py-3 px-2">{formatEUR(produit.priceTTC)}</td>
                    <td className="text-right py-3 px-2">
                      {produit.discount > 0 ? (
                        <span className="text-green-600">
                          -{produit.discount}
                          {produit.discountType === 'percent' ? '%' : '€'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produit.isPickupOnSite 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {produit.isPickupOnSite ? '🚗 Emporter' : '📦 Livrer'}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 font-semibold">
                      {formatEUR(calculateProductTotal(
                        produit.qty,
                        produit.priceTTC,
                        produit.discount || 0,
                        produit.discountType || 'percent'
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <div className="flex justify-between py-2">
              <span>Total HT :</span>
              <span className="font-semibold">{formatEUR(totals.totalHT)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>TVA (20%) :</span>
              <span className="font-semibold">{formatEUR(totals.totalTVA)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 text-xl font-bold text-[#477A0C]">
              <span>Total TTC :</span>
              <span>{formatEUR(totals.totalTTC)}</span>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💳</span>
            Modalités de Paiement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <strong>Mode de règlement :</strong> {paiement.method}
            </div>
            {paiement.depositAmount && paiement.depositAmount > 0 && (
              <div>
                <strong>Acompte :</strong> {formatEUR(paiement.depositAmount)}
              </div>
            )}
            {paiement.nombreChequesAVenir && paiement.nombreChequesAVenir > 0 && (
              <div>
                <strong>Nombre de chèques :</strong> {paiement.nombreChequesAVenir} fois
              </div>
            )}
            {paiement.remainingAmount && paiement.remainingAmount > 0 && (
              <div>
                <strong>Montant par chèque :</strong> {formatEUR(paiement.remainingAmount / (paiement.nombreChequesAVenir || 1))}
              </div>
            )}
          </div>
          
          {paiement.note && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <strong>Notes :</strong> {paiement.note}
            </div>
          )}
        </section>

        {/* Modalités de livraison */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🚚</span>
            Modalités de Livraison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">À emporter ({produitsAEmporter.length})</h4>
              {produitsAEmporter.length > 0 ? (
                <ul className="text-sm text-green-700">
                  {produitsAEmporter.map(p => (
                    <li key={p.id}>• {p.designation} (x{p.qty})</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Aucun produit à emporter</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">À livrer ({produitsALivrer.length})</h4>
              {produitsALivrer.length > 0 ? (
                <ul className="text-sm text-blue-700">
                  {produitsALivrer.map(p => (
                    <li key={p.id}>• {p.designation} (x{p.qty})</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Aucun produit à livrer</p>
              )}
            </div>
          </div>

          {livraison.deliveryMethod && (
            <div className="mt-4">
              <strong>Mode de livraison :</strong> {livraison.deliveryMethod}
            </div>
          )}

          {livraison.eventLocation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <strong>Lieu/Adresse :</strong> {livraison.eventLocation}
            </div>
          )}

          {livraison.deliveryNotes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <strong>Notes de livraison :</strong> {livraison.deliveryNotes}
            </div>
          )}
        </section>

        {/* Signature */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">✍️</span>
            Signature Client
          </h3>
          
          {signature.dataUrl ? (
            <div className="text-center">
              <img 
                src={signature.dataUrl} 
                alt="Signature du client" 
                className="max-w-md mx-auto border rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 mt-2">
                Signé le {signature.timestamp ? new Date(signature.timestamp).toLocaleString('fr-FR') : ''}
              </p>
            </div>
          ) : (
            <p className="text-red-600">⚠️ Aucune signature enregistrée</p>
          )}
        </section>

        {/* Actions finales */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 border-2 border-green-300">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="mr-2">🎉</span>
            Commande Finalisée
          </h3>
          
          <p className="text-green-700 mb-6">
            Toutes les informations ont été collectées avec succès. Vous pouvez maintenant :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className="bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">📄</span>
              Générer la Facture PDF
            </button>
            
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">📧</span>
              Envoyer par Email
            </button>
            
            <button
              type="button"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">💾</span>
              Sauvegarder
            </button>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onPrev}
            className="px-8 py-4 rounded-xl border-2 border-gray-300 text-lg font-semibold hover:bg-gray-50 transition-all"
          >
            ← Signature
          </button>

          <button
            type="button"
            className="bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            🆕 Nouvelle Commande
          </button>
        </div>
      </div>
    </div>
  );
}
