import { useState, useMemo } from 'react';
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

export default function StepRecapNoScroll({ onNext, onPrev }: StepProps) {
  const { 
    client, 
    produits, 
    paiement, 
    livraison, 
    invoiceNumber,
    invoiceDate,
    syncToMainInvoice
  } = useInvoiceWizard();
  
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Construction de l'objet Invoice depuis le store Zustand
  const invoice: Invoice = useMemo(() => {
    const baseInvoice = syncToMainInvoice();
    return baseInvoice;
  }, [syncToMainInvoice]);

  // Système de notifications
  const addNotification = (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    persistent: boolean = false,
    action?: string
  ) => {
    const notification: NotificationMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      persistent,
      action
    };
    setNotifications(prev => [...prev, notification]);
    
    if (action) {
      setActionHistory(prev => [...prev, action]);
    }

    // Auto-remove non-persistent notifications
    if (!persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
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
      saveInvoice(invoice);

      // Notification de succès
      addNotification(
        'success',
        'Facture enregistrée avec succès',
        `Facture ${invoice.invoiceNumber} sauvegardée dans l'onglet factures. Elle est maintenant accessible depuis le mode normal.`,
        true,
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

  // Action 2: Imprimer le PDF A4 Premium
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);

      addNotification(
        'info',
        'Génération PDF en cours',
        'Création du PDF A4 premium avec en-tête, footer et CGV...'
      );

      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);

      addNotification(
        'info',
        'Ouverture du PDF',
        'Ouverture du PDF dans un nouvel onglet pour impression...'
      );

      const w = window.open(url, '_blank');
      if (!w) {
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

  // Action 3: Envoyer par email via N8N
  const handleSendEmailAndDrive = async () => {
    try {
      setIsLoading(true);

      addNotification(
        'info',
        "Préparation de l'envoi",
        "Génération du PDF et préparation des données pour l'envoi..."
      );

      const pdfBlob = await PDFService.generateInvoicePDF(invoice);

      addNotification(
        'info',
        'Conversion en cours',
        "Conversion du PDF en format base64 pour l'envoi..."
      );

      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Erreur conversion PDF'));
        reader.readAsDataURL(pdfBlob);
      });

      addNotification(
        'info',
        'Envoi en cours',
        'Envoi du PDF par email et sauvegarde sur Google Drive via N8N...'
      );

      const result = await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);

      if (result.success) {
        addNotification(
          'success',
          'Envoi réussi',
          `Facture ${invoice.invoiceNumber} envoyée par email à ${client.email} et sauvegardée sur Google Drive.`,
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

  // Calculs financiers
  const totalTTC = useMemo(() => {
    return produits.reduce((sum, p) => 
      sum + calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType), 0
    );
  }, [produits]);

  // États pour validation des actions obligatoires
  const isInvoiceSaved = actionHistory.some(action => action.includes('enregistrée'));
  const isEmailSent = actionHistory.some(action => action.includes('envoyée par email'));
  const canProceed = isInvoiceSaved && isEmailSent;

  // Page secondaire pour l'aperçu complet de la facture
  if (showFullInvoice) {
    return <FullInvoicePreviewPage 
      client={client}
      produits={produits}
      paiement={paiement}
      livraison={livraison}
      totalTTC={totalTTC}
      invoiceNumber={invoiceNumber}
      invoiceDate={invoiceDate}
      onBack={() => setShowFullInvoice(false)}
      onValidate={() => {
        setShowFullInvoice(false);
        setShowProcessing(true);
      }}
    />;
  }

  // Page de traitement final
  if (showProcessing) {
    return <ProcessingPage 
      onComplete={() => {
        // Ici on peut déclencher l'envoi N8N, impression, etc.
        onNext(); // ou redirection vers confirmation finale
      }}
    />;
  }

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative">
      {/* 🎯 Header fixe */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📋 Récapitulatif Final
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Étape 7/8 • Vérification avant finalisation
        </p>
      </div>

      {/* 🎯 Contenu principal - INTERFACE SIMPLIFIÉE */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-center">
        
        {/* Résumé ultra-compact avec bouton détails */}
        <div className="bg-myconfort-green/10 p-3 rounded-xl border border-myconfort-green/30 mb-4">
          <div className="flex items-center justify-between">
            {/* Résumé en colonnes */}
            <div className="grid grid-cols-4 gap-2 text-center flex-1">
              <div>
                <div className="text-sm font-bold text-myconfort-dark">{client.name ? '✓' : '❌'}</div>
                <div className="text-xs text-myconfort-dark/70">Client</div>
              </div>
              <div>
                <div className="text-sm font-bold text-myconfort-dark">{produits.length}</div>
                <div className="text-xs text-myconfort-dark/70">Produits</div>
              </div>
              <div>
                <div className="text-sm font-bold text-myconfort-dark">{totalTTC.toFixed(0)}€</div>
                <div className="text-xs text-myconfort-dark/70">Total</div>
              </div>
              <div>
                <div className="text-sm font-bold text-myconfort-dark">{paiement.method ? '✓' : '❌'}</div>
                <div className="text-xs text-myconfort-dark/70">Paiement</div>
              </div>
            </div>
            
            {/* Bouton Voir détails repositionné */}
            <div className="ml-4">
              <button
                type="button"
                onClick={() => setShowFullInvoice(true)}
                className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white
                           rounded-lg text-sm font-medium transition-all shadow-sm
                           flex items-center gap-1"
              >
                <span className="text-xs">📄</span>
                <span>Voir détails</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 ACTIONS PRINCIPALES SIMPLIFIÉES - Plus d'espace */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-myconfort-green text-center">
            ⚡ Actions Finales
          </h3>

          {/* Avertissement compact */}
          {!canProceed && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-center">
              <span className="text-sm font-medium">⚠️ Enregistrer + Envoyer obligatoires</span>
            </div>
          )}

          {/* Indicateur de progression compact */}
          {isLoading && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 text-sm font-medium">Traitement...</span>
              </div>
            </div>
          )}

          {/* Notifications compactes */}
          {notifications.length > 0 && (
            <div className="space-y-1">
              {notifications.slice(-2).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2 rounded text-xs text-center ${
                    notif.type === 'success' ? 'bg-green-50 text-green-700' :
                    notif.type === 'error' ? 'bg-red-50 text-red-700' :
                    notif.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className="font-medium">{notif.title}</div>
                </div>
              ))}
            </div>
          )}

          {/* BOUTONS D'ACTIONS + NAVIGATION - Grid 5 colonnes optimisé */}
          <div className="grid grid-cols-5 gap-3">
            
            {/* 0. Bouton Précédent */}
            <div className="relative">
              <button
                type="button"
                onClick={onPrev}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]"
              >
                <span className="text-xl mb-1">←</span>
                <div className="text-center">
                  <div className="text-sm">Précédent</div>
                </div>
              </button>
            </div>

            {/* 1. Enregistrer Facture - OBLIGATOIRE */}
            <div className="relative">
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isLoading}
                className="w-full bg-myconfort-green hover:bg-myconfort-green/90 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]"
              >
                <span className="text-xl mb-1">💾</span>
                <div className="text-center">
                  <div className="text-sm">Enregistrer</div>
                  <div className="text-xs opacity-80">Facture</div>
                </div>
              </button>
              {!isInvoiceSaved && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                  !
                </div>
              )}
              {actionHistory.some(action => action.includes('enregistrée')) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* 2. Imprimer PDF A4 */}
            <div className="relative">
              <button
                type="button"
                onClick={handlePrintInvoice}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]"
              >
                <span className="text-xl mb-1">🖨️</span>
                <div className="text-center">
                  <div className="text-sm">Imprimer</div>
                  <div className="text-xs opacity-80">PDF A4</div>
                </div>
              </button>
              {actionHistory.some(action => action.includes('ouvert pour impression')) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* 3. Envoyer Email - OBLIGATOIRE */}
            <div className="relative">
              <button
                type="button"
                onClick={handleSendEmailAndDrive}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]"
              >
                <span className="text-xl mb-1">📧</span>
                <div className="text-center">
                  <div className="text-sm">Envoyer</div>
                  <div className="text-xs opacity-80">Email</div>
                </div>
              </button>
              {!isEmailSent && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                  !
                </div>
              )}
              {actionHistory.some(action => action.includes('envoyée par email')) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>

            {/* 4. Bouton Suivant */}
            <div className="relative">
              <button
                type="button"
                onClick={onNext}
                className="w-full bg-myconfort-green hover:bg-myconfort-green/90 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]"
              >
                <span className="text-xl mb-1">→</span>
                <div className="text-center">
                  <div className="text-sm">Nouvelles</div>
                  <div className="text-xs opacity-80">Commandes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Actions effectuées - compact */}
          {actionHistory.length > 0 && (
            <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
              <div className="text-xs font-medium text-green-700">
                ✅ {actionHistory.length} action(s) effectuée(s)
              </div>
            </div>
          )}

          {/* Message de validation finale */}
          {canProceed && (
            <div className="bg-myconfort-green/10 p-3 rounded-lg border border-myconfort-green/30 text-center">
              <div className="text-lg mb-1">🎉</div>
              <div className="text-sm font-bold text-myconfort-green">Terminé !</div>
              <div className="text-xs text-myconfort-dark/70">Facture prête</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🎯 Page secondaire pour l'aperçu complet de la facture
function FullInvoicePreviewPage({ 
  client,
  produits,
  paiement,
  livraison,
  totalTTC,
  invoiceNumber,
  invoiceDate,
  onBack,
  onValidate 
}: any) {
  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📄 Aperçu Facture
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Facture #{invoiceNumber} - {invoiceDate}
        </p>
      </div>

      {/* Contenu scrollable avec aperçu facture */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-300 max-w-4xl mx-auto">
          
          {/* En-tête facture */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-myconfort-green">MyConfort</h1>
              <p className="text-gray-600">Solutions de confort thermique</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">FACTURE #{invoiceNumber}</div>
              <div className="text-gray-600">Date: {invoiceDate}</div>
            </div>
          </div>

          {/* Informations client */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">FACTURER À:</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold">{client.name}</div>
              <div>{client.address}</div>
              <div>{client.postalCode} {client.city}</div>
              <div>{client.email} • {client.phone}</div>
            </div>
          </div>

          {/* Tableau produits */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-myconfort-green text-white">
                  <th className="border p-2 text-left">Produit</th>
                  <th className="border p-2 text-center">Qté</th>
                  <th className="border p-2 text-right">Prix Unit.</th>
                  <th className="border p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p: any, i: number) => {
                  const total = calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType);
                  return (
                    <tr key={i}>
                      <td className="border p-2">{p.designation}</td>
                      <td className="border p-2 text-center">{p.qty}</td>
                      <td className="border p-2 text-right">{p.priceTTC.toFixed(2)}€</td>
                      <td className="border p-2 text-right">{total.toFixed(2)}€</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={3} className="border p-2 text-right">TOTAL TTC:</td>
                  <td className="border p-2 text-right">{totalTTC.toFixed(2)}€</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Informations paiement */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">MODALITÉS DE PAIEMENT:</h3>
            <div className="bg-blue-50 p-3 rounded">
              <div><strong>Méthode:</strong> {paiement.method}</div>
              {paiement.depositAmount && (
                <div><strong>Acompte:</strong> {paiement.depositAmount}€</div>
              )}
              {paiement.nombreFoisAlma && (
                <div><strong>Alma:</strong> {paiement.nombreFoisAlma} fois</div>
              )}
              {paiement.nombreChequesAVenir && (
                <div><strong>Chèques:</strong> {paiement.nombreChequesAVenir} chèques</div>
              )}
            </div>
          </div>

          {/* Informations livraison */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">LIVRAISON:</h3>
            <div className="bg-yellow-50 p-3 rounded">
              <div><strong>Mode:</strong> {livraison.deliveryMethod || 'À définir'}</div>
              <div><strong>Adresse:</strong> {livraison.deliveryAddress || client.address}</div>
              {livraison.deliveryNotes && (
                <div><strong>Instructions:</strong> {livraison.deliveryNotes}</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Retour
        </button>

        <button
          onClick={onValidate}
          className="px-12 py-4 bg-myconfort-green hover:bg-myconfort-green/90 text-white
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     shadow-lg min-h-[56px]"
        >
          ✅ Valider facture →
        </button>
      </div>
    </div>
  );
}

// 🎯 Page de traitement final
function ProcessingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);

  // Simulation du processus
  setTimeout(() => {
    if (step < 4) setStep(step + 1);
    else onComplete();
  }, 1500);

  const steps = [
    '📄 Génération PDF...',
    '📤 Envoi N8N...',
    '💾 Sauvegarde...',
    '✅ Terminé !'
  ];

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-myconfort-dark mb-6">
          Finalisation en cours...
        </h1>
        
        <div className="space-y-3">
          {steps.map((stepText, i) => (
            <div key={i} className={`flex items-center justify-center gap-3 p-2 rounded-lg ${
              i < step ? 'bg-myconfort-green/10 text-myconfort-green' :
              i === step ? 'bg-myconfort-blue/10 text-myconfort-blue' :
              'bg-gray-100 text-gray-400'
            }`}>
              <div className="text-lg">
                {i < step ? '✅' : i === step ? '⏳' : '⭕'}
              </div>
              <div className="font-medium">{stepText}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-myconfort-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Étape {step}/4
          </div>
        </div>
      </div>
    </div>
  );
}
