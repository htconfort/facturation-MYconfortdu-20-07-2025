import { z } from 'zod';
import { Invoice } from '../types';

// 📋 SCHÉMA DE VALIDATION STRICT POUR LE PAYLOAD N8N
export const InvoicePayloadSchema = z.object({
  // Informations facture (obligatoires)
  invoiceNumber: z.string().min(1, "Numéro de facture obligatoire"),
  invoiceDate: z.string().min(1, "Date de facture obligatoire"),
  eventLocation: z.string().optional(), // Lieu optionnel
  
  // Informations client (essentiels obligatoires, autres optionnels)
  clientName: z.string().min(1, "Nom client obligatoire"),
  clientEmail: z.string().email("Email client invalide"),
  clientPhone: z.string().min(1, "Téléphone client obligatoire"),
  clientAddress: z.string().min(1, "Adresse client obligatoire"),
  clientCity: z.string().min(1, "Ville client obligatoire"),
  clientPostalCode: z.string().min(1, "Code postal client obligatoire"),
  clientHousingType: z.string().optional(), // Type de logement optionnel
  clientDoorCode: z.string().optional(), // Code porte optionnel
  clientSiret: z.string().optional(),
  
  // Informations conseiller
  advisorName: z.string().optional(), // Nom conseiller optionnel - valeur par défaut appliquée dans sanitizePayload
  
  // Produits (au moins un)
  products: z.array(z.object({
    name: z.string().min(1, "Nom produit obligatoire"),
    category: z.string().min(1, "Catégorie produit obligatoire"),
    quantity: z.number().min(1, "Quantité doit être >= 1"),
    unitPriceHT: z.number().min(0, "Prix HT doit être >= 0"),
    unitPriceTTC: z.number().min(0, "Prix TTC doit être >= 0"),
    discount: z.number().min(0, "Remise doit être >= 0"),
    discountType: z.enum(['percentage', 'amount']),
    totalTTC: z.number().min(0, "Total TTC doit être >= 0")
  })).min(1, "Au moins un produit obligatoire"),
  
  // Totaux calculés
  totalHT: z.number().min(0, "Total HT doit être >= 0"),
  totalTTC: z.number().min(0, "Total TTC doit être >= 0"),
  totalTVA: z.number().min(0, "Total TVA doit être >= 0"),
  taxRate: z.number().min(0, "Taux TVA doit être >= 0"),
  
  // Paiement
  paymentMethod: z.string().min(1, "Méthode de paiement obligatoire"),
  depositAmount: z.number().min(0, "Montant acompte doit être >= 0"),
  remainingAmount: z.number().min(0, "Montant restant doit être >= 0"),
  
  // Livraison
  deliveryMethod: z.string().optional(),
  deliveryNotes: z.string().optional(),
  
  // Métadonnées
  invoiceNotes: z.string().optional(),
  termsAccepted: z.boolean(),
  signature: z.string().optional(),
  
  // PDF (base64)
  pdfBase64: z.string().min(1, "PDF base64 obligatoire"),
  pdfSizeKB: z.number().min(0, "Taille PDF doit être >= 0"),
  
  // Timestamps
  generatedAt: z.string(),
  generatedTimestamp: z.number()
});

export type ValidatedInvoicePayload = z.infer<typeof InvoicePayloadSchema>;

// 🔍 LOGGER DÉTAILLÉ POUR LE PAYLOAD
export class PayloadLogger {
  private static logToConsole(payload: any, errors?: z.ZodError): void {
    console.group('🔍 DIAGNOSTIC PAYLOAD JSON - ANALYSE COMPLÈTE');
    
    // 🎯 LOG COMPLET AVANT ENVOI (PRIORITÉ ABSOLUE)
    console.log('📦 PAYLOAD COMPLET À ENVOYER:', JSON.stringify(payload, null, 2));
    
    // 🔍 VÉRIFICATION CHAMPS REQUIS CRITIQUES
    console.group('⚠️ VÉRIFICATION CHAMPS CRITIQUES REQUIS');
    const criticalFields = [
      'clientEmail', 'clientPhone', 'clientName', 'clientAddress',
      'invoiceNumber', 'invoiceDate', 'totalHT', 'totalTTC',
      'products', 'paymentMethod', 'pdfBase64'
    ];
    
    const missingCriticalFields = criticalFields.filter(field => {
      const value = payload[field];
      const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === '';
      if (isEmpty) {
        console.error(`❌ CHAMP CRITIQUE MANQUANT: ${field}`);
      } else {
        console.log(`✅ ${field}:`, typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value);
      }
      return isEmpty;
    });
    
    if (missingCriticalFields.length > 0) {
      console.error('🚨 CHAMPS CRITIQUES MANQUANTS:', missingCriticalFields);
      console.error('⚠️ LE WEBHOOK N8N RECEVRA UN PAYLOAD INCOMPLET !');
    } else {
      console.log('✅ TOUS LES CHAMPS CRITIQUES SONT PRÉSENTS');
    }
    console.groupEnd();
    
    // 🗺️ MAPPING DES DONNÉES - VÉRIFICATION CORRESPONDANCE
    console.group('🗺️ MAPPING DES DONNÉES - CORRESPONDANCE EXACTE');
    const fieldMappings = [
      { app: 'clientPhone', webhook: 'phone', value: payload.clientPhone },
      { app: 'clientEmail', webhook: 'email', value: payload.clientEmail },
      { app: 'totalHT', webhook: 'montantHT', value: payload.totalHT },
      { app: 'totalTTC', webhook: 'montantTTC', value: payload.totalTTC },
      { app: 'clientName', webhook: 'clientName', value: payload.clientName },
      { app: 'invoiceNumber', webhook: 'invoiceNumber', value: payload.invoiceNumber },
      { app: 'products', webhook: 'products', value: payload.products },
      { app: 'pdfBase64', webhook: 'fichier_facture', value: payload.pdfBase64 ? 'PDF_PRESENT' : 'PDF_MISSING' }
    ];
    
    fieldMappings.forEach(mapping => {
      const hasValue = mapping.value !== undefined && mapping.value !== null && mapping.value !== '';
      console.log(`${hasValue ? '✅' : '❌'} ${mapping.app} → ${mapping.webhook}:`, 
        hasValue ? (typeof mapping.value === 'string' && mapping.value.length > 30 ? `${mapping.value.substring(0, 30)}...` : mapping.value) : 'MANQUANT'
      );
    });
    console.groupEnd();
    
    // 🔍 ANALYSE DÉTAILLÉE DES PRODUITS
    console.group('📦 ANALYSE DÉTAILLÉE DES PRODUITS');
    if (payload.products && Array.isArray(payload.products)) {
      console.log(`📊 Nombre de produits: ${payload.products.length}`);
      payload.products.forEach((product: any, index: number) => {
        console.log(`Produit ${index + 1}:`, {
          name: product.name,
          quantity: product.quantity,
          unitPriceTTC: product.unitPriceTTC,
          totalTTC: product.totalTTC,
          category: product.category
        });
      });
    } else {
      console.error('❌ PRODUITS MANQUANTS OU FORMAT INVALIDE');
    }
    console.groupEnd();
    
    // 🔍 ANALYSE DU PDF
    console.group('📄 ANALYSE DU PDF');
    if (payload.pdfBase64) {
      console.log('✅ PDF présent');
      console.log('📊 Taille base64:', payload.pdfBase64.length, 'caractères');
      console.log('📊 Taille estimée PDF:', payload.pdfSizeKB, 'KB');
      console.log('🔍 Début base64:', payload.pdfBase64.substring(0, 50) + '...');
    } else {
      console.error('❌ PDF MANQUANT - CRITIQUE POUR N8N');
    }
    console.groupEnd();
    
    // 🔍 VÉRIFICATION TYPES DE DONNÉES
    console.group('🔍 VÉRIFICATION TYPES DE DONNÉES');
    const typeChecks = [
      { field: 'totalHT', expected: 'number', actual: typeof payload.totalHT },
      { field: 'totalTTC', expected: 'number', actual: typeof payload.totalTTC },
      { field: 'taxRate', expected: 'number', actual: typeof payload.taxRate },
      { field: 'depositAmount', expected: 'number', actual: typeof payload.depositAmount },
      { field: 'products', expected: 'array', actual: Array.isArray(payload.products) ? 'array' : typeof payload.products },
      { field: 'termsAccepted', expected: 'boolean', actual: typeof payload.termsAccepted }
    ];
    
    typeChecks.forEach(check => {
      const isCorrectType = check.actual === check.expected;
      console.log(`${isCorrectType ? '✅' : '❌'} ${check.field}: attendu ${check.expected}, reçu ${check.actual}`);
    });
    console.groupEnd();
    
    // Log des erreurs de validation
    if (errors) {
      console.group('❌ ERREURS DE VALIDATION');
      errors.issues.forEach(error => {
        console.error(`• ${error.path.join('.')}: ${error.message}`);
      });
      console.groupEnd();
    }
    
    // Statistiques du payload
    console.group('📊 STATISTIQUES PAYLOAD');
    console.log('• Taille JSON:', JSON.stringify(payload).length, 'caractères');
    console.log('• Nombre de produits:', payload.products?.length || 0);
    console.log('• Taille PDF:', payload.pdfSizeKB || 0, 'KB');
    console.log('• Signature présente:', !!payload.signature);
    console.groupEnd();
    
    console.groupEnd();
  }
  
  // 🆕 NOUVELLE MÉTHODE: LOG AVANT ENVOI WEBHOOK
  static logBeforeWebhookSend(payload: any): void {
    console.group('🚀 DIAGNOSTIC FINAL AVANT ENVOI WEBHOOK N8N');
    
    // Payload complet
    console.log('📦 PAYLOAD COMPLET À ENVOYER:', JSON.stringify(payload, null, 2));
    
    // Vérification finale des champs critiques
    const webhookRequiredFields = ['clientEmail', 'clientPhone', 'totalHT', 'totalTTC', 'invoiceNumber', 'pdfBase64'];
    const missingWebhookFields = webhookRequiredFields.filter(field => {
      const value = payload[field];
      return !value || value === '' || (Array.isArray(value) && value.length === 0);
    });
    
    if (missingWebhookFields.length > 0) {
      console.error('🚨 CHAMPS MANQUANTS POUR WEBHOOK:', missingWebhookFields);
      console.error('⚠️ LE WEBHOOK N8N RISQUE DE PLANTER !');
    } else {
      console.log('✅ PAYLOAD PRÊT POUR ENVOI WEBHOOK');
    }
    
    // Taille du payload
    const payloadSize = JSON.stringify(payload).length;
    console.log('📊 Taille totale payload:', payloadSize, 'caractères');
    
    if (payloadSize > 1000000) { // 1MB
      console.warn('⚠️ PAYLOAD TRÈS VOLUMINEUX (>1MB) - RISQUE DE TIMEOUT');
    }
    
    console.groupEnd();
  }
  
  private static logToFile(payload: any, errors?: z.ZodError): void {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        payload: payload,
        validation: {
          isValid: !errors,
          errors: errors?.issues || []
        },
        stats: {
          jsonSize: JSON.stringify(payload).length,
          productsCount: payload.products?.length || 0,
          pdfSizeKB: payload.pdfSizeKB || 0,
          hasSignature: !!payload.signature
        }
      };
      
      // Simuler l'écriture de fichier (dans un vrai environnement, utiliser fs)
      console.log('📁 LOG FICHIER (simulation):', JSON.stringify(logData, null, 2));
      
      // Dans un environnement Node.js réel, vous pourriez faire :
      // fs.writeFileSync(`logs/payload-${Date.now()}.json`, JSON.stringify(logData, null, 2));
      
    } catch (error) {
      console.error('❌ Erreur écriture log fichier:', error);
    }
  }
  
  static logPayload(payload: any, errors?: z.ZodError): void {
    this.logToConsole(payload, errors);
    this.logToFile(payload, errors);
  }
}

// 🧹 NETTOYEUR DE PAYLOAD
export class PayloadSanitizer {
  static sanitizePayload(invoice: Invoice, pdfBase64: string, pdfSizeKB: number): ValidatedInvoicePayload {
    console.log('🧹 NETTOYAGE ET PRÉPARATION DU PAYLOAD - DIAGNOSTIC COMPLET');
    
    // 🔍 LOG DES DONNÉES BRUTES AVANT NETTOYAGE
    console.group('📋 DONNÉES BRUTES AVANT NETTOYAGE');
    console.log('Invoice brute:', {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone,
      products: invoice.products.length,
      paymentMethod: invoice.paymentMethod,
      signature: !!invoice.signature
    });
    console.log('PDF info:', { base64Length: pdfBase64.length, sizeKB: pdfSizeKB });
    console.groupEnd();
    
    // Calculer les totaux
    const products = invoice.products.map(product => {
      const unitPriceHT = product.priceTTC / (1 + (invoice.taxRate / 100));
      const totalTTC = product.quantity * product.priceTTC * (1 - (product.discount / 100));
      
      return {
        name: product.name.trim(),
        category: product.category?.trim() || '',
        quantity: product.quantity,
        unitPriceHT: Math.round(unitPriceHT * 100) / 100,
        unitPriceTTC: product.priceTTC,
        discount: product.discount,
        discountType: (product.discountType === 'percent' ? 'percentage' : 'amount') as 'percentage' | 'amount',
        totalTTC: Math.round(totalTTC * 100) / 100
      };
    });
    
    const totalTTC = products.reduce((sum, p) => sum + p.totalTTC, 0);
    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const totalTVA = totalTTC - totalHT;
    const depositAmount = invoice.montantAcompte || 0;
    const remainingAmount = totalTTC - depositAmount;
    
    // 🔍 LOG DES CALCULS
    console.group('🧮 CALCULS EFFECTUÉS');
    console.log('Totaux calculés:', {
      totalHT: Math.round(totalHT * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      depositAmount: Math.round(depositAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100
    });
    console.groupEnd();
    
    // Construire le payload nettoyé
    const cleanPayload = {
      // Informations facture
      invoiceNumber: invoice.invoiceNumber.trim(),
      invoiceDate: invoice.invoiceDate,
      eventLocation: invoice.eventLocation?.trim() || '',
      
      // Informations client (nettoyées)
      clientName: invoice.clientName.trim(),
      clientEmail: invoice.clientEmail.trim().toLowerCase(),
      clientPhone: invoice.clientPhone.trim(),
      clientAddress: invoice.clientAddress.trim(),
      clientCity: invoice.clientCity.trim(),
      clientPostalCode: invoice.clientPostalCode.trim(),
      clientHousingType: invoice.clientHousingType?.trim() || '',
      clientDoorCode: invoice.clientDoorCode?.trim() || '',
      clientSiret: invoice.clientSiret?.trim(),
      
      // Conseiller
      advisorName: invoice.advisorName?.trim() || 'MYCONFORT',
      
      // Produits
      products: products,
      
      // Totaux (arrondis à 2 décimales)
      totalHT: Math.round(totalHT * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      taxRate: invoice.taxRate,
      
      // Paiement
      paymentMethod: invoice.paymentMethod.trim(),
      depositAmount: Math.round(depositAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      
      // Livraison
      deliveryMethod: invoice.deliveryMethod?.trim(),
      deliveryNotes: invoice.deliveryNotes?.trim(),
      
      // Métadonnées
      invoiceNotes: invoice.invoiceNotes?.trim(),
      termsAccepted: invoice.termsAccepted,
      signature: invoice.signature?.trim(),
      
      // PDF
      pdfBase64: pdfBase64,
      pdfSizeKB: pdfSizeKB,
      
      // Timestamps
      generatedAt: new Date().toISOString(),
      generatedTimestamp: Date.now()
    };
    
    // 🔍 LOG DU PAYLOAD NETTOYÉ
    console.group('✅ PAYLOAD NETTOYÉ - PRÊT POUR VALIDATION');
    console.log('Payload nettoyé:', JSON.stringify(cleanPayload, null, 2));
    console.groupEnd();
    
    return cleanPayload;
  }
}

// 🔐 VALIDATEUR PRINCIPAL
export class PayloadValidator {
  static validateAndPrepare(invoice: Invoice, pdfBase64: string, pdfSizeKB: number): {
    isValid: boolean;
    payload?: ValidatedInvoicePayload;
    errors?: string[];
  } {
    try {
      console.log('🔐 VALIDATION DU PAYLOAD AVANT ENVOI N8N');
      
      // 1. Nettoyer le payload (format interne)
      const cleanPayload = PayloadSanitizer.sanitizePayload(invoice, pdfBase64, pdfSizeKB);
      
      // 2. Valider avec le schéma Zod (format interne)
      const validationResult = InvoicePayloadSchema.safeParse(cleanPayload);
      
      if (validationResult.success) {
        console.log('✅ VALIDATION INTERNE RÉUSSIE');
        
        // 3. 🚀 TRANSFORMATION VERS FORMAT STANDARD N8N
        const n8nPayload = N8nFormatTransformer.transformToN8nFormat(validationResult.data);
        
        // 4. Validation du format N8N
        const n8nValidation = N8nFormatTransformer.validateN8nFormat(n8nPayload);
        
        if (n8nValidation.isValid) {
          console.log('✅ VALIDATION FORMAT N8N RÉUSSIE - Payload prêt pour envoi');
          PayloadLogger.logPayload(n8nPayload);
          
          return {
            isValid: true,
            payload: n8nPayload
          };
        } else {
          console.error('❌ VALIDATION FORMAT N8N ÉCHOUÉE');
          console.error('Erreurs N8N:', n8nValidation.errors);
          
          return {
            isValid: false,
            errors: n8nValidation.errors
          };
        }
      } else {
        console.error('❌ VALIDATION INTERNE ÉCHOUÉE');
        PayloadLogger.logPayload(cleanPayload, validationResult.error);
        
        const errors = validationResult.error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        return {
          isValid: false,
          errors: errors
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      return {
        isValid: false,
        errors: [`Erreur de validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      };
    }
  }
}

/**
 * 🚀 TRANSFORMATION AU FORMAT STANDARD N8N
 * Convertit notre payload interne vers le format attendu par N8N
 */
export class N8nFormatTransformer {
  /**
   * Transforme le payload MyConfort vers le format standard N8N
   */
  static transformToN8nFormat(cleanPayload: any): any {
    console.log('🔄 TRANSFORMATION VERS FORMAT STANDARD N8N');
    console.group('📤 Conversion vers format webhook standard');
    
    // Transformer les produits au format N8N standard
    const items = cleanPayload.products.map((product: any, index: number) => ({
      id: index + 1,
      description: product.name,
      category: product.category,
      quantity: product.quantity,
      unit_price: product.unitPriceTTC,
      unit_price_ht: product.unitPriceHT,
      discount: product.discount,
      discount_type: product.discountType,
      total_price: product.totalTTC
    }));
    
    // Format standard N8N
    const n8nPayload = {
      // 🔥 FORMAT STANDARD N8N
      invoice_number: cleanPayload.invoiceNumber,
      invoice_date: cleanPayload.invoiceDate,
      client_email: cleanPayload.clientEmail,
      client_name: cleanPayload.clientName,
      client_phone: cleanPayload.clientPhone,
      client_address: cleanPayload.clientAddress,
      client_city: cleanPayload.clientCity,
      client_postal_code: cleanPayload.clientPostalCode,
      client_housing_type: cleanPayload.clientHousingType,
      client_door_code: cleanPayload.clientDoorCode,
      client_siret: cleanPayload.clientSiret,
      
      // Montants
      amount: cleanPayload.totalTTC,           // Montant principal (standard N8N)
      amount_ht: cleanPayload.totalHT,         // Montant HT
      amount_ttc: cleanPayload.totalTTC,       // Montant TTC (clarité)
      amount_tva: cleanPayload.totalTVA,       // TVA
      tax_rate: cleanPayload.taxRate,
      
      // Produits au format standard
      items: items,
      items_count: items.length,
      
      // Paiement et livraison
      payment_method: cleanPayload.paymentMethod,
      deposit_amount: cleanPayload.depositAmount,
      remaining_amount: cleanPayload.remainingAmount,
      delivery_method: cleanPayload.deliveryMethod,
      delivery_notes: cleanPayload.deliveryNotes,
      
      // Commercial
      advisor_name: cleanPayload.advisorName,
      event_location: cleanPayload.eventLocation,
      
      // Notes
      invoice_notes: cleanPayload.invoiceNotes,
      
      // PDF et signature
      pdf_base64: cleanPayload.pdfBase64,
      signature: cleanPayload.signature,
      terms_accepted: cleanPayload.termsAccepted,
      
      // Métadonnées
      date: cleanPayload.invoiceDate,          // Date standard N8N
      created_at: new Date().toISOString(),
      source: "MyConfort",
      version: "1.0"
    };
    
    console.log('✅ Transformation terminée');
    console.log('📊 Statistiques:');
    console.log(`   • Produits transformés: ${items.length}`);
    console.log(`   • Montant principal: ${n8nPayload.amount}€`);
    console.log(`   • Email client: ${n8nPayload.client_email}`);
    console.log(`   • PDF présent: ${n8nPayload.pdf_base64 ? 'OUI' : 'NON'}`);
    
    console.groupEnd();
    
    return n8nPayload;
  }
  
  /**
   * Validation du format N8N
   */
  static validateN8nFormat(payload: any): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Champs obligatoires standard N8N
    const requiredFields = [
      'invoice_number', 'client_email', 'client_name', 
      'amount', 'items', 'date'
    ];
    
    requiredFields.forEach(field => {
      if (!payload[field]) {
        errors.push(`Champ obligatoire manquant: ${field}`);
      }
    });
    
    // Validation email
    if (payload.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.client_email)) {
      errors.push('Format email invalide');
    }
    
    // Validation montant
    if (payload.amount && (typeof payload.amount !== 'number' || payload.amount <= 0)) {
      errors.push('Montant invalide');
    }
    
    // Validation items
    if (payload.items && !Array.isArray(payload.items)) {
      errors.push('Items doit être un tableau');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}