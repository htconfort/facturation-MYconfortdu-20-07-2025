import { Invoice } from '../types';
import { N8nBlueprintAdapter } from './n8nBlueprintAdapter';

/**
 * SERVICE N8N - FORMAT JSON BINAIRE OPTIMAL
 * ========================================
 * 
 * Version alternative qui envoie les données au format JSON pur
 * avec le champ binary.data que N8N comprend nativement.
 * 
 * À utiliser si le format FormData pose problème avec le workflow N8N.
 */
export class N8nJsonBinaryService {
  private static readonly WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle';
  private static readonly TIMEOUT_MS = 30000;
  
  /**
   * Envoie une facture au format JSON avec binary data intégré
   */
  static async sendInvoiceJsonBinary(
    invoice: Invoice, 
    pdfBase64: string
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    webhookUrl?: string;
  }> {
    try {
      console.log('🎯 ENVOI JSON BINAIRE VERS N8N');
      console.log('📄 Facture:', invoice.invoiceNumber);
      
      // 1. Adapter les données de base
      const { payload } = N8nBlueprintAdapter.adaptForN8nBlueprint(invoice, pdfBase64);
      
      // 2. Format JSON avec binary data N8N-compatible
      const jsonPayload = {
        // Toutes les métadonnées normales
        ...payload,
        
        // Format binary spécifique N8N
        binary: {
          data: {
            mimeType: 'application/pdf',
            fileName: `Facture_${payload.numero_facture}.pdf`,
            data: pdfBase64,
            size: Math.floor(pdfBase64.length * 0.75) // Estimation taille décodée
          }
        },
        
        // Informations de debug pour N8N
        _debug: {
          source: 'MYCONFORT-APP',
          format: 'JSON-BINARY',
          timestamp: new Date().toISOString(),
          pdf_size_base64: pdfBase64.length,
          pdf_size_estimated: Math.floor(pdfBase64.length * 0.75)
        }
      };
      
      // 3. Validation
      const validation = this.validateJsonBinaryPayload(jsonPayload);
      if (!validation.isValid) {
        const errorMessage = `❌ Validation JSON binaire échouée:\\n${validation.errors.join('\\n')}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          webhookUrl: this.WEBHOOK_URL
        };
      }
      
      console.log('✅ Payload JSON binaire validé');
      console.log('📊 Taille payload JSON:', JSON.stringify(jsonPayload).length, 'caractères');
      console.log('📄 PDF intégré:', jsonPayload.binary.data.fileName);
      
      // 4. Envoi JSON pur
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
      
      try {
        console.log('📤 ENVOI JSON BINAIRE...');
        
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MYCONFORT-JsonBinary/1.0'
          },
          body: JSON.stringify(jsonPayload),
          signal: controller.signal
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
            message: 'Réponse non-JSON reçue'
          };
        }
        
        console.group('📥 RÉPONSE N8N JSON BINAIRE');
        console.log('🔢 Status:', response.status);
        console.log('📄 Content-Type:', response.headers.get('content-type'));
        console.log('📋 Body:', responseData);
        
        if (response.ok) {
          console.log('✅ N8N A REÇU LE JSON BINAIRE AVEC SUCCÈS');
          console.log('🎉 Workflow déclenché avec binary.data intégré');
        } else {
          console.error('❌ N8N A REJETÉ LE JSON BINAIRE');
          console.error('🔍 Vérifiez la configuration du node Webhook (Binary Data)');
        }
        console.groupEnd();
        
        if (!response.ok) {
          const errorMessage = `❌ Erreur JSON Binaire HTTP ${response.status}: ${responseText}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            response: responseData,
            webhookUrl: this.WEBHOOK_URL
          };
        }
        
        const successMessage = `✅ Facture ${payload.numero_facture} envoyée en JSON binaire avec succès`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          response: responseData,
          webhookUrl: this.WEBHOOK_URL
        };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          const timeoutMessage = `❌ Timeout JSON Binaire: N8N ne répond pas dans les ${this.TIMEOUT_MS/1000}s`;
          console.error(timeoutMessage);
          
          return {
            success: false,
            message: timeoutMessage,
            webhookUrl: this.WEBHOOK_URL
          };
          
        } else {
          const networkMessage = `❌ Erreur réseau JSON Binaire: ${fetchError.message}`;
          console.error(networkMessage);
          
          return {
            success: false,
            message: networkMessage,
            webhookUrl: this.WEBHOOK_URL
          };
        }
      }
      
    } catch (error: any) {
      const generalError = `❌ Erreur générale JSON Binaire: ${error.message}`;
      console.error(generalError);
      console.error('Stack:', error.stack);
      
      return {
        success: false,
        message: generalError,
        webhookUrl: this.WEBHOOK_URL
      };
    }
  }
  
  /**
   * Valide le payload JSON binaire
   */
  private static validateJsonBinaryPayload(payload: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validation des métadonnées de base
    if (!payload.numero_facture) {
      errors.push('numero_facture est obligatoire');
    }
    
    if (!payload.client_email || !payload.client_email.includes('@')) {
      errors.push('client_email doit être un email valide');
    }
    
    if (!payload.montant_ttc || payload.montant_ttc <= 0) {
      errors.push('montant_ttc doit être supérieur à 0');
    }
    
    // Validation du format binary
    if (!payload.binary || !payload.binary.data) {
      errors.push('Champ binary.data manquant');
    } else {
      const binaryData = payload.binary.data;
      
      if (!binaryData.mimeType) {
        errors.push('binary.data.mimeType est obligatoire');
      }
      
      if (!binaryData.fileName) {
        errors.push('binary.data.fileName est obligatoire');
      }
      
      if (!binaryData.data || typeof binaryData.data !== 'string') {
        errors.push('binary.data.data doit être une string base64');
      }
      
      // Validation base64
      if (binaryData.data) {
        try {
          atob(binaryData.data);
        } catch {
          errors.push('binary.data.data doit être un base64 valide');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Test de connectivité avec le format JSON binaire
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 TEST CONNECTIVITÉ JSON BINAIRE N8N...');
      
      // Payload de test minimal
      const testPayload = {
        numero_facture: 'TEST-JSON-BIN',
        client_nom: 'Test Connectivité',
        client_email: 'test@myconfort.com',
        montant_ttc: 1.00,
        date_facture: new Date().toISOString().slice(0, 10),
        description_travaux: 'Test connectivité JSON binaire',
        
        binary: {
          data: {
            mimeType: 'application/pdf',
            fileName: 'test-connectivite.pdf',
            data: 'JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSPj4Kc3RyZWFtCkZha2UgUERGIGZvciB0ZXN0CmVuZHN0cmVhbQplbmRvYmoKdHJhaWxlcgo8PC9Sb290IDEgMCBSPj4K',
            size: 85
          }
        },
        
        _debug: {
          source: 'TEST-CONNECTIVITE',
          format: 'JSON-BINARY',
          timestamp: new Date().toISOString()
        }
      };
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MYCONFORT-Test/1.0'
        },
        body: JSON.stringify(testPayload)
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        const successMessage = `✅ Connectivité JSON binaire OK (${latency}ms)`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          latency
        };
      } else {
        const errorMessage = `❌ Test connectivité échoué: HTTP ${response.status}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          latency
        };
      }
      
    } catch (error: any) {
      const latency = Date.now() - startTime;
      const errorMessage = `❌ Erreur test connectivité: ${error.message}`;
      console.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        latency
      };
    }
  }
}
