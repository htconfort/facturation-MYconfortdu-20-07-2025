import { useState, useMemo, useEffect } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { PDFService } from '../../services/pdfService';
import { saveInvoice } from '../../utils/storage';
import type { Invoice } from '../../types';

/**
 * StepRecapNoScroll
 * - Conteneur pleine hauteur iPad (100svh)
 * - Contenu principal scrollable avec padding-bas pour ne pas passer sous la barre sticky
 * - Barre 5 boutons sticky "à l'intérieur" de l'iPad
 * - Paiement : rend "Chèques à venir" (nb + montant) ou "Alma (X fois)"
 */

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
    syncToMainInvoice,
  } = useInvoiceWizard();

  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Construction Invoice unifié depuis Zustand
  const invoice: Invoice = useMemo(() => {
    return syncToMainInvoice();
  }, [syncToMainInvoice]);

  // Notifications
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
    setNotifications(prev => [...prev, notification]);
    if (action) setActionHistory(prev => [...prev, action]);
    if (!persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  // Actions
  const handleSaveInvoice = async () => {
    try {
      setIsLoading(true);
      addNotification('info', 'Enregistrement en cours', "Sauvegarde de la facture...");
      saveInvoice(invoice);
      addNotification(
        'success',
        'Facture enregistrée',
        `Facture ${invoice.invoiceNumber} disponible dans l’onglet factures.`,
        true,
        `Facture ${invoice.invoiceNumber} enregistrée`
      );
    } catch (error) {
      console.error('Erreur sauvegarde facture:', error);
      addNotification('error', "Erreur d'enregistrement", 'Réessayez.', true, 'Échec enregistrement facture');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);
      addNotification('info', 'Génération PDF', 'Création du PDF A4 premium...');
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);
      const w = window.open(url, '_blank');
      if (!w) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        addNotification('warning', 'PDF téléchargé', 'Pop-ups bloqués : PDF téléchargé automatiquement.', false, `PDF facture ${invoice.invoiceNumber} téléchargé`);
      } else {
        addNotification('success', 'PDF ouvert', `PDF facture ${invoice.invoiceNumber} ouvert (nouvel onglet).`, true, 'ouvert pour impression');
      }
    } catch (error) {
      console.error('Erreur impression PDF:', error);
      addNotification('error', 'Erreur PDF', 'Impossible de générer le PDF.', true, 'Échec génération PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailAndDrive = async () => {
    try {
      setIsLoading(true);
      addNotification('info', "Préparation de l'envoi", 'Génération du PDF + conversion base64...');
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);

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

      addNotification('info', 'Envoi en cours', 'Envoi email + sauvegarde Drive via N8N...');
      const result = await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);

      if (result.success) {
        addNotification(
          'success',
          'Envoi réussi',
          `Facture ${invoice.invoiceNumber} envoyée à ${client?.email ?? 'client'} et sauvegardée sur Drive.`,
          true,
          `Facture ${invoice.invoiceNumber} envoyée par email`
        );
      } else {
        addNotification('error', "Échec de l'envoi", result.message ?? 'Erreur N8N', true, 'Échec envoi email/Drive');
      }
    } catch (error) {
      console.error('Erreur envoi email/drive:', error);
      addNotification('error', 'Erreur système', "Vérifiez connexion et config N8N.", true, 'Erreur système envoi');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculs
  const totalTTC = useMemo(() => {
    return produits.reduce(
      (sum, p) => sum + calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType),
      0
    );
  }, [produits]);

  // Conditions pour déverrouiller "suite"
  const isInvoiceSaved = actionHistory.some(a => a.includes('enregistrée'));
  const isEmailSent = actionHistory.some(a => a.includes('envoyée par email'));
  const canProceed = isInvoiceSaved && isEmailSent;

  // Pages secondaires
  if (showFullInvoice) {
    return (
      <FullInvoicePreviewPage
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
      />
    );
  }

  if (showProcessing) {
    return (
      <ProcessingPage
        onComplete={() => onNext()}
        onBack={onPrev}
        onPreview={() => setShowFullInvoice(true)}
        onPrint={handlePrintInvoice}
        canProceed={canProceed}
      />
    );
  }

  // ===== PAGE PRINCIPALE =====
  return (
    <div className="w-full h-[100svh] bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">📋 Récapitulatif Final</h1>
        <p className="text-myconfort-dark/70 text-sm">Étape 7/8 • Vérification avant finalisation</p>
      </div>

      {/* Contenu scrollable avec espace pour la barre des boutons */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-start overflow-y-auto pb-[120px]">
        {/* Bandeau résumé */}
        <div className="bg-myconfort-green/10 p-3 rounded-xl border border-myconfort-green/30 mb-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-4 gap-2 text-center flex-1">
              <div>
                <div className="text-sm font-bold text-myconfort-dark">{client?.name ? '✓' : '❌'}</div>
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
                <div className="text-sm font-bold text-myconfort-dark">
                  {/* Mini résumé Paiement */}
                  {paiement?.method === 'Chèque à venir' ? 'Chèques' : 
                   paiement?.method?.startsWith('Alma ') ? 'Alma' : 
                   paiement?.method ? '✓' : '❌'}
                </div>
                <div className="text-xs text-myconfort-dark/70">Paiement</div>
              </div>
            </div>
            <div className="ml-4">
              <button
                type="button"
                onClick={() => setShowFullInvoice(true)}
                className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-1"
              >
                <span className="text-xs">📄</span>
                <span>Voir détails</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications compactes */}
        {notifications.length > 0 && (
          <div className="space-y-1 mb-4">
            {notifications.slice(-2).map(notif => (
              <div
                key={notif.id}
                className={`p-2 rounded text-xs text-center ${
                  notif.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : notif.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : notif.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                <div className="font-medium">{notif.title}</div>
              </div>
            ))}
          </div>
        )}

        {/* Cartes informations (extrait) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facture */}
          <div className="bg-white rounded-xl border p-4">
            <div className="font-bold text-myconfort-dark mb-2">🧾 Facture</div>
            <div className="text-sm">Numéro : <strong>{invoiceNumber}</strong></div>
            <div className="text-sm">Date : <strong>{invoiceDate}</strong></div>
          </div>

          {/* Produits */}
          <div className="bg-white rounded-xl border p-4">
            <div className="font-bold text-myconfort-dark mb-2">📦 Produits ({produits.length})</div>
            <div className="text-sm">Total TTC : <strong>{totalTTC.toFixed(2)}€</strong></div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-xl border p-4">
            <div className="font-bold text-myconfort-dark mb-2">👤 Client</div>
            <div className="text-sm">{client?.name ?? <span className="text-red-600">Non renseigné</span>}</div>
          </div>

          {/* Livraison */}
          <div className="bg-white rounded-xl border p-4">
            <div className="font-bold text-myconfort-dark mb-2">🚚 Livraison</div>
            <div className="text-sm">Mode : {livraison?.deliveryMethod ?? <span className="text-red-600">Non défini</span>}</div>
          </div>

          {/* Paiement (rendu robuste) */}
          <div className="bg-white rounded-xl border p-4 md:col-span-2">
            <div className="font-bold text-myconfort-dark mb-2">💳 Paiement</div>
            <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
              {!paiement?.method ? (
                <div className="text-red-600 font-medium">Mode : Non défini</div>
              ) : paiement.method === 'Chèque à venir' ? (
                <div className="space-y-1">
                  <div><strong>Méthode :</strong> Chèques à venir</div>
                  <div className="text-myconfort-dark/90">
                    <strong>Nombre :</strong> {paiement.nombreChequesAVenir ?? '—'}
                    {typeof paiement.nombreChequesAVenir === 'number' && paiement.nombreChequesAVenir > 0 && (
                      <span className="ml-2">
                        <strong>Montant/chèque :</strong> {((totalTTC - (paiement.depositAmount || 0)) / paiement.nombreChequesAVenir).toFixed(2)}€
                      </span>
                    )}
                  </div>
                  {typeof paiement.depositAmount === 'number' && (
                    <div><strong>Acompte :</strong> {paiement.depositAmount.toFixed(2)}€</div>
                  )}
                </div>
              ) : paiement.method?.startsWith('Alma ') ? (
                <div className="space-y-1">
                  <div><strong>Méthode :</strong> {paiement.method}</div>
                  <div><strong>Échelonnement :</strong> {paiement.nombreFoisAlma ?? '—'} fois</div>
                  {typeof paiement.depositAmount === 'number' && (
                    <div><strong>Acompte :</strong> {paiement.depositAmount.toFixed(2)}€</div>
                  )}
                </div>
              ) : (
                <div><strong>Méthode :</strong> {paiement.method}</div>
              )}
            </div>
          </div>
        </div>

        {/* Statut actions effectuées */}
        {actionHistory.length > 0 && (
          <div className="mt-4 bg-green-50 p-2 rounded-lg border border-green-200 text-center">
            <div className="text-xs font-medium text-green-700">✅ {actionHistory.length} action(s) effectuée(s)</div>
          </div>
        )}

        {/* Validation finale */}
        {!canProceed && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-center">
            <span className="text-sm font-medium">⚠️ Enregistrer + Envoyer obligatoires</span>
          </div>
        )}
        {isLoading && (
          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700 text-sm font-medium">Traitement...</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== BARRE DE BOUTONS collée "dans l'iPad" ===== */}
      <div
        className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-myconfort-dark/10 px-4 py-3"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-5 gap-3">
          {/* 0. Précédent */}
          <button
            type="button"
            onClick={onPrev}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[64px]"
          >
            <span className="text-xl mb-1">←</span>
            <div className="text-center">
              <div className="text-sm">Précédent</div>
            </div>
          </button>

          {/* 1. Enregistrer (OBLIGATOIRE) */}
          <div className="relative">
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={isLoading}
              className="w-full bg-myconfort-green hover:bg-myconfort-green/90 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[64px]"
            >
              <span className="text-xl mb-1">💾</span>
              <div className="text-center">
                <div className="text-sm">Enregistrer</div>
                <div className="text-xs opacity-80">Facture</div>
              </div>
            </button>
            {!isInvoiceSaved && (
              <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">!</div>
            )}
            {isInvoiceSaved && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
            )}
          </div>

          {/* 2. Imprimer */}
          <div className="relative">
            <button
              type="button"
              onClick={handlePrintInvoice}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[64px]"
            >
              <span className="text-xl mb-1">🖨️</span>
              <div className="text-center">
                <div className="text-sm">Imprimer</div>
                <div className="text-xs opacity-80">PDF A4</div>
              </div>
            </button>
            {/* coche visuelle si déjà ouvert */}
            {actionHistory.some(a => a.includes('ouvert pour impression')) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
            )}
          </div>

          {/* 3. Envoyer (OBLIGATOIRE) */}
          <div className="relative">
            <button
              type="button"
              onClick={handleSendEmailAndDrive}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[64px]"
            >
              <span className="text-xl mb-1">📧</span>
              <div className="text-center">
                <div className="text-sm">Envoyer</div>
                <div className="text-xs opacity-80">Email</div>
              </div>
            </button>
            {!isEmailSent && (
              <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">!</div>
            )}
            {isEmailSent && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
            )}
          </div>

          {/* 4. Suivant / Nouvelles commandes */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={`w-full px-3 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-h-[64px] ${
              canProceed ? 'bg-myconfort-green hover:bg-myconfort-green/90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-xl mb-1">→</span>
            <div className="text-center">
              <div className="text-sm">{canProceed ? 'Suivant' : 'Compléter d’abord'}</div>
              <div className="text-xs opacity-80">{canProceed ? 'Valider' : 'Enregistrer + Envoyer'}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pages secondaires ---------- */

function FullInvoicePreviewPage({
  client,
  produits,
  paiement,
  livraison,
  totalTTC,
  invoiceNumber,
  invoiceDate,
  onBack,
  onValidate,
}: {
  client: any;
  produits: any[];
  paiement: any;
  livraison: any;
  totalTTC: number;
  invoiceNumber: string;
  invoiceDate: string;
  onBack: () => void;
  onValidate: () => void;
}) {
  return (
    <div className="w-full h-[100svh] bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">📄 Aperçu Facture</h1>
        <p className="text-myconfort-dark/70 text-sm">
          Facture #{invoiceNumber} - {invoiceDate}
        </p>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-300 max-w-4xl mx-auto">
          {/* En-tête */}
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

          {/* Client */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">FACTURER À :</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold">{client?.name ?? '—'}</div>
              <div>{client?.address ?? '—'}</div>
              <div>{client?.postalCode ?? ''} {client?.city ?? ''}</div>
              <div>{client?.email ?? '—'} • {client?.phone ?? '—'}</div>
            </div>
          </div>

          {/* Produits */}
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
                      <td className="border p-2 text-right">{Number(p.priceTTC ?? 0).toFixed(2)}€</td>
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

          {/* Paiement */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">MODALITÉS DE PAIEMENT :</h3>
            <div className="bg-blue-50 p-3 rounded">
              {!paiement?.method ? (
                <div className="text-gray-500 italic">Mode de paiement à définir</div>
              ) : paiement.method === 'Chèque à venir' ? (
                <div>
                  <strong>Chèques à venir :</strong> {paiement.nombreChequesAVenir ?? '—'} chèques
                  {typeof paiement.nombreChequesAVenir === 'number' && paiement.nombreChequesAVenir > 0 && (
                    <span className="text-myconfort-dark/80"> de {((totalTTC - (paiement.depositAmount || 0)) / paiement.nombreChequesAVenir).toFixed(2)}€ chacun</span>
                  )}
                </div>
              ) : paiement.method?.startsWith('Alma ') ? (
                <div><strong>{paiement.method} :</strong> {paiement.nombreFoisAlma ?? '—'} fois</div>
              ) : (
                <div><strong>Méthode :</strong> {paiement.method}</div>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">LIVRAISON :</h3>
            <div className="bg-yellow-50 p-3 rounded">
              <div><strong>Mode :</strong> {livraison?.deliveryMethod ?? 'À définir'}</div>
              <div><strong>Adresse :</strong> {livraison?.deliveryAddress ?? client?.address ?? '—'}</div>
              {livraison?.deliveryNotes && <div><strong>Instructions :</strong> {livraison.deliveryNotes}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105 min-h-[56px]"
        >
          ← Retour
        </button>

        <button
          onClick={onValidate}
          className="px-12 py-4 bg-myconfort-green hover:bg-myconfort-green/90 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg min-h-[56px]"
        >
          ✅ Valider facture →
        </button>
      </div>
    </div>
  );
}

function ProcessingPage({
  onComplete,
  onBack,
  onPreview,
  onPrint,
  canProceed,
}: {
  onComplete: () => void;
  onBack?: () => void;
  onPreview?: () => void;
  onPrint?: () => void;
  canProceed?: boolean;
}) {
  const [step, setStep] = useState(1);

  // Séquence auto
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s < 4) return s + 1;
        clearInterval(timer);
        onComplete();
        return s;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [onComplete]);

  const steps = ['📄 Génération PDF...', '📤 Envoi N8N...', '💾 Sauvegarde...', '✅ Terminé !'];

  return (
    <div className="w-full h-[100svh] bg-myconfort-cream flex flex-col overflow-hidden items-center">
      <div className="flex-1 w-full overflow-y-auto flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-myconfort-dark mb-6">Finalisation en cours...</h1>

          <div className="space-y-3">
            {steps.map((text, i) => (
              <div
                key={i}
                className={`flex items-center justify-center gap-3 p-2 rounded-lg ${
                  i + 1 < step ? 'bg-myconfort-green/10 text-myconfort-green' :
                  i + 1 === step ? 'bg-myconfort-blue/10 text-myconfort-blue' :
                  'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-lg">{i + 1 < step ? '✅' : i + 1 === step ? '⏳' : '⭕'}</div>
                <div className="font-medium">{text}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-myconfort-green h-2 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            <div className="text-sm text-gray-600 mt-2">Étape {step}/4</div>
          </div>
        </div>
      </div>

      {/* Footer sticky avec actions optionnelles */}
      <div
        className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-myconfort-dark/10 px-4 py-3 w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={onBack}
            disabled={!onBack}
            className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 text-lg ${
              onBack ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>👈</span>
            <span>Retour</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onPreview}
              disabled={!onPreview}
              className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 ${
                onPreview ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-sm">📄</span>
              <span>Aperçu PDF</span>
            </button>

            <button
              onClick={onPrint}
              disabled={!onPrint || !canProceed}
              className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 text-lg ${
                onPrint && canProceed ? 'bg-myconfort-green hover:bg-myconfort-green/90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>🖨️</span>
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
