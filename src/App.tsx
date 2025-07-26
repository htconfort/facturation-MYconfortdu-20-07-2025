import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import PDFPreviewModal from './components/PDFPreviewModal';
import { PDFGuideModal } from './components/PDFGuideModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { PayloadDebugModal } from './components/PayloadDebugModal';
import { DebugCenter } from './components/DebugCenter';
import { SignaturePad } from './components/SignaturePad';
import { InvoicePreviewModern } from './components/InvoicePreviewModern';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient, saveInvoice, loadInvoices, deleteInvoice } from './utils/storage';
import { AdvancedPDFService } from './services/advancedPdfService'; // Keep this import
import { N8nBlueprintWebhookService } from './services/n8nBlueprintWebhookService';
// import { PDFService } from './services/pdfService'; // REMOVED: No longer needed, using AdvancedPDFService

function App() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    taxRate: 20,
    
    // Client - Structure plate
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientPostalCode: '',
    clientCity: '',
    clientHousingType: '',
    clientDoorCode: '',
    clientSiret: '',
    
    // Produits et montants
    products: [],
    montantHT: 0,
    montantTTC: 0,
    montantTVA: 0,
    montantRemise: 0,
    
    // Paiement
    paymentMethod: '',
    montantAcompte: 0,
    montantRestant: 0,
    
    // Livraison
    deliveryMethod: '',
    deliveryNotes: '',
    
    // Signature
    signature: '',
    isSigned: false,
    
    // Notes et conseiller
    invoiceNotes: '',
    advisorName: '',
    termsAccepted: false,
    
    // Chèques à venir
    nombreChequesAVenir: 0,
    
    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showClientsList, setShowClientsList] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showPDFGuide, setShowPDFGuide] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [showPayloadDebug, setShowPayloadDebug] = useState(false);
  const [showDebugCenter, setShowDebugCenter] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  useEffect(() => {
    setClients(loadClients());
    
    const loadedInvoices = loadInvoices();
    
    // Si aucune facture n'existe, créer des données de test
    if (loadedInvoices.length === 0) {
      const testInvoices: Invoice[] = [
        {
          invoiceNumber: 'FAC-2025-001',
          invoiceDate: '2025-07-20',
          eventLocation: 'Paris 17ème',
          clientName: 'Jean Dupont',
          clientEmail: 'jean.dupont@email.com',
          clientPhone: '0123456789',
          clientAddress: '123 Rue de la Paix',
          clientPostalCode: '75017',
          clientCity: 'Paris',
          clientHousingType: 'Appartement',
          clientDoorCode: 'A1234',
          clientSiret: '',
          products: [
            {
              name: 'Installation climatisation',
              quantity: 1,
              priceHT: 800,
              priceTTC: 960,
              discount: 0,
              discountType: 'fixed' as const,
              totalHT: 800,
              totalTTC: 960,
              category: 'Installation'
            }
          ],
          montantHT: 800,
          montantTTC: 960,
          montantTVA: 160,
          montantRemise: 0,
          taxRate: 20,
          paymentMethod: 'Carte bancaire',
          montantAcompte: 200,
          montantRestant: 760,
          deliveryMethod: 'Sur site',
          deliveryNotes: 'Installation le matin',
          signature: '',
          isSigned: false,
          invoiceNotes: 'Installation standard',
          advisorName: 'Marc Martin',
          termsAccepted: true,
          createdAt: '2025-07-20T10:00:00.000Z',
          updatedAt: '2025-07-20T10:00:00.000Z'
        },
        {
          invoiceNumber: 'FAC-2025-002',
          invoiceDate: '2025-07-22',
          eventLocation: 'Neuilly-sur-Seine',
          clientName: 'Marie Leblanc',
          clientEmail: 'marie.leblanc@email.com',
          clientPhone: '0987654321',
          clientAddress: '456 Avenue Charles de Gaulle',
          clientPostalCode: '92200',
          clientCity: 'Neuilly-sur-Seine',
          clientHousingType: 'Maison',
          clientDoorCode: '',
          clientSiret: '',
          products: [
            {
              name: 'Maintenance climatisation',
              quantity: 2,
              priceHT: 150,
              priceTTC: 180,
              discount: 10,
              discountType: 'percent' as const,
              totalHT: 270,
              totalTTC: 324,
              category: 'Maintenance'
            }
          ],
          montantHT: 270,
          montantTTC: 324,
          montantTVA: 54,
          montantRemise: 36,
          taxRate: 20,
          paymentMethod: 'Virement',
          montantAcompte: 0,
          montantRestant: 324,
          deliveryMethod: 'Sur site',
          deliveryNotes: 'Maintenance annuelle',
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          isSigned: true,
          signatureDate: '2025-07-22T14:30:00.000Z',
          invoiceNotes: 'Client satisfait',
          advisorName: 'Sophie Dubois',
          termsAccepted: true,
          createdAt: '2025-07-22T09:00:00.000Z',
          updatedAt: '2025-07-22T14:30:00.000Z'
        }
      ];
      
      // Sauvegarder les factures de test
      testInvoices.forEach(invoice => {
        saveInvoice(invoice);
      });
      
      setInvoices(testInvoices);
      showToast('Données de test initialisées - 2 factures créées', 'success');
    } else {
      setInvoices(loadedInvoices);
    }
    
    const draft = loadDraft();
    if (draft) {
      setInvoice(draft);
      showToast('Brouillon chargé', 'success');
    }

    // Auto-save every 60 seconds
    const interval = setInterval(() => {
      handleSave();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSave = () => {
    try {
      saveDraft(invoice);
      if (invoice.clientName && invoice.clientEmail) {
        const client: Client = {
          name: invoice.clientName,
          address: invoice.clientAddress,
          postalCode: invoice.clientPostalCode,
          city: invoice.clientCity,
          phone: invoice.clientPhone,
          email: invoice.clientEmail
        };
        saveClient(client);
        setClients(loadClients());
      }
      showToast('Brouillon enregistré', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleSaveInvoice = () => {
    try {
      if (!invoice.clientName || !invoice.clientEmail || invoice.products.length === 0) {
        showToast('Veuillez compléter les informations client et ajouter au moins un produit', 'error');
        return;
      }

      saveInvoice(invoice);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoice.invoiceNumber} enregistrée avec succès`, 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement de la facture', 'error');
    }
  };

  // 🔒 VALIDATION OBLIGATOIRE RENFORCÉE AVEC DATE
  const validateMandatoryFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation date (OBLIGATOIRE)
    if (!invoice.invoiceDate || invoice.invoiceDate.trim() === '') {
      errors.push('Date de la facture obligatoire');
    }

    // Validation lieu d'événement (OBLIGATOIRE)
    if (!invoice.eventLocation || invoice.eventLocation.trim() === '') {
      errors.push('Lieu de l\'événement obligatoire');
    }

    // Validation informations client (TOUS OBLIGATOIRES)
    if (!invoice.clientName || invoice.clientName.trim() === '') {
      errors.push('Nom complet du client obligatoire');
    }

    if (!invoice.clientAddress || invoice.clientAddress.trim() === '') {
      errors.push('Adresse du client obligatoire');
    }

    if (!invoice.clientPostalCode || invoice.clientPostalCode.trim() === '') {
      errors.push('Code postal du client obligatoire');
    }

    if (!invoice.clientCity || invoice.clientCity.trim() === '') {
      errors.push('Ville du client obligatoire');
    }

    if (!invoice.clientPhone || invoice.clientPhone.trim() === '') {
      errors.push('Téléphone du client obligatoire');
    }

    if (!invoice.clientEmail || invoice.clientEmail.trim() === '') {
      errors.push('Email du client obligatoire');
    }

    // Validation email format
    if (invoice.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.clientEmail)) {
      errors.push('Format d\'email invalide');
    }

    // Validation produits
    if (invoice.products.length === 0) {
      errors.push('Au moins un produit obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 🟢 Helper universel pour générer le PDF Blob en utilisant AdvancedPDFService
  const generatePDFBlobFromPreview = async () => {
    // AdvancedPDFService génère le PDF à partir des données de l'objet invoice,
    // donc previewRef n'est pas directement utilisé ici pour la génération.
    // Il est conservé pour l'affichage de l'aperçu HTML.
    return await AdvancedPDFService.getPDFBlob(invoice);
  };

  // 🟢 Handler pour télécharger le PDF en utilisant AdvancedPDFService
  const handleDownloadPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible de télécharger le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    handleSave();
    handleSaveInvoice();
    showToast('Génération et téléchargement du PDF MYCONFORT en cours...', 'success');
    
    try {
      await AdvancedPDFService.downloadPDF(invoice);
      showToast(`PDF MYCONFORT téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''}`, 'success');
    } catch (error) {
      console.error('❌ PDF download error:', error);
      showToast('Erreur lors du téléchargement du PDF', 'error');
    }
  };

  // 🟢 Handler pour envoyer par N8N/Drive/Email
  const handleSendPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible d'envoyer le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleSave();
    handleSaveInvoice();
    showToast('📤 Préparation de l\'envoi du PDF MYCONFORT...', 'success');

    try {
      console.log('🔍 DIAGNOSTIC AVANT GÉNÉRATION PDF');
      console.log('📋 Invoice data:', {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        productsCount: invoice.products.length,
        paymentMethod: invoice.paymentMethod,
        totalCalculated: invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0)
      });
      
      const pdfBlob = await generatePDFBlobFromPreview();
      if (!pdfBlob) return;

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Erreur conversion PDF en Base64"));
        reader.readAsDataURL(pdfBlob);
      });

      const pdfSizeKB = Math.round(pdfBlob.size / 1024);
      
      console.log('📄 PDF généré:', {
        sizeKB: pdfSizeKB,
        base64Length: base64Data.length,
        base64Preview: base64Data.substring(0, 50) + '...'
      });
      
      showToast('🎯 Envoi vers Blueprint N8N...', 'success');
      
      // Utiliser le nouveau service Blueprint N8N
      const result = await N8nBlueprintWebhookService.sendInvoiceToN8nBlueprint(invoice, base64Data);

      if (result.success) {
        showToast(result.message, "success");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi PDF via Blueprint N8N:', error);
      showToast(`❌ Erreur d'envoi Blueprint N8N: ${error.message || 'Erreur inconnue'}`, 'error');
    }
  };

  // 🖨️ IMPRESSION CONDENSÉE A4 - Version intégrée
  const handlePrintWifi = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible d'imprimer. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    handleSave();
    handleSaveInvoice();
    showToast('📄 Préparation impression A4 condensée...', 'success');
    
    try {
      const element = document.getElementById('invoice-preview-section');
      if (!element) {
        showToast('❌ Aperçu de facture non trouvé', 'error');
        return;
      }
      
      // Sauvegarder le contenu original
      const originalContent = document.body.innerHTML;
      const originalTitle = document.title;
      
      // CSS d'impression ULTRA-CONDENSÉ
      const printStyles = `
        <style>
          @page { size: A4; margin: 8mm; }
          body { font-family: Arial; margin: 0; padding: 5px; background: white; font-size: 10px; line-height: 1.2; }
          .bg-\\[\\#F2EFE2\\] { background: #F2EFE2 !important; padding: 8px !important; border-radius: 4px; margin: 3px 0 !important; }
          .bg-white { background: white !important; padding: 8px !important; border-radius: 4px; margin: 3px 0 !important; }
          h1, .text-2xl { font-size: 16px !important; margin: 3px 0 !important; line-height: 1.1; }
          h2, .text-lg { font-size: 14px !important; margin: 2px 0 !important; line-height: 1.1; }
          p { margin: 2px 0 !important; font-size: 9px !important; line-height: 1.2; }
          .mb-4, .mb-6 { margin-bottom: 4px !important; }
          .p-4, .p-6 { padding: 4px !important; }
          table { border-collapse: collapse; width: 100%; margin: 3px 0 !important; font-size: 8px !important; }
          table th, table td { border: 1px solid #ddd; padding: 3px !important; line-height: 1.1; }
          table th { background: #f5f5f5; font-weight: bold; }
          .bg-\\[\\#F2EFE2\\]:first-child { transform: scale(0.85); transform-origin: top center; width: 117.6%; margin-left: -8.8%; }
        </style>
      `;
      
      // Remplacer le contenu
      document.title = 'Impression Facture MyConfort - A4';
      document.body.innerHTML = printStyles + element.outerHTML;
      
      // Lancer l'impression
      setTimeout(() => {
        window.print();
        
        // Restaurer après impression
        setTimeout(() => {
          document.body.innerHTML = originalContent;
          document.title = originalTitle;
          showToast('✅ Impression A4 terminée', 'success');
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Erreur impression:', error);
      showToast('❌ Erreur lors de l\'impression', 'error');
    }
  };

  // handlePrint function REMOVED as it relied on PDFService and html2pdf.js for printing from DOM
  // const handlePrint = () => {
  //   PDFService.printInvoice(previewRef, invoice.invoiceNumber);
  // };

  const handleEmailJSSuccess = (message: string) => {
    handleSaveInvoice();
    showToast(message, 'success');
  };

  const handleEmailJSError = (message: string) => {
    showToast(message, 'error');
  };

  const handleLoadClient = (client: Client) => {
    setInvoice(prev => ({ 
      ...prev, 
      clientName: client.name,
      clientAddress: client.address,
      clientPostalCode: client.postalCode,
      clientCity: client.city,
      clientPhone: client.phone,
      clientEmail: client.email
    }));
    setShowClientsList(false);
    showToast('Client chargé avec succès', 'success');
  };

  const handleDeleteClient = (index: number) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
    showToast('Client supprimé', 'success');
  };

  const handleLoadInvoice = (loadedInvoice: Invoice) => {
    setInvoice(loadedInvoice);
    showToast(`Facture ${loadedInvoice.invoiceNumber} chargée avec succès`, 'success');
  };

  const handleDeleteInvoice = (index: number) => {
    const invoiceToDelete = invoices[index];
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.invoiceNumber);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoiceToDelete.invoiceNumber} supprimée`, 'success');
    }
  };

  const handleSaveSignature = (signature: string) => {
    setInvoice(prev => ({ ...prev, signature }));
    showToast('Signature enregistrée - Facture prête pour envoi !', 'success');
  };

  // 🆕 CRÉER UNE NOUVELLE FACTURE
  const handleNewInvoice = () => {
    if (window.confirm('Créer une nouvelle facture ?\n\nLes données actuelles seront perdues si elles ne sont pas sauvegardées.')) {
      setInvoice({
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        eventLocation: '',
        taxRate: 20,
        
        // Client - Structure plate
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientPostalCode: '',
        clientCity: '',
        clientHousingType: '',
        clientDoorCode: '',
        clientSiret: '',
        
        // Produits et montants
        products: [],
        montantHT: 0,
        montantTTC: 0,
        montantTVA: 0,
        montantRemise: 0,
        
        // Paiement
        paymentMethod: '',
        montantAcompte: 0,
        montantRestant: 0,
        
        // Livraison
        deliveryMethod: '',
        deliveryNotes: '',
        
        // Signature
        signature: '',
        isSigned: false,
        signatureDate: '',
        
        // Métadonnées
        invoiceNotes: '',
        advisorName: '',
        termsAccepted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showToast('✅ Nouvelle facture créée avec succès !', 'success');
    }
  };

  // 🔒 VÉRIFICATION DES CHAMPS OBLIGATOIRES POUR L'AFFICHAGE
  const validation = validateMandatoryFields();

  return (
    <div className="min-h-screen font-['Inter'] text-gray-100" style={{ backgroundColor: '#14281D' }}>
      <Header
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowGoogleDrive={handleSendPDF}
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.clientName}
        canSendToDrive={validation.isValid}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête MYCONFORT avec dégradé basé sur #477A0C */}
        <div
          className="text-white rounded-xl shadow-xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, #477A0C 0%, #5A8F0F 25%, #3A6A0A 50%, #6BA015 75%, #477A0C 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">MYCONFORT</h1>
                <p className="text-green-100">Facturation professionnelle avec signature électronique</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Statut de la facture</div>
              <div className="flex items-center space-x-2 mt-1">
                {validation.isValid ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>✅</span>
                    <span>COMPLÈTE</span>
                  </div>
                ) : (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>INCOMPLÈTE</span>
                  </div>
                )}
                {invoice.signature && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                )}
                <button
                  onClick={handleNewInvoice}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all hover:scale-105 shadow-md"
                  title="Créer une nouvelle facture"
                >
                  <span>📝</span>
                  <span>Nouvelle facture</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Center Section */}
        {showDebugCenter && (
          <div className="mb-6">
            <DebugCenter
              invoice={invoice}
              onSuccess={handleEmailJSSuccess}
              onError={handleEmailJSError}
            />
          </div>
        )}

        <InvoiceHeader
          invoice={invoice}
          onUpdate={(updates) => setInvoice(prev => ({ ...prev, ...updates }))}
        />

        <div id="client-section">
          <ClientSection
            client={{
              name: invoice.clientName,
              address: invoice.clientAddress,
              postalCode: invoice.clientPostalCode,
              city: invoice.clientCity,
              phone: invoice.clientPhone,
              email: invoice.clientEmail,
              housingType: invoice.clientHousingType,
              doorCode: invoice.clientDoorCode,
              siret: invoice.clientSiret || '',
            }}
            onUpdate={(client) => setInvoice(prev => ({ 
              ...prev, 
              clientName: client.name,
              clientAddress: client.address,
              clientPostalCode: client.postalCode,
              clientCity: client.city,
              clientPhone: client.phone,
              clientEmail: client.email,
              clientHousingType: client.housingType || '',
              clientDoorCode: client.doorCode || '',
              clientSiret: client.siret || ''
            }))}
          />
        </div>

        <div id="products-section">
          <ProductSection
            products={invoice.products}
            onUpdate={(products) => setInvoice(prev => ({ ...prev, products }))}
            taxRate={invoice.taxRate}
            invoiceNotes={invoice.invoiceNotes}
            onNotesChange={(invoiceNotes) => setInvoice(prev => ({ ...prev, invoiceNotes }))}
            acompteAmount={invoice.montantAcompte}
            onAcompteChange={(amount) => setInvoice(prev => ({
              ...prev,
              montantAcompte: amount
            }))}
            paymentMethod={invoice.paymentMethod}
            onPaymentMethodChange={(method) => setInvoice(prev => ({
              ...prev,
              paymentMethod: method
            }))}
            advisorName={invoice.advisorName}
            onAdvisorNameChange={(name) => setInvoice(prev => ({ ...prev, advisorName: name }))}
            termsAccepted={invoice.termsAccepted}
            onTermsAcceptedChange={(accepted) => setInvoice(prev => ({ ...prev, termsAccepted: accepted }))}
            signature={invoice.signature}
            onShowSignaturePad={() => setShowSignaturePad(true)}
            nombreChequesAVenir={invoice.nombreChequesAVenir || 0}
            onNombreChequesAVenirChange={(nombre) => setInvoice(prev => ({ ...prev, nombreChequesAVenir: nombre }))}
          />
        </div>

        {/* Delivery Section - UNIFORMISÉ */}
        <div id="delivery-section" className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>

          <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black mb-1 font-bold">
                  Mode de livraison
                </label>
                <select
                  value={invoice.deliveryMethod}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    deliveryMethod: e.target.value
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                >
                  <option value="">Sélectionner</option>
                  <option value="Colissimo 48 heures">Colissimo 48 heures</option>
                  <option value="Livraison par transporteur">Livraison par transporteur</option>
                  <option value="Retrait en magasin">Retrait en magasin</option>
                </select>
              </div>

              <div>
                <label className="block text-black mb-1 font-bold">
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.deliveryNotes}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    deliveryNotes: e.target.value
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold h-20"
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-black italic font-semibold">
              <p>📦 Livraison estimée sous 48 heures. Les délais sont donnés à titre indicatif et ne sont pas contractuels.</p>
            </div>
          </div>
        </div>

        {/* Communication & Actions Section - EmailSender removed */}
        {/* <EmailSender
          invoice={invoice}
          onSuccess={handleEmailJSSuccess}
          onError={handleEmailJSError}
          onShowConfig={() => setShowGoogleDriveConfig(true)}
          onShowEmailJSConfig={() => setShowEmailJSConfig(true)}
        /> */}



        {/* Aperçu de la facture - AVEC CHOIX DE 3 STYLES */}
        {showInvoicePreview && (
          <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F2EFE2] flex items-center justify-center">
                <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
                  APERÇU DE LA FACTURE
                </span>
              </h2>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowInvoicePreview(!showInvoicePreview)}
                  className="text-[#F2EFE2] hover:text-white underline text-sm font-semibold"
                >
                  {showInvoicePreview ? 'Masquer' : 'Afficher'} l'aperçu
                </button>
              </div>
            </div>

            {/* Aperçu avec choix de style + indicateur de style actuel */}
            <div id="invoice-preview-section" className="bg-transparent">
              <div key="modern" className="transition-all duration-500">
                <InvoicePreviewModern invoice={invoice} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - UNIFORMISÉ AVEC NOUVELLE FACTURE CLIQUABLE */}
        <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              ACTIONS PRINCIPALES
            </span>
          </h2>

          <div className="bg-[#F2EFE2] rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <label className="block text-black mb-1 font-bold">Email du destinataire</label>
                <input
                  value={invoice.clientEmail}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    clientEmail: e.target.value
                  }))}
                  type="email"
                  className="w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                  placeholder="client@email.com"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                <button
                  onClick={handleSaveInvoice}
                  disabled={!invoice.clientName || !invoice.clientEmail || invoice.products.length === 0}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 font-medium text-sm sm:text-base shadow-md transform transition-all hover:scale-105 disabled:hover:scale-100 ${
                    invoice.clientName && invoice.clientEmail && invoice.products.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={invoice.clientName && invoice.clientEmail && invoice.products.length > 0
                    ? "Enregistrer la facture dans l'onglet Factures"
                    : "Complétez les informations client et ajoutez au moins un produit"}
                >
                  <span>💾</span>
                  <span className="hidden sm:inline">ENREGISTRER FACTURE</span>
                  <span className="sm:hidden">SAUVER</span>
                </button>
                <button
                  onClick={handlePrintWifi}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 font-medium text-sm sm:text-base shadow-md transform transition-all hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white"
                  title="Imprimer la facture directement"
                >
                  <span>🖨️</span>
                  <span className="hidden sm:inline">IMPRIMER</span>
                  <span className="sm:hidden">PRINT</span>
                </button>
                <button
                  onClick={handleSendPDF}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 font-medium text-sm sm:text-base shadow-md transform transition-all hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <span>📧</span>
                  <span className="hidden sm:inline">ENVOYER PAR EMAIL/DRIVE</span>
                  <span className="sm:hidden">EMAIL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onLoadClient={handleLoadClient}
        onDeleteClient={handleDeleteClient}
      />

      <InvoicesListModal
        isOpen={showInvoicesList}
        onClose={() => setShowInvoicesList(false)}
        invoices={invoices}
        onLoadInvoice={handleLoadInvoice}
        onDeleteInvoice={handleDeleteInvoice}
      />

      <ProductsListModal
        isOpen={showProductsList}
        onClose={() => setShowProductsList(false)}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        onDownload={handleDownloadPDF}
      />

      <PDFGuideModal
        isOpen={showPDFGuide}
        onClose={() => setShowPDFGuide(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      {/* EmailJSConfigurationModal removed */}
      {/* <EmailJSConfigurationModal
        isOpen={showEmailJSConfig}
        onClose={() => setShowEmailJSConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      /> */}

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      {/* Keep the original PayloadDebugModal for compatibility */}
      <PayloadDebugModal
        isOpen={showPayloadDebug}
        onClose={() => setShowPayloadDebug(false)}
        invoice={invoice}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      {/* Add toggle for Debug Center */}
      {showDebugCenter && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDebugCenter(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Fermer Debug
          </button>
        </div>
      )}

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
