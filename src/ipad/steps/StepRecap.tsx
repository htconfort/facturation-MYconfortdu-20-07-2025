import { useMemo, useState, useRef } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { UnifiedPrintService } from '../../services/unifiedPrintService';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { PDFService } from '../../services/pdfService';
import { saveInvoice } from '../../utils/storage'; // Utiliser le même système que le mode normal
import { InvoicePreviewModern } from '../../components/InvoicePreviewModern';
import { Invoice } from '../../types';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecap({ onPrev }: StepProps) {
  const { client, produits, paiement, livraison, signature, syncToMainInvoice } = useInvoiceWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Construction de l'objet Invoice depuis le store Zustand
  const invoice: Invoice = useMemo(() => {
    const baseInvoice = syncToMainInvoice();
    
    // Calculs financiers
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
    const montantRemise = produits.reduce((sum, p) => {
      const originalTotal = p.priceTTC * p.qty;
      const discountedTotal = calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType);
      return sum + (originalTotal - discountedTotal);
    }, 0);

    return {
      ...baseInvoice,
      montantHT: +totalHT.toFixed(2),
      montantTTC: +totalTTC.toFixed(2),
      montantTVA: +totalTVA.toFixed(2),
      montantRemise: +montantRemise.toFixed(2),
      taxRate: 20,
      isSigned: !!signature.dataUrl,
      signatureDate: signature.dataUrl ? new Date().toISOString() : undefined,
    };
  }, [produits, paiement, client, livraison, signature, syncToMainInvoice]);

  // Fonction pour afficher un message temporaire
  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setErrorMessage(null);
    }
    
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 5000);
  };

  // Action 1: Enregistrer la facture dans l'onglet factures
  const handleSaveInvoice = async () => {
    try {
      setIsLoading(true);
      
      // Sauvegarder directement avec le format Invoice unifié
      // Cela sera visible dans l'onglet factures du mode normal
      saveInvoice(invoice);
      
      showMessage('✅ Facture enregistrée avec succès dans l\'onglet factures');
    } catch (error) {
      console.error('Erreur sauvegarde facture:', error);
      showMessage('❌ Erreur lors de l\'enregistrement de la facture', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 2: Imprimer les deux pages (facture + CGV)
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);
      showMessage('🖨️ Préparation de l\'impression...');
      
      // Utiliser le service d'impression unifié
      await UnifiedPrintService.printInvoice(invoice);
      
      showMessage('✅ Impression lancée avec succès');
    } catch (error) {
      console.error('Erreur impression:', error);
      showMessage('❌ Erreur lors de l\'impression', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Envoyer par email et drive via N8N
  const handleSendEmailAndDrive = async () => {
    try {
      setIsLoading(true);
      showMessage('📧 Génération du PDF et envoi en cours...');
      
      // Générer le PDF depuis l'aperçu
      const pdfBlob = await PDFService.generateInvoicePDF(invoice, invoicePreviewRef);
      
      // Convertir le blob en base64
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extraire seulement la partie base64 (après la virgule)
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Erreur conversion PDF'));
        reader.readAsDataURL(pdfBlob);
      });
      
      // Envoyer via N8N
      const result = await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);
      
      if (result.success) {
        showMessage('✅ Facture envoyée par email et sauvegardée sur Drive avec succès');
      } else {
        showMessage(`❌ Erreur lors de l'envoi: ${result.message}`, true);
      }
    } catch (error) {
      console.error('Erreur envoi email/drive:', error);
      showMessage('❌ Erreur lors de l\'envoi par email et drive', true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEUR = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const produitsALivrer = produits.filter(p => !p.isPickupOnSite);
  const produitsAEmporter = produits.filter(p => p.isPickupOnSite);

  return (
    <div className="py-8">
      {/* Header avec code couleur harmonisé */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#477A0C] text-white rounded-full text-2xl font-bold mb-4">
          7
        </div>
        <h2 className="text-3xl font-bold text-[#477A0C] mb-2">📋 Récapitulatif Final</h2>
        <p className="text-gray-600 text-lg">
          Vérification complète avant génération de la facture
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Messages d'état */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-center">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {/* Aperçu de la facture */}
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
            📄 Aperçu de la facture
          </h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <InvoicePreviewModern 
              ref={invoicePreviewRef}
              invoice={invoice}
              className="bg-white"
            />
          </div>
        </section>

        {/* Informations client */}
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
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
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
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
              <span className="font-semibold">{formatEUR(invoice.montantHT)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>TVA (20%) :</span>
              <span className="font-semibold">{formatEUR(invoice.montantTVA)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 text-xl font-bold text-[#477A0C]">
              <span>Total TTC :</span>
              <span>{formatEUR(invoice.montantTTC)}</span>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
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
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
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

          {livraison.deliveryNotes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <strong>Notes de livraison :</strong> {livraison.deliveryNotes}
            </div>
          )}
        </section>

        {/* Signature */}
        <section className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
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

        {/* Actions principales */}
        <section className="bg-gradient-to-r from-[#477A0C]/10 to-[#477A0C]/20 rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]">
          <h3 className="text-xl font-semibold text-[#477A0C] mb-4 flex items-center">
            <span className="mr-2">�</span>
            Actions Principales
          </h3>
          
          <p className="text-green-700 mb-6">
            Toutes les informations ont été collectées avec succès. Vous pouvez maintenant :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={isLoading}
              className="bg-[#477A0C] hover:bg-[#5A8F0F] disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">�</span>
              {isLoading ? 'Enregistrement...' : 'Enregistrer Facture'}
            </button>
            
            <button
              type="button"
              onClick={handlePrintInvoice}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">�️</span>
              {isLoading ? 'Impression...' : 'Imprimer les 2 Pages'}
            </button>
            
            <button
              type="button"
              onClick={handleSendEmailAndDrive}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">�</span>
              {isLoading ? 'Envoi en cours...' : 'Envoyer Email & Drive'}
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
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            💻 Retour Mode Normal
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
