import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Printer, FileText, Share2, Loader, UploadCloud as CloudUpload, AlertCircle } from 'lucide-react';
import { InvoicePreview } from './InvoicePreview';
import { Invoice } from '../types';
import html2canvas from 'html2canvas';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { GoogleDriveService } from '../services/googleDriveService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { UnifiedPrintService, InvoiceStyle } from '../services/unifiedPrintService';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => Promise<void>;
  invoiceStyle?: InvoiceStyle;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload,
  invoiceStyle = 'modern'
}) => {
  // État unifié pour les opérations de loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // États d'erreur séparés
  const [shareError, setShareError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // États pour les captures
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  
  // Nettoyage des états et de la mémoire lors de la fermeture ou du changement
  const cleanupAndClose = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
    setShareError(null);
    setUploadError(null);
    
    // Nettoyage de la mémoire pour les URLs d'objets
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl(null);
    }
    
    onClose();
  }, [capturedImageUrl, onClose]);
  
  // Nettoyage automatique lors du changement de facture ou fermeture
  useEffect(() => {
    if (!isOpen) {
      return () => {
        if (capturedImageUrl) {
          URL.revokeObjectURL(capturedImageUrl);
        }
      };
    }
  }, [isOpen, capturedImageUrl]);
  
  // Gestion sécurisée du téléchargement
  const handleDownloadClick = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Génération du PDF...');
      await onDownload();
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      setShareError(error instanceof Error ? error.message : 'Erreur lors du téléchargement du PDF');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePrint = async () => {
    try {
      // Utiliser le service unifié d'impression avec le style sélectionné
      await UnifiedPrintService.printInvoice(invoice, invoiceStyle);
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };
      
      // Créer le contenu HTML pour l'impression avec la facture sur la première page et les conditions générales sur la deuxième
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 0; 
              background: white; 
              color: #333;
              font-size: 12px;
              line-height: 1.4;
            }
            
            /* Page 1 - Facture */
            .invoice-page {
              padding: 20mm;
              min-height: 100vh;
              page-break-after: always;
            }
            
            .header { 
              background: linear-gradient(135deg, #477A0C, #5A8F0F); 
              color: white; 
              padding: 20px; 
              text-align: center; 
              margin-bottom: 30px;
              border-radius: 8px;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 20px;
              font-weight: normal;
            }
            
            .invoice-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            
            .invoice-details h3,
            .client-info h3 {
              color: #477A0C;
              font-size: 16px;
              margin: 0 0 15px 0;
              border-bottom: 2px solid #477A0C;
              padding-bottom: 5px;
            }
            
            .client-info { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px;
              border-left: 4px solid #477A0C;
            }
            
            .products-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .products-table th, .products-table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            
            .products-table th { 
              background: #477A0C; 
              color: white; 
              font-weight: bold;
              text-align: center;
            }
            
            .products-table td:nth-child(2),
            .products-table td:nth-child(3),
            .products-table td:nth-child(4) {
              text-align: center;
            }
            
            .products-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .total-section { 
              text-align: right; 
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #477A0C;
            }
            
            .total { 
              font-size: 20px; 
              font-weight: bold; 
              color: #477A0C; 
              margin-bottom: 10px;
            }
            
            .signature-info {
              margin: 30px 0;
              padding: 15px;
              background: #e8f5e8;
              border-radius: 8px;
              border-left: 4px solid #28a745;
              text-align: center;
            }
            
            .company-footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 11px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            
            /* Page 2 - Conditions Générales */
            .conditions-page {
              padding: 20mm;
              min-height: 100vh;
            }
            
            .conditions-header h1 {
              text-align: center;
              color: #477A0C;
              margin-bottom: 30px;
              font-size: 22px;
              border-bottom: 3px solid #477A0C;
              padding-bottom: 10px;
            }
            
            .conditions-content {
              font-size: 10px;
              line-height: 1.4;
              columns: 2;
              column-gap: 20px;
            }
            
            .condition-section {
              margin-bottom: 12px;
              break-inside: avoid;
            }
            
            .condition-section h3 {
              color: #477A0C;
              font-size: 11px;
              margin-bottom: 5px;
              font-weight: bold;
            }
            
            .condition-section p {
              margin: 0;
              text-align: justify;
            }
            
            .conditions-footer {
              text-align: center;
              margin-top: 30px;
              font-size: 9px;
              font-style: italic;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0;
              }
              .invoice-page {
                padding: 15mm;
                page-break-after: always;
              }
              .conditions-page {
                padding: 15mm;
              }
              .no-print { 
                display: none !important; 
              }
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: FACTURE -->
          <div class="invoice-page">
            <div class="header">
              <h1>🌸 MYCONFORT</h1>
              <h2>Facture ${invoice.invoiceNumber}</h2>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-details">
                <h3>Informations Facture</h3>
                <p><strong>Numéro:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                ${invoice.eventLocation ? `<p><strong>Lieu d'événement:</strong> ${invoice.eventLocation}</p>` : ''}
                ${invoice.advisorName ? `<p><strong>Conseiller:</strong> ${invoice.advisorName}</p>` : ''}
                ${invoice.clientHousingType ? `<p><strong>Type de logement:</strong> ${invoice.clientHousingType}</p>` : ''}
              </div>
              
              <div class="client-info">
                <h3>Informations Client</h3>
                <p><strong>${invoice.clientName}</strong></p>
                <p>${invoice.clientAddress}</p>
                <p>${invoice.clientPostalCode} ${invoice.clientCity}</p>
                <p><strong>Téléphone:</strong> ${invoice.clientPhone}</p>
                <p><strong>Email:</strong> ${invoice.clientEmail}</p>
              </div>
            </div>
            
            <table class="products-table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Quantité</th>
                  <th>Prix unitaire TTC</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.products.map(product => {
                  const productTotal = calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
                  return `
                    <tr>
                      <td><strong>${product.name}</strong></td>
                      <td>${product.quantity}</td>
                      <td>${formatCurrency(product.priceTTC)}</td>
                      <td><strong>${formatCurrency(productTotal)}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total">
                TOTAL TTC: ${formatCurrency(total)}
              </div>
              ${invoice.montantAcompte > 0 ? `
                <div style="font-size: 14px; margin-top: 10px;">
                  <div>Acompte versé: ${formatCurrency(invoice.montantAcompte)}</div>
                  <div style="color: #477A0C; font-weight: bold; font-size: 16px; margin-top: 5px;">
                    Reste à payer: ${formatCurrency(total - invoice.montantAcompte)}
                  </div>
                </div>
              ` : ''}
            </div>
            
            ${invoice.signature ? `
              <div class="signature-info">
                <p><strong>✅ Facture signée électroniquement</strong></p>
                <p style="font-size: 11px; margin-top: 5px;">Cette facture a été signée numériquement par le client</p>
              </div>
            ` : ''}
            
            <div class="company-footer">
              <p><strong>MYCONFORT</strong></p>
              <p>88 Avenue des Ternes, 75017 Paris</p>
              <p>Téléphone: 04 68 50 41 45 • Email: myconfort66@gmail.com</p>
              <p>SIRET: 824 313 530 00027</p>
            </div>
          </div>
          
          <!-- PAGE 2: CONDITIONS GÉNÉRALES -->
          <div class="conditions-page">
            <div class="conditions-header">
              <h1>CONDITIONS GÉNÉRALES DE VENTE</h1>
            </div>
            
            <div class="conditions-content">
              <div class="condition-section">
                <h3>Art. 1 - Livraison</h3>
                <p>Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 2 - Délais de Livraison</h3>
                <p>Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 3 - Risques de Transport</h3>
                <p>Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 4 - Acceptation des Conditions</h3>
                <p>Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 5 - Réclamations</h3>
                <p>Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 6 - Retours</h3>
                <p>Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n'implique aucune reconnaissance.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 7 - Tailles des Matelas</h3>
                <p>Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 8 - Odeur des Matériaux</h3>
                <p>Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 9 - Règlements et Remises</h3>
                <p>Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 10 - Paiement</h3>
                <p>Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 11 - Pénalités de Retard</h3>
                <p>En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 12 - Exigibilité en Cas de Non-Paiement</h3>
                <p>Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 13 - Livraison Incomplète ou Non-Conforme</h3>
                <p>En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 14 - Litiges</h3>
                <p>Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
              </div>

              <div class="condition-section">
                <h3>Art. 15 - Horaires de Livraison</h3>
                <p>Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.</p>
              </div>
            </div>

            <div class="conditions-footer">
              Les présentes Conditions générales ont été mises à jour le 23 août 2024
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
      
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
          className="ml-4 text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Partage d'aperçu par email amélioré
  const handleSharePreviewViaEmail = async () => {
    if (!invoice.clientEmail) {
      setShareError('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    setIsLoading(true);
    setShareError(null);

    try {
      setLoadingMessage('📸 Capture de l\'aperçu...');
      
      const element = document.getElementById('pdf-preview-content');
      if (!element) {
        throw new Error('Élément aperçu non trouvé');
      }

      setLoadingMessage('🖼️ Conversion en image...');
      
      // Options optimisées pour réduire la taille et améliorer la qualité
      const canvas = await html2canvas(element, {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Convertir en JPEG avec qualité optimisée
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      setLoadingMessage('🚀 Préparation pour l\'envoi...');
      
      // Nettoyer l'ancienne URL si elle existe
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
      
      // Créer un lien de téléchargement pour l'image
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `apercu-facture-${invoice.invoiceNumber}.jpg`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCapturedImageUrl(imageDataUrl);
      
      setLoadingMessage('✅ Aperçu capturé !');
      
      // Ouvrir le client mail par défaut
      const mailtoLink = `mailto:${invoice.clientEmail}?subject=Aperçu facture MYCONFORT n°${invoice.invoiceNumber}&body=Bonjour ${invoice.clientName},%0D%0A%0D%0AVeuillez trouver ci-joint l'aperçu de votre facture n°${invoice.invoiceNumber}.%0D%0A%0D%0ACordialement,%0D%0A${invoice.advisorName || 'MYCONFORT'}`;
      
      window.open(mailtoLink, '_blank');
      
      // Message de succès moderne (remplace alert)
      setTimeout(() => {
        setLoadingMessage('✅ Aperçu capturé et client mail ouvert');
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      setShareError(error instanceof Error ? error.message : 'Erreur lors de la capture de l\'aperçu');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);
    }
  };

  // Upload to Google Drive amélioré
  const handleUploadToGoogleDrive = async () => {
    setIsLoading(true);
    setUploadError(null);
    setLoadingMessage('🔄 Génération du PDF...');

    try {
      // Generate PDF blob
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      setLoadingMessage('📤 Envoi vers Google Drive...');
      
      // Upload to Google Drive
      const success = await GoogleDriveService.uploadPDFToGoogleDrive(invoice, pdfBlob);
      
      if (success) {
        setLoadingMessage('✅ PDF envoyé avec succès !');
        setTimeout(() => {
          setLoadingMessage('');
        }, 2000);
      } else {
        throw new Error('Échec de l\'envoi vers Google Drive');
      }
    } catch (error) {
      console.error('❌ Erreur upload Google Drive:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'envoi vers Google Drive');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header - no-print pour masquer à l'impression */}
        <div className="no-print flex justify-between items-center p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">Aperçu de la facture {invoice.invoiceNumber}</h3>
            {invoice.signature && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <span>🔒</span>
                <span>SIGNÉE</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Bouton upload Google Drive */}
            <button
              onClick={handleUploadToGoogleDrive}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title="Envoyer cette facture vers Google Drive"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  <span>Google Drive</span>
                </>
              )}
            </button>
            
            {/* Bouton partage aperçu */}
            <button
              onClick={handleSharePreviewViaEmail}
              disabled={isLoading || !invoice.clientEmail}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={!invoice.clientEmail ? "Veuillez renseigner l'email du client" : "Capturer cet aperçu et l'envoyer par email"}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Capture en cours...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Partager Aperçu</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>
            <button
              onClick={cleanupAndClose}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {shareError && (
          <ErrorMessage 
            error={shareError} 
            onDismiss={() => setShareError(null)} 
          />
        )}
        
        {uploadError && (
          <ErrorMessage 
            error={uploadError} 
            onDismiss={() => setUploadError(null)} 
          />
        )}

        {/* Indicateur de chargement unifié */}
        {isLoading && loadingMessage && (
          <div className="no-print bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Opération en cours...</div>
                <div className="text-sm text-blue-700">{loadingMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour le partage */}
        <div className="no-print bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900">Partage d'aperçu :</span>
            <span className="text-purple-800">
              {invoice.clientEmail 
                ? "Cliquez sur \"Partager Aperçu\" pour capturer et envoyer par email"
                : "⚠️ Email client requis pour le partage d'aperçu"
              }
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📸 Format: JPEG optimisé • 🎯 Téléchargement automatique
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 L'image sera téléchargée et votre client mail s'ouvrira automatiquement
          </div>
        </div>

        {/* Instructions pour Google Drive */}
        <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <CloudUpload className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Google Drive :</span>
            <span className="text-blue-800">
              Cliquez sur "Google Drive" pour envoyer cette facture vers votre Drive
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📁 Dossier: {GoogleDriveService.getConfig().folderId} • 🎯 Format: PDF haute qualité
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 La facture sera automatiquement envoyée vers votre Google Drive via n8n
          </div>
        </div>

        {/* Content - FORMAT UNIQUE : InvoicePreview */}
        <div className="no-print overflow-auto max-h-[calc(90vh-220px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePreview invoice={invoice} className="print-preview" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
