import { Invoice } from '../types';
import { N8nBlueprintAdapter } from './n8nBlueprintAdapter';

/**
 * SERVICE D'ENVOI OPTIMISÉ POUR VOTRE BLUEPRINT N8N
 * =================================================
 *
 * Ce service utilise votre blueprint "Workflow Facture Universel"
 * et envoie les données exactement dans le format attendu par N8N.
 *
 * URL de votre webhook : https://n8n.srv765811.hstgr.cloud/webhook/...
 */
export class N8nBlueprintWebhookService {
  // 🎯 URL de votre webhook N8N (corrigée après scan - cette URL est ACTIVE)
  private static readonly WEBHOOK_URL =
    'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
  private static readonly TIMEOUT_MS = 30000; // 30 secondes

  /**
   * Envoie une facture vers votre blueprint N8N
   * Format : multipart/form-data avec PDF + champs JSON
   */
  static async sendInvoiceToN8nBlueprint(
    invoice: Invoice,
    pdfBase64: string
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    webhookUrl?: string;
  }> {
    try {
      console.log('🎯 ENVOI VERS BLUEPRINT N8N "Workflow Facture Universel"');
      console.log('📄 Facture:', invoice.invoiceNumber);
      console.log('👤 Client:', invoice.clientName, invoice.clientEmail);

      // 1. Adapter les données au format blueprint N8N
      N8nBlueprintAdapter.logDiagnostic(invoice);
      const { payload, formData } = N8nBlueprintAdapter.adaptForN8nBlueprint(
        invoice,
        pdfBase64
      );

      // 2. Validation du payload
      const validation = N8nBlueprintAdapter.validateN8nPayload(payload);
      if (!validation.isValid) {
        const errorMessage = `❌ Validation blueprint échouée:\n${validation.errors.join('\n')}`;
        console.error(errorMessage);

        return {
          success: false,
          message: errorMessage,
          webhookUrl: this.WEBHOOK_URL,
        };
      }

      console.log('✅ Payload validé pour blueprint N8N');

      // 3. Diagnostic final du FormData
      console.group('📦 FORMDATA BLUEPRINT N8N');
      console.log(
        '🔢 Nombre de champs:',
        Array.from(formData.entries()).length
      );

      // Log des champs (sans le PDF pour éviter le spam)
      for (const [key, value] of formData.entries()) {
        if (key === 'data') {
          console.log(`📄 ${key}: [PDF BLOB - ${(value as Blob).size} bytes]`);
        } else {
          console.log(`📋 ${key}:`, value);
        }
      }
      console.groupEnd();

      // 4. Envoi via fetch avec multipart/form-data
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.TIMEOUT_MS);

      try {
        console.log('📤 ENVOI MULTIPART/FORM-DATA VERS N8N...');

        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          // ⚠️ PAS de Content-Type header - laissé au navigateur pour multipart/form-data
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MYCONFORT-Blueprint/1.0',
          },
          body: formData, // FormData automatiquement en multipart/form-data
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 5. Traitement de la réponse
        const responseText = await response.text();
        let responseData;

        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = {
            raw: responseText,
            message: 'Réponse non-JSON reçue',
          };
        }

        console.group('📥 RÉPONSE BLUEPRINT N8N');
        console.log('🔢 Status:', response.status);
        console.log('📄 Content-Type:', response.headers.get('content-type'));
        console.log('📋 Body:', responseData);

        if (response.ok) {
          console.log('✅ BLUEPRINT N8N A REÇU LA FACTURE AVEC SUCCÈS');
          console.log(
            '🎉 Votre workflow "Workflow Facture Universel" est déclenché'
          );
        } else {
          console.error('❌ BLUEPRINT N8N A REJETÉ LA FACTURE');
          console.error(
            '🔍 Vérifiez votre workflow N8N et les champs attendus'
          );
        }
        console.groupEnd();

        if (!response.ok) {
          const errorMessage = `❌ Erreur Blueprint HTTP ${response.status}: ${responseText}`;
          console.error(errorMessage);

          return {
            success: false,
            message: errorMessage,
            response: responseData,
            webhookUrl: this.WEBHOOK_URL,
          };
        }

        const successMessage = `✅ Facture ${payload.numero_facture} envoyée avec succès vers Blueprint N8N`;
        console.log(successMessage);

        return {
          success: true,
          message: successMessage,
          response: responseData,
          webhookUrl: this.WEBHOOK_URL,
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          const timeoutMessage = `❌ Timeout Blueprint: N8N ne répond pas dans les ${this.TIMEOUT_MS / 1000}s`;
          console.error(timeoutMessage);

          return {
            success: false,
            message: timeoutMessage,
            webhookUrl: this.WEBHOOK_URL,
          };
        }

        const networkMessage = `❌ Erreur réseau Blueprint: ${fetchError.message}`;
        console.error(networkMessage);

        return {
          success: false,
          message: networkMessage,
          webhookUrl: this.WEBHOOK_URL,
        };
      }
    } catch (error: any) {
      const unexpectedMessage = `❌ Erreur inattendue Blueprint: ${error.message}`;
      console.error(unexpectedMessage, error);

      return {
        success: false,
        message: unexpectedMessage,
        webhookUrl: this.WEBHOOK_URL,
      };
    }
  }

  /**
   * Test de connectivité avec votre blueprint N8N
   */
  static async testBlueprintConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
    webhookUrl?: string;
  }> {
    try {
      console.log('🧪 TEST DE CONNECTIVITÉ BLUEPRINT N8N');

      const startTime = Date.now();

      // Payload de test minimal compatible avec votre blueprint
      const testFormData = new FormData();
      testFormData.append('numero_facture', 'TEST-001');
      testFormData.append('client_nom', 'Test Client');
      testFormData.append('client_email', 'test@myconfort.fr');
      testFormData.append('montant_ttc', '100.00');
      testFormData.append('description_travaux', 'Test de connectivité');
      testFormData.append(
        'date_facture',
        new Date().toISOString().slice(0, 10)
      );
      testFormData.append('test_mode', 'true');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 secondes pour le test

      try {
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MYCONFORT-Blueprint-Test/1.0',
          },
          body: testFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const successMessage = `✅ Blueprint N8N accessible (${responseTime}ms)`;
          console.log(successMessage);

          return {
            success: true,
            message: successMessage,
            responseTime,
            webhookUrl: this.WEBHOOK_URL,
          };
        } else {
          const errorMessage = `❌ Blueprint N8N répond avec erreur ${response.status}`;
          console.error(errorMessage);

          return {
            success: false,
            message: errorMessage,
            responseTime,
            webhookUrl: this.WEBHOOK_URL,
          };
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            message: '❌ Timeout: Blueprint N8N ne répond pas',
            webhookUrl: this.WEBHOOK_URL,
          };
        }

        return {
          success: false,
          message: `❌ Erreur de connexion Blueprint: ${fetchError.message}`,
          webhookUrl: this.WEBHOOK_URL,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur test Blueprint: ${error.message}`,
        webhookUrl: this.WEBHOOK_URL,
      };
    }
  }

  /**
   * Configure l'URL du webhook (pour personnalisation)
   */
  static configureWebhookUrl(newUrl: string): boolean {
    try {
      // Validation basique de l'URL
      new URL(newUrl);

      // Note: Dans un vrai projet, on ferait ceci via une config
      console.log('🔧 Configuration webhook URL:', newUrl);
      console.log('⚠️ Redémarrage requis pour prise en compte');

      return true;
    } catch {
      console.error('❌ URL webhook invalide:', newUrl);
      return false;
    }
  }
}

export default N8nBlueprintWebhookService;
