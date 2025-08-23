import { useMemo, useState, useRef } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { PDFService } from '../../services/pdfService';
import { saveInvoice } from '../../utils/storage';
import { InvoicePreviewModern } from '../../components/InvoicePreviewModern';
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
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

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
    <div className='py-8'>
      {/* Header avec code couleur harmonisé */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-[#477A0C] text-white rounded-full text-2xl font-bold mb-4'>
          7
        </div>
        <h2 className='text-3xl font-bold text-[#477A0C] mb-2'>
          📋 Récapitulatif Final
        </h2>
        <p className='text-gray-600 text-lg'>
          Vérification complète avant génération de la facture
        </p>
      </div>

      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Système de notifications amélioré */}
        {notifications.length > 0 && (
          <section className='space-y-3'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-gray-700'>
                📢 Notifications
              </h3>
              {notifications.length > 1 && (
                <button
                  onClick={clearAllNotifications}
                  className='text-sm text-gray-500 hover:text-gray-700 underline'
                >
                  Tout effacer
                </button>
              )}
            </div>

            {notifications.map(notification => {
              const bgColors = {
                info: 'bg-blue-50 border-blue-200 text-blue-800',
                success: 'bg-green-50 border-green-200 text-green-800',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                error: 'bg-red-50 border-red-200 text-red-800',
              };

              const icons = {
                info: '🔵',
                success: '✅',
                warning: '⚠️',
                error: '❌',
              };

              return (
                <div
                  key={notification.id}
                  className={`${bgColors[notification.type]} border rounded-xl p-4 shadow-sm`}
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-lg'>
                          {icons[notification.type]}
                        </span>
                        <span className='font-semibold'>
                          {notification.title}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {notification.timestamp.toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <p className='text-sm leading-relaxed'>
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className='text-gray-400 hover:text-gray-600 ml-2 text-xl'
                      title='Fermer'
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Historique des actions */}
        {actionHistory.length > 0 && (
          <section className='bg-gray-50 rounded-xl p-4 border'>
            <h3 className='text-sm font-semibold text-gray-600 mb-2'>
              📝 Historique des actions
            </h3>
            <div className='space-y-1'>
              {actionHistory.slice(0, 5).map((action, index) => (
                <div
                  key={index}
                  className='text-xs text-gray-500 flex items-center gap-2'
                >
                  <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                  {action}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Aperçu de la facture */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            📄 Aperçu de la facture
          </h3>
          <div className='border rounded-lg p-4 bg-gray-50'>
            <InvoicePreviewModern
              ref={invoicePreviewRef}
              invoice={invoice}
              className='bg-white'
            />
          </div>
        </section>

        {/* Informations client */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>👤</span>
            Informations Client
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              {client.addressLine2 && (
                <div className='text-gray-600'>{client.addressLine2}</div>
              )}
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
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>📦</span>
            Produits Commandés
          </h3>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b-2 border-gray-200'>
                  <th className='text-left py-3 px-2 font-semibold'>
                    Désignation
                  </th>
                  <th className='text-center py-3 px-2 font-semibold'>Qté</th>
                  <th className='text-right py-3 px-2 font-semibold'>
                    Prix unit. TTC
                  </th>
                  <th className='text-right py-3 px-2 font-semibold'>Remise</th>
                  <th className='text-center py-3 px-2 font-semibold'>
                    Livraison
                  </th>
                  <th className='text-right py-3 px-2 font-semibold'>
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {produits.map(produit => (
                  <tr key={produit.id} className='border-b border-gray-100'>
                    <td className='py-3 px-2'>
                      <div className='font-medium'>{produit.designation}</div>
                      {produit.category && (
                        <div className='text-sm text-gray-500'>
                          {produit.category}
                        </div>
                      )}
                    </td>
                    <td className='text-center py-3 px-2'>{produit.qty}</td>
                    <td className='text-right py-3 px-2'>
                      {formatEUR(produit.priceTTC)}
                    </td>
                    <td className='text-right py-3 px-2'>
                      {produit.discount > 0 ? (
                        <span className='text-green-600'>
                          -{produit.discount}
                          {produit.discountType === 'percent' ? '%' : '€'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='text-center py-3 px-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          produit.isPickupOnSite
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {produit.isPickupOnSite ? '🚗 Emporter' : '📦 Livrer'}
                      </span>
                    </td>
                    <td className='text-right py-3 px-2 font-semibold'>
                      {formatEUR(
                        calculateProductTotal(
                          produit.qty,
                          produit.priceTTC,
                          produit.discount || 0,
                          produit.discountType || 'percent'
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className='bg-gray-50 rounded-xl p-4 mt-4'>
            <div className='flex justify-between py-2'>
              <span>Total HT :</span>
              <span className='font-semibold'>
                {formatEUR(invoice.montantHT)}
              </span>
            </div>
            <div className='flex justify-between py-2'>
              <span>TVA (20%) :</span>
              <span className='font-semibold'>
                {formatEUR(invoice.montantTVA)}
              </span>
            </div>
            <div className='flex justify-between py-3 border-t-2 border-gray-300 text-xl font-bold text-[#477A0C]'>
              <span>Total TTC :</span>
              <span>{formatEUR(invoice.montantTTC)}</span>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>💳</span>
            Modalités de Paiement
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <strong>Mode de règlement :</strong> {paiement.method}
            </div>
            {paiement.depositAmount && paiement.depositAmount > 0 && (
              <div>
                <strong>Acompte :</strong> {formatEUR(paiement.depositAmount)}
              </div>
            )}
            {paiement.nombreChequesAVenir &&
              paiement.nombreChequesAVenir > 0 && (
                <div>
                  <strong>Nombre de chèques :</strong>{' '}
                  {paiement.nombreChequesAVenir} fois
                </div>
              )}
            {paiement.remainingAmount && paiement.remainingAmount > 0 && (
              <div>
                <strong>Montant par chèque :</strong>{' '}
                {formatEUR(
                  paiement.remainingAmount / (paiement.nombreChequesAVenir || 1)
                )}
              </div>
            )}
          </div>

          {paiement.note && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <strong>Notes :</strong> {paiement.note}
            </div>
          )}
        </section>

        {/* Modalités de livraison */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>🚚</span>
            Modalités de Livraison
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold text-green-800 mb-2'>
                emporter ({produitsAEmporter.length})
              </h4>
              {produitsAEmporter.length > 0 ? (
                <ul className='text-sm text-green-700'>
                  {produitsAEmporter.map(p => (
                    <li key={p.id}>
                      • {p.designation} (x{p.qty})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-500 text-sm'>
                  Aucun produit à emporter
                </p>
              )}
            </div>

            <div>
              <h4 className='font-semibold text-blue-800 mb-2'>
                À livrer ({produitsALivrer.length})
              </h4>
              {produitsALivrer.length > 0 ? (
                <ul className='text-sm text-blue-700'>
                  {produitsALivrer.map(p => (
                    <li key={p.id}>
                      • {p.designation} (x{p.qty})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-500 text-sm'>Aucun produit à livrer</p>
              )}
            </div>
          </div>

          {livraison.deliveryMethod && (
            <div className='mt-4'>
              <strong>Mode de livraison :</strong> {livraison.deliveryMethod}
            </div>
          )}

          {livraison.deliveryNotes && (
            <div className='mt-4 p-3 bg-yellow-50 rounded-lg'>
              <strong>Notes de livraison :</strong> {livraison.deliveryNotes}
            </div>
          )}
        </section>

        {/* Signature */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>✍️</span>
            Signature Client
          </h3>

          {signature.dataUrl ? (
            <div className='text-center'>
              <img
                src={signature.dataUrl}
                alt='Signature du client'
                className='max-w-md mx-auto border rounded-lg shadow-sm'
              />
              <p className='text-sm text-gray-600 mt-2'>
                Signé le{' '}
                {signature.timestamp
                  ? new Date(signature.timestamp).toLocaleString('fr-FR')
                  : ''}
              </p>
            </div>
          ) : (
            <p className='text-red-600'>⚠️ Aucune signature enregistrée</p>
          )}
        </section>

        {/* Actions principales */}
        <section className='bg-gradient-to-r from-[#477A0C]/10 to-[#477A0C]/20 rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4 flex items-center'>
            <span className='mr-2'>⚡</span>
            Actions Principales
          </h3>

          <p className='text-green-700 mb-4'>
            Toutes les informations ont été collectées avec succès. Vous pouvez
            maintenant :
          </p>

          {/* Avertissement sur les actions obligatoires */}
          {!canProceed && (
            <div className='bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>⚠️</span>
                <span className='font-semibold'>Actions obligatoires</span>
              </div>
              <p className='text-sm mt-1'>
                Vous devez <strong>enregistrer la facture</strong> et{' '}
                <strong>envoyer l'email</strong> pour pouvoir continuer.
              </p>
            </div>
          )}

          {/* Indicateur de progression global */}
          {isLoading && (
            <div className='bg-white rounded-lg p-4 mb-6 border-2 border-blue-200'>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-blue-700 font-medium'>
                  Traitement en cours...
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-3'>
                <div className='bg-blue-600 h-2 rounded-full w-1/3 animate-pulse'></div>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='relative'>
              <button
                type='button'
                onClick={handleSaveInvoice}
                disabled={isLoading}
                className='w-full bg-[#477A0C] hover:bg-[#5A8F0F] disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center min-h-[60px]'
              >
                <span className='mr-2'>💾</span>
                <div className='text-center'>
                  <div>
                    {isLoading ? 'Enregistrement...' : 'Enregistrer Facture'}
                  </div>
                  <div className='text-xs opacity-80 mt-1'>
                    Sauvegarde dans l'onglet factures
                  </div>
                </div>
              </button>
              {/* Badge OBLIGATOIRE */}
              {!isInvoiceSaved && (
                <div className='absolute -top-3 -left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                  OBLIGATOIRE
                </div>
              )}
              {actionHistory.includes(
                `Facture ${invoice.invoiceNumber} enregistrée`
              ) && (
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs'>
                  ✓
                </div>
              )}
            </div>

            <div className='relative'>
              <button
                type='button'
                onClick={handlePrintInvoice}
                disabled={isLoading}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center min-h-[60px]'
              >
                <span className='mr-2'>🖨️</span>
                <div className='text-center'>
                  <div>
                    {isLoading ? 'Génération PDF...' : 'Imprimer (PDF A4)'}
                  </div>
                  <div className='text-xs opacity-80 mt-1'>
                    PDF premium avec CGV
                  </div>
                </div>
              </button>
              {actionHistory.some(action =>
                action.includes('ouvert pour impression')
              ) && (
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs'>
                  ✓
                </div>
              )}
            </div>

            <div className='relative'>
              <button
                type='button'
                onClick={handleSendEmailAndDrive}
                disabled={isLoading}
                className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center min-h-[60px]'
              >
                <span className='mr-2'>📧</span>
                <div className='text-center'>
                  <div>
                    {isLoading ? 'Envoi en cours...' : 'Envoyer Email & Drive'}
                  </div>
                  <div className='text-xs opacity-80 mt-1'>
                    Email + sauvegarde Google Drive
                  </div>
                </div>
              </button>
              {/* Badge OBLIGATOIRE */}
              {!isEmailSent && (
                <div className='absolute -top-3 -left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                  OBLIGATOIRE
                </div>
              )}
              {actionHistory.some(action =>
                action.includes('envoyée par email et Drive')
              ) && (
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs'>
                  ✓
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif des actions effectuées */}
          {actionHistory.length > 0 && (
            <div className='mt-6 p-4 bg-green-50 rounded-xl border border-green-200'>
              <h4 className='text-sm font-semibold text-green-700 mb-2'>
                ✅ Actions effectuées
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div
                  className={`flex items-center gap-2 ${actionHistory.some(a => a.includes('enregistrée')) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <span>
                    {actionHistory.some(a => a.includes('enregistrée'))
                      ? '✅'
                      : '⭕'}
                  </span>
                  Facture enregistrée
                </div>
                <div
                  className={`flex items-center gap-2 ${actionHistory.some(a => a.includes('impression')) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <span>
                    {actionHistory.some(a => a.includes('impression'))
                      ? '✅'
                      : '⭕'}
                  </span>
                  PDF généré
                </div>
                <div
                  className={`flex items-center gap-2 ${actionHistory.some(a => a.includes('email')) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <span>
                    {actionHistory.some(a => a.includes('email')) ? '✅' : '⭕'}
                  </span>
                  Email envoyé
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className='flex flex-col items-center gap-4'>
          {/* Message d'information si les actions ne sont pas complètes */}
          {!canProceed && (
            <div className='bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl text-center max-w-2xl'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <span className='text-xl'>⚠️</span>
                <span className='font-semibold'>
                  Actions obligatoires requises
                </span>
              </div>
              <p className='text-sm'>
                Vous devez d'abord <strong>enregistrer la facture</strong> et{' '}
                <strong>envoyer l'email</strong> avant de pouvoir poursuivre.
              </p>
              <div className='flex justify-center gap-4 mt-3 text-xs'>
                <span
                  className={`flex items-center gap-1 ${isInvoiceSaved ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {isInvoiceSaved ? '✅' : '⭕'} Facture enregistrée
                </span>
                <span
                  className={`flex items-center gap-1 ${isEmailSent ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {isEmailSent ? '✅' : '⭕'} Email envoyé
                </span>
              </div>
            </div>
          )}

          {/* Message de validation si toutes les actions sont complètes */}
          {canProceed && (
            <div className='bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl text-center max-w-2xl'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <span className='text-xl'>✅</span>
                <span className='font-semibold'>
                  Toutes les actions effectuées
                </span>
              </div>
              <p className='text-sm'>
                La facture a été enregistrée et l'email envoyé. Vous pouvez
                maintenant poursuivre.
              </p>
            </div>
          )}

          <div className='flex gap-4 justify-center'>
            <button
              type='button'
              onClick={onPrev}
              className='px-8 py-4 rounded-xl border-2 border-gray-300 text-lg font-semibold hover:bg-gray-50 transition-all'
            >
              ← Signature
            </button>

            <button
              type='button'
              onClick={handleNewOrder}
              disabled={!canProceed}
              className={`px-8 py-4 rounded-xl text-xl font-semibold transition-all transform shadow-lg ${
                canProceed
                  ? 'bg-[#477A0C] hover:bg-[#5A8F0F] text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                !canProceed
                  ? "Veuillez d'abord enregistrer la facture et envoyer l'email"
                  : ''
              }
            >
              🆕 Nouvelle Commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
