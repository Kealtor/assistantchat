import { getWebhookById, WebhookContext } from '@/config/webhooks.config';

export const webhookService = {
  /**
   * Trigger a webhook by ID
   * @param webhookId The webhook configuration ID
   * @param context Context data to pass to the webhook
   * @returns Promise resolving to the webhook response or null if webhook is disabled/not found
   */
  async trigger(webhookId: string, context: WebhookContext): Promise<any> {
    const webhook = getWebhookById(webhookId);
    
    if (!webhook) {
      console.warn(`Webhook not found: ${webhookId}`);
      return null;
    }

    if (!webhook.enabled) {
      console.log(`Webhook disabled: ${webhookId}`);
      return null;
    }

    if (!webhook.url) {
      console.warn(`Webhook URL not configured: ${webhookId}`);
      return null;
    }

    try {
      const payload = webhook.getPayload ? webhook.getPayload(context) : context;
      
      console.log(`Triggering webhook: ${webhook.name}`, {
        url: webhook.url,
        method: webhook.method,
        payload
      });

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          ...webhook.headers,
        },
        body: webhook.method !== 'GET' ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Webhook completed successfully: ${webhook.name}`, data);
      
      return data;
    } catch (error) {
      console.error(`Error triggering webhook: ${webhook.name}`, error);
      throw error;
    }
  }
};
