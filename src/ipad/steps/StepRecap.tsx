import { useMemo, useState, useRef } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { PDFService } from '../../services/pdfService';
import { UnifiedPrintService } from '../../services/unifiedPrintService';
import { saveInvoice } from '../../utils/storage';
import { Invoice } from '../../types';

// Types pour le système de notifications
interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  action?: string;
}

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecap({ onPrev }: StepProps) {
  const {
    client,
    produits,
    paiement,
    livraison,
    signature,
    syncToMainInvoice,
  } = useInvoiceWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Construction de l'objet Invoice depuis le store Zustand
  const invoice: Invoice = useMemo(() => {
    const baseInvoice = syncToMainInvoice();

    // Calculs financiers
    const totalTTC = produits.reduce((sum, p) => {
      return (
        sum +
        calculateProductTotal(
          Number(p.qty || 0),
          Number(p.priceTTC || 0),
          Number(p.discount || 0),
          p.discountType || 'percent'
        )
      );
    }, 0);

    const totalHT = totalTTC / 1.2; // TVA 20%
    const totalTVA = totalTTC - totalHT;
    const montantRemise = produits.reduce((sum, p) => {
      const originalTotal = p.priceTTC * p.qty;
      const discountedTotal = calculateProductTotal(
        p.qty,
        p.priceTTC,
        p.discount,
        p.discountType
      );
      return sum + (originalTotal - discountedTotal);
    }, 0);

    return {
      ...baseInvoice,
      montantHT: +totalHT.toFixed(2),
      montantTTC: +totalTTC.toFixed(2),
      montantTVA: +totalTVA.toFixed(2),
      montantRemise: +montantRemise.toFixed(2),
      taxRate: 20,
      signature: signature.dataUrl || '',
      isSigned: !!signature.dataUrl,
      signatureDate: signature.dataUrl ? new Date().toISOString() : undefined,
    };
  }, [produits, paiement, client, livraison, signature, syncToMainInvoice]);

  // Système de notifications amélioré
  const addNotification = (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    persistent = false,
    action?: string
  ) => {
    const notification: NotificationMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      persistent,
      action,
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder max 5 notifications

    // Ajouter à l'historique des actions si c'est une action
    if (action) {
      setActionHistory(prev => [action, ...prev.slice(0, 9)]); // Garder max 10 actions
    }

    // Auto-supprimer les notifications non persistantes après 5 secondes
    if (!persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  // Fonction pour supprimer une notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fonction pour vider toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Vérifier si les actions obligatoires ont été effectuées
  const isInvoiceSaved = actionHistory.some(action =>
    action.includes('enregistrée')
  );
  const isEmailSent = actionHistory.some(action =>
    action.includes('envoyée par email et Drive')
  );
  const canProceed = isInvoiceSaved && isEmailSent;

  // Fonction pour démarrer une nouvelle commande
  const handleNewOrder = () => {
    if (canProceed) {
      // Rediriger vers une nouvelle commande (à adapter selon votre routing)
      window.location.href = '/ipad';
    }
  };

  // Action 1: Enregistrer la facture dans l'onglet factures
  const handleSaveInvoice = async () => {
    try {
      setIsLoading(true);

      // Notification de début
      addNotification(
        'info',
        'Enregistrement en cours',
        "Sauvegarde de la facture dans l'onglet factures..."
      );

      // Sauvegarder directement avec le format Invoice unifié
      // Cela sera visible dans l'onglet factures du mode normal
      saveInvoice(invoice);

      // Notification de succès
      addNotification(
        'success',
        'Facture enregistrée avec succès',
        `Facture ${invoice.invoiceNumber} sauvegardée dans l'onglet factures. Elle est maintenant accessible depuis le mode normal.`,
        true, // persistante
        `Facture ${invoice.invoiceNumber} enregistrée`
      );
    } catch (error) {
      console.error('Erreur sauvegarde facture:', error);
      addNotification(
        'error',
        "Erreur d'enregistrement",
        'Impossible de sauvegarder la facture. Veuillez réessayer.',
        true,
        'Échec enregistrement facture'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Action 2: Imprimer le PDF A4 figé (jamais le DOM)
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);

      // Notification de début
      addNotification(
        'info',
        'Génération PDF en cours',
        'Création du PDF A4 premium avec en-tête, footer et CGV...'
      );

      // Générer le PDF A4 figé avec le service unifié (sans invoicePreviewRef)
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);

      // Notification de progression
      addNotification(
        'info',
        'Ouverture du PDF',
        'Ouverture du PDF dans un nouvel onglet pour impression...'
      );

      // Ouvrir le PDF natif du navigateur (A4 exact)
      const w = window.open(url, '_blank');
      if (!w) {
        // Fallback : télécharger le PDF si le popup est bloqué
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        addNotification(
          'warning',
          'PDF téléchargé',
          'Les pop-ups sont bloqués. Le PDF a été téléchargé automatiquement.',
          false,
          `PDF facture ${invoice.invoiceNumber} téléchargé`
        );
      } else {
        addNotification(
          'success',
          'PDF ouvert avec succès',
          `PDF A4 premium de la facture ${invoice.invoiceNumber} ouvert dans un nouvel onglet. Vous pouvez maintenant l'imprimer.`,
          true,
          `PDF facture ${invoice.invoiceNumber} ouvert pour impression`
        );
      }
    } catch (error) {
      console.error('Erreur impression PDF:', error);
      addNotification(
        'error',
        'Erreur de génération PDF',
        'Impossible de générer le PDF. Vérifiez les données de la facture et réessayez.',
        true,
        'Échec génération PDF'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Nouvelle fonction : Export PDF avec signatures
  const handleExportPdfWithSignatures = async () => {
    try {
      setIsLoading(true);
      addNotification(
        'info',
        'Export PDF avec signatures',
        'Génération du PDF avec signatures intégrées...'
      );

      const doc = await UnifiedPrintService.generateInvoicePdf(
        {
          ...syncToMainInvoice(),
          signature: signature,
        },
        { includeSignature: true }
      );

      const blob = doc.output('blob');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `facture_${invoice.invoiceNumber || 'sans_num'}_signee.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);

      addNotification(
        'success',
        'PDF avec signatures exporté',
        'Le PDF avec signatures a été téléchargé avec succès.'
      );
    } catch (error) {
      console.error('Erreur export PDF avec signatures:', error);
      addNotification(
        'error',
        'Erreur export PDF',
        "Impossible d'exporter le PDF avec signatures."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Envoyer par email et drive via N8N
  const handleSendEmailAndDrive = async () => {
    try {
      setIsLoading(true);

      // Notification de début
      addNotification(
        'info',
        "Préparation de l'envoi",
        "Génération du PDF et préparation des données pour l'envoi..."
      );

      // Générer le PDF avec le service unifié (sans dépendance DOM)
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);

      // Notification de progression
      addNotification(
        'info',
        'Conversion en cours',
        "Conversion du PDF en format base64 pour l'envoi..."
      );

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

      // Notification d'envoi
      addNotification(
        'info',
        'Envoi en cours',
        'Envoi du PDF par email et sauvegarde sur Google Drive via N8N...'
      );

      // Envoyer via N8N
      const result = await N8nWebhookService.sendInvoiceToN8n(
        invoice,
        pdfBase64
      );

      if (result.success) {
        addNotification(
          'success',
          'Envoi réussi',
          `Facture ${invoice.invoiceNumber} envoyée par email à ${client.email} et sauvegardée sur Google Drive. Le client va recevoir un email avec le PDF en pièce jointe.`,
          true,
          `Facture ${invoice.invoiceNumber} envoyée par email et Drive`
        );
      } else {
        addNotification(
          'error',
          "Échec de l'envoi",
          `Erreur lors de l'envoi: ${result.message}. Vérifiez la configuration N8N et réessayez.`,
          true,
          'Échec envoi email/Drive'
        );
      }
    } catch (error) {
      console.error('Erreur envoi email/drive:', error);
      addNotification(
        'error',
        'Erreur système',
        "Erreur lors de l'envoi par email et drive. Vérifiez votre connexion internet et la configuration N8N.",
        true,
        'Erreur système envoi'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatEUR = (amount: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  const produitsALivrer = produits.filter(p => !p.isPickupOnSite);
  const produitsAEmporter = produits.filter(p => p.isPickupOnSite);

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* Header adaptatif */}
      <div className='px-4 md:px-6 py-2 md:py-3 border-b border-myconfort-dark/10 bg-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg md:text-xl font-bold text-myconfort-dark'>
              📋 <span className='hidden md:inline'>Facture </span>{invoice.invoiceNumber || 'N/A'}<span className='hidden md:inline'> - </span>
              <span className='block md:inline text-sm md:text-base text-gray-600 md:text-myconfort-dark'>
                {new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('fr-FR')}
              </span>
            </h1>
          </div>
          <span className='bg-myconfort-green text-white px-3 py-1 rounded-full text-sm font-bold'>
            Étape 7/7
          </span>
        </div>
      </div>

      {/* Notifications adaptatives */}
      {notifications.length > 0 && (
        <div className='px-4 md:px-6 py-1 md:py-2'>
          {notifications.slice(0, 1).map(notification => (
            <div key={notification.id}
              className={`text-xs md:text-sm p-2 md:p-3 rounded-lg ${
                notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
              <div className='flex justify-between items-center'>
                <span className='font-medium'>{notification.title}</span>
                <button onClick={() => removeNotification(notification.id)}
                  className='text-gray-500 hover:text-gray-700 ml-2'>×</button>
              </div>
              <p className='text-xs md:text-sm mt-1 truncate md:whitespace-normal'>{notification.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contenu principal - ADAPTATIF : Grille condensée iPad / Scroll Desktop */}
      <div className='flex-1 overflow-hidden md:overflow-y-auto'>
        
        {/* Layout iPad - Grille condensée 3 colonnes SANS scroll */}
        <div className='block md:hidden h-full p-4'>
          <div className='grid grid-cols-3 gap-3 h-full'>

          {/* COLONNE 1 : Facture + Client */}
          <div className='space-y-3 overflow-hidden'>
            
            {/* FACTURE */}
            <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm'>📄</span>
                <span className='font-bold text-myconfort-dark text-sm'>Facture</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Numéro :</span>
                  <span className='font-semibold'>{invoice.invoiceNumber || 'N/A'}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Date :</span>
                  <span className='font-semibold'>
                    {new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>TVA :</span>
                  <span className='font-semibold'>20%</span>
                </div>
              </div>
            </div>

            {/* CLIENT */}
            <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm'>👤</span>
                <span className='font-bold text-myconfort-dark text-sm'>Client</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Nom :</span>
                  <span className='font-semibold truncate'>{client.name}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Email :</span>
                  <span className='font-semibold truncate text-xs'>{client.email}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Tél :</span>
                  <span className='font-semibold'>{client.phone}</span>
                </div>
                <div className='text-xs'>
                  <div className='text-gray-600 mb-1'>Adresse :</div>
                  <div className='font-semibold text-xs leading-tight'>
                    {client.address}
                    {client.addressLine2 && <br/>}{client.addressLine2}
                    <br/>{client.postalCode} {client.city}
                  </div>
                </div>
                {client.siret && (
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-600'>SIRET :</span>
                    <span className='font-semibold text-xs'>{client.siret}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLONNE 2 : Produits + Totaux */}
          <div className='space-y-3 overflow-hidden'>
            
            {/* PRODUITS CONDENSÉS */}
            <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1 overflow-hidden'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>📦</span>
                  <span className='font-bold text-myconfort-dark text-sm'>Produits</span>
                </div>
                <span className='text-xs text-gray-600'>
                  {produits.length} article{produits.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Liste produits condensée */}
              <div className='space-y-2 overflow-y-auto max-h-40'>
                {produits.map((produit) => (
                  <div key={produit.id} className='border border-gray-100 rounded p-2'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-semibold text-xs truncate'>{produit.designation}</div>
                        <div className='flex items-center gap-2 text-xs text-gray-600'>
                          <span>Qté: {produit.qty}</span>
                          <span>Prix: {formatEUR(produit.priceTTC)}</span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-myconfort-green text-xs'>
                          {formatEUR(calculateProductTotal(produit.qty, produit.priceTTC, produit.discount || 0, produit.discountType || 'percent'))}
                        </div>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          produit.isPickupOnSite
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {produit.isPickupOnSite ? '🚗' : '📦'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className='mt-3 pt-2 border-t border-gray-200 space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span>Total HT :</span>
                  <span className='font-semibold'>{formatEUR(invoice.montantHT)}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span>TVA (20%) :</span>
                  <span className='font-semibold'>{formatEUR(invoice.montantTVA)}</span>
                </div>
                {invoice.montantRemise > 0 && (
                  <div className='flex justify-between text-xs text-green-600'>
                    <span>Remises :</span>
                    <span className='font-semibold'>-{formatEUR(invoice.montantRemise)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm font-bold text-myconfort-green pt-1 border-t border-gray-300'>
                  <span>Total TTC :</span>
                  <span>{formatEUR(invoice.montantTTC)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLONNE 3 : Paiement + Livraison + Signature + Actions */}
          <div className='space-y-3 overflow-hidden'>
            
            {/* PAIEMENT */}
            <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm'>💳</span>
                <span className='font-bold text-myconfort-dark text-sm'>Paiement</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Mode :</span>
                  <span className='font-semibold truncate'>{paiement.method}</span>
                </div>
                {paiement.depositAmount > 0 && (
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-600'>Acompte :</span>
                    <span className='font-semibold text-green-600'>{formatEUR(paiement.depositAmount)}</span>
                  </div>
                )}
                {paiement.nombreChequesAVenir > 0 && (
                  <>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-600'>Chèques :</span>
                      <span className='font-semibold'>{paiement.nombreChequesAVenir}</span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-600'>Reste :</span>
                      <span className='font-semibold text-orange-600'>
                        {formatEUR(invoice.montantTTC - (paiement.depositAmount || 0))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* LIVRAISON */}
            <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm'>🚚</span>
                <span className='font-bold text-myconfort-dark text-sm'>Livraison</span>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Mode :</span>
                  <span className='font-semibold truncate'>{livraison.deliveryMethod || 'À définir'}</span>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='text-center p-2 bg-green-50 rounded text-xs'>
                    <div className='text-lg'>🚗</div>
                    <div className='font-semibold text-green-800'>Emporter</div>
                    <div className='text-green-600'>{produitsAEmporter.length}</div>
                  </div>
                  <div className='text-center p-2 bg-blue-50 rounded text-xs'>
                    <div className='text-lg'>📦</div>
                    <div className='font-semibold text-blue-800'>Livrer</div>
                    <div className='text-blue-600'>{produitsALivrer.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIGNATURE */}
            {signature?.dataUrl && (
              <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-200'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-sm'>✍️</span>
                  <span className='font-bold text-myconfort-dark text-sm'>Signature</span>
                </div>
                <div className='text-center'>
                  <img
                    src={signature.dataUrl}
                    alt='Signature du client'
                    className='max-w-full h-auto max-h-16 mx-auto border rounded shadow-sm'
                  />
                  <div className='text-xs text-gray-600 mt-1'>
                    Signé le {signature.timestamp ? new Date(signature.timestamp).toLocaleDateString('fr-FR') : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS PRINCIPALES - SECTION BIEN VISIBLE */}
            <div className='bg-gradient-to-r from-myconfort-green/20 to-myconfort-green/30 rounded-xl p-4 shadow-lg border-2 border-myconfort-green'>
              <div className='text-base font-bold text-myconfort-dark mb-3 text-center'>⚡ Actions Principales</div>

              {/* Indicateur de progression */}
              {isLoading && (
                <div className='flex items-center justify-center gap-2 mb-3'>
                  <div className='w-5 h-5 border-2 border-myconfort-green border-t-transparent rounded-full animate-spin'></div>
                  <span className='text-sm font-medium'>Traitement...</span>
                </div>
              )}

              {/* 3 BOUTONS D'ACTIONS PRINCIPALES */}
              <div className='space-y-3 mb-3'>
                
                {/* 1. 💾 ENREGISTRER FACTURE - OBLIGATOIRE */}
                <div className='relative'>
                  <button
                    onClick={handleSaveInvoice}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                      isInvoiceSaved
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-myconfort-green text-white hover:opacity-90 hover:scale-105'
                    }`}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-lg'>💾</span>
                      <div className='text-center'>
                        <div>Enregistrer Facture</div>
                        {!isInvoiceSaved && <div className='text-xs opacity-80'>OBLIGATOIRE</div>}
                      </div>
                    </div>
                  </button>
                  {!isInvoiceSaved && (
                    <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                      OBLIGATOIRE
                    </div>
                  )}
                </div>

                {/* 2. 🖨️ IMPRIMER FACTURE */}
                <button
                  onClick={handlePrintInvoice}
                  disabled={isLoading}
                  className='w-full p-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:opacity-90 hover:scale-105 transition-all shadow-md'
                >
                  <div className='flex items-center justify-center gap-2'>
                    <span className='text-lg'>🖨️</span>
                    <div className='text-center'>
                      <div>Imprimer Facture</div>
                      <div className='text-xs opacity-80'>PDF A4 Premium</div>
                    </div>
                  </div>
                </button>

                {/* 3. 📧 ENVOYER EMAIL - OBLIGATOIRE */}
                <div className='relative'>
                  <button
                    onClick={handleSendEmailAndDrive}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                      isEmailSent
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-purple-600 text-white hover:opacity-90 hover:scale-105'
                    }`}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-lg'>📧</span>
                      <div className='text-center'>
                        <div>Envoyer Email</div>
                        {!isEmailSent && <div className='text-xs opacity-80'>OBLIGATOIRE</div>}
                      </div>
                    </div>
                  </button>
                  {!isEmailSent && (
                    <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                      OBLIGATOIRE
                    </div>
                  )}
                </div>
              </div>

              {/* Status des actions */}
              <div className='pt-3 border-t border-myconfort-green/30'>
                <div className='flex justify-center gap-6 text-sm'>
                  <span className={`flex items-center gap-1 font-medium ${isInvoiceSaved ? 'text-green-600' : 'text-gray-500'}`}>
                    {isInvoiceSaved ? '✅' : '⭕'} Enregistré
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${isEmailSent ? 'text-green-600' : 'text-gray-500'}`}>
                    {isEmailSent ? '✅' : '⭕'} Envoyé
                  </span>
                </div>
              </div>

              {/* Message d'avertissement */}
              {!canProceed && (
                <div className='bg-amber-100 border border-amber-300 text-amber-800 p-3 rounded-xl text-center text-sm font-medium mt-3'>
                  <div className='flex items-center justify-center gap-2'>
                    <span>⚠️</span>
                    <span>Actions obligatoires requises</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
        
        {/* Layout Desktop - AVEC scroll (version originale) */}
        <div className='hidden md:block px-4 py-3 pb-24'>

          {/* Notifications desktop */}
          {notifications.length > 0 && (
            <div className='mb-3'>
              {notifications.slice(0, 2).map(notification => (
                <div key={notification.id}
                  className={`text-sm p-3 rounded-lg mb-2 ${
                    notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                    notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                    'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>{notification.title}</span>
                    <button onClick={() => removeNotification(notification.id)}
                      className='text-gray-500 hover:text-gray-700 ml-2'>×</button>
                  </div>
                  <p className='text-sm mt-1'>{notification.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* 1. INFORMATIONS FACTURE Desktop */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-lg'>📄</span>
              <span className='font-bold text-myconfort-dark'>Informations Facture</span>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <div className='text-sm text-gray-600'>Numéro</div>
                <div className='font-semibold'>{invoice.invoiceNumber || 'N/A'}</div>
              </div>
              <div>
                <div className='text-sm text-gray-600'>Date</div>
                <div className='font-semibold'>
                  {new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div>
                <div className='text-sm text-gray-600'>Statut</div>
                <div className='font-semibold text-myconfort-green'>✓ Prête à finaliser</div>
              </div>
              <div>
                <div className='text-sm text-gray-600'>TVA</div>
                <div className='font-semibold'>20%</div>
              </div>
            </div>
          </div>

          {/* 2. INFORMATIONS CLIENT Desktop */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-lg'>👤</span>
              <span className='font-bold text-myconfort-dark'>Client</span>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Nom :</span>
                <span className='font-semibold'>{client.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Email :</span>
                <span className='font-semibold text-sm'>{client.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Téléphone :</span>
                <span className='font-semibold'>{client.phone}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Adresse :</span>
                <span className='font-semibold text-sm text-right max-w-[200px]'>
                  {client.address}
                  {client.addressLine2 && <br/>}
                  {client.addressLine2}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Ville :</span>
                <span className='font-semibold'>{client.postalCode} {client.city}</span>
              </div>
              {client.siret && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>SIRET :</span>
                  <span className='font-semibold text-sm'>{client.siret}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. PRODUITS DÉTAILLÉS Desktop */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>📦</span>
                <span className='font-bold text-myconfort-dark'>Produits Commandés</span>
              </div>
              <span className='text-sm text-gray-600'>
                {produits.length} article{produits.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Liste des produits Desktop */}
            <div className='space-y-3'>
              {produits.map((produit, index) => (
                <div key={produit.id} className='border border-gray-100 rounded-lg p-3'>
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex-1'>
                      <div className='font-semibold text-sm'>{produit.designation}</div>
                      {produit.category && (
                        <div className='text-xs text-gray-500'>{produit.category}</div>
                      )}
                    </div>
                    <div className='text-right'>
                      <div className='font-bold text-myconfort-green'>
                        {formatEUR(calculateProductTotal(produit.qty, produit.priceTTC, produit.discount || 0, produit.discountType || 'percent'))}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <div className='flex items-center gap-3'>
                      <span className='text-gray-600'>Qté: <strong>{produit.qty}</strong></span>
                      <span className='text-gray-600'>Prix: <strong>{formatEUR(produit.priceTTC)}</strong></span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {produit.discount > 0 && (
                        <span className='text-green-600 text-xs'>
                          -{produit.discount}{produit.discountType === 'percent' ? '%' : '€'}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produit.isPickupOnSite
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {produit.isPickupOnSite ? '🚗 Emporter' : '📦 Livrer'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux détaillés Desktop */}
            <div className='mt-4 pt-3 border-t border-gray-200 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Total HT :</span>
                <span className='font-semibold'>{formatEUR(invoice.montantHT)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>TVA (20%) :</span>
                <span className='font-semibold'>{formatEUR(invoice.montantTVA)}</span>
              </div>
              {invoice.montantRemise > 0 && (
                <div className='flex justify-between text-sm text-green-600'>
                  <span>Remises :</span>
                  <span className='font-semibold'>-{formatEUR(invoice.montantRemise)}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold text-myconfort-green pt-2 border-t border-gray-300'>
                <span>Total TTC :</span>
                <span>{formatEUR(invoice.montantTTC)}</span>
              </div>
            </div>
          </div>

          {/* 4. PAIEMENT DÉTAILLÉ Desktop */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-lg'>💳</span>
              <span className='font-bold text-myconfort-dark'>Modalités de Paiement</span>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Mode de règlement :</span>
                <span className='font-semibold'>{paiement.method}</span>
              </div>

              {paiement.depositAmount > 0 && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Acompte versé :</span>
                  <span className='font-semibold text-green-600'>{formatEUR(paiement.depositAmount)}</span>
                </div>
              )}

              {paiement.nombreChequesAVenir > 0 && (
                <>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Nombre de chèques :</span>
                    <span className='font-semibold'>{paiement.nombreChequesAVenir}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Montant par chèque :</span>
                    <span className='font-semibold'>
                      {formatEUR((invoice.montantTTC - (paiement.depositAmount || 0)) / paiement.nombreChequesAVenir)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Reste à payer :</span>
                    <span className='font-semibold text-orange-600'>
                      {formatEUR(invoice.montantTTC - (paiement.depositAmount || 0))}
                    </span>
                  </div>
                </>
              )}

              {paiement.note && (
                <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                  <div className='text-sm font-semibold text-blue-800 mb-1'>Notes de paiement :</div>
                  <div className='text-sm text-blue-700'>{paiement.note}</div>
                </div>
              )}
            </div>
          </div>

          {/* 5. LIVRAISON DÉTAILLÉE Desktop */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-lg'>🚚</span>
              <span className='font-bold text-myconfort-dark'>Modalités de Livraison</span>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Mode de livraison :</span>
                <span className='font-semibold'>{livraison.deliveryMethod || 'À définir'}</span>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='text-center p-3 bg-green-50 rounded-lg'>
                  <div className='text-2xl mb-1'>🚗</div>
                  <div className='font-semibold text-green-800'>À emporter</div>
                  <div className='text-sm text-green-600'>{produitsAEmporter.length} article{produitsAEmporter.length > 1 ? 's' : ''}</div>
                </div>
                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                  <div className='text-2xl mb-1'>📦</div>
                  <div className='font-semibold text-blue-800'>À livrer</div>
                  <div className='text-sm text-blue-600'>{produitsALivrer.length} article{produitsALivrer.length > 1 ? 's' : ''}</div>
                </div>
              </div>

              {livraison.deliveryNotes && (
                <div className='mt-3 p-3 bg-yellow-50 rounded-lg'>
                  <div className='text-sm font-semibold text-yellow-800 mb-1'>Notes de livraison :</div>
                  <div className='text-sm text-yellow-700'>{livraison.deliveryNotes}</div>
                </div>
              )}
            </div>
          </div>

          {/* 6. SIGNATURE Desktop */}
          {signature?.dataUrl && (
            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
              <div className='flex items-center gap-2 mb-3'>
                <span className='text-lg'>✍️</span>
                <span className='font-bold text-myconfort-dark'>Signature Client</span>
              </div>
              <div className='text-center'>
                <img
                  src={signature.dataUrl}
                  alt='Signature du client'
                  className='max-w-full h-auto max-h-24 mx-auto border rounded-lg shadow-sm'
                />
                <div className='text-xs text-gray-600 mt-2'>
                  Signé le {signature.timestamp ? new Date(signature.timestamp).toLocaleString('fr-FR') : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Actions principales Desktop */}
          <div className='bg-gradient-to-r from-myconfort-green/10 to-myconfort-green/20 rounded-xl p-4 shadow-sm border border-myconfort-green mb-3'>
            <div className='text-lg font-semibold text-myconfort-dark mb-4 text-center'>⚡ Actions Finales</div>

            {/* Indicateur de progression Desktop */}
            {isLoading && (
              <div className='flex items-center justify-center gap-2 mb-4'>
                <div className='w-5 h-5 border-3 border-myconfort-green border-t-transparent rounded-full animate-spin'></div>
                <span className='font-medium'>Traitement en cours...</span>
              </div>
            )}

            {/* Actions principales Desktop */}
            <div className='grid grid-cols-3 gap-4 mb-4'>

              {/* Enregistrer Desktop */}
              <div className='relative'>
                <button
                  onClick={handleSaveInvoice}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl font-bold text-sm transition-all ${
                    isInvoiceSaved
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-myconfort-green text-white hover:opacity-90 shadow-lg'
                  }`}
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-xl'>💾</span>
                    <span>Enregistrer Facture</span>
                    {!isInvoiceSaved && <span className='text-xs opacity-80'>OBLIGATOIRE</span>}
                  </div>
                </button>
                {!isInvoiceSaved && (
                  <div className='absolute -top-3 -left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                    OBLIGATOIRE
                  </div>
                )}
              </div>

              {/* Imprimer Desktop */}
              <button
                onClick={handlePrintInvoice}
                disabled={isLoading}
                className='p-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg'
              >
                <div className='flex flex-col items-center gap-2'>
                  <span className='text-xl'>🖨️</span>
                  <span>Imprimer (PDF A4)</span>
                </div>
              </button>

              {/* Email Desktop */}
              <div className='relative'>
                <button
                  onClick={handleSendEmailAndDrive}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl font-bold text-sm transition-all ${
                    isEmailSent
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-purple-600 text-white hover:opacity-90 shadow-lg'
                  }`}
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-xl'>📧</span>
                    <span>Envoyer Email</span>
                    {!isEmailSent && <span className='text-xs opacity-80'>OBLIGATOIRE</span>}
                  </div>
                </button>
                {!isEmailSent && (
                  <div className='absolute -top-3 -left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                    OBLIGATOIRE
                  </div>
                )}
              </div>

            </div>

            {/* Status des actions Desktop */}
            <div className='pt-3 border-t border-gray-200'>
              <div className='flex justify-center gap-6 text-sm'>
                <span className={`flex items-center gap-1 ${isInvoiceSaved ? 'text-green-600' : 'text-gray-400'}`}>
                  {isInvoiceSaved ? '✅' : '⭕'} Facture enregistrée
                </span>
                <span className={`flex items-center gap-1 ${isEmailSent ? 'text-green-600' : 'text-gray-400'}`}>
                  {isEmailSent ? '✅' : '⭕'} Email envoyé
                </span>
              </div>
            </div>
          </div>

          {/* Message d'avertissement si actions non complètes Desktop */}
          {!canProceed && (
            <div className='bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center font-semibold'>
              ⚠️ Actions obligatoires : Enregistrer la facture + Envoyer l'email avant de pouvoir continuer
            </div>
          )}

        </div>
      </div>

      {/* Footer navigation fixe - EN BAS */}
      <div className='bg-white border-t border-gray-200 px-6 py-4 shadow-lg'>
        <div className='flex justify-between items-center max-w-md mx-auto'>
          <button
            onClick={onPrev}
            className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-sm min-w-[120px] transition-all'
          >
            ← Précédent
          </button>

          <button
            onClick={handleNewOrder}
            disabled={!canProceed}
            className={`px-6 py-3 font-bold rounded-xl text-sm min-w-[140px] transition-all shadow-lg ${
              canProceed
                ? 'bg-myconfort-green text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🆕 Nouvelle Commande
          </button>
        </div>
      </div>
    </div>
  );
}
