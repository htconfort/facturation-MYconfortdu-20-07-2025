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
      {/* Header compact */}
      <div className='px-6 py-3 border-b border-myconfort-dark/10'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-myconfort-dark'>
            📋 Récapitulatif Final
          </h1>
          <div className='flex items-center gap-2'>
            <span className='bg-myconfort-green text-white px-3 py-1 rounded-full text-sm font-bold'>
              Étape 7/7
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal avec scroll optimisé */}
      <div className='flex-1 overflow-y-auto px-4 py-3 pb-24'>

        {/* Notifications compactes */}
        {notifications.length > 0 && (
          <div className='mb-3'>
            {notifications.slice(0, 2).map(notification => (
              <div key={notification.id}
                className={`text-xs p-2 rounded-lg mb-2 ${
                  notification.type === 'success' ? 'bg-green-50 text-green-700' :
                  notification.type === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>{notification.title}</span>
                  <button onClick={() => removeNotification(notification.id)}
                    className='text-gray-500 hover:text-gray-700 ml-2'>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid compact d'informations */}
        <div className='grid grid-cols-2 gap-3 mb-3'>

          {/* Client compact */}
          <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-lg'>👤</span>
              <span className='font-semibold text-sm'>Client</span>
            </div>
            <div className='space-y-1 text-xs'>
              <div className='font-medium'>{client.name}</div>
              <div className='text-gray-600'>{client.email}</div>
              <div className='text-gray-600'>{client.phone}</div>
              <div className='text-gray-600 text-xs'>{client.city}</div>
            </div>
          </div>

          {/* Totaux compacts */}
          <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-lg'>💰</span>
              <span className='font-semibold text-sm'>Montant</span>
            </div>
            <div className='space-y-1'>
              <div className='text-lg font-bold text-myconfort-green'>
                {formatEUR(invoice.montantTTC)}
              </div>
              <div className='text-xs text-gray-600'>
                HT: {formatEUR(invoice.montantHT)}
              </div>
              {invoice.montantRemise > 0 && (
                <div className='text-xs text-green-600'>
                  Remise: -{formatEUR(invoice.montantRemise)}
                </div>
              )}
            </div>
          </div>

          {/* Produits résumé */}
          <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-lg'>📦</span>
              <span className='font-semibold text-sm'>Produits</span>
            </div>
            <div className='space-y-1'>
              <div className='text-sm font-medium'>
                {produits.length} article{produits.length > 1 ? 's' : ''}
              </div>
              <div className='text-xs text-gray-600 max-h-12 overflow-hidden'>
                {produits.slice(0, 2).map(p => p.designation).join(', ')}
                {produits.length > 2 && '...'}
              </div>
            </div>
          </div>

          {/* Paiement compact */}
          <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-lg'>💳</span>
              <span className='font-semibold text-sm'>Paiement</span>
            </div>
            <div className='space-y-1 text-xs'>
              <div>{paiement.method}</div>
              {paiement.depositAmount > 0 && (
                <div className='text-green-600'>
                  Acompte: {formatEUR(paiement.depositAmount)}
                </div>
              )}
              {paiement.nombreChequesAVenir > 0 && (
                <div>{paiement.nombreChequesAVenir} chèque{paiement.nombreChequesAVenir > 1 ? 's' : ''}</div>
              )}
            </div>
          </div>

        </div>

        {/* Actions principales compactes */}
        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3'>
          <div className='text-sm font-semibold text-gray-700 mb-3'>⚡ Actions principales</div>

          {/* Indicateur de progression */}
          {isLoading && (
            <div className='flex items-center gap-2 mb-3 text-sm'>
              <div className='w-4 h-4 border-2 border-myconfort-green border-t-transparent rounded-full animate-spin'></div>
              <span>Traitement en cours...</span>
            </div>
          )}

          <div className='grid grid-cols-2 gap-2'>

            {/* Enregistrer */}
            <button
              onClick={handleSaveInvoice}
              disabled={isLoading}
              className={`p-3 rounded-lg font-semibold text-xs transition-all ${
                isInvoiceSaved
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-myconfort-green text-white hover:opacity-90'
              }`}
            >
              <div className='flex flex-col items-center gap-1'>
                <span className='text-sm'>💾</span>
                <span>Enregistrer</span>
                {!isInvoiceSaved && <span className='text-[10px] opacity-80'>OBLIGATOIRE</span>}
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleSendEmailAndDrive}
              disabled={isLoading}
              className={`p-3 rounded-lg font-semibold text-xs transition-all ${
                isEmailSent
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-purple-600 text-white hover:opacity-90'
              }`}
            >
              <div className='flex flex-col items-center gap-1'>
                <span className='text-sm'>📧</span>
                <span>Email</span>
                {!isEmailSent && <span className='text-[10px] opacity-80'>OBLIGATOIRE</span>}
              </div>
            </button>

            {/* PDF */}
            <button
              onClick={handlePrintInvoice}
              disabled={isLoading}
              className='p-3 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:opacity-90 transition-all'
            >
              <div className='flex flex-col items-center gap-1'>
                <span className='text-sm'>🖨️</span>
                <span>PDF</span>
              </div>
            </button>

            {/* PDF Signé */}
            <button
              onClick={handleExportPdfWithSignatures}
              disabled={isLoading || !signature?.dataUrl}
              className='p-3 rounded-lg bg-myconfort-green text-white font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-50'
            >
              <div className='flex flex-col items-center gap-1'>
                <span className='text-sm'>✍️</span>
                <span>PDF Signé</span>
              </div>
            </button>

          </div>

          {/* Status des actions */}
          <div className='mt-3 pt-3 border-t border-gray-200'>
            <div className='flex justify-center gap-4 text-xs'>
              <span className={isInvoiceSaved ? 'text-green-600' : 'text-gray-400'}>
                {isInvoiceSaved ? '✅' : '⭕'} Enregistrée
              </span>
              <span className={isEmailSent ? 'text-green-600' : 'text-gray-400'}>
                {isEmailSent ? '✅' : '⭕'} Email envoyée
              </span>
            </div>
          </div>
        </div>

        {/* Message d'avertissement compact */}
        {!canProceed && (
          <div className='bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs text-center'>
            ⚠️ Actions obligatoires: Enregistrer + Envoyer email
          </div>
        )}

        {/* Signature miniature */}
        {signature?.dataUrl && (
          <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm'>✍️</span>
              <span className='font-semibold text-xs'>Signature</span>
            </div>
            <img
              src={signature.dataUrl}
              alt='Signature'
              className='w-full max-h-12 object-contain border rounded'
            />
          </div>
        )}

      </div>

      {/* Footer navigation fixe - toujours visible */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4'>
        <div className='flex justify-between items-center max-w-md mx-auto'>
          <button
            onClick={onPrev}
            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg text-sm min-w-[100px]'
          >
            ← Précédent
          </button>

          <button
            onClick={handleNewOrder}
            disabled={!canProceed}
            className={`px-4 py-2 font-semibold rounded-lg text-sm min-w-[120px] transition-all ${
              canProceed
                ? 'bg-myconfort-green text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🆕 Nouvelle commande
          </button>
        </div>
      </div>
    </div>
  );
}
