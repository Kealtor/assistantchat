# Daily Inspiration Card Refresh Flow

## Overview

When a user clicks the refresh button on the Daily Inspiration card, the system goes through multiple steps to update the content, which can result in temporary dummy data being displayed before the actual refreshed content appears.

## Refresh Flow Sequence

### 1. Initial Button Click
- **Location**: `src/components/dashboard/HeroCard.tsx` - `handleRefresh()` function
- **Action**: User clicks the refresh button (RefreshCw icon)
- **Visual Feedback**: Button becomes disabled and the icon starts spinning

### 2. Webhook Trigger Attempt
```typescript
await webhookService.trigger('daily_inspiration_webhook', {
  userId: user.id,
  cardType: 'daily_inspiration',
  timestamp: new Date().toISOString(),
  currentContent: { message }
});
```
- **Configuration**: `src/config/webhooks.config.ts`
- **Current Status**: Webhook is **disabled** by default (as shown in console logs)
- **Behavior**: If disabled, this step logs "Webhook disabled: daily_inspiration_webhook" and continues

### 3. Dashboard Service Refresh Call
- **Location**: `src/services/dashboardService.ts` - `refreshHeroMessage()`
- **Action**: Returns a random message from a predefined array of dummy messages
- **Delay**: Simulates API call with 800ms timeout
- **Dummy Messages**:
  1. "Your consistency is building something powerful. Keep showing up for yourself."
  2. "Small steps lead to big changes. What will you choose to focus on today?"
  3. "You're making progress, even when it doesn't feel like it. Trust the process."
  4. "Today is another opportunity to grow. What matters most to you right now?"

### 4. Content Display Pattern

#### Why Dummy Data Appears First

The dummy data appears because:

1. **Synchronous State Update**: The parent component immediately updates its local state with the result from `dashboardService.refreshHeroMessage()`, which returns one of the hardcoded dummy messages.

2. **No Real-time Integration**: Currently, the refresh handler uses mock data instead of:
   - Calling an external API
   - Updating the `card_content` table in Supabase
   - Subscribing to real-time database changes

3. **Missing Card Content Service Integration**: Unlike the `QuickReflectionWidget` which subscribes to card updates via `cardContentService.subscribeToCardUpdates()`, the HeroCard doesn't have this real-time subscription to update when card_content changes.

## Expected vs. Actual Behavior

### Current Behavior (Mock Implementation)
```
User clicks refresh
  ↓
Webhook attempt (disabled - logs message)
  ↓
Get random dummy message (800ms delay)
  ↓
Display dummy message immediately
  ↓
[END - No further updates]
```

### Production Behavior (When Properly Configured)
```
User clicks refresh
  ↓
Webhook triggers external service (e.g., n8n workflow)
  ↓
Display loading state
  ↓
External service generates personalized content
  ↓
External service updates card_content table via Supabase
  ↓
Real-time subscription detects change
  ↓
Card updates with actual personalized content
```

## How to Enable Proper Refresh Flow

### Step 1: Enable Webhook
Edit `src/config/webhooks.config.ts`:
```typescript
{
  id: 'daily_inspiration_webhook',
  name: 'Daily Inspiration Refresh',
  url: 'YOUR_N8N_WEBHOOK_URL', // Add your webhook URL
  enabled: true, // Change to true
  // ... rest of config
}
```

### Step 2: Configure External Service
Your external service (e.g., n8n workflow) should:
1. Receive the webhook payload
2. Generate personalized content using AI or other logic
3. Update the Supabase `card_content` table:

```sql
UPDATE card_content 
SET content = jsonb_set(content, '{message}', '"Your personalized message here"')
WHERE card_type = 'hero' 
AND user_id = 'USER_ID_FROM_WEBHOOK';
```

### Step 3: Add Real-time Subscription
The HeroCard component should subscribe to changes:
```typescript
useEffect(() => {
  const subscription = cardContentService.subscribeToCardUpdates(
    'hero',
    (payload) => {
      if (payload.new?.content?.message) {
        setMessage(payload.new.content.message);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

## Current Limitations

1. **No Persistence**: Refreshed messages are not saved to the database
2. **No Personalization**: Messages are randomly selected from a fixed array
3. **No Loading State**: No intermediate state between old and new content
4. **No Error Handling**: Failed webhooks don't provide user feedback
5. **No Real-time Updates**: Card doesn't automatically update when database changes

## Related Files

- `src/components/dashboard/HeroCard.tsx` - UI component with refresh button
- `src/services/dashboardService.ts` - Mock refresh implementation
- `src/services/webhookService.ts` - Webhook triggering logic
- `src/config/webhooks.config.ts` - Webhook configuration
- `src/services/cardContentService.ts` - Database operations for card content
- `WEBHOOK_CONFIGURATION.md` - Detailed webhook setup guide

## Console Logs Reference

When refresh is triggered, you'll see:
```
Webhook disabled: daily_inspiration_webhook
```

This indicates the webhook is not configured/enabled and the refresh is using mock data.
