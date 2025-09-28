/**
 * 🔗 UTILITAIRE URL WEBHOOK N8N
 * ============================
 * Gère automatiquement l'URL du webhook selon l'environnement
 * - Production (Netlify): utilise le proxy /api/n8n/*
 * - Développement: utilise l'URL directe
 */

import { configService } from '../services/configService';
import { getCurrentSession, ensureOpenSession } from '../services/sessionService';

export class WebhookUrlHelper {
  private static isProd(): boolean {
    try {
      const meta = (import.meta as unknown as { env?: { PROD?: boolean } });
      return Boolean(meta.env && meta.env.PROD);
    } catch {
      return false;
    }
  }
  /**
   * Retourne l'URL du webhook adaptée à l'environnement
   */
  static getWebhookUrl(
    endpoint: string = 'webhook/facture-universelle'
  ): string {
    // 🚀 UTILISER LE PROXY NETLIFY/VITE POUR ÉVITER CORS EN DÉVELOPPEMENT ET PRODUCTION
    console.log('🔍 WebhookUrlHelper - Environment check:', {
      isProd: this.isProd(),
      hostname: window.location.hostname,
      willUseProxy:
        this.isProd() || window.location.hostname === 'localhost',
    });

    // En production (Netlify) ET en développement local, utilise le proxy pour éviter CORS
    if (this.isProd() || window.location.hostname === 'localhost') {
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
   * Ajoute des paramètres de requête à une URL (relative ou absolue)
   */
  static appendQueryParams(
    url: string,
    params: Record<string, string | number | boolean | undefined | null>
  ): string {
    try {
      // Supporte les URLs relatives en utilisant l'origine courante
      const base = url.startsWith('http')
        ? new URL(url)
        : new URL(url, window.location.origin);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          base.searchParams.set(key, String(value));
        }
      });

      // Si l'URL initiale était relative, retourner un chemin relatif
      if (!url.startsWith('http')) {
        return base.pathname + (base.search ? base.search : '');
      }
      return base.toString();
    } catch {
      // En cas d'échec, retourner l'URL d'origine
      return url;
    }
  }

  /**
   * Retourne un identifiant de session stable pour servir de clé (key)
   */
  static getSessionKey(): string {
    const session = getCurrentSession() ?? ensureOpenSession().data ?? null;
    return session?.id ?? 'anonymous';
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
    return this.isProd();
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
      environment: this.isProd() ? 'production' : 'development',
      usingProxy: this.isUsingProxy(),
      webhookUrl: this.getWebhookUrl(),
      directUrl: this.getDirectUrl(),
    };
  }
}

export default WebhookUrlHelper;
