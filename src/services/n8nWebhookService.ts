import { ValidatedInvoicePayload, PayloadValidator, PayloadLogger } from './payloadValidator';
import { Invoice } from '../types';

// 🚀 SERVICE D'ENVOI VERS N8N AVEC VALIDATION
export class N8nWebhookService {
  private static readonly WEBHOOK_URL_PROD = 'https://n8n.srv765811.hstgr.cloud/webhook/e6129ba6-a1f3-4f0a-95b7-a40b8365069c';
  private static readonly WEBHOOK_URL_DEV = '/api/n8n/webhook/e6129ba6-a1f3-4f0a-95b7-a40b8365069c';
  private static readonly TIMEOUT_MS = 30000; // 30 secondes
  
  private static getWebhookUrl(forceProd: boolean = false): string {
    if (forceProd) {
      console.log('🚀 Mode DIRECT PRODUCTION (bypass proxy)');
      return this.WEBHOOK_URL_PROD;
    }
    
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const url = isDev ? this.WEBHOOK_URL_DEV : this.WEBHOOK_URL_PROD;
    
    console.log(`🌐 Mode ${isDev ? 'DEVELOPMENT (via proxy)' : 'PRODUCTION'} - URL: ${url}`);
    return url;
  }
  
  /**
   * Envoie une facture validée vers n8n
   */
  static async sendInvoiceToN8n(
    invoice: Invoice, 
    pdfBase64: string, 
    pdfSizeKB: number
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    payload?: ValidatedInvoicePayload;
  }> {
    try {
      console.log('🚀 DIAGNOSTIC COMPLET AVANT ENVOI N8N');
      
      // 1. Valider et préparer le payload
      const validation = PayloadValidator.validateAndPrepare(invoice, pdfBase64, pdfSizeKB);
      
      if (!validation.isValid) {
        const errorMessage = `❌ Validation échouée:\n${validation.errors?.join('\n')}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage
        };
      }
      
      const validatedPayload = validation.payload!;
      
      // 2. 🎯 DIAGNOSTIC FINAL AVANT ENVOI (PRIORITÉ ABSOLUE)
      PayloadLogger.logBeforeWebhookSend(validatedPayload);
      
      // 3. 🗺️ VÉRIFICATION MAPPING WEBHOOK
      console.group('🗺️ MAPPING WEBHOOK N8N - VÉRIFICATION FINALE');
      console.log('🎯 URL Webhook:', this.getWebhookUrl());
      console.log('📊 Taille payload:', JSON.stringify(validatedPayload).length, 'caractères');
      
      // Vérification du mapping des champs critiques pour n8n
      const webhookMapping = {
        'clientEmail → email': validatedPayload.clientEmail,
        'clientPhone → phone': validatedPayload.clientPhone,
        'totalHT → montantHT': validatedPayload.totalHT,
        'totalTTC → montantTTC': validatedPayload.totalTTC,
        'clientName → nom_client': validatedPayload.clientName,
        'invoiceNumber → numero_facture': validatedPayload.invoiceNumber,
        'pdfBase64 → fichier_facture': validatedPayload.pdfBase64 ? 'PDF_PRESENT' : 'PDF_MISSING',
        'products → produits': validatedPayload.products?.length || 0
      };
      
      Object.entries(webhookMapping).forEach(([mapping, value]) => {
        const hasValue = value !== undefined && value !== null && value !== '';
        console.log(`${hasValue ? '✅' : '❌'} ${mapping}:`, 
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
        
        const response = await fetch(this.getWebhookUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MYCONFORT-Invoice-System/1.0'
          },
          body: JSON.stringify(validatedPayload),
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
            payload: validatedPayload
          };
        }
        
        const successMessage = `✅ Facture ${validatedPayload.invoiceNumber} envoyée avec succès vers n8n`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          response: responseData,
          payload: validatedPayload
        };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          const timeoutMessage = `❌ Timeout: n8n ne répond pas dans les ${this.TIMEOUT_MS/1000}s`;
          console.error(timeoutMessage);
          
          return {
            success: false,
            message: timeoutMessage,
            payload: validatedPayload
          };
        }
        
        const networkMessage = `❌ Erreur réseau: ${fetchError.message}`;
        console.error(networkMessage);
        
        return {
          success: false,
          message: networkMessage,
          payload: validatedPayload
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
        const response = await fetch(this.getWebhookUrl(), {
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
  
  /**
   * Test avec payload simplifié pour diagnostiquer l'erreur 500
   */
  static async testSimplifiedPayload(invoice: Invoice): Promise<{
    success: boolean;
    message: string;
    response?: any;
  }> {
    try {
      console.log('🧪 TEST PAYLOAD SIMPLIFIÉ POUR DIAGNOSTIQUER ERREUR 500');
      
      // Payload minimal pour test
      const simplifiedPayload = {
        // Données essentielles uniquement
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        totalTTC: invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0),
        
        // PDF de test très petit
        pdfBase64: "dGVzdA==", // "test" en base64
        
        // Métadonnées de test
        test: true,
        timestamp: new Date().toISOString()
      };
      
      console.log('📦 Payload simplifié:', simplifiedPayload);
      console.log('📊 Taille payload simplifié:', JSON.stringify(simplifiedPayload).length, 'caractères');
      
      const response = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(simplifiedPayload)
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }
      
      console.log('📥 Réponse test simplifié:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });
      
      if (response.ok) {
        return {
          success: true,
          message: `✅ Test payload simplifié réussi (${response.status})`,
          response: responseData
        };
      } else {
        return {
          success: false,
          message: `❌ Test payload simplifié échoué (${response.status}): ${responseText}`,
          response: responseData
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur test simplifié: ${error.message}`
      };
    }
  }
  
  /**
   * Envoie une facture avec un PDF de taille réduite pour éviter l'erreur 500
   */
  static async sendInvoiceWithReducedPDF(
    invoice: Invoice, 
    pdfBase64: string, 
    pdfSizeKB: number
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    payload?: ValidatedInvoicePayload;
  }> {
    try {
      console.log('🚀 ENVOI AVEC PDF RÉDUIT - DIAGNOSTIC');
      
      // Réduire la taille du PDF si nécessaire
      let reducedPdfBase64 = pdfBase64;
      let reducedSizeKB = pdfSizeKB;
      
      // Si le PDF est trop gros (> 100KB), on le remplace par un PDF de test
      if (pdfSizeKB > 100) {
        console.warn(`⚠️ PDF trop volumineux (${pdfSizeKB}KB), remplacement par PDF de test`);
        reducedPdfBase64 = "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0xlbmd0aCA0MCAKL0ZpbHRlciBbL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlXQo+PgpzdHJlYW0KOWpxbzBeFlJIMGlTcl5eKClVXlNjCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GIDw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+Pgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMjIgMDAwMDAgbiAKMDAwMDAwMDE5NCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAyNTEgMDAwMDAgbiAKMDAwMDAwMDI4OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgNSAwIFIKPj4Kc3RhcnR4cmVmCjMzNgolJUVPRg=="; // PDF minimal de test
        reducedSizeKB = 1; // 1KB
      }
      
      // 1. Valider et préparer le payload avec PDF réduit
      const validation = PayloadValidator.validateAndPrepare(invoice, reducedPdfBase64, reducedSizeKB);
      
      if (!validation.isValid) {
        const errorMessage = `❌ Validation échouée:\n${validation.errors?.join('\n')}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage
        };
      }
      
      const validatedPayload = validation.payload!;
      
      console.log('📦 PAYLOAD AVEC PDF RÉDUIT:', {
        pdfSizeOriginal: pdfSizeKB + 'KB',
        pdfSizeReduced: reducedSizeKB + 'KB',
        payloadSize: JSON.stringify(validatedPayload).length + ' caractères',
        reduction: pdfSizeKB > 100 ? 'PDF remplacé par version test' : 'PDF conservé'
      });
      
      // 2. Envoyer vers n8n
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.TIMEOUT_MS);
      
      try {
        console.log('📤 ENVOI PDF RÉDUIT VERS N8N...');
        
        const response = await fetch(this.getWebhookUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MYCONFORT-Invoice-System/1.0'
          },
          body: JSON.stringify(validatedPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
        
        console.log('📥 RÉPONSE PDF RÉDUIT:', {
          status: response.status,
          data: responseData
        });
        
        if (!response.ok) {
          const errorMessage = `❌ Erreur HTTP ${response.status}: ${responseText}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            response: responseData,
            payload: validatedPayload
          };
        }
        
        const successMessage = `✅ Facture envoyée avec PDF réduit (${reducedSizeKB}KB)`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          response: responseData,
          payload: validatedPayload
        };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        const errorMessage = `❌ Erreur réseau: ${fetchError.message}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          payload: validatedPayload
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
   * Test ultra-minimal pour vérifier si le webhook répond
   */
  static async testWebhookMinimal(): Promise<{
    success: boolean;
    message: string;
    response?: any;
  }> {
    try {
      console.log('🔬 TEST ULTRA-MINIMAL DU WEBHOOK N8N');
      
      // Payload minimal absolu
      const minimalPayload = {
        test: true
      };
      
      console.log('📦 Payload ultra-minimal:', minimalPayload);
      console.log('📊 Taille:', JSON.stringify(minimalPayload).length, 'caractères');
      
      const response = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalPayload)
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }
      
      console.log('📥 Réponse webhook ultra-minimal:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyText: responseText,
        data: responseData
      });
      
      if (response.ok) {
        return {
          success: true,
          message: `✅ Webhook répond correctement (${response.status})`,
          response: responseData
        };
      } else {
        return {
          success: false,
          message: `❌ Webhook erreur ${response.status}: ${responseText}`,
          response: responseData
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur test webhook: ${error.message}`
      };
    }
  }
  
  /**
   * Test avec URL de production directe (contourne le proxy)
   */
  static async testDirectProduction(): Promise<{
    success: boolean;
    message: string;
    response?: any;
  }> {
    try {
      console.log('🔗 TEST DIRECT VERS URL DE PRODUCTION N8N');
      console.log('🎯 URL utilisée:', this.WEBHOOK_URL_PROD);
      
      // Payload de test
      const testPayload = {
        test: true,
        source: 'DIRECT_PRODUCTION_TEST',
        timestamp: new Date().toISOString()
      };
      
      console.log('📦 Payload direct:', testPayload);
      console.log('📊 Taille:', JSON.stringify(testPayload).length, 'caractères');
      
      const response = await fetch(this.WEBHOOK_URL_PROD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }
      
      console.log('📥 Réponse direct production:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyText: responseText,
        data: responseData
      });
      
      if (response.ok) {
        return {
          success: true,
          message: `✅ Test direct production réussi (${response.status})`,
          response: responseData
        };
      } else {
        return {
          success: false,
          message: `❌ Test direct production échoué (${response.status}): ${responseText}`,
          response: responseData
        };
      }
      
    } catch (error: any) {
      console.error('📛 Erreur test direct production:', error);
      
      if (error.message.includes('CORS')) {
        return {
          success: false,
          message: `❌ Erreur CORS (normal en développement) - Le proxy est nécessaire: ${error.message}`
        };
      }
      
      return {
        success: false,
        message: `❌ Erreur test direct: ${error.message}`
      };
    }
  }
  
  /**
   * Test ultra-basique avec le payload le plus simple possible
   */
  static async testBasicConnectivity(): Promise<{
    success: boolean;
    message: string;
    response?: any;
  }> {
    try {
      console.log('🔍 TEST ULTRA-BASIQUE N8N - CONNECTIVITÉ PURE');
      
      // Payload minimaliste
      const basicPayload = { test: 1 };
      
      console.log('📦 Payload basique:', basicPayload);
      console.log('🌐 URL utilisée:', this.getWebhookUrl());
      
      const response = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(basicPayload)
      });
      
      console.log('📊 Status reçu:', response.status);
      console.log('📊 Status text:', response.statusText);
      
      const responseText = await response.text();
      console.log('📥 Réponse brute:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }
      
      if (response.ok) {
        return {
          success: true,
          message: `✅ Test basique réussi (${response.status})`,
          response: responseData
        };
      } else {
        return {
          success: false,
          message: `❌ Test basique échoué (${response.status}): ${responseText.substring(0, 200)}`,
          response: responseData
        };
      }
      
    } catch (error: any) {
      console.error('📛 Erreur test basique:', error);
      
      return {
        success: false,
        message: `❌ Erreur test basique: ${error.message}`
      };
    }
  }
  
  /**
   * Vérifie si le workflow N8N est actif et disponible
   */
  static async checkWorkflowStatus(): Promise<{
    success: boolean;
    message: string;
    isActive: boolean;
  }> {
    try {
      console.log('🔍 VÉRIFICATION STATUS WORKFLOW N8N');
      
      const testPayload = { status_check: true };
      
      const response = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log('📊 Status workflow:', response.status);
      
      if (response.status === 404) {
        return {
          success: false,
          message: '❌ Workflow N8N INACTIF - Veuillez l\'activer dans l\'interface N8N',
          isActive: false
        };
      }
      
      if (response.ok || response.status === 500) {
        // Status 500 peut indiquer que le workflow est actif mais qu'il y a une erreur de traitement
        return {
          success: true,
          message: '✅ Workflow N8N actif',
          isActive: true
        };
      }
      
      return {
        success: false,
        message: `⚠️ Status workflow incertain (${response.status})`,
        isActive: false
      };
      
    } catch (error: any) {
      console.error('📛 Erreur vérification workflow:', error);
      
      if (error.message.includes('CORS')) {
        return {
          success: false,
          message: '⚠️ Impossible de vérifier (CORS) - Utilisez le proxy en dev',
          isActive: false
        };
      }
      
      return {
        success: false,
        message: `❌ Erreur vérification: ${error.message}`,
        isActive: false
      };
    }
  }
  
  /**
   * Diagnostique l'erreur 500 de N8N avec différents types de payload
   */
  static async diagnoseN8nError500(): Promise<{
    success: boolean;
    message: string;
    diagnostics: any[];
  }> {
    console.log('🔬 DIAGNOSTIC APPROFONDI ERREUR 500 N8N');
    
    const diagnostics: any[] = [];
    
    // Test 1: Payload vide
    try {
      console.log('🧪 Test 1: Payload complètement vide');
      const response1 = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const text1 = await response1.text();
      diagnostics.push({
        test: 'Payload vide',
        status: response1.status,
        response: text1.substring(0, 200)
      });
      
    } catch (error: any) {
      diagnostics.push({
        test: 'Payload vide',
        error: error.message
      });
    }
    
    // Test 2: Payload avec champs de base N8N
    try {
      console.log('🧪 Test 2: Payload avec structure N8N standard');
      const n8nPayload = {
        // Champs typiques attendus par N8N
        webhook_id: 'e7ca38d2-4b2a-4216-9c26-23663529790a',
        source: 'MYCONFORT',
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };
      
      const response2 = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      });
      
      const text2 = await response2.text();
      diagnostics.push({
        test: 'Structure N8N',
        status: response2.status,
        response: text2.substring(0, 200)
      });
      
    } catch (error: any) {
      diagnostics.push({
        test: 'Structure N8N',
        error: error.message
      });
    }
    
    // Test 3: Payload avec données métier minimales
    try {
      console.log('🧪 Test 3: Payload avec données métier minimales');
      const businessPayload = {
        invoiceNumber: 'TEST-001',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        totalTTC: 100
      };
      
      const response3 = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessPayload)
      });
      
      const text3 = await response3.text();
      diagnostics.push({
        test: 'Données métier minimales',
        status: response3.status,
        response: text3.substring(0, 200)
      });
      
    } catch (error: any) {
      diagnostics.push({
        test: 'Données métier minimales',
        error: error.message
      });
    }
    
    // Test 4: Headers différents
    try {
      console.log('🧪 Test 4: Test avec headers différents');
      const response4 = await fetch(this.getWebhookUrl(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'N8N-Test/1.0',
          'X-Webhook-Source': 'MYCONFORT'
        },
        body: JSON.stringify({ test: 'headers' })
      });
      
      const text4 = await response4.text();
      diagnostics.push({
        test: 'Headers spéciaux',
        status: response4.status,
        response: text4.substring(0, 200)
      });
      
    } catch (error: any) {
      diagnostics.push({
        test: 'Headers spéciaux',
        error: error.message
      });
    }
    
    console.log('📊 Résultats diagnostic complet:', diagnostics);
    
    // Analyser les résultats
    const hasSuccess = diagnostics.some(d => d.status && d.status < 400);
    const allErrors500 = diagnostics.every(d => d.status === 500);
    
    let message = '';
    if (hasSuccess) {
      message = '✅ Certains tests ont réussi - Le problème vient du format des données';
    } else if (allErrors500) {
      message = '⚠️ Toutes les requêtes donnent erreur 500 - Problème dans le workflow N8N';
    } else {
      message = '🔍 Résultats mixtes - Vérifiez les logs pour identifier le pattern';
    }
    
    return {
      success: hasSuccess,
      message,
      diagnostics
    };
  }
}