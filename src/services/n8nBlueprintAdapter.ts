import { Invoice } from '../types';

/**
 * SERVICE DE COMPATIBILITÉ N8N BLUEPRINT
 * ====================================
 * 
 * Ce service adapte les données de l'application MyConfort
 * au format attendu par votre blueprint N8N "Workflow Facture Universel".
 * 
 * Il transforme les noms de champs de l'application vers ceux
 * attendus par votre automatisation N8N.
 */

interface N8nCompatiblePayload {
  // === CHAMPS EXACTS DU BLUEPRINT N8N ===
  // (selon l'image fournie par l'utilisateur)
  
  // Informations facture
  numero_facture: string;
  date_facture: string;
  date_echeance?: string;
  
  // Informations client
  client_nom: string;
  client_email: string;
  client_telephone?: string;
  client_adresse: string;
  client_ville?: string;
  client_code_postal?: string;
  
  // Montants
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_acompte?: number;
  
  // Détails
  description_travaux: string;
  mode_paiement?: string;
  conseiller?: string;
  notes_facture?: string;
  
  // ✅ NOUVEAU : Coordonnées bancaires RIB
  afficher_rib?: boolean;
  rib_html?: string;
  rib_texte?: string;
  
  // Métadonnées
  statut_facture?: string;
  type_facture?: string;
}

export class N8nBlueprintAdapter {
  /**
   * Convertit une facture MyConfort vers le format N8N Blueprint
   */
  static adaptForN8nBlueprint(invoice: Invoice, pdfBase64: string): {
    payload: N8nCompatiblePayload;
    formData: FormData;
  } {
    console.log('🔄 ADAPTATION DONNÉES POUR N8N BLUEPRINT');
    console.log('Blueprint utilisé : "Workflow Facture Universel"');
    
    // Calcul des totaux selon votre logique métier
    const totalTTC = invoice.products.reduce((sum, product) => {
      return sum + (product.quantity * product.priceTTC);
    }, 0);
    
    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const montantTVA = totalTTC - totalHT;
    const acompte = invoice.montantAcompte || 0;
    
    // Construction description des travaux à partir des produits
    const descriptionTravaux = invoice.products.length > 0 
      ? invoice.products.map(p => `${p.name} (x${p.quantity})`).join(', ')
      : 'Services MyConfort';
    
    // Adresse complète du client
    const adresseComplete = [
      invoice.clientAddress,
      invoice.clientPostalCode,
      invoice.clientCity
    ].filter(Boolean).join(', ');
    
    // Date d'échéance (30 jours par défaut)
    const dateFacture = invoice.invoiceDate || new Date().toISOString().slice(0, 10);
    const dateEcheance = new Date(dateFacture);
    dateEcheance.setDate(dateEcheance.getDate() + 30);
    
    // Payload compatible avec votre blueprint N8N
    const payload: N8nCompatiblePayload = {
      // === CHAMPS OBLIGATOIRES BLUEPRINT ===
      numero_facture: invoice.invoiceNumber || 'INCONNU',
      date_facture: dateFacture,
      date_echeance: dateEcheance.toISOString().slice(0, 10),
      
      client_nom: invoice.clientName || 'INCONNU',
      client_email: invoice.clientEmail || 'INCONNU',
      client_telephone: invoice.clientPhone || '',
      client_adresse: adresseComplete,
      client_ville: invoice.clientCity || '',
      client_code_postal: invoice.clientPostalCode || '',
      
      montant_ht: Math.round(totalHT * 100) / 100,
      montant_tva: Math.round(montantTVA * 100) / 100,
      montant_ttc: Math.round(totalTTC * 100) / 100,
      montant_acompte: Math.round(acompte * 100) / 100,
      
      description_travaux: descriptionTravaux,
      mode_paiement: invoice.paymentMethod || 'Non spécifié',
      conseiller: invoice.advisorName || 'MYCONFORT',
      notes_facture: invoice.invoiceNotes || '',
      
      // ✅ NOUVEAU : COORDONNÉES BANCAIRES POUR VIREMENT
      afficher_rib: Boolean(invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement')),
      rib_html: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement') 
        ? `<div style="margin-top: 20px; padding: 15px; background-color: #e1f5fe; border: 1px solid #2563eb; border-radius: 8px;">
             <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 14px;">📋 Coordonnées bancaires pour votre virement</h3>
             <div style="font-size: 12px; line-height: 1.4;">
               <div><strong>Bénéficiaire :</strong> MYCONFORT</div>
               <div><strong>IBAN :</strong> FR76 1027 8060 4100 0209 3280 165</div>
               <div><strong>BIC :</strong> CMCIFR2A</div>
               <div><strong>Banque :</strong> Crédit Mutuel du Sud-Est</div>
               <div style="margin-top: 8px; font-style: italic; color: #666;">
                 Merci d'indiquer le numéro de facture <strong>${invoice.invoiceNumber}</strong> en référence de votre virement.
               </div>
             </div>
           </div>`
        : '',
      rib_texte: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement')
        ? `COORDONNÉES BANCAIRES POUR VIREMENT\n\nBénéficiaire : MYCONFORT\nIBAN : FR76 1027 8060 4100 0209 3280 165\nBIC : CMCIFR2A\nBanque : Crédit Mutuel du Sud-Est\n\nMerci d'indiquer le numéro de facture ${invoice.invoiceNumber} en référence de votre virement.`
        : '',
      
      // Métadonnées
      statut_facture: 'En attente',
      type_facture: 'Facture standard'
    };
    
    // Construction du FormData pour l'envoi multipart/form-data
    const formData = new FormData();
    
    // Conversion base64 vers Blob (compatible navigateur)
    function base64ToBlob(base64: string, mimeType: string): Blob {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    }
    
    // Ajout du PDF en tant que fichier
    const pdfBlob = base64ToBlob(pdfBase64, 'application/pdf');
    formData.append('data', pdfBlob, `Facture_${payload.numero_facture}.pdf`);
    
    // Ajout de tous les champs comme form-data (comme attendu par votre blueprint)
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    console.log('✅ Payload N8N généré:', {
      numero_facture: payload.numero_facture,
      client_nom: payload.client_nom,
      client_email: payload.client_email,
      montant_ttc: payload.montant_ttc,
      montant_ht: payload.montant_ht,
      montant_tva: payload.montant_tva,
      description_travaux: payload.description_travaux,
      date_facture: payload.date_facture,
      nb_produits: invoice.products.length
    });
    
    return { payload, formData };
  }
  
  /**
   * Valide que le payload est compatible avec le blueprint N8N
   */
  static validateN8nPayload(payload: N8nCompatiblePayload): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validation selon les conditions de votre blueprint
    if (!payload.numero_facture || payload.numero_facture === 'INCONNU') {
      errors.push('numero_facture est obligatoire et ne peut pas être vide');
    }
    
    if (!payload.client_email || !payload.client_email.includes('@')) {
      errors.push('client_email doit être un email valide');
    }
    
    if (!payload.montant_ttc || payload.montant_ttc <= 0) {
      errors.push('montant_ttc doit être supérieur à 0');
    }
    
    if (!payload.client_nom || payload.client_nom === 'INCONNU') {
      errors.push('client_nom est obligatoire');
    }
    
    if (!payload.date_facture) {
      errors.push('date_facture est obligatoire');
    }
    
    if (!payload.description_travaux) {
      errors.push('description_travaux est obligatoire');
    }
    
    // Validation cohérence des montants
    const calculatedTTC = payload.montant_ht + payload.montant_tva;
    if (Math.abs(calculatedTTC - payload.montant_ttc) > 0.01) {
      errors.push('Incohérence dans les montants (HT + TVA ≠ TTC)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Génère l'URL de votre webhook N8N
   */
  static generateWebhookUrl(baseUrl: string = 'https://your-n8n-instance.com'): string {
    return `${baseUrl}/webhook/facture-universelle`;
  }
  
  /**
   * Log de diagnostic pour debug
   */
  static logDiagnostic(invoice: Invoice): void {
    console.group('🔍 DIAGNOSTIC N8N BLUEPRINT COMPATIBILITY');
    console.log('Invoice ID:', invoice.invoiceNumber);
    console.log('Client:', invoice.clientName, invoice.clientEmail);
    console.log('Produits:', invoice.products.length);
    console.log('Total TTC:', invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0));
    console.log('Mode paiement:', invoice.paymentMethod);
    console.log('Acompte:', invoice.montantAcompte);
    console.groupEnd();
  }
}

export default N8nBlueprintAdapter;
