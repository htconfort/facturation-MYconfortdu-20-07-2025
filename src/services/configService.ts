/**
 * 🔧 SERVICE DE CONFIGURATION CENTRALISÉ
 * =====================================
 * Gestion unifiée de toutes les variables d'environnement
 * avec validation et valeurs par défaut
 */

interface AppConfig {
  // ☁️ Google Drive
  googleDrive: {
    apiKey: string;
    clientId: string;
    mainFolderId: string;
  };

  // 🔗 N8N Webhook
  n8n: {
    webhookUrl: string;
    secret?: string;
  };

  // 🏢 Entreprise
  company: {
    name: string;
    phone: string;
    email: string;
    address: string;
    siret: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };

  // 📄 PDF
  pdf: {
    quality: number;
    maxSizeMB: number;
    compression: boolean;
  };

  // ⚙️ Application
  app: {
    debugMode: boolean;
    consoleLogs: boolean;
    autoSaveInterval: number;
    maxProductsPerInvoice: number;
    defaultTaxRate: number;
    currency: string;
  };

  // 🔄 Sauvegarde
  backup: {
    enabled: boolean;
    intervalHours: number;
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    return {
      googleDrive: {
        apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '',
        clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
        mainFolderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '',
      },

      n8n: {
        webhookUrl:
          import.meta.env.VITE_N8N_WEBHOOK_URL ||
          'https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle',
        secret: import.meta.env.VITE_N8N_WEBHOOK_SECRET,
      },

      company: {
        name: import.meta.env.VITE_COMPANY_NAME || 'MYCONFORT',
        phone: import.meta.env.VITE_COMPANY_PHONE || '06 61 48 60 23',
        email: import.meta.env.VITE_COMPANY_EMAIL || 'htconfort@gmail.com',
        address: import.meta.env.VITE_COMPANY_ADDRESS || '88, avenue des Ternes, 75017 Paris',
        siret: import.meta.env.VITE_COMPANY_SIRET || '824 313 530 00027',
        iban: import.meta.env.VITE_COMPANY_IBAN || '',
        bic: import.meta.env.VITE_COMPANY_BIC || '',
        bankName: import.meta.env.VITE_COMPANY_BANK || '',
      },

      pdf: {
        quality: parseFloat(import.meta.env.VITE_PDF_QUALITY) || 0.8,
        maxSizeMB: parseInt(import.meta.env.VITE_PDF_MAX_SIZE_MB) || 5,
        compression: import.meta.env.VITE_PDF_COMPRESSION === 'true',
      },

      app: {
        debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        consoleLogs: import.meta.env.VITE_CONSOLE_LOGS === 'true',
        autoSaveInterval:
          parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL) || 60000,
        maxProductsPerInvoice:
          parseInt(import.meta.env.VITE_MAX_PRODUCTS_PER_INVOICE) || 50,
        defaultTaxRate: parseFloat(import.meta.env.VITE_DEFAULT_TAX_RATE) || 20,
        currency: import.meta.env.VITE_CURRENCY || 'EUR',
      },

      backup: {
        enabled: import.meta.env.VITE_BACKUP_ENABLED === 'true',
        intervalHours:
          parseInt(import.meta.env.VITE_BACKUP_INTERVAL_HOURS) || 24,
      },
    };
  }

  private validateConfig(): void {
    const issues: string[] = [];

    // Validation Google Drive (optionnel)
    if (this.config.googleDrive.apiKey && !this.config.googleDrive.clientId) {
      issues.push('VITE_GOOGLE_DRIVE_CLIENT_ID requis si API key fournie');
    }

    // Validation N8N
    if (!this.config.n8n.webhookUrl) {
      issues.push('VITE_N8N_WEBHOOK_URL manquant');
    }

    // Log des problèmes en mode développement
    if (issues.length > 0 && import.meta.env.DEV) {
      console.warn('🔧 Problèmes de configuration détectés:', issues);
    }
  }

  // Getters pour accéder à la configuration
  get googleDrive() {
    return this.config.googleDrive;
  }
  get n8n() {
    return this.config.n8n;
  }
  get company() {
    return this.config.company;
  }
  get pdf() {
    return this.config.pdf;
  }
  get app() {
    return this.config.app;
  }
  get backup() {
    return this.config.backup;
  }

  // Méthodes utilitaires
  isGoogleDriveConfigured(): boolean {
    return !!(
      this.config.googleDrive.apiKey && this.config.googleDrive.clientId
    );
  }

  isN8NConfigured(): boolean {
    return !!this.config.n8n.webhookUrl;
  }

  // Méthode pour afficher l'état de la configuration
  getConfigStatus(): {
    service: string;
    configured: boolean;
    required: boolean;
  }[] {
    return [
      {
        service: 'Google Drive',
        configured: this.isGoogleDriveConfigured(),
        required: false,
      },
      {
        service: 'N8N Webhook',
        configured: this.isN8NConfigured(),
        required: true,
      },
    ];
  }

  // Méthode pour logs de debug
  logConfig(): void {
    if (this.config.app.debugMode && this.config.app.consoleLogs) {
      console.group('🔧 Configuration Application');
      console.log('Google Drive configuré:', this.isGoogleDriveConfigured());
      console.log('N8N configuré:', this.isN8NConfigured());
      console.log('Mode debug:', this.config.app.debugMode);
      console.log('Sauvegarde auto:', this.config.backup.enabled);
      console.groupEnd();
    }
  }
}

// Export de l'instance singleton
export const configService = ConfigService.getInstance();

// Export du type pour TypeScript
export type { AppConfig };
