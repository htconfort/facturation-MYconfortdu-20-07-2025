import { useState, useMemo, useEffect, useRef } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { PDFService } from '../../services/pdfService';
import { UnifiedPrintService } from '../../services/unifiedPrintService';
import { CompactPrintService } from '../../services/compactPrintService';
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

  // 🔍 Debug: Vérifier le numéro de facture
  useEffect(() => {
    console.log('🔍 StepRecap - invoiceNumber:', invoiceNumber);
    console.log('🔍 StepRecap - invoiceDate:', invoiceDate);
    console.log('🔍 StepRecap - eventLocation:', eventLocation);
  }, [invoiceNumber, invoiceDate, eventLocation]);

  // 🔧 Correction: Regénérer le numéro de facture s'il est vide
  useEffect(() => {
    if (!invoiceNumber || invoiceNumber.trim() === '') {
      console.log('⚠️ Numéro de facture vide, regénération...');
      import('../../utils/calculations').then(({ generateInvoiceNumber }) => {
        const newInvoiceNumber = generateInvoiceNumber();
        console.log('🔢 Regénération numéro facture StepRecap:', newInvoiceNumber);
        
        // Mettre à jour le store avec le nouveau numéro
        const { setInvoiceData } = useInvoiceWizard.getState();
        setInvoiceData({ invoiceNumber: newInvoiceNumber });
      });
    }
  }, [invoiceNumber]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [postSigStatus, setPostSigStatus] = useState<'idle'|'running'|'done'|'error'>('idle');
  const postSigRanRef = useRef(false);

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

  // 🟢 Pipeline post-signature non bloquant (décorrélé de l'email)
  useEffect(() => {
    if (postSigRanRef.current) return;
    if (!signature?.dataUrl) return;
    postSigRanRef.current = true;

    (async () => {
      try {
        setPostSigStatus('running');
        console.log('POSTSIG:start', { invoiceNumber, hasSignature: true });
        // Sauvegarde locale sûre
        saveInvoice(invoice);
        console.log('POSTSIG:saved');
        // Génération PDF (optimisation signature journale en interne)
        console.log('POSTSIG:optimized (via PDFService)');
        const pdfBlob = await PDFService.generateInvoicePDF(invoice);
        console.log('POSTSIG:pdf', { size: pdfBlob.size });
        setActionHistory(prev => [...prev, `Post-signature: PDF prêt (${pdfBlob.size}o)`]);
        if (!client.email) {
          console.log('POSTSIG:email:skip');
        } else {
          console.log('POSTSIG:email:available');
        }
        setPostSigStatus('done');
      } catch (err: any) {
        console.error('POSTSIG:error', err?.message || err);
        setPostSigStatus('error');
      }
    })();
  }, [signature?.dataUrl, invoiceNumber, client.email, invoice]);

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

  // Action 2: Imprimer - Méthode native compatible iPad
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);
      console.log('🖨️ Lancement impression native...');
      
      // Détection device pour méthode d'impression appropriée
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Utiliser le service unifié CompactPrintService partout
      console.log('🖨️ Impression via service unifié CompactPrintService...');
      await CompactPrintService.printInvoice(invoice);
      setActionHistory(prev => [...prev, 'Facture ouverte pour impression (Format unifié)']);
    } catch (error: any) {
      console.error('Erreur impression:', error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Envoyer par email
  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      console.log('📧 Début envoi email...', {
        clientEmail: client.email || 'Pas d\'email client',
        invoiceNumber: invoice.invoiceNumber
      });
      
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      console.log('📄 PDF généré:', { size: pdfBlob.size });
      
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
      console.log('🔄 PDF converti en base64:', { length: pdfBase64.length });

      // Modifier l'objet invoice pour inclure un email par défaut si nécessaire
      const invoiceToSend = {
        ...invoice,
        clientEmail: client.email || 'pas-d-email@myconfort.fr'
      };

      await N8nWebhookService.sendInvoiceToN8n(invoiceToSend, pdfBase64);
      console.log('✅ Email envoyé avec succès');
      setActionHistory(prev => [...prev, `Facture ${invoice.invoiceNumber} envoyée par email ${client.email ? `à ${client.email}` : '(sans email client)'}`]);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      setActionHistory(prev => [...prev, `Erreur envoi: ${ (error as any).message || 'Erreur inconnue'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // États des actions
  const isInvoiceSaved = actionHistory.some(action => action.includes('enregistrée'));
  const isEmailSent = actionHistory.some(action => action.includes('envoyée par email'));
  const isPdfGenerated = actionHistory.some(action => action.includes('ouvert pour impression'));

  // Debug état du bouton email (ne bloque pas le pipeline post-signature)
  const emailButtonDisabled = isLoading;
  console.log('🔍 Debug bouton email:', {
    isLoading,
    clientEmail: client.email,
    emailButtonDisabled,
    isEmailSent,
    postSigStatus,
  });

  return (
    <div className="h-full flex flex-col bg-[#F2EFE2] overflow-hidden">
      
      {/* Header ultra-compact */}
      <div className="bg-white border-b border-[#477A0C]/20 p-2 flex-shrink-0">
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#477A0C]">
            📋 Récap Final - {invoiceNumber || 'En cours de génération...'}
          </h2>
        </div>
      </div>

      {/* CONTENU PRINCIPAL - GRILLE 3 COLONNES - TOUT VISIBLE */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full grid grid-cols-3 gap-3">
          
          {/* COLONNE 1: Infos Facture + Client */}
          <div className="space-y-3 overflow-hidden">
            {/* Facture */}
            <div className="bg-white rounded-lg p-3 shadow-md flex-1">
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
            <div className="bg-white rounded-lg p-3 shadow-md flex-1">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">👤 Client</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom :</span>
                  <span className="font-medium truncate">{client.name || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email :</span>
                  <span className="font-medium text-xs truncate">
                    {client.email || 'Pas d\'e-mail'}
                  </span>
                </div>
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
                {client.addressLine2 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complément :</span>
                    <span className="font-medium text-xs">{client.addressLine2}</span>
                  </div>
                )}
                {(client.postalCode || client.city) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ville :</span>
                    <span className="font-medium text-xs">{client.postalCode} {client.city}</span>
                  </div>
                )}
                {client.siret && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SIRET :</span>
                    <span className="font-medium text-xs">{client.siret}</span>
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
                {paiement?.nombreChequesAVenir && paiement.nombreChequesAVenir > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chèques :</span>
                      <span className="font-medium text-blue-600">{paiement.nombreChequesAVenir} fois</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Par chèque :</span>
                      <span className="font-medium text-blue-600">
                        {((totals.total - (paiement.depositAmount || 0)) / paiement.nombreChequesAVenir).toFixed(2)} €
                      </span>
                    </div>
                    {/* Adresse d'envoi des chèques */}
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-semibold text-amber-800 mb-1">
                        📮 Adresse d'envoi des chèques
                      </p>
                      <p className="text-xs text-amber-700">
                        <strong>Vos chèques sont à envoyer à l'adresse suivante :</strong><br/>
                        Myconfort<br/>
                        8, rue du Grégal<br/>
                        66510 Saint-Hippolyte
                      </p>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Livraison :</span>
                  <span className="font-medium">{livraison?.deliveryMethod || 'Non défini'}</span>
                </div>
                {livraison?.deliveryNotes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes :</span>
                    <span className="font-medium text-xs truncate">{livraison.deliveryNotes}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                  {signature?.dataUrl ? (
                    <div className="flex items-center gap-1 flex-1">
                      <div className="w-8 h-6 bg-gray-100 rounded border overflow-hidden">
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
          <div className="flex flex-col space-y-3 overflow-hidden h-full">
            
            {/* Message d'obligation */}
            {(!isInvoiceSaved || !isEmailSent) && (
              <div className="p-2 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-xs text-orange-800 text-center font-medium">
                  ⚠️ Enregistrer + Envoyer obligatoires
                </p>
              </div>
            )}

            {/* LES 3 BOUTONS ESSENTIELS - TOUJOURS VISIBLES */}
            <div className="flex flex-col space-y-3 flex-1">
              
              {/* 1. Enregistrer Facture - OBLIGATOIRE */}
              <div className="relative flex-1">
                <button
                  onClick={handleSaveInvoice}
                  disabled={isLoading}
                  className="w-full h-full bg-[#477A0C] hover:bg-[#3A6A0A] disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[60px]"
                >
                  <span className="text-lg mb-1">💾</span>
                  <div className="text-center">
                    <div className="text-sm">Enregistrer</div>
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
              <div className="relative flex-1">
                <button
                  onClick={handlePrintInvoice}
                  disabled={isLoading}
                  className="w-full h-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[60px] active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <span className="text-lg mb-1 animate-spin">⏳</span>
                      <div className="text-center">
                        <div className="text-sm">Génération...</div>
                        <div className="text-xs opacity-80">PDF en cours</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-lg mb-1">🖨️</span>
                      <div className="text-center">
                        <div className="text-sm">Imprimer</div>
                        <div className="text-xs opacity-80">PDF A4</div>
                      </div>
                    </>
                  )}
                </button>
                {isPdfGenerated && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>

              {/* 3. Envoyer Email - OBLIGATOIRE */}
              <div className="relative flex-1">
                <button
                  onClick={handleSendEmail}
                  disabled={emailButtonDisabled}
                  className="w-full h-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex flex-col items-center justify-center min-h-[60px] active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <span className="text-lg mb-1 animate-spin">⏳</span>
                      <div className="text-center">
                        <div className="text-sm">Envoi...</div>
                        <div className="text-xs opacity-80">Email en cours</div>
                      </div>
                    </>
                  ) : !client.email ? (
                    <>
                      <span className="text-lg mb-1">📧</span>
                      <div className="text-center">
                        <div className="text-sm">Envoyer</div>
                        <div className="text-xs opacity-80">Sans email client</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-lg mb-1">📧</span>
                      <div className="text-center">
                        <div className="text-sm">Envoyer</div>
                        <div className="text-xs opacity-80">Email</div>
                      </div>
                    </>
                  )}
                </button>
                {!isEmailSent && !emailButtonDisabled && (
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
