import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Printer, FileText, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { InvoicePreviewModern } from './InvoicePreviewModern';
import { Invoice } from '../types';
import { UnifiedPrintService } from '../services/unifiedPrintService';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => Promise<void>;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Nettoyage des états au fermeture
  const cleanupAndClose = useCallback(() => {
    setShareSuccess(null);
    setShareError(null);
    setIsLoading(false);
    setLoadingMessage('');
    onClose();
  }, [onClose]);

  // Nettoyage automatique des messages de succès
  useEffect(() => {
    if (shareSuccess) {
      const timer = setTimeout(() => {
        setShareSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shareSuccess]);

  // Effet pour fermer modal avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        cleanupAndClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, cleanupAndClose]);

  const handleDownloadClick = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Génération du PDF en cours...');
      await onDownload();
      setShareSuccess('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setShareError(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePrint = async () => {
    try {
      // Utiliser le service unifié d'impression avec le style sélectionné
      await UnifiedPrintService.printInvoice(invoice);
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  // Système d'affichage d'erreur moderne
  const ErrorMessage: React.FC<{ error: string; onDismiss: () => void }> = ({ error, onDismiss }) => (
    <div className="no-print bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">Erreur</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-3 text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const SuccessMessage: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
    <div className="no-print bg-green-50 border-l-4 border-green-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-green-800">Succès</h3>
          <p className="text-sm text-green-700 mt-1">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-3 text-green-400 hover:text-green-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Aperçu PDF - Facture {invoice.invoiceNumber}</h2>
              <p className="text-sm opacity-90">
                Style: 🎨 MODERNE
              </p>
            </div>
          </div>
          <button
            onClick={cleanupAndClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages d'état */}
        <div className="px-6 pt-4">
          {shareError && <ErrorMessage error={shareError} onDismiss={() => setShareError(null)} />}
          {shareSuccess && <SuccessMessage message={shareSuccess} onDismiss={() => setShareSuccess(null)} />}
          
          {isLoading && (
            <div className="no-print bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex items-center">
                <Loader className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">En cours...</h3>
                  <p className="text-sm text-blue-700">{loadingMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="no-print px-6 py-4 bg-gray-50 border-b flex flex-wrap gap-3">
          <button
            onClick={cleanupAndClose}
            className="flex items-center space-x-2 bg-[#477A0C] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            title="Retour au formulaire principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <button
            onClick={handleDownloadClick}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Télécharger PDF</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>

        {/* Aperçu */}
        <div className="overflow-auto max-h-[60vh] bg-gray-100 p-6">
          <div className="bg-white shadow-lg rounded-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
            <InvoicePreviewModern invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
