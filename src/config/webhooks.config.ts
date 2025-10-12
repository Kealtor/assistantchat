/**
 * Webhook Configuration
 * 
 * Configure webhooks for dashboard card refresh actions.
 * Each webhook can be triggered when users refresh specific dashboard cards.
 */

export interface WebhookConfig {
  /** Unique identifier for the webhook */
  id: string;
  /** Display name for the webhook */
  name: string;
  /** The webhook URL to call */
  url: string;
  /** HTTP method to use */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** 
   * Payload template function
   * Receives context data and returns the payload to send
   */
  getPayload?: (context: WebhookContext) => any;
  /** Whether the webhook is enabled */
  enabled: boolean;
}

export interface WebhookContext {
  userId: string;
  cardType: 'daily_inspiration' | 'daily_reflection';
  timestamp: string;
  currentContent?: any;
}

/**
 * Webhook Configurations
 * 
 * To add a new webhook:
 * 1. Add a new WebhookConfig object to the array below
 * 2. Set the URL to your webhook endpoint
 * 3. Configure the method (GET, POST, etc.)
 * 4. Add any custom headers needed (e.g., API keys, auth tokens)
 * 5. Define the payload structure using the getPayload function
 * 6. Set enabled to true to activate
 * 
 * Example:
 * {
 *   id: 'daily_inspiration_webhook',
 *   name: 'Daily Inspiration Refresh',
 *   url: 'https://your-webhook-service.com/refresh-inspiration',
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer YOUR_API_KEY_HERE'
 *   },
 *   getPayload: (context) => ({
 *     user_id: context.userId,
 *     card_type: context.cardType,
 *     requested_at: context.timestamp,
 *     current_content: context.currentContent
 *   }),
 *   enabled: true
 * }
 */
export const webhookConfigs: WebhookConfig[] = [
  {
    id: 'daily_inspiration_webhook',
    name: 'Daily Inspiration Refresh',
    url: '', // Add your webhook URL here
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add your API key or authentication headers here
      // 'Authorization': 'Bearer YOUR_API_KEY'
    },
    getPayload: (context) => ({
      user_id: context.userId,
      card_type: context.cardType,
      timestamp: context.timestamp,
      current_content: context.currentContent
    }),
    enabled: false // Set to true to enable
  },
  {
    id: 'daily_reflection_webhook',
    name: 'Daily Reflection Refresh',
    url: '', // Add your webhook URL here
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add your API key or authentication headers here
      // 'Authorization': 'Bearer YOUR_API_KEY'
    },
    getPayload: (context) => ({
      user_id: context.userId,
      card_type: context.cardType,
      timestamp: context.timestamp,
      current_content: context.currentContent
    }),
    enabled: false // Set to true to enable
  }
];

/**
 * Get webhook configuration by ID
 */
export const getWebhookById = (id: string): WebhookConfig | undefined => {
  return webhookConfigs.find(webhook => webhook.id === id);
};

/**
 * Get all enabled webhooks
 */
export const getEnabledWebhooks = (): WebhookConfig[] => {
  return webhookConfigs.filter(webhook => webhook.enabled);
};
