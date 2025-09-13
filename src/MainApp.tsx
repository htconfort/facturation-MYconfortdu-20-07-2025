import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import { QuickInvoiceModal } from './components/QuickInvoiceModal';
import { InvoicesSyncTab } from './components/InvoicesSyncTab';
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
import {
  saveClients,
  loadClients,
  saveDraft,
  loadDraft,
  saveClient,
  saveInvoice,
  loadInvoices,
  deleteInvoice,
} from './utils/storage';

import { PDFService } from './services/pdfService';
import { N8nWebhookService } from './services/n8nWebhookService';

function MainApp() {
  const navigate = useNavigate();
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
    clientAddressLine2: '',
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
    depositPaymentMethod: '', // Ajout pour compatibilité wizard/N8N
    montantRestant: 0,

    // Livraison
    deliveryMethod: '',
    deliveryAddress: '', // Ajout pour compatibilité wizard/N8N
    deliveryNotes: '',

    // Signature
    signature: '',
    isSigned: false,
    signatureDate: undefined, // Ajout pour compatibilité wizard/N8N

    // Notes et conseiller
    invoiceNotes: '',
    advisorName: '',
    termsAccepted: false,

    // Chèques à venir
    nombreChequesAVenir: 0,

    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showClientsList, setShowClientsList] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showQuickInvoice, setShowQuickInvoice] = useState(false);
  const [showSyncTab, setShowSyncTab] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showPDFGuide, setShowPDFGuide] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [showPayloadDebug, setShowPayloadDebug] = useState(false);
  const [showDebugCenter, setShowDebugCenter] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  // FORMAT FIGÉ: Premium uniquement - formats classique et moderne supprimés pour éviter les conflits
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType,
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
          email: invoice.clientEmail,
        };

        // 🧹 Nettoyer les données client avant la sauvegarde
        const cleanedClient = sanitizeClientData(client);
        saveClient(cleanedClient);
        setClients(loadClients());
      }
      showToast('Brouillon enregistré', 'success');
    } catch (error) {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleSaveInvoice = () => {
    try {
      if (
        !invoice.clientName ||
        !invoice.clientEmail ||
        invoice.products.length === 0
      ) {
        showToast(
          'Veuillez compléter les informations client et ajouter au moins un produit',
          'error'
        );
        return;
      }

      saveInvoice(invoice);
      setInvoices(loadInvoices());
      showToast(
        `Facture ${invoice.invoiceNumber} enregistrée avec succès`,
        'success'
      );
    } catch (error) {
      showToast("Erreur lors de l'enregistrement de la facture", 'error');
    }
  };

  // 🚀 HANDLERS POUR FACTURE RAPIDE
  const handleQuickInvoiceSave = (quickInvoice: Invoice) => {
    try {
      console.log('💫 Sauvegarde facture rapide:', quickInvoice);
      
      // Sauvegarder la facture
      saveInvoice(quickInvoice);
      
      // Sauvegarder le client s'il n'existe pas
      const existingClient = clients.find(c => 
        c.name.toLowerCase() === quickInvoice.clientName.toLowerCase() &&
        c.email === quickInvoice.clientEmail
      );
      
      if (!existingClient && quickInvoice.clientName) {
        const newClient: Client = {
          id: Date.now().toString(),
          name: quickInvoice.clientName,
          email: quickInvoice.clientEmail,
          phone: quickInvoice.clientPhone,
          address: '',
          addressLine2: '',
          postalCode: '',
          city: '',
          housingType: '',
          doorCode: '',
          siret: '',
          createdAt: new Date().toISOString(),
        };
        
        saveClient(newClient);
        setClients(loadClients());
      }
      
      // Mettre à jour la liste des factures
      setInvoices(loadInvoices());
      
      showToast(
        `✅ Facture rapide ${quickInvoice.invoiceNumber} créée avec succès !`,
        'success'
      );
      
    } catch (error) {
      console.error('❌ Erreur facture rapide:', error);
      showToast("Erreur lors de la création de la facture rapide", 'error');
      throw error;
    }
  };

  const handleQuickInvoiceEmail = async (quickInvoice: Invoice) => {
    try {
      if (!quickInvoice.clientEmail) {
        throw new Error('Email client manquant');
      }
      
      console.log('📧 Envoi email facture rapide:', quickInvoice.invoiceNumber);
      showToast("📤 Préparation de l'envoi de la facture rapide...", 'success');

      // Nettoyage des données pour la facture rapide
      const cleanedQuickInvoice = {
        ...quickInvoice,
        clientName: sanitizeClientData({ name: quickInvoice.clientName }).name,
        clientAddress: sanitizeClientData({ address: quickInvoice.clientAddress })
          .address,
        clientAddressLine2: sanitizeClientData({
          addressLine2: quickInvoice.clientAddressLine2,
        }).addressLine2,
        clientCity: sanitizeClientData({ city: quickInvoice.clientCity }).city,
        clientEmail: sanitizeClientData({ email: quickInvoice.clientEmail }).email,
        clientPhone: sanitizeClientData({ phone: quickInvoice.clientPhone }).phone,
      };

      console.log('📋 Facture rapide nettoyée:', cleanedQuickInvoice);

      // Générer le PDF pour la facture rapide
      const pdfBlob = await PDFService.generateInvoicePDF(cleanedQuickInvoice);

      // Convertir en base64
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

      // Envoyer via N8N avec le même service que les factures normales
      const result = await N8nWebhookService.sendInvoiceToN8n(
        cleanedQuickInvoice,
        pdfBase64
      );

      if (result.success) {
        showToast(
          `✅ Facture rapide envoyée par email à ${quickInvoice.clientEmail}`,
          'success'
        );
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('❌ Erreur envoi email facture rapide:', error);
      showToast("Erreur lors de l'envoi de l'email", 'error');
      throw error;
    }
  };

  // 🧹 FONCTION DE NETTOYAGE ET VALIDATION DES DONNÉES CLIENT
  const sanitizeClientData = (clientData: any) => {
    console.log('🧹 NETTOYAGE DES DONNÉES CLIENT:', clientData);

    // Fonction pour nettoyer les chaînes de caractères
    const cleanString = (str: string): string => {
      if (typeof str !== 'string') return '';

      return str
        .replace(/[\\"]*/g, '') // Supprimer les caractères d'échappement et guillemets
        .replace(/\s+/g, ' ') // Remplacer plusieurs espaces par un seul
        .trim(); // Supprimer les espaces en début/fin
    };

    // Nettoyer toutes les propriétés string
    const cleanedData = {
      ...clientData,
      name: cleanString(clientData.name || ''),
      address: cleanString(clientData.address || ''),
      addressLine2: cleanString(clientData.addressLine2 || ''),
      postalCode: cleanString(clientData.postalCode || ''),
      city: cleanString(clientData.city || ''),
      phone: cleanString(clientData.phone || ''),
      email: cleanString(clientData.email || ''),
      housingType: cleanString(clientData.housingType || ''),
      doorCode: cleanString(clientData.doorCode || ''),
      siret: cleanString(clientData.siret || ''),
    };

    // Validation email basique
    if (cleanedData.email && !cleanedData.email.includes('@')) {
      console.warn('⚠️ Email invalide détecté:', cleanedData.email);
    }

    // Vérifier qu'aucun champ ne contient de données d'un autre champ
    const suspiciousPatterns = ['@', 'rue', 'avenue', 'boulevard'];
    if (
      cleanedData.name &&
      suspiciousPatterns.some(pattern =>
        cleanedData.name.toLowerCase().includes(pattern)
      )
    ) {
      console.warn(
        '⚠️ Le nom contient des données suspectes:',
        cleanedData.name
      );
      // Ne pas écraser automatiquement, juste alerter
    }

    console.log('✅ DONNÉES NETTOYÉES:', cleanedData);
    return cleanedData;
  };

  // 🔒 VALIDATION OBLIGATOIRE RENFORCÉE AVEC DATE ET NETTOYAGE
  const validateMandatoryFields = (): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Validation date (OBLIGATOIRE)
    if (!invoice.invoiceDate || invoice.invoiceDate.trim() === '') {
      errors.push('Date de la facture obligatoire');
    }

    // Validation lieu d'événement (OBLIGATOIRE)
    if (!invoice.eventLocation || invoice.eventLocation.trim() === '') {
      errors.push("Lieu de l'événement obligatoire");
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
    if (
      invoice.clientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.clientEmail)
    ) {
      errors.push("Format d'email invalide");
    }

    // Validation produits
    if (invoice.products.length === 0) {
      errors.push('Au moins un produit obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // 🟢 Helper universel pour générer le PDF Blob avec le service unifié
  const generatePDFBlobFromPreview = async () => {
    console.log('🚀 DÉBUT GÉNÉRATION PDF AVEC SERVICE UNIFIÉ');

    try {
      // Utiliser le nouveau service PDF unifié
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);

      const sizeKB = Math.round(pdfBlob.size / 1024);

      console.log('🎉 PDF généré avec service unifié - Analyse:', {
        taille: sizeKB + 'KB',
        pages: '2 pages (Facture + CGV)',
        source: 'PDFService unifié (jsPDF + autotable)',
        format: 'A4 professionnel',
        contientLogo: true,
        contientCGV: true,
      });

      return pdfBlob;
    } catch (error: any) {
      console.error('❌ Erreur lors de la génération PDF:', error);
      throw new Error(
        `Erreur génération PDF: ${error?.message || 'Erreur inconnue'}`
      );
    }
  };

  // 🟢 Handler pour télécharger le PDF en utilisant generatePDFBlobFromPreview (même PDF que webhook)
  const handleDownloadPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(
        `Impossible de télécharger le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`,
        'error'
      );
      return;
    }

    handleSave();
    handleSaveInvoice();
    showToast(
      'Génération et téléchargement du PDF MYCONFORT en cours...',
      'success'
    );

    try {
      console.log(
        '🔍 TÉLÉCHARGEMENT PDF - Utilisation du même PDF que webhook (HTML-based)'
      );

      // Utiliser la même fonction que pour le webhook
      const pdfBlob = await generatePDFBlobFromPreview();

      if (!pdfBlob) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoice.invoiceNumber}.pdf`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL
      URL.revokeObjectURL(url);

      const sizeKB = Math.round(pdfBlob.size / 1024);
      console.log('✅ PDF téléchargé avec succès:', {
        fileName: `facture-${invoice.invoiceNumber}.pdf`,
        sizeKB: sizeKB,
        source: 'generatePDFBlobFromPreview (HTML-based)',
        contientSignature: !!invoice.signature,
      });

      showToast(
        `PDF MYCONFORT téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''} - ${sizeKB}KB`,
        'success'
      );
    } catch (error: any) {
      console.error('❌ PDF download error:', error);
      showToast(
        `Erreur lors du téléchargement du PDF: ${error?.message || 'Erreur inconnue'}`,
        'error'
      );
    }
  };

  // 🟢 Handler pour envoyer par N8N/Drive/Email
  const handleSendPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(
        `Impossible d'envoyer le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`,
        'error'
      );
      return;
    }
    handleSave();
    handleSaveInvoice();
    showToast("📤 Préparation de l'envoi du PDF MYCONFORT...", 'success');

    try {
      console.log('🔍 DIAGNOSTIC AVANT GÉNÉRATION PDF');

      // 🧹 NETTOYAGE DES DONNÉES AVANT ENVOI
      const cleanedInvoice = {
        ...invoice,
        clientName: sanitizeClientData({ name: invoice.clientName }).name,
        clientAddress: sanitizeClientData({ address: invoice.clientAddress })
          .address,
        clientAddressLine2: sanitizeClientData({
          addressLine2: invoice.clientAddressLine2,
        }).addressLine2,
        clientCity: sanitizeClientData({ city: invoice.clientCity }).city,
        clientEmail: sanitizeClientData({ email: invoice.clientEmail }).email,
        clientPhone: sanitizeClientData({ phone: invoice.clientPhone }).phone,
      };

      console.log('📋 Invoice data NETTOYÉ:', cleanedInvoice);
      console.log('📋 Invoice data structure check:', {
        invoiceNumber: cleanedInvoice.invoiceNumber,
        clientName: cleanedInvoice.clientName,
        clientEmail: cleanedInvoice.clientEmail,
        clientPhone: cleanedInvoice.clientPhone,
        clientAddress: cleanedInvoice.clientAddress,
        clientCity: cleanedInvoice.clientCity,
        clientPostalCode: cleanedInvoice.clientPostalCode,
        productsCount: cleanedInvoice.products.length,
        paymentMethod: cleanedInvoice.paymentMethod,
        montantAcompte: cleanedInvoice.montantAcompte,
        advisorName: cleanedInvoice.advisorName,
        eventLocation: cleanedInvoice.eventLocation,
        taxRate: cleanedInvoice.taxRate,
        termsAccepted: cleanedInvoice.termsAccepted,
        totalCalculated: cleanedInvoice.products.reduce(
          (sum, p) => sum + p.quantity * p.priceTTC,
          0
        ),
      });

      const pdfBlob = await generatePDFBlobFromPreview();
      if (!pdfBlob) {
        console.error('❌ PDF Blob generation failed');
        showToast('❌ Erreur lors de la génération du PDF', 'error');
        return;
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () =>
          reject(new Error('Erreur conversion PDF en Base64'));
        reader.readAsDataURL(pdfBlob);
      });

      const pdfSizeKB = Math.round(pdfBlob.size / 1024);

      // ✅ Validation préalable avant envoi N8N
      if (
        !cleanedInvoice.clientEmail ||
        cleanedInvoice.clientEmail.trim() === ''
      ) {
        showToast("❌ Email client obligatoire pour l'envoi N8N", 'error');
        return;
      }

      if (!cleanedInvoice.clientEmail.includes('@')) {
        showToast("❌ Format d'email client invalide", 'error');
        return;
      }

      console.log('📄 PDF généré:', {
        sizeKB: pdfSizeKB,
        base64Length: base64Data.length,
        base64Preview: base64Data.substring(0, 50) + '...',
      });

      showToast('🔐 Validation et envoi vers N8N...', 'success');

      // Utiliser la méthode standard sendInvoiceToN8n (même que le wizard)
      const result = await N8nWebhookService.sendInvoiceToN8n(
        cleanedInvoice,
        base64Data
      );

      if (result.success) {
        showToast(result.message, 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur envoi PDF via N8N:', error);
      showToast(`❌ Erreur d'envoi N8N: ${errorMessage}`, 'error');
    }
  };

  // 🖨️ IMPRESSION A4 COMPLÈTE - 2 pages (facture + conditions générales)
  const handlePrintWifi = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(
        `Impossible d'imprimer. Champs obligatoires manquants: ${validation.errors.join(', ')}`,
        'error'
      );
      return;
    }

    handleSave();
    handleSaveInvoice();
    showToast(
      '📄 Préparation impression A4 professionnelle (2 pages)...',
      'success'
    );

    try {
      // ✅ CIBLE LA FACTURE COMPLÈTE (2 pages : facture + conditions générales)
      const element = document.getElementById('invoice-preview-section');
      if (!element) {
        showToast('❌ Aperçu de facture non trouvé', 'error');
        return;
      }

      console.log('📄 IMPRESSION: Facture complète (2 pages), dimensions:', {
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      // Sauvegarder le contenu original
      const originalContent = document.body.innerHTML;
      const originalTitle = document.title;

      // CSS d'impression A4 PROFESSIONNEL - Vos règles exactes
      const printStyles = `
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          
          .page {
            width: 210mm;      /* Largeur A4 exacte */
            min-height: 297mm; /* Hauteur A4 exacte */
            padding: 15mm;     /* Marges uniformes */
            page-break-after: always;
            box-sizing: border-box;
            margin: 0 auto;
            background: white;
          }
          
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white; 
            font-size: 12px; 
            line-height: 1.4; 
            color: #2D3748;
          }
          
          /* Respecter les sauts de page originaux */
          div[style*="pageBreakBefore: 'always'"] {
            page-break-before: always !important;
          }
          
          /* Conserver les couleurs et styles originaux */
          .bg-\\[\\#477A0C\\] { background: #477A0C !important; }
          .bg-\\[\\#F2EFE2\\] { background: #F2EFE2 !important; }
          .bg-white { background: white !important; }
          .text-white { color: white !important; }
          
          /* Tailles de texte optimisées pour A4 */
          h1 { font-size: 18px !important; margin: 8px 0 !important; }
          h2 { font-size: 16px !important; margin: 6px 0 !important; }
          h3 { font-size: 14px !important; margin: 4px 0 !important; }
          p { margin: 4px 0 !important; font-size: 11px !important; }
          
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 8px 0 !important; 
            font-size: 10px !important; 
          }
          table th, table td { 
            border: 1px solid #ddd; 
            padding: 6px !important; 
            line-height: 1.3; 
          }
          table th { 
            background: #f5f5f5 !important; 
            font-weight: bold; 
          }
          
          /* Ajustements de mise en page pour A4 */
          .p-4, .p-6 { padding: 8px !important; }
          .mb-4, .mb-6 { margin-bottom: 8px !important; }
          .rounded-xl, .rounded-lg { border-radius: 8px !important; }
        </style>
      `;

      // Remplacer le contenu avec wrapper A4 professionnel
      document.title =
        'Impression Facture MyConfort - A4 Professionnel (2 pages)';

      // Wrapper le contenu dans une structure A4 professionnelle
      const wrappedContent = `
        <div class="page">
          ${element.outerHTML}
        </div>
      `;

      document.body.innerHTML = printStyles + wrappedContent;

      // Lancer l'impression
      setTimeout(() => {
        window.print();

        // Restaurer après impression
        setTimeout(() => {
          document.body.innerHTML = originalContent;
          document.title = originalTitle;
          showToast(
            '✅ Impression A4 terminée (format professionnel)',
            'success'
          );
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Erreur impression:', error);
      showToast("❌ Erreur lors de l'impression", 'error');
    }
  };

  // handlePrint function REMOVED as it relied on PDFService and html2pdf.js for printing from DOM
  // const handlePrint = () => {
  //   PDFService.printInvoice(previewRef, invoice.invoiceNumber);
  // };

  // Handlers pour les toasts (N8N remplace EmailJS)
  const showSuccessToast = (message: string) => {
    handleSaveInvoice();
    showToast(message, 'success');
  };

  const showErrorToast = (message: string) => {
    showToast(message, 'error');
  };

  const handleLoadClient = (client: Client) => {
    console.log('🔍 CHARGEMENT CLIENT - Données brutes:', client);

    // Nettoyer les données client avant de les utiliser
    const cleanedClient = sanitizeClientData(client);

    setInvoice(prev => ({
      ...prev,
      clientName: cleanedClient.name,
      clientAddress: cleanedClient.address,
      clientAddressLine2: cleanedClient.addressLine2,
      clientPostalCode: cleanedClient.postalCode,
      clientCity: cleanedClient.city,
      clientPhone: cleanedClient.phone,
      clientEmail: cleanedClient.email,
    }));
    setShowClientsList(false);
    showToast('Client chargé avec succès (données nettoyées)', 'success');
  };

  const handleDeleteClient = (index: number) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
    showToast('Client supprimé', 'success');
  };

  const handleLoadInvoice = (loadedInvoice: Invoice) => {
    setInvoice(loadedInvoice);
    showToast(
      `Facture ${loadedInvoice.invoiceNumber} chargée avec succès`,
      'success'
    );
  };

  const handleDeleteInvoice = (index: number) => {
    const invoiceToDelete = invoices[index];
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.invoiceNumber);
      setInvoices(loadInvoices());
      showToast(
        `Facture ${invoiceToDelete.invoiceNumber} supprimée`,
        'success'
      );
    }
  };

  const handleSaveSignature = (signature: string) => {
    setInvoice(prev => ({ ...prev, signature }));
    showToast('Signature enregistrée - Facture prête pour envoi !', 'success');
  };

  // 🆕 CRÉER UNE NOUVELLE FACTURE
  const handleNewInvoice = () => {
    if (
      window.confirm(
        'Créer une nouvelle facture ?\n\nLes données actuelles seront perdues si elles ne sont pas sauvegardées.'
      )
    ) {
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
        clientAddressLine2: '',
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

        // Chèques à venir
        nombreChequesAVenir: 0,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showToast('✅ Nouvelle facture créée avec succès !', 'success');
    }
  };

  // 🔒 VÉRIFICATION DES CHAMPS OBLIGATOIRES POUR L'AFFICHAGE
  const validation = validateMandatoryFields();

  return (
    <div
      className="min-h-screen font-['Inter'] text-gray-100"
      style={{ backgroundColor: '#14281D' }}
    >
      <Header
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowQuickInvoice={() => setShowQuickInvoice(true)}
        onShowSync={() => setShowSyncTab(true)}
        onShowGoogleDrive={handleSendPDF}
        onShowDebug={() => setShowDebugCenter(true)}
        onGoToIpad={() => navigate('/ipad?step=facture')}
      />

      <main className='container mx-auto px-4 py-6' id='invoice-content'>
        {/* En-tête MYCONFORT avec dégradé basé sur #477A0C */}
        <div
          className='text-white rounded-xl shadow-xl p-6 mb-6'
          style={{
            background:
              'linear-gradient(135deg, #477A0C 0%, #5A8F0F 25%, #3A6A0A 50%, #6BA015 75%, #477A0C 100%)',
          }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='bg-white/20 p-3 rounded-full'>
                <span className='text-2xl'>🌸</span>
              </div>
              <div>
                <h1 className='text-3xl font-bold'>MYCONFORT</h1>
                <p className='text-green-100'>
                  Facturation professionnelle avec signature électronique
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-blue-100'>Statut de la facture</div>
              <div className='flex items-center space-x-2 mt-1'>
                {validation.isValid ? (
                  <div className='bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1'>
                    <span>✅</span>
                    <span>COMPLÈTE</span>
                  </div>
                ) : (
                  <div className='bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>INCOMPLÈTE</span>
                  </div>
                )}
                {invoice.signature && (
                  <div className='bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1'>
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                )}
                <button
                  onClick={handleNewInvoice}
                  className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all hover:scale-105 shadow-md'
                  title='Créer une nouvelle facture'
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
          <div className='mb-6'>
            <DebugCenter
              invoice={invoice}
              onSuccess={showSuccessToast}
              onError={showErrorToast}
            />
          </div>
        )}

        <InvoiceHeader
          invoice={invoice}
          onUpdate={updates => setInvoice(prev => ({ ...prev, ...updates }))}
        />

        <div id='client-section'>
          <ClientSection
            client={{
              name: invoice.clientName,
              address: invoice.clientAddress,
              addressLine2: invoice.clientAddressLine2,
              postalCode: invoice.clientPostalCode,
              city: invoice.clientCity,
              phone: invoice.clientPhone,
              email: invoice.clientEmail,
              housingType: invoice.clientHousingType,
              doorCode: invoice.clientDoorCode,
              siret: invoice.clientSiret || '',
            }}
            onUpdate={client =>
              setInvoice(prev => ({
                ...prev,
                clientName: client.name,
                clientAddress: client.address,
                clientAddressLine2: client.addressLine2,
                clientPostalCode: client.postalCode,
                clientCity: client.city,
                clientPhone: client.phone,
                clientEmail: client.email,
                clientHousingType: client.housingType || '',
                clientDoorCode: client.doorCode || '',
                clientSiret: client.siret || '',
              }))
            }
          />
        </div>

        <div id='products-section'>
          <ProductSection
            products={invoice.products}
            onUpdate={products => setInvoice(prev => ({ ...prev, products }))}
            taxRate={invoice.taxRate}
            invoiceNotes={invoice.invoiceNotes}
            onNotesChange={invoiceNotes =>
              setInvoice(prev => ({ ...prev, invoiceNotes }))
            }
            acompteAmount={invoice.montantAcompte}
            onAcompteChange={amount =>
              setInvoice(prev => ({
                ...prev,
                montantAcompte: amount,
              }))
            }
            paymentMethod={invoice.paymentMethod}
            onPaymentMethodChange={method =>
              setInvoice(prev => ({
                ...prev,
                paymentMethod: method,
              }))
            }
            advisorName={invoice.advisorName}
            onAdvisorNameChange={name =>
              setInvoice(prev => ({ ...prev, advisorName: name }))
            }
            termsAccepted={invoice.termsAccepted}
            onTermsAcceptedChange={accepted =>
              setInvoice(prev => ({ ...prev, termsAccepted: accepted }))
            }
            signature={invoice.signature}
            onShowSignaturePad={() => setShowSignaturePad(true)}
            nombreChequesAVenir={invoice.nombreChequesAVenir || 0}
            onNombreChequesAVenirChange={nombre =>
              setInvoice(prev => ({ ...prev, nombreChequesAVenir: nombre }))
            }
          />
        </div>

        {/* Delivery Section - UNIFORMISÉ */}
        <div
          id='delivery-section'
          className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]'
        >
          <h2 className='text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center'>
            <span className='bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold'>
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>

          <div className='bg-[#F2EFE2] rounded-lg p-6 mt-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-black mb-1 font-bold'>
                  Mode de livraison
                </label>
                <select
                  value={invoice.deliveryMethod}
                  onChange={e =>
                    setInvoice(prev => ({
                      ...prev,
                      deliveryMethod: e.target.value,
                    }))
                  }
                  className='w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold'
                >
                  <option value=''>Sélectionner</option>
                  <option value='Colissimo 48 heures'>
                    Colissimo 48 heures
                  </option>
                  <option value='Livraison par transporteur'>
                    Livraison par transporteur
                  </option>
                  <option value='Retrait en magasin'>Retrait en magasin</option>
                </select>
              </div>

              <div>
                <label className='block text-black mb-1 font-bold'>
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.deliveryNotes}
                  onChange={e =>
                    setInvoice(prev => ({
                      ...prev,
                      deliveryNotes: e.target.value,
                    }))
                  }
                  className='w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold h-20'
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>

            <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-black italic font-semibold'>
              <p>
                📦 Livraison estimée sous 48 heures. Les délais sont donnés à
                titre indicatif et ne sont pas contractuels.
              </p>
            </div>
          </div>
        </div>

        {/* Communication & Actions Section - EmailSender removed - Use N8N via wizard */}

        {/* Section Aperçu de la facture - Style Netlify intégré */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-[#477A0C] flex items-center'>
              <span className='mr-3'>📄</span>
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
              {showInvoicePreview
                ? "Masquer l'aperçu 🌸"
                : "Afficher l'aperçu 🌸"}
            </button>
          </div>

          {showInvoicePreview && (
            <div className='border-2 border-[#477A0C] rounded-lg p-4 bg-gray-50'>
              {/* FORMAT FIGÉ: Premium uniquement - Aperçu de la facture au format premium */}
              <div
                id='invoice-preview-section'
                className='bg-white rounded-lg overflow-hidden'
              >
                <div className='transition-all duration-500'>
                  <InvoicePreviewModern invoice={invoice} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - UNIFORMISÉ AVEC NOUVELLE FACTURE CLIQUABLE */}
        <div className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]'>
          <h2 className='text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center'>
            <span className='bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold'>
              ACTIONS PRINCIPALES
            </span>
          </h2>

          <div className='bg-[#F2EFE2] rounded-lg p-6'>
            <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
              <div>
                <label className='block text-black mb-1 font-bold'>
                  Email du destinataire
                </label>
                <input
                  value={invoice.clientEmail}
                  onChange={e =>
                    setInvoice(prev => ({
                      ...prev,
                      clientEmail: e.target.value,
                    }))
                  }
                  type='email'
                  className='w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold'
                  placeholder='client@email.com'
                />
              </div>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => setShowPDFPreview(true)}
                  className='px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white'
                  title="Ouvrir l'aperçu de la facture et télécharger le PDF"
                >
                  <span>👁️</span>
                  <span>APERÇU & PDF</span>
                </button>
                <button
                  onClick={handleSaveInvoice}
                  disabled={
                    !invoice.clientName ||
                    !invoice.clientEmail ||
                    invoice.products.length === 0
                  }
                  className={`px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 disabled:hover:scale-100 ${
                    invoice.clientName &&
                    invoice.clientEmail &&
                    invoice.products.length > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={
                    invoice.clientName &&
                    invoice.clientEmail &&
                    invoice.products.length > 0
                      ? "Enregistrer la facture dans l'onglet Factures"
                      : 'Complétez les informations client et ajoutez au moins un produit'
                  }
                >
                  <span>💾</span>
                  <span>ENREGISTRER</span>
                </button>
                <button
                  onClick={handlePrintWifi}
                  className='px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white'
                  title='Imprimer la facture complète (2 pages : facture + conditions générales)'
                >
                  <span>🖨️</span>
                  <span>IMPRIMER (2 PAGES)</span>
                </button>
                <button
                  onClick={handleSendPDF}
                  className='px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white'
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

      <InvoicesSyncTab
        isOpen={showSyncTab}
        onClose={() => setShowSyncTab(false)}
        invoices={invoices}
        onInvoicesUpdated={setInvoices}
      />

      <ProductsListModal
        isOpen={showProductsList}
        onClose={() => setShowProductsList(false)}
      />

      <QuickInvoiceModal
        isOpen={showQuickInvoice}
        onClose={() => setShowQuickInvoice(false)}
        onSave={handleQuickInvoiceSave}
        onSendEmail={handleQuickInvoiceEmail}
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
        onSuccess={showSuccessToast}
        onError={showErrorToast}
      />

      {/* N8N email integration via wizard only - EmailJS removed */}

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={showSuccessToast}
        onError={showErrorToast}
      />

      {/* Keep the original PayloadDebugModal for compatibility */}
      <PayloadDebugModal
        isOpen={showPayloadDebug}
        onClose={() => setShowPayloadDebug(false)}
        invoice={invoice}
        onSuccess={showSuccessToast}
        onError={showErrorToast}
      />

      {/* Add toggle for Debug Center */}
      {showDebugCenter && (
        <div className='fixed top-4 right-4 z-50'>
          <button
            onClick={() => setShowDebugCenter(false)}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium'
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

      {/* Version indicator */}
      <div className='fixed bottom-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded'>
        v2025.07.27-15h00
      </div>
    </div>
  );
}

export default MainApp;
