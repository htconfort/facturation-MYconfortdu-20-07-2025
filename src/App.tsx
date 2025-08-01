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
import { calculateInvoiceTotals } from './utils/invoice-calculations';
import { AdvancedPDFService } from './services/advancedPdfService'; // Keep this import
import { N8nWebhookService } from './services/n8nWebhookService';
import { CompactPrintService } from './services/compactPrintService'; // Service d'impression compacte
import { generateNewInvoiceNumber } from './hooks/useInvoiceNumber'; // 🔢 Import du hook
// import { PDFService } from './services/pdfService'; // REMOVED: No longer needed, using AdvancedPDFService

function App() {
  // ✅ CORRECTION: Utiliser useState avec une fonction pour éviter les re-renders multiples
  const [invoice, setInvoice] = useState<Invoice>(() => ({
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
    
    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })); // ✅ CORRECTION: Fermeture correcte du useState avec fonction

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

  // État pour les notifications d'email
  const [emailStatus, setEmailStatus] = useState({
    show: false,
    message: '',
    type: 'info' as ToastType
  });

  useEffect(() => {
    setClients(loadClients());
    setInvoices(loadInvoices());
    
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

  // Effect to automatically recalculate invoice totals when key fields change
  useEffect(() => {
    // Only recalculate if we have products and essential data
    if (invoice.products.length > 0) {
      const calculatedTotals = calculateInvoiceTotals(
        invoice.products,
        invoice.taxRate || 20,
        invoice.montantAcompte || 0,
        invoice.paymentMethod || ''
      );
      
      // Update the invoice state with calculated values if they differ
      setInvoice(prev => {
        const needsUpdate = 
          prev.montantHT !== calculatedTotals.montantHT ||
          prev.montantTTC !== calculatedTotals.montantTTC ||
          prev.montantTVA !== calculatedTotals.montantTVA ||
          prev.montantRestant !== calculatedTotals.montantRestant;
          
        if (needsUpdate) {
          return {
            ...prev,
            montantHT: calculatedTotals.montantHT,
            montantTTC: calculatedTotals.montantTTC,
            montantTVA: calculatedTotals.montantTVA,
            montantRemise: calculatedTotals.montantRemise,
            montantAcompte: calculatedTotals.montantAcompte,
            montantRestant: calculatedTotals.montantRestant
          };
        }
        return prev;
      });
    }
  }, [invoice.products, invoice.taxRate, invoice.montantAcompte, invoice.paymentMethod]);

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

      // Debug: vérifier les données sauvegardées
      console.log('💾 Sauvegarde facture:', {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        clientAddress: invoice.clientAddress,
        products: invoice.products?.length || 0
      });

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
      console.log('📋 Invoice data COMPLET:', invoice);
      console.log('📋 Invoice data structure check:', {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        clientAddress: invoice.clientAddress,
        clientCity: invoice.clientCity,
        clientPostalCode: invoice.clientPostalCode,
        productsCount: invoice.products.length,
        paymentMethod: invoice.paymentMethod,
        montantAcompte: invoice.montantAcompte,
        advisorName: invoice.advisorName,
        eventLocation: invoice.eventLocation,
        taxRate: invoice.taxRate,
        termsAccepted: invoice.termsAccepted,
        totalCalculated: invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0)
      });
      
      // 🚨 DEBUG CRITIQUE : VÉRIFICATION DES PRODUITS AVANT PDF
      console.log('🛒 PRODUITS RÉELS DE LA FACTURE AVANT PDF:', {
        products: invoice.products,
        items: invoice.products, // Alias pour compatibilité
        productsCount: invoice.products.length,
        totalCalculated: invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0),
        STRUCTURE_COMPLETE: invoice
      });
      
      // Vérifier si les produits ont les bonnes propriétés
      invoice.products.forEach((product, index) => {
        console.log(`🏷️ Produit ${index + 1}:`, {
          name: product.name,
          quantity: product.quantity,
          priceTTC: product.priceTTC,
          priceHT: product.priceTTC / (1 + (invoice.taxRate || 20) / 100),
          total: product.quantity * product.priceTTC
        });
      });
      
      // 🔧 DEBUG ULTIME : Structure envoyée au service PDF
      console.log('📤 STRUCTURE EXACTE ENVOYÉE AU SERVICE PDF:', {
        invoiceObject: invoice,
        productsProperty: invoice.products,
        hasProducts: !!invoice.products,
        hasItems: !!(invoice as any).items,
        hasProduits: !!(invoice as any).produits,
        JSON_STRINGIFY: JSON.stringify(invoice, null, 2)
      });
      
      const pdfBlob = await generatePDFBlobFromPreview();
      if (!pdfBlob) {
        console.error('❌ PDF Blob generation failed');
        showToast('❌ Erreur lors de la génération du PDF', 'error');
        return;
      }

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
      
      showToast('🔐 Validation et envoi vers N8N...', 'success');
      
      // Utiliser le service N8N pour l'envoi
      const result = await N8nWebhookService.sendInvoiceToN8n(invoice, base64Data);

      if (result.success) {
        showToast(result.message, "success");
        
        // Marquer l'email comme envoyé dans la facture actuelle
        const updatedInvoice = {
          ...invoice,
          emailSent: true,
          emailSentDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setInvoice(updatedInvoice);
        
        // Mettre à jour la facture dans la liste des factures sauvegardées
        const savedInvoices = loadInvoices();
        const invoiceIndex = savedInvoices.findIndex(inv => 
          inv.invoiceNumber === invoice.invoiceNumber && 
          inv.invoiceDate === invoice.invoiceDate
        );
        
        if (invoiceIndex !== -1) {
          savedInvoices[invoiceIndex] = updatedInvoice;
          localStorage.setItem('myconfort_invoices', JSON.stringify(savedInvoices));
          setInvoices(savedInvoices);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi PDF via N8N:', error);
      showToast(`❌ Erreur d'envoi N8N: ${error.message || 'Erreur inconnue'}`, 'error');
    }
  };

  // 📧 Handler pour vérifier le statut d'envoi d'email - AUTOMATIQUE (MASQUÉ)
  // const handleCheckEmailStatus = async () => {
  //   setEmailStatus({
  //     show: true,
  //     message: '🔍 Checking email delivery status...',
  //     type: 'info'
  //   });

  //   try {
  //     const recentInvoices = invoices.filter(inv => 
  //       inv.emailSent && 
  //       inv.emailSentDate && 
  //       new Date().getTime() - new Date(inv.emailSentDate).getTime() < 24 * 60 * 60 * 1000
  //     );

  //     if (recentInvoices.length === 0) {
  //       setEmailStatus({
  //         show: true,
  //         message: '📭 No recent email deliveries found in the last 24 hours.',
  //         type: 'info'
  //       });
  //     } else {
  //       await new Promise(resolve => setTimeout(resolve, 1500));
        
  //       setEmailStatus({
  //         show: true,
  //         message: `✅ ${recentInvoices.length} email(s) sent successfully in the last 24 hours.`,
  //         type: 'success'
  //       });
  //     }
  //   } catch (error) {
  //     setEmailStatus({
  //       show: true,
  //       message: '❌ Error checking email status.',
  //       type: 'error'
  //     });
  //   }

  //   setTimeout(() => {
  //     setEmailStatus({ show: false, message: '', type: 'info' });
  //   }, 4000);
  // };

  // 🖨️ IMPRESSION COMPACTE A4 - Utilise le CompactPrintService
  const handlePrintWifi = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible d'imprimer. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    // Sauvegarder la facture avant impression
    handleSave();
    handleSaveInvoice();
    
    showToast('📄 Préparation impression compacte A4...', 'success');
    
    try {
      // Utiliser le service d'impression compacte
      await CompactPrintService.printInvoice(invoice);
      showToast('✅ Impression lancée avec succès', 'success');
    } catch (error) {
      console.error('Erreur impression:', error);
      showToast('❌ Erreur lors de l\'impression', 'error');
    }
  };

  // handlePrint function REMOVED as it relied on PDFService and html2pdf.js for printing from DOM
  // const handlePrint = () => {
  //   PDFService.printInvoice(previewRef, invoice.invoiceNumber);
  // };



  // Handlers temporaires pour compatibilité (plus d'EmailJS)
  const handleSuccess = (message: string) => {
    handleSaveInvoice();
    showToast(message, 'success');
  };

  const handleError = (message: string) => {
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
    // Debug: vérifier les données client chargées
    console.log('🔍 Chargement facture:', {
      clientName: loadedInvoice.clientName,
      clientEmail: loadedInvoice.clientEmail,
      clientPhone: loadedInvoice.clientPhone,
      clientAddress: loadedInvoice.clientAddress,
      products: loadedInvoice.products?.length || 0
    });
    
    // S'assurer que toutes les propriétés sont définies avec des valeurs par défaut
    const completeInvoice: Invoice = {
      // Copier toutes les données de la facture chargée
      ...loadedInvoice,
      
      // S'assurer que les champs client existent avec des valeurs par défaut
      clientName: loadedInvoice.clientName || '',
      clientEmail: loadedInvoice.clientEmail || '',
      clientPhone: loadedInvoice.clientPhone || '',
      clientAddress: loadedInvoice.clientAddress || '',
      clientPostalCode: loadedInvoice.clientPostalCode || '',
      clientCity: loadedInvoice.clientCity || '',
      clientHousingType: loadedInvoice.clientHousingType || '',
      clientDoorCode: loadedInvoice.clientDoorCode || '',
      clientSiret: loadedInvoice.clientSiret || '',
      
      // S'assurer que les produits existent
      products: loadedInvoice.products || [],
      
      // S'assurer que les montants existent
      montantHT: loadedInvoice.montantHT || 0,
      montantTTC: loadedInvoice.montantTTC || 0,
      montantTVA: loadedInvoice.montantTVA || 0,
      montantRemise: loadedInvoice.montantRemise || 0,
      montantAcompte: loadedInvoice.montantAcompte || 0,
      montantRestant: loadedInvoice.montantRestant || 0,
      
      // Autres champs avec valeurs par défaut
      taxRate: loadedInvoice.taxRate || 20,
      paymentMethod: loadedInvoice.paymentMethod || '',
      deliveryMethod: loadedInvoice.deliveryMethod || '',
      deliveryNotes: loadedInvoice.deliveryNotes || '',
      invoiceNotes: loadedInvoice.invoiceNotes || '',
      advisorName: loadedInvoice.advisorName || '',
      signature: loadedInvoice.signature || '',
      isSigned: loadedInvoice.isSigned || false,
      termsAccepted: loadedInvoice.termsAccepted || false,
      nombreChequesAVenir: loadedInvoice.nombreChequesAVenir || 0
    };
    
    setInvoice(completeInvoice);
    showToast(`Facture ${loadedInvoice.invoiceNumber} chargée avec succès - Client: ${completeInvoice.clientName || 'Non défini'}`, 'success');
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
        invoiceNumber: generateNewInvoiceNumber(), // ✅ CORRECTION: Utilisation explicite pour nouvelle facture
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
        onShowDebug={() => setShowDebugCenter(true)}
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
              onSuccess={handleSuccess}
              onError={handleError}
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
                
                {/* Affichage dynamique des produits par type de livraison */}
                {invoice.products.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {invoice.products.filter(p => !p.isPickupOnSite).length > 0 && (
                      <div className="mb-2">
                        <div className="font-bold text-red-700 mb-1">🚛 Produits à livrer :</div>
                        <div className="text-sm text-red-600">
                          {invoice.products
                            .filter(p => !p.isPickupOnSite)
                            .map(p => `${p.name} (x${p.quantity})`)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {invoice.products.filter(p => p.isPickupOnSite).length > 0 && (
                      <div>
                        <div className="font-bold text-green-700 mb-1">📦 Produits emportés :</div>
                        <div className="text-sm text-green-600">
                          {invoice.products
                            .filter(p => p.isPickupOnSite)
                            .map(p => `${p.name} (x${p.quantity})`)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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

        {/* Section Aperçu de la facture - Style Netlify intégré */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#477A0C] flex items-center">
              <span className="mr-3">📄</span>
              APERÇU DE LA FACTURE
            </h2>
            <button
              onClick={() => setShowInvoicePreview(!showInvoicePreview)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                showInvoicePreview 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-[#477A0C] hover:bg-green-700 text-white'
              }`}
            >
              {showInvoicePreview ? 'Masquer l\'aperçu 🌸' : 'Afficher l\'aperçu 🌸'}
            </button>
          </div>

          {showInvoicePreview && (
            <div className="border-2 border-[#477A0C] rounded-lg p-4 bg-gray-50">
              {/* Aperçu de la facture - Mode Premium uniquement */}
              <div id="invoice-preview-section" className="bg-white rounded-lg overflow-hidden">
                <div className="transition-all duration-500">
                  <InvoicePreviewModern invoice={invoice} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - UNIFORMISÉ AVEC NOUVELLE FACTURE CLIQUABLE */}
        <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              ACTIONS PRINCIPALES
            </span>
          </h2>

          <div className="bg-[#F2EFE2] rounded-lg p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <div>
                  <label className="block text-black mb-1 font-bold text-center">Email du destinataire</label>
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
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={handleSaveInvoice}
                  disabled={!invoice.clientName || !invoice.clientEmail || invoice.products.length === 0}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 font-bold shadow-lg transform transition-all hover:scale-105 disabled:hover:scale-100 text-sm ${
                    invoice.clientName && invoice.clientEmail && invoice.products.length > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={invoice.clientName && invoice.clientEmail && invoice.products.length > 0
                    ? "Enregistrer la facture dans l'onglet Factures"
                    : "Complétez les informations client et ajoutez au moins un produit"}
                >
                  <span>💾</span>
                  <span>ENREGISTRER</span>
                </button>
                <button
                  onClick={handlePrintWifi}
                  className="px-3 py-2 rounded-lg flex items-center space-x-2 font-bold shadow-lg transform transition-all hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white text-sm"
                  title="Imprimer la facture directement"
                >
                  <span>🖨️</span>
                  <span>IMPRIMER</span>
                </button>
                <button
                  onClick={handleSendPDF}
                  className="px-3 py-2 rounded-lg flex items-center space-x-2 font-bold shadow-lg transform transition-all hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  <span>📧</span>
                  <span>ENVOYER PAR EMAIL/DRIVE</span>
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
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {/* EmailJSConfigurationModal removed */}
      {/* <EmailJSConfigurationModal
        isOpen={showEmailJSConfig}
        onClose={() => setShowEmailJSConfig(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      /> */}

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {/* Keep the original PayloadDebugModal for compatibility */}
      <PayloadDebugModal
        isOpen={showPayloadDebug}
        onClose={() => setShowPayloadDebug(false)}
        invoice={invoice}
        onSuccess={handleSuccess}
        onError={handleError}
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

      {/* Toast pour le statut d'email */}
      <Toast
        message={emailStatus.message}
        type={emailStatus.type}
        show={emailStatus.show}
        onClose={() => setEmailStatus({ show: false, message: '', type: 'info' })}
      />
      
      {/* Version indicator */}
      <div className="fixed bottom-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
        v2025.07.27-15h00
      </div>
    </div>
  );
}

export default App;
