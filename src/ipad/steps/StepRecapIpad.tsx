import { useState, useMemo } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { PDFService } from '../../services/pdfService';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { saveInvoice } from '../../utils/storage';
import type { Invoice } from '../../types';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapIpad({ onNext, onPrev }: StepProps) {
  const {
    client,
    produits,
    paiement,
    livraison,
    invoiceNumber,
    invoiceDate,
    eventLocation,
    signature,
    termsAccepted,
    advisorName
  } = useInvoiceWizard();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Calculs des totaux (DOIT être défini AVANT invoice)
  const totals = useMemo(() => {
    let subtotal = 0;
    
    const details = produits.map(produit => {
      const lineTotal = calculateProductTotal(
        produit.qty || 0,
        produit.priceTTC || 0,
        produit.discount || 0,
        produit.discountType || 'fixed'
      );
      subtotal += lineTotal;
      
      return {
        ...produit,
        lineTotal
      };
    });

    const acompte = paiement?.depositAmount || 0;
    const reste = Math.max(0, subtotal - acompte);

    return {
      details,
      subtotal,
      acompte,
      reste,
      total: subtotal
    };
  }, [produits, paiement]);

  // Construction de l'objet Invoice pour les actions
  const invoice: Invoice = useMemo(() => ({
    // Informations de base
    invoiceNumber,
    invoiceDate,
    eventLocation: eventLocation || '',
    
    // Client - Structure plate pour compatibilité webhook
    clientName: client.name || '',
    clientEmail: client.email || '',
    clientPhone: client.phone || '',
    clientAddress: client.address || '',
    clientAddressLine2: client.addressLine2 || '',
    clientPostalCode: client.postalCode || '',
    clientCity: client.city || '',
    clientHousingType: client.housingType || '',
    clientDoorCode: client.doorCode || '',
    clientSiret: client.siret || '',
    
    // Produits
    products: produits.map(p => ({
      id: p.id,
      name: p.designation,
      category: p.category || '',
      quantity: p.qty,
      priceHT: p.priceTTC / 1.2, // Approximation
      priceTTC: p.priceTTC,
      discount: p.discount,
      discountType: p.discountType,
      totalHT: (p.qty * p.priceTTC / 1.2) - (p.discountType === 'fixed' ? p.discount : (p.qty * p.priceTTC / 1.2) * p.discount / 100),
      totalTTC: (p.qty * p.priceTTC) - (p.discountType === 'fixed' ? p.discount : (p.qty * p.priceTTC) * p.discount / 100),
      isPickupOnSite: p.isPickupOnSite
    })),
    
    // Montants (calculés et stockés)
    montantHT: totals.subtotal / 1.2, // Approximation en attendant calcul précis
    montantTTC: totals.subtotal,
    montantTVA: totals.subtotal - (totals.subtotal / 1.2),
    montantRemise: 0, // À calculer
    taxRate: 20,
    
    // Paiement
    paymentMethod: paiement?.method || '',
    montantAcompte: paiement?.depositAmount || 0,
    depositPaymentMethod: paiement?.depositPaymentMethod || '',
    montantRestant: totals.reste,
    
    // Livraison
    deliveryMethod: livraison?.deliveryMethod || '',
    deliveryAddress: livraison?.deliveryAddress || '',
    deliveryNotes: livraison?.deliveryNotes || '',
    
    // Signature
    signature: signature?.dataUrl || '',
    isSigned: !!signature?.dataUrl,
    signatureDate: signature?.timestamp || '',
    
    // Notes et conseiller
    invoiceNotes: '',
    advisorName: advisorName || '',
    termsAccepted: termsAccepted || false,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), [invoiceNumber, invoiceDate, eventLocation, client, produits, paiement, livraison, signature, termsAccepted, advisorName, totals]);

  // Action 1: Enregistrer la facture
  const handleSaveInvoice = async () => {
    try {
      setIsLoading(true);
      saveInvoice(invoice);
      setActionHistory(prev => [...prev, `Facture ${invoice.invoiceNumber} enregistrée`]);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 2: Imprimer le PDF
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);
      
      const w = window.open(url, '_blank');
      if (!w) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      setActionHistory(prev => [...prev, `PDF facture ${invoice.invoiceNumber} ouvert pour impression`]);
    } catch (error) {
      console.error('Erreur impression:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Envoyer par email
  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);

      setActionHistory(prev => [...prev, `Facture ${invoice.invoiceNumber} envoyée par email`]);
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // États des actions
  const isInvoiceSaved = actionHistory.some(action => action.includes('enregistrée'));
  const isEmailSent = actionHistory.some(action => action.includes('envoyée par email'));
  const isPdfGenerated = actionHistory.some(action => action.includes('ouvert pour impression'));

  // Changeons aussi la couleur du background principal pour respecter vos couleurs
  if (isProcessing) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Finalisation en cours...</h2>
          <p className="text-gray-600">Génération de la facture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F2EFE2] overflow-hidden">
      
      {/* Header compact */}
      <div className="bg-white shadow-sm p-3 border-b flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📄 Récapitulatif Final
          <span className="text-lg font-normal text-blue-600">#{invoiceNumber}</span>
        </h1>
      </div>

      {/* Contenu principal - Scroll optimisé pour iPad */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-20"> {/* Padding bottom pour les boutons */}
          
          {/* Grille responsive 2 colonnes sur iPad */}
          <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
            
            {/* Colonne gauche */}
            <div className="space-y-4">
              
              {/* Informations facture */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📋 Facture
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro :</span>
                    <span className="font-medium">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date :</span>
                    <span className="font-medium">{invoiceDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lieu :</span>
                    <span className="font-medium">{eventLocation}</span>
                  </div>
                  {advisorName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conseiller :</span>
                      <span className="font-medium">{advisorName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  👤 Client
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom :</span>
                    <span className="font-medium">{client.name || 'Non renseigné'}</span>
                  </div>
                  {client.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email :</span>
                      <span className="font-medium text-xs">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tél :</span>
                      <span className="font-medium">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse :</span>
                      <span className="font-medium text-xs">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Paiement */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  💳 Paiement
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode :</span>
                    <span className="font-medium">{paiement?.method || 'Non défini'}</span>
                  </div>
                  {paiement?.depositAmount && paiement.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acompte :</span>
                      <span className="font-medium text-green-600">{paiement.depositAmount.toFixed(2)} €</span>
                    </div>
                  )}
                  {paiement?.nombreChequesAVenir && paiement.nombreChequesAVenir > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chèques à venir :</span>
                      <span className="font-medium">{paiement.nombreChequesAVenir} chèques de {(totals.reste / paiement.nombreChequesAVenir).toFixed(2)} €</span>
                    </div>
                  )}
                  {paiement?.nombreChequesAVenir && paiement.nombreChequesAVenir > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant total des chèques :</span>
                      <span className="font-medium text-blue-600">{totals.reste.toFixed(2)} €</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              
              {/* Produits */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📦 Produits ({produits.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {totals.details.map((produit, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {produit.designation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {produit.qty} × {produit.priceTTC?.toFixed(2)}€
                            {produit.isPickupOnSite ? ' 📦' : ' 🚚'}
                          </div>
                        </div>
                        <div className="font-medium text-sm text-gray-800">
                          {produit.lineTotal.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total TTC :</span>
                    <span className="font-bold text-xl text-blue-600">{totals.total.toFixed(2)} €</span>
                  </div>
                  {totals.acompte > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Acompte versé :</span>
                        <span>-{totals.acompte.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between font-medium text-orange-600 mt-1">
                        <span>Reste à régler :</span>
                        <span>{totals.reste.toFixed(2)} €</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Livraison */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🚚 Livraison
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode :</span>
                    <span className="font-medium">{livraison?.deliveryMethod || 'Non défini'}</span>
                  </div>
                  {livraison?.deliveryNotes && (
                    <div>
                      <span className="text-gray-600">Notes :</span>
                      <p className="text-xs text-gray-800 mt-1">{livraison.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  ✍️ Signature & CGV
                </h3>
                <div className="flex items-center justify-between">
                  {signature?.dataUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        <img 
                          src={signature.dataUrl} 
                          alt="Signature" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-xs">
                        <div className="text-green-600 font-medium">✅ Signée</div>
                        {signature.timestamp && (
                          <div className="text-gray-500">
                            {new Date(signature.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-orange-600 text-sm">⚠️ Signature manquante</div>
                  )}
                </div>
                <div className="mt-2">
                  <div className={`text-sm font-medium ${termsAccepted ? 'text-green-600' : 'text-orange-600'}`}>
                    {termsAccepted ? '✅ CGV acceptées' : '⚠️ CGV non acceptées'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer vraiment fixe en bas de l'écran, toujours visible */}
      <div
        className="bg-[#F2EFE2] border-t border-[#477A0C]/20 shadow-lg p-4 flex-shrink-0"
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          zIndex: 100,
          boxShadow: '0 -2px 12px rgba(71,122,12,0.08)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          
          {/* Message d'obligation si pas encore fait */}
          {(!isInvoiceSaved || !isEmailSent) && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-sm text-orange-800 text-center">
                ⚠️ <strong>Enregistrer</strong> et <strong>Envoyer</strong> sont obligatoires pour continuer
              </p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-3">
            
            {/* Bouton Retour */}
            <button
              onClick={onPrev}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors px-4 py-3 flex flex-col items-center justify-center min-h-[70px]"
            >
              <span className="text-lg mb-1">←</span>
              <div className="text-xs">Retour</div>
            </button>

            {/* 1. Enregistrer Facture - OBLIGATOIRE - Couleur MyConfort */}
            <div className="relative">
              <button
                onClick={handleSaveInvoice}
                disabled={isLoading}
                className="w-full bg-[#477A0C] hover:bg-[#3A6A0A] disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[70px]"
              >
                <span className="text-lg mb-1">💾</span>
                <div className="text-center">
                  <div className="text-xs">Enregistrer</div>
                  <div className="text-xs opacity-80">Facture</div>
                </div>
              </button>
              {!isInvoiceSaved && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                  !
                </div>
              )}
              {isInvoiceSaved && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* 2. Imprimer PDF A4 */}
            <div className="relative">
              <button
                onClick={handlePrintInvoice}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[70px]"
              >
                <span className="text-lg mb-1">🖨️</span>
                <div className="text-center">
                  <div className="text-xs">Imprimer</div>
                  <div className="text-xs opacity-80">PDF A4</div>
                </div>
              </button>
              {isPdfGenerated && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* 3. Envoyer Email - OBLIGATOIRE */}
            <div className="relative">
              <button
                onClick={handleSendEmail}
                disabled={isLoading || !client.email}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[70px]"
              >
                <span className="text-lg mb-1">📧</span>
                <div className="text-center">
                  <div className="text-xs">Envoyer</div>
                  <div className="text-xs opacity-80">Email</div>
                </div>
              </button>
              {!isEmailSent && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                  !
                </div>
              )}
              {isEmailSent && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* Bouton Nouvelle commande - Redirige directement vers l'étape 1 */}
            <button
              onClick={() => {
                if (isInvoiceSaved && isEmailSent) {
                  // Réinitialise le wizard et va à l'étape 1
                  window.location.href = '/ipad?step=facture';
                }
              }}
              disabled={!isInvoiceSaved || !isEmailSent}
              className={`rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[70px] ${
                isInvoiceSaved && isEmailSent
                  ? 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-lg mb-1">🆕</span>
              <div className="text-center">
                <div className="text-xs">Nouvelle</div>
                <div className="text-xs opacity-80">Commande</div>
              </div>
            </button>
          </div>

          {/* Status en cours */}
          {isLoading && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <div className="animate-spin text-[#477A0C]">⏳</div>
                <span className="text-sm text-gray-700">Traitement en cours...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
