import { Invoice } from '../types';
import { calculateInvoiceTotals } from '../utils/invoice-calculations';
import WebhookUrlHelper from '../utils/webhookUrlHelper';

// 🚀 SERVICE D'ENVOI VERS N8N AVEC VALIDATION
export class N8nWebhookService {
  private static get WEBHOOK_URL() {
    const url = WebhookUrlHelper.getWebhookUrl('webhook/facture-universelle');
    console.log('🔗 N8nWebhookService - Using webhook URL:', url);
    return url;
  }
  private static readonly TIMEOUT_MS = 30000; // 30 secondes
  
  /**
   * Envoie une facture validée vers n8n
   */
  static async sendInvoiceToN8n(
    invoice: Invoice, 
    pdfBase64: string
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    payload?: any; // Changé de ValidatedInvoicePayload à any pour accepter la structure N8N
  }> {
    try {
      console.log('🚀 DIAGNOSTIC COMPLET AVANT ENVOI N8N');
      
      // 1. ✅ UTILISATION STRUCTURE PAYLOAD FONCTIONNELLE (commit e54c7f9)
      console.log('🔧 Création payload avec structure validée du commit e54c7f9...');
      
      // Calculer les totaux avec la logique correcte selon le mode de paiement
      const calculatedTotals = calculateInvoiceTotals(
        invoice.products,
        invoice.taxRate || 20,
        invoice.montantAcompte || 0,
        invoice.paymentMethod || ''
      );
      
      const totalAmount = calculatedTotals.montantTTC;
      const acompteAmount = calculatedTotals.montantAcompte;
      const montantRestant = calculatedTotals.montantRestant;
      
      // 2. 📦 STRUCTURE DU PAYLOAD IDENTIQUE AU COMMIT FONCTIONNEL e54c7f9
      const webhookPayload = {
        // PDF data
        nom_facture: `Facture_MYCONFORT_${invoice.invoiceNumber}`,
        fichier_facture: pdfBase64, // Base64 du PDF
        date_creation: new Date().toISOString(),
        
        // Invoice metadata - NOMS EXACTS DU COMMIT FONCTIONNEL
        numero_facture: invoice.invoiceNumber,
        date_facture: invoice.invoiceDate,
        montant_ttc: totalAmount,
        acompte: acompteAmount,
        montant_restant: montantRestant,
        
        // NOUVEAUX CHAMPS FINANCIERS DÉTAILLÉS - TOUS LES MONTANTS
        montant_ht: invoice.montantHT || 0,
        montant_tva: invoice.montantTVA || 0,
        montant_remise: invoice.montantRemise || 0,
        taux_tva: invoice.taxRate || 20,
        
        // Client information - CORRESPONDANCE EXACTE AVEC VOTRE JSON N8N + TOUS LES CHAMPS
        nom_du_client: invoice.clientName,
        email_client: invoice.clientEmail,
        telephone_client: invoice.clientPhone,
        adresse_client: `${invoice.clientAddress}, ${invoice.clientPostalCode} ${invoice.clientCity}`,
        
        // NOUVEAUX CHAMPS CLIENT DÉTAILLÉS - TOUS LES CHAMPS DISPONIBLES
        client_adresse_rue: invoice.clientAddress,
        client_code_postal: invoice.clientPostalCode,
        client_ville: invoice.clientCity,
        client_type_logement: invoice.clientHousingType || '',
        client_code_porte: invoice.clientDoorCode || '',
        client_siret: invoice.clientSiret || '',
        
        // Payment information
        mode_paiement: invoice.paymentMethod || 'Non spécifié',
        signature: invoice.isSigned ? 'Oui' : 'Non',
        signature_presente: invoice.isSigned ? 'Oui' : 'Non',
        signature_image: invoice.signature || '', // ✅ SIGNATURE BASE64 COMPLÈTE
        date_signature: invoice.signatureDate || '',
        
        // NOUVEAUX CHAMPS LIVRAISON - TOUS LES CHAMPS DISPONIBLES
        methode_livraison: invoice.deliveryMethod || '',
        notes_livraison: invoice.deliveryNotes || '',
        
        // Chèques à venir - CORRESPONDANCE EXACTE AVEC VOTRE JSON N8N
        nombre_cheques: invoice.nombreChequesAVenir || 0,
        montant_par_cheque: invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0 && montantRestant > 0
          ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2)
          : '',
        
        // ✅ CHAMP POUR AFFICHAGE EMAIL - MODE DE PAIEMENT DÉTAILLÉ
        mode_paiement_avec_details: (() => {
          // Si pas d'acompte ET pas de chèques à venir
          if ((!acompteAmount || acompteAmount === 0) && (!invoice.nombreChequesAVenir || invoice.nombreChequesAVenir === 0)) {
            return `Montant à régler : ${totalAmount.toFixed(2)}€ par ${invoice.paymentMethod || 'Non spécifié'}`;
          }
          // Si chèques à venir présents
          else if (invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
            return `${invoice.paymentMethod || 'Chèques à venir'} - ${invoice.nombreChequesAVenir} chèque${invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir de ${montantRestant > 0 ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2) : '0.00'}€ chacun`;
          }
          // Si acompte présent mais pas de chèques
          else {
            return `Montant restant : ${montantRestant.toFixed(2)}€ par ${invoice.paymentMethod || 'Non spécifié'}`;
          }
        })(),
        
        // ✅ NOUVEAU : COORDONNÉES BANCAIRES POUR VIREMENT
        afficher_rib: invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes('virement'),
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
        
        // NOUVEAUX CHAMPS NOTES ET MÉTADONNÉES - TOUS LES CHAMPS DISPONIBLES
        notes_facture: invoice.invoiceNotes || '',
        conseiller: invoice.advisorName || 'MYCONFORT',
        lieu_evenement: invoice.eventLocation || 'Non spécifié',
        conditions_acceptees: invoice.termsAccepted ? 'Oui' : 'Non',
        date_creation_facture: invoice.createdAt || new Date().toISOString(),
        date_modification_facture: invoice.updatedAt || new Date().toISOString(),
        
        // Produits formatés en HTML pour email
        produits_html: invoice.products.map(product => {
          const total = product.quantity * product.priceTTC;
          return `<li><strong>${product.name}</strong><br>
                   Quantité: ${product.quantity} × ${product.priceTTC.toFixed(2)}€ = <strong>${total.toFixed(2)}€</strong>
                   ${product.discount > 0 ? `<br><em>Remise: -${product.discount}${product.discountType === 'percent' ? '%' : '€'}</em>` : ''}
                   </li>`;
        }).join(''),
        
        // CHAMPS PRODUITS SÉPARÉS POUR N8N - ACCÈS FACILE AUX DONNÉES
        produits_noms: invoice.products.map(p => p.name),
        produits_categories: invoice.products.map(p => p.category || ''),
        produits_quantites: invoice.products.map(p => p.quantity),
        produits_prix_unitaires: invoice.products.map(p => p.priceTTC.toFixed(2)),
        produits_prix_ht_unitaires: invoice.products.map(p => p.priceHT.toFixed(2)),
        produits_remises: invoice.products.map(p => p.discount || 0),
        produits_types_remises: invoice.products.map(p => p.discountType || 'fixed'),
        produits_totaux: invoice.products.map(p => (p.quantity * p.priceTTC).toFixed(2)),
        produits_totaux_ht: invoice.products.map(p => (p.quantity * p.priceHT).toFixed(2)),
        produits_statuts_livraison: invoice.products.map(p => p.isPickupOnSite ? 'emporte' : 'a_livrer'), // Nouveau champ pour les statuts de livraison
        
        // Additional metadata
        nombre_produits: invoice.products.length,
        
        // NOUVEAUX CHAMPS STATISTIQUES LIVRAISON
        nombre_produits_a_livrer: invoice.products.filter(p => !p.isPickupOnSite).length,
        nombre_produits_emportes: invoice.products.filter(p => p.isPickupOnSite).length,
        noms_produits_a_livrer: invoice.products.filter(p => !p.isPickupOnSite).map(p => p.name).join(', '),
        noms_produits_emportes: invoice.products.filter(p => p.isPickupOnSite).map(p => p.name).join(', '),
        a_une_livraison: invoice.products.some(p => !p.isPickupOnSite) ? 'Oui' : 'Non',
        a_des_produits_emportes: invoice.products.some(p => p.isPickupOnSite) ? 'Oui' : 'Non',
        
        // ✅ CORRECTION STRUCTURE PRODUITS - TABLEAU D'OBJETS POUR N8N
        produits: invoice.products.map(product => ({
          nom: product.name,
          quantite: product.quantity,
          prix_ttc: product.priceTTC,
          prix_ht: product.priceHT,
          total_ttc: product.quantity * product.priceTTC,
          total_ht: product.quantity * product.priceHT,
          categorie: product.category || 'Non spécifiée',
          statut_livraison: product.isPickupOnSite ? 'emporte' : 'a_livrer', // Nouveau champ pour le statut de livraison
          remise: product.discount || 0,
          type_remise: product.discountType || 'fixed'
        })),
        
        // Garder aussi le format texte pour compatibilité
        produits_text: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),
        
        // Google Drive folder ID (du commit fonctionnel)
        dossier_id: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'
      };
      
      console.log('📦 Payload N8N préparé (structure e54c7f9):', {
        ...webhookPayload,
        fichier_facture: `[${pdfBase64.length} caractères Base64]`
      });
      
      // 3. 🗺️ VÉRIFICATION MAPPING WEBHOOK (Structure e54c7f9)
      console.group('🗺️ MAPPING WEBHOOK N8N - STRUCTURE FONCTIONNELLE e54c7f9');
      console.log('🎯 URL Webhook:', this.WEBHOOK_URL);
      console.log('📊 Taille payload:', JSON.stringify(webhookPayload).length, 'caractères');
      
      const criticalFields = {
        // CHAMPS DE BASE
        'nom_facture': webhookPayload.nom_facture,
        'numero_facture': webhookPayload.numero_facture,
        'nom_du_client': webhookPayload.nom_du_client,
        'email_client': webhookPayload.email_client,
        'montant_ttc': webhookPayload.montant_ttc,
        
        // CHAMPS FINANCIERS COMPLETS
        'montant_ht': webhookPayload.montant_ht,
        'montant_tva': webhookPayload.montant_tva,
        'montant_remise': webhookPayload.montant_remise,
        'taux_tva': webhookPayload.taux_tva,
        'acompte': webhookPayload.acompte,
        'montant_restant': webhookPayload.montant_restant,
        
        // CLIENT DÉTAILLÉ
        'telephone_client': webhookPayload.telephone_client,
        'client_adresse_rue': webhookPayload.client_adresse_rue,
        'client_code_postal': webhookPayload.client_code_postal,
        'client_ville': webhookPayload.client_ville,
        'client_type_logement': webhookPayload.client_type_logement,
        'client_code_porte': webhookPayload.client_code_porte,
        'client_siret': webhookPayload.client_siret || 'Non renseigné',
        
        // PAIEMENT ET SIGNATURE
        'mode_paiement': webhookPayload.mode_paiement,
        'signature_presente': webhookPayload.signature_presente,
        'signature_image': webhookPayload.signature_image ? 'Incluse (base64)' : 'Non disponible',
        'date_signature': webhookPayload.date_signature || 'Non signé',
        
        // LIVRAISON
        'methode_livraison': webhookPayload.methode_livraison || 'Non spécifiée',
        'notes_livraison': webhookPayload.notes_livraison || 'Aucune',
        
        // CHÈQUES À VENIR
        'nombre_cheques': webhookPayload.nombre_cheques,
        'montant_par_cheque': webhookPayload.montant_par_cheque || 'Non applicable',
        'mode_paiement_avec_details': webhookPayload.mode_paiement_avec_details,
        
        // MÉTADONNÉES
        'notes_facture': webhookPayload.notes_facture || 'Aucune',
        'conseiller': webhookPayload.conseiller,
        'lieu_evenement': webhookPayload.lieu_evenement,
        'conditions_acceptees': webhookPayload.conditions_acceptees,
        
        // PRODUITS
        'produits_html (longueur)': `${webhookPayload.produits_html.length} chars`,
        'produits_noms (nombre)': `${webhookPayload.produits_noms.length} items`,
        'produits_categories (nombre)': `${webhookPayload.produits_categories.length} items`,
        'produits_quantites (nombre)': `${webhookPayload.produits_quantites.length} items`,
        'produits_prix_ht_unitaires (nombre)': `${webhookPayload.produits_prix_ht_unitaires.length} items`,
        'nombre_produits': webhookPayload.nombre_produits,
        
        // PDF
        'fichier_facture (taille)': `${pdfBase64.length} chars`,
      };
      
      Object.entries(criticalFields).forEach(([field, value]) => {
        const hasValue = value !== undefined && value !== null && value !== '';
        console.log(`${hasValue ? '✅' : '❌'} ${field}:`, 
          typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value
        );
      });
      console.groupEnd();
      
      // 4. Envoyer vers n8n avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.TIMEOUT_MS);
      
      try {
        console.log('📤 ENVOI EN COURS VERS N8N...');
        
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MYCONFORT-Invoice-System/1.0'
          },
          body: JSON.stringify(webhookPayload),
          mode: 'cors', // Tentative CORS normale d'abord
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 5. Analyser la réponse
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
        
        console.group('📥 RÉPONSE N8N');
        console.log('🔢 Status:', response.status);
        console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));
        console.log('📋 Body:', responseData);
        
        // Diagnostic de la réponse
        if (response.ok) {
          console.log('✅ WEBHOOK N8N A REÇU LE PAYLOAD AVEC SUCCÈS');
        } else {
          console.error('❌ WEBHOOK N8N A REJETÉ LE PAYLOAD');
          console.error('🔍 Vérifiez le workflow n8n et les champs attendus');
        }
        console.groupEnd();
        
        if (!response.ok) {
          const errorMessage = `❌ Erreur HTTP ${response.status}: ${responseText}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            response: responseData,
            payload: webhookPayload
          };
        }
        
        const successMessage = `✅ Facture ${webhookPayload.numero_facture} envoyée avec succès vers n8n`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          response: responseData,
          payload: webhookPayload
        };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          const timeoutMessage = `❌ Timeout: n8n ne répond pas dans les ${this.TIMEOUT_MS/1000}s`;
          console.error(timeoutMessage);
          
          return {
            success: false,
            message: timeoutMessage,
            payload: webhookPayload
          };
        }
        
        // Gestion spéciale des erreurs CORS
        if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
          console.warn('⚠️ Erreur CORS détectée, tentative avec mode no-cors...');
          
          try {
            // Tentative avec mode no-cors (supprimer fallbackResponse non utilisé)
            await fetch(this.WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(webhookPayload),
              mode: 'no-cors' // Mode no-cors pour éviter CORS
            });
            
            console.log('✅ Envoi no-cors réussi (pas de réponse lisible)');
            
            return {
              success: true,
              message: '✅ Envoi réussi via mode no-cors (CORS configuré côté N8N requis pour les réponses)',
              response: { note: 'Mode no-cors utilisé - réponse non lisible' },
              payload: webhookPayload
            };
            
          } catch (noCorsError) {
            console.error('❌ Échec même avec no-cors:', noCorsError);
          }
        }
        
        const networkMessage = `❌ Erreur réseau: ${fetchError.message}`;
        console.error(networkMessage);
        
        return {
          success: false,
          message: networkMessage,
          payload: webhookPayload
        };
      }
      
    } catch (error: any) {
      const unexpectedMessage = `❌ Erreur inattendue: ${error.message}`;
      console.error(unexpectedMessage, error);
      
      return {
        success: false,
        message: unexpectedMessage
      };
    }
  }
  
  /**
   * Test de connectivité vers n8n
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    try {
      console.log('🧪 TEST DE CONNECTIVITÉ N8N');
      
      const startTime = Date.now();
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'MYCONFORT-Test'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 secondes pour le test
      
      try {
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const successMessage = `✅ n8n accessible (${responseTime}ms)`;
          console.log(successMessage);
          
          return {
            success: true,
            message: successMessage,
            responseTime
          };
        } else {
          const errorMessage = `❌ n8n répond avec erreur ${response.status}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            responseTime
          };
        }
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            message: '❌ Timeout: n8n ne répond pas'
          };
        }
        
        return {
          success: false,
          message: `❌ Erreur de connexion: ${fetchError.message}`
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur test: ${error.message}`
      };
    }
  }
}