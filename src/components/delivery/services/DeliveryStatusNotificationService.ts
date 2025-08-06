import { DeliveryStatus } from '../DeliveryStatusSelector';

// Service pour notifier les changements vers N8N
export class DeliveryStatusNotificationService {
  private static webhookUrl = 'https://n8n.srv765811.hstgr.cloud/webhook/sync/status-update';
  
  static async notifyStatusChange(
    invoiceNumber: string,
    productName: string,
    newStatus: DeliveryStatus,
    oldStatus?: DeliveryStatus
  ): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber,
          productName,
          newStatus,
          oldStatus,
          timestamp: new Date().toISOString(),
          source: 'facturation-app'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Statut notifié avec succès:', result);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur notification statut:', error);
      return false;
    }
  }
}
