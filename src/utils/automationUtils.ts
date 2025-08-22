// 🎯 Utilitaire de surveillance pour l'automatisation
// Fonctions helper pour le système de monitoring

export interface OperationMetrics {
  count: number;
  threshold: number;
  lastOperation: string;
  timestamp: Date;
}

export class AutomationMonitor {
  private static readonly STORAGE_KEY = 'mycomfort_operation_count';
  private static readonly DEFAULT_THRESHOLD = 3;

  static getOperationCount(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  static incrementOperation(reason: string): boolean {
    const currentCount = this.getOperationCount() + 1;

    try {
      localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
      console.log(`🔢 Opération #${currentCount}: ${reason}`);

      if (currentCount >= this.DEFAULT_THRESHOLD) {
        console.log('🚨 Seuil atteint - Déclenchement automatique recommandé');
        return true;
      }

      const remaining = this.DEFAULT_THRESHOLD - currentCount;
      console.log(`⏳ ${remaining} opération(s) restante(s)`);
      return false;
    } catch (error) {
      console.error("❌ Erreur lors de l'incrémentation:", error);
      return false;
    }
  }

  static resetCounter(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, '0');
      console.log('🔄 Compteur remis à zéro');
    } catch (error) {
      console.error('❌ Erreur lors de la remise à zéro:', error);
    }
  }

  static getMetrics(): OperationMetrics {
    return {
      count: this.getOperationCount(),
      threshold: this.DEFAULT_THRESHOLD,
      lastOperation: 'N/A',
      timestamp: new Date(),
    };
  }
}

// Hook React pour l'automatisation
export const useAutomationMonitor = () => {
  const triggerOperation = (reason: string) => {
    const shouldTrigger = AutomationMonitor.incrementOperation(reason);

    if (shouldTrigger) {
      // En mode développement, on peut déclencher des actions automatiques
      console.log('🤖 Recommandation: Exécuter ./auto-save-push.sh');
    }

    return shouldTrigger;
  };

  return {
    triggerOperation,
    getMetrics: AutomationMonitor.getMetrics,
    resetCounter: AutomationMonitor.resetCounter,
  };
};
