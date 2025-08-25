import { useState, useMemo } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import { PDFService } from '../../services/pdfService';
import { N8nWebhookService } from '../../services/n8nWebhookService';
import { saveInvoice } from '../../utils/storage';
import type { Invoice } from '../../types';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapIpad({ onNext, onPrev }: StepProps) {
  const {
    client,
    produits,
    paiement,
    livraison,
    invoiceNumber,
    invoiceDate,
    eventLocation,
    signature,
    termsAccepted,
    advisorName
  } = useInvoiceWizard();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Calculs des totaux (DOIT être défini AVANT invoice)
  const totals = useMemo(() => {
    let subtotal = 0;
    
    const details = produits.map(produit => {
      const lineTotal = calculateProductTotal(
        produit.qty || 0,
        produit.priceTTC || 0,
        produit.discount || 0,
        produit.discountType || 'fixed'
      );
      subtotal += lineTotal;
      
      return {
        ...produit,
        lineTotal
      };
    });

    const acompte = paiement?.depositAmount || 0;
    const reste = Math.max(0, subtotal - acompte);

    return {
      details,
      subtotal,
      acompte,
      reste,
      total: subtotal
    };
  }, [produits, paiement]);

  // Construction de l'objet Invoice pour les actions
  const invoice: Invoice = useMemo(() => ({
    // Informations de base
    invoiceNumber,
    invoiceDate,
    eventLocation: eventLocation || '',
    
    // Client - Structure plate pour compatibilité webhook
    clientName: client.name || '',
    clientEmail: client.email || '',
    clientPhone: client.phone || '',
    clientAddress: client.address || '',
    clientAddressLine2: client.addressLine2 || '',
    clientPostalCode: client.postalCode || '',
    clientCity: client.city || '',
    clientHousingType: client.housingType || '',
    clientDoorCode: client.doorCode || '',
    clientSiret: client.siret || '',
    
    // Produits
    products: produits.map(p => ({
      id: p.id,
      name: p.designation,
      category: p.category || '',
      quantity: p.qty,
      priceHT: p.priceTTC / 1.2, // Approximation
      priceTTC: p.priceTTC,
      discount: p.discount,
      discountType: p.discountType,
      totalHT: (p.qty * p.priceTTC / 1.2) - (p.discountType === 'fixed' ? p.discount : (p.qty * p.priceTTC / 1.2) * p.discount / 100),
      totalTTC: (p.qty * p.priceTTC) - (p.discountType === 'fixed' ? p.discount : (p.qty * p.priceTTC) * p.discount / 100),
      isPickupOnSite: p.isPickupOnSite
    })),
    
    // Montants (calculés et stockés)
    montantHT: totals.subtotal / 1.2, // Approximation en attendant calcul précis
    montantTTC: totals.subtotal,
    montantTVA: totals.subtotal - (totals.subtotal / 1.2),
    montantRemise: 0, // À calculer
    taxRate: 20,
    
    // Paiement
    paymentMethod: paiement?.method || '',
    montantAcompte: paiement?.depositAmount || 0,
    depositPaymentMethod: paiement?.depositPaymentMethod || '',
    montantRestant: totals.reste,
    
    // Livraison
    deliveryMethod: livraison?.deliveryMethod || '',
    deliveryAddress: livraison?.deliveryAddress || '',
    deliveryNotes: livraison?.deliveryNotes || '',
    
    // Signature
    signature: signature?.dataUrl || '',
    isSigned: !!signature?.dataUrl,
    signatureDate: signature?.timestamp || '',
    
    // Notes et conseiller
    invoiceNotes: '',
    advisorName: advisorName || '',
    termsAccepted: termsAccepted || false,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), [invoiceNumber, invoiceDate, eventLocation, client, produits, paiement, livraison, signature, termsAccepted, advisorName, totals]);

  // Action 1: Enregistrer la facture
  const handleSaveInvoice = async () => {
    try {
      setIsLoading(true);
      saveInvoice(invoice);
      setActionHistory(prev => [...prev, `Facture ${invoice.invoiceNumber} enregistrée`]);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 2: Imprimer le PDF
  const handlePrintInvoice = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);
      
      const w = window.open(url, '_blank');
      if (!w) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      setActionHistory(prev => [...prev, `PDF facture ${invoice.invoiceNumber} ouvert pour impression`]);
    } catch (error) {
      console.error('Erreur impression:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Envoyer par email
  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      await N8nWebhookService.sendInvoiceToN8n(invoice, pdfBase64);

      setActionHistory(prev => [...prev, `Facture ${invoice.invoiceNumber} envoyée par email`]);
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // États des actions
  const isInvoiceSaved = actionHistory.some(action => action.includes('enregistrée'));
  const isEmailSent = actionHistory.some(action => action.includes('envoyée par email'));
  const isPdfGenerated = actionHistory.some(action => action.includes('ouvert pour impression'));

  // Changeons aussi la couleur du background principal pour respecter vos couleurs
  if (isProcessing) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Finalisation en cours...</h2>
          <p className="text-gray-600">Génération de la facture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F2EFE2] overflow-hidden">
      {/* ...existing code... */}
    </div>
  );
}
