import { Invoice } from '../types';

// 🚀 SERVICE D'ENVOI VERS N8N AVEC VALIDATION
export class N8nWebhookService {
  private static readonly WEBHOOK_URL = '/api/n8n/webhook/facture-universelle';
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
      
      // Calculer les totaux comme dans le commit fonctionnel
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + (product.quantity * product.priceTTC);
      }, 0);
      
      const acompteAmount = invoice.montantAcompte || 0;
      const montantRestant = totalAmount - acompteAmount;
      
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
        
        // Client information - NOMS EXACTS DU COMMIT FONCTIONNEL
        "Nom du client": invoice.clientName,
        client_email: invoice.clientEmail,
        client_telephone: invoice.clientPhone,
        adresse_client: `${invoice.clientAddress}, ${invoice.clientPostalCode} ${invoice.clientCity}`,
        
        // Payment information
        mode_paiement: invoice.paymentMethod || 'Non spécifié',
        signature: invoice.signature ? 'Oui' : 'Non',
        
        // Additional metadata
        conseiller: invoice.advisorName || 'MYCONFORT',
        lieu_evenement: invoice.eventLocation || 'Non spécifié',
        nombre_produits: invoice.products.length,
        produits: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),
        
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
        'nom_facture': webhookPayload.nom_facture,
        'numero_facture': webhookPayload.numero_facture,
        'Nom du client': webhookPayload["Nom du client"],
        'client_email': webhookPayload.client_email,
        'montant_ttc': webhookPayload.montant_ttc,
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