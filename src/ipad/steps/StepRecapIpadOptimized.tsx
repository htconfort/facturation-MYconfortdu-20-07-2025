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

export default function StepRecapIpadOptimized({
  onNext,
  onPrev,
  onQuit,
  isFirstStep,
  isLastStep,
}: StepProps) {
  const {
    invoiceNumber,
    invoiceDate,
    client,
    produits,
    paiement,
    livraison,
    eventLocation,
    signature,
    termsAccepted,
    advisorName
  } = useInvoiceWizard();

  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Calculs des totaux
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
      priceHT: (p.priceTTC || 0) / 1.2,
      priceTTC: p.priceTTC || 0,
      discount: p.discount || 0,
      discountType: p.discountType,
      totalHT: ((p.priceTTC || 0) / 1.2) * (p.qty || 0),
      totalTTC: (p.priceTTC || 0) * (p.qty || 0),
      isPickupOnSite: p.isPickupOnSite
    })),
    
    // Montants (calculés et stockés)
    montantHT: totals.subtotal / 1.2,
    montantTTC: totals.subtotal,
    montantTVA: totals.subtotal - (totals.subtotal / 1.2),
    montantRemise: 0,
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
      window.open(url, '_blank');
      setActionHistory(prev => [...prev, `PDF ${invoice.invoiceNumber} ouvert pour impression`]);
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

  return (
    <div className="h-full flex flex-col bg-[#F2EFE2] overflow-hidden">
      
      {/* Header ultra-compact */}
      <div className="bg-white border-b border-[#477A0C]/20 p-2 flex-shrink-0">
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#477A0C]">
            📋 Récap Final - {invoiceNumber}
          </h2>
        </div>
      </div>

      {/* CONTENU PRINCIPAL - GRILLE 3 COLONNES - TOUT VISIBLE */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full grid grid-cols-3 gap-3">
          
          {/* COLONNE 1: Infos Facture + Client */}
          <div className="space-y-3 overflow-hidden">
            {/* Facture */}
            <div className="bg-white rounded-lg p-3 shadow-md">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">🧾 Facture</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date :</span>
                  <span className="font-medium">{invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu :</span>
                  <span className="font-medium truncate">{eventLocation}</span>
                </div>
                {advisorName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conseiller :</span>
                    <span className="font-medium truncate">{advisorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client */}
            <div className="bg-white rounded-lg p-3 shadow-md">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">👤 Client</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom :</span>
                  <span className="font-medium truncate">{client.name || 'Non renseigné'}</span>
                </div>
                {client.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email :</span>
                    <span className="font-medium text-xs truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tél :</span>
                    <span className="font-medium">{client.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Paiement + Livraison */}
            <div className="bg-white rounded-lg p-3 shadow-md flex-1">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">💳 Paiement & 🚚 Livraison</h3>
              <div className="space-y-1 text-xs">
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
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Livraison :</span>
                  <span className="font-medium">{livraison?.deliveryMethod || 'Non défini'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {signature?.dataUrl ? (
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-4 bg-gray-100 rounded border overflow-hidden">
                        <img src={signature.dataUrl} alt="Signature" className="w-full h-full object-contain"/>
                      </div>
                      <span className="text-green-600 font-medium text-xs">✅ Signée</span>
                    </div>
                  ) : (
                    <span className="text-orange-600 text-xs">⚠️ Signature manquante</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE 2: Produits + Total */}
          <div className="space-y-3 overflow-hidden">
            <div className="bg-white rounded-lg p-3 shadow-md h-full flex flex-col">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">📦 Produits ({produits.length})</h3>
              
              {/* Liste produits avec scroll limité */}
              <div className="flex-1 space-y-1 overflow-y-auto" style={{maxHeight: '280px'}}>
                {totals.details.map((produit, index) => (
                  <div key={index} className="border-b border-gray-100 pb-1 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-1">
                        <div className="font-medium text-xs text-gray-800 truncate">
                          {produit.designation}
                        </div>
                        <div className="text-xs text-gray-500">
                          {produit.qty} × {produit.priceTTC?.toFixed(2)}€
                          {produit.isPickupOnSite ? ' 📦' : ' 🚚'}
                        </div>
                      </div>
                      <div className="font-medium text-xs text-gray-800">
                        {produit.lineTotal.toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total - Toujours visible */}
              <div className="border-t border-gray-300 pt-2 mt-2 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-sm">Total TTC :</span>
                  <span className="font-bold text-lg text-blue-600">{totals.total.toFixed(2)} €</span>
                </div>
                {totals.acompte > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Acompte versé :</span>
                      <span>-{totals.acompte.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-medium text-orange-600 text-xs mt-1">
                      <span>Reste à régler :</span>
                      <span>{totals.reste.toFixed(2)} €</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE 3: BOUTONS D'ACTION - TOUJOURS VISIBLES */}
          <div className="space-y-3 overflow-hidden">
            
            {/* Message d'obligation */}
            {(!isInvoiceSaved || !isEmailSent) && (
              <div className="p-2 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-xs text-orange-800 text-center font-medium">
                  ⚠️ Enregistrer + Envoyer obligatoires
                </p>
              </div>
            )}

            {/* LES 3 BOUTONS ESSENTIELS - TOUJOURS VISIBLES */}
            <div className="space-y-3">
              
              {/* 1. Enregistrer Facture - OBLIGATOIRE */}
              <div className="relative">
                <button
                  onClick={handleSaveInvoice}
                  disabled={isLoading}
                  className="w-full bg-[#477A0C] hover:bg-[#3A6A0A] disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center h-16"
                >
                  <span className="text-base mb-1">💾</span>
                  <div className="text-center">
                    <div className="text-xs">Enregistrer</div>
                    <div className="text-xs opacity-80">Facture</div>
                  </div>
                </button>
                {!isInvoiceSaved && (
                  <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                    !
                  </div>
                )}
                {isInvoiceSaved && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>

              {/* 2. Imprimer PDF A4 */}
              <div className="relative">
                <button
                  onClick={handlePrintInvoice}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center h-16"
                >
                  <span className="text-base mb-1">🖨️</span>
                  <div className="text-center">
                    <div className="text-xs">Imprimer</div>
                    <div className="text-xs opacity-80">PDF A4</div>
                  </div>
                </button>
                {isPdfGenerated && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>

              {/* 3. Envoyer Email - OBLIGATOIRE */}
              <div className="relative">
                <button
                  onClick={handleSendEmail}
                  disabled={isLoading || !client.email}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center h-16"
                >
                  <span className="text-base mb-1">📧</span>
                  <div className="text-center">
                    <div className="text-xs">Envoyer</div>
                    <div className="text-xs opacity-80">Email</div>
                  </div>
                </button>
                {!isEmailSent && (
                  <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                    !
                  </div>
                )}
                {isEmailSent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>

              {/* Boutons navigation */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={onPrev}
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors py-2 flex flex-col items-center justify-center"
                >
                  <span className="text-sm">←</span>
                  <div className="text-xs">Retour</div>
                </button>

                <button
                  onClick={onNext}
                  disabled={!isInvoiceSaved || !isEmailSent}
                  className={`rounded-lg font-bold transition-colors py-2 flex flex-col items-center justify-center ${
                    isInvoiceSaved && isEmailSent
                      ? 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm">🆕</span>
                  <div className="text-xs">Nouvelle</div>
                </button>
              </div>

              {/* Status en cours */}
              {isLoading && (
                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-xs">
                    <div className="animate-spin text-[#477A0C]">⏳</div>
                    <span className="text-gray-700">Traitement...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
