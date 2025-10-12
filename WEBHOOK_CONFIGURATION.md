# Webhook Configuration Guide

This guide explains how to configure webhooks for the Daily Inspiration and Daily Reflection card refresh buttons.

## Overview

When users click the refresh button on dashboard cards, the system can trigger webhooks to notify external services or trigger custom workflows. This is useful for:

- Logging user interactions
- Triggering AI content generation
- Updating external systems
- Analytics and tracking

## Configuration Location

Webhook configurations are defined in: `src/config/webhooks.config.ts`

## How to Configure a Webhook

### 1. Open the Configuration File

Navigate to `src/config/webhooks.config.ts` and locate the `webhookConfigs` array.

### 2. Configure Your Webhook

Each webhook has the following properties:

```typescript
{
  id: 'daily_inspiration_webhook',           // Unique identifier
  name: 'Daily Inspiration Refresh',         // Display name for logging
  url: 'https://your-api.com/webhook',      // Your webhook URL
  method: 'POST',                            // HTTP method: GET, POST, PUT, PATCH
  headers: {                                 // Custom headers
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'   // Add your API key here
  },
  getPayload: (context) => ({               // Define the payload structure
    user_id: context.userId,
    card_type: context.cardType,
    timestamp: context.timestamp,
    current_content: context.currentContent
  }),
  enabled: true                              // Set to true to activate
}
```

### 3. Available Webhooks

#### Daily Inspiration Webhook
- **ID**: `daily_inspiration_webhook`
- **Triggered when**: User clicks refresh on the Daily Inspiration card
- **Card Type**: `daily_inspiration`

#### Daily Reflection Webhook
- **ID**: `daily_reflection_webhook`
- **Triggered when**: User clicks refresh on the Daily Reflection card
- **Card Type**: `daily_reflection`

## Configuration Steps

### Step 1: Set Your Webhook URL

Replace the empty `url` field with your webhook endpoint:

```typescript
url: 'https://your-webhook-service.com/api/refresh'
```

### Step 2: Add Authentication Headers

If your webhook requires authentication, add the appropriate headers:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer sk_live_your_api_key_here',
  'X-Custom-Header': 'custom-value'
}
```

### Step 3: Customize the Payload

The `getPayload` function receives a context object with:

- `userId`: The authenticated user's ID
- `cardType`: Either `'daily_inspiration'` or `'daily_reflection'`
- `timestamp`: ISO timestamp of when the refresh was triggered
- `currentContent`: The current content of the card (if available)

Customize the payload structure to match your webhook's expectations:

```typescript
getPayload: (context) => ({
  user: context.userId,
  action: 'refresh',
  card: context.cardType,
  time: context.timestamp,
  metadata: {
    current_message: context.currentContent
  }
})
```

### Step 4: Enable the Webhook

Set `enabled: true` to activate the webhook:

```typescript
enabled: true
```

## Example Configuration

Here's a complete example for a daily inspiration webhook:

```typescript
{
  id: 'daily_inspiration_webhook',
  name: 'Daily Inspiration Refresh',
  url: 'https://api.example.com/v1/inspiration/refresh',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_live_abc123xyz',
    'X-App-Version': '1.0'
  },
  getPayload: (context) => ({
    user_id: context.userId,
    action: 'refresh_inspiration',
    timestamp: context.timestamp,
    current_message: context.currentContent?.message,
    source: 'dashboard'
  }),
  enabled: true
}
```

## Testing Your Webhook

1. Configure your webhook as described above
2. Save the file
3. Navigate to the dashboard
4. Click the refresh button on the configured card
5. Check your webhook endpoint logs to verify the request was received

## Webhook Request Format

The webhook will receive a POST request (or your configured method) with:

**Headers:**
- All headers defined in the `headers` configuration
- Any default headers from the fetch API

**Body** (for POST/PUT/PATCH):
```json
{
  "user_id": "user-uuid-here",
  "card_type": "daily_inspiration",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "current_content": {
    // Current card content if available
  }
}
```

## Disabling a Webhook

To disable a webhook without removing its configuration, set:

```typescript
enabled: false
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit API keys directly in code**
   - Use environment variables for sensitive data
   - Consider using a secrets management system

2. **Validate webhook signatures**
   - If your webhook provider supports signatures (like GitHub or Stripe), verify them

3. **Use HTTPS URLs only**
   - Never use HTTP for production webhooks

4. **Rate limiting**
   - Consider implementing rate limiting on your webhook endpoint

5. **Authentication**
   - Always use proper authentication headers

## Troubleshooting

### Webhook Not Firing
- Check that `enabled: true` is set
- Verify the `url` field is not empty
- Check browser console for errors

### Authentication Errors
- Verify your API key is correct
- Check that the `Authorization` header format matches your API's requirements

### Payload Issues
- Check your webhook endpoint logs
- Verify the `getPayload` function returns the expected structure

## Support

For additional help, refer to:
- Browser console logs (shows webhook trigger attempts)
- Your webhook endpoint logs (shows received requests)
- Network tab in browser DevTools (inspect actual requests)
