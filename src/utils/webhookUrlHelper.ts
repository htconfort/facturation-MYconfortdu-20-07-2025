/**
 * 🔗 UTILITAIRE URL WEBHOOK N8N
 * ============================
 * Gère automatiquement l'URL du webhook selon l'environnement
 * - Production (Netlify): utilise le proxy /api/n8n/*
 * - Développement: utilise l'URL directe
 */

import { configService } from '../services/configService';

export class WebhookUrlHelper {
  /**
   * Retourne l'URL du webhook adaptée à l'environnement
   */
  static getWebhookUrl(
    endpoint: string = 'webhook/facture-universelle'
  ): string {
    // 🚀 UTILISER LE PROXY NETLIFY/VITE POUR ÉVITER CORS EN DÉVELOPPEMENT ET PRODUCTION
    console.log('🔍 WebhookUrlHelper - Environment check:', {
      isProd: import.meta.env.PROD,
      hostname: window.location.hostname,
      willUseProxy:
        import.meta.env.PROD || window.location.hostname === 'localhost',
    });

    // En production (Netlify) ET en développement local, utilise le proxy pour éviter CORS
    if (import.meta.env.PROD || window.location.hostname === 'localhost') {
      const proxyUrl = `/api/n8n/${endpoint}`;
      console.log('✅ Using proxy URL:', proxyUrl);
      return proxyUrl;
    }

    // Fallback pour autres environnements (très rare)
    const baseUrl = configService.n8n.webhookUrl;

    // Si l'endpoint est déjà dans l'URL de base, ne le dupliquer pas
    if (baseUrl.includes(endpoint)) {
      return baseUrl;
    }

    // Sinon, construire l'URL complète
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Enlever le / final si présent
    return `${cleanBaseUrl}/${endpoint}`;
  }

  /**
   * Retourne l'URL directe (sans proxy) pour les tests
   */
  static getDirectUrl(
    endpoint: string = 'webhook/facture-universelle'
  ): string {
    const baseUrl = configService.n8n.webhookUrl;

    if (baseUrl.includes(endpoint)) {
      return baseUrl;
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/${endpoint}`;
  }

  /**
   * Vérifie si on est en mode proxy (production)
   */
  static isUsingProxy(): boolean {
    return import.meta.env.PROD;
  }

  /**
   * Retourne des informations de debug sur l'URL utilisée
   */
  static getDebugInfo(): {
    environment: string;
    usingProxy: boolean;
    webhookUrl: string;
    directUrl: string;
  } {
    return {
      environment: import.meta.env.PROD ? 'production' : 'development',
      usingProxy: this.isUsingProxy(),
      webhookUrl: this.getWebhookUrl(),
      directUrl: this.getDirectUrl(),
    };
  }
}

export default WebhookUrlHelper;
