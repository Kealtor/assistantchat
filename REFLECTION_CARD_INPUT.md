# Reflection Card Input Documentation

## Overview

The Quick Reflection card displays personalized reflection prompts to encourage users to engage in self-reflection. This document describes the data structure and format expected by the reflection card.

## Data Structure

### Card Type
- **Card Type ID**: `reflection`
- **Database Table**: `card_content`
- **Component**: `QuickReflectionWidget.tsx`

### Content Format

The reflection card expects content in the following JSON structure:

```typescript
interface ReflectionContent {
  title: string;      // Main heading for the reflection card
  subtitle: string;   // The reflection prompt or question
}
```

### Example Content

```json
{
  "title": "Quick Reflection",
  "subtitle": "What's one thing you're grateful for today?"
}
```

```json
{
  "title": "Evening Check-in",
  "subtitle": "How did you show up for yourself today?"
}
```

```json
{
  "title": "Mindful Moment",
  "subtitle": "What emotion are you experiencing right now?"
}
```

## Storage

### Database Record
Content is stored in the `card_content` table:

```sql
INSERT INTO card_content (user_id, card_type, content, updated_at)
VALUES (
  '<user_uuid>',
  'reflection',
  '{"title": "Quick Reflection", "subtitle": "What brought you joy today?"}'::jsonb,
  NOW()
);
```

### Via API

Using the card content API:

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/update-card' \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cardType": "reflection",
    "content": {
      "title": "Quick Reflection",
      "subtitle": "What brought you joy today?"
    }
  }'
```

## Update Behavior

### When User Clicks Refresh

1. **Webhook Trigger**: If configured, triggers the `daily_reflection_webhook` (see `WEBHOOK_CONFIGURATION.md`)
2. **Content Update**: External service (like n8n) should update the card content via API
3. **Real-time Display**: Component automatically receives updates via Supabase subscription
4. **User Interaction**: User can tap the card to open journal area with the prompt

### Webhook Payload Sent

When the refresh button is clicked, the following data is sent to the configured webhook:

```json
{
  "userId": "<user_uuid>",
  "cardType": "daily_reflection",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "currentContent": {
    "title": "Quick Reflection",
    "subtitle": "Current prompt text"
  }
}
```

## Default Content

If no custom content is set, the card displays:

```json
{
  "title": "Quick Reflection",
  "subtitle": "Tap to start journaling..."
}
```

This placeholder is defined in the component's initial state.

## Best Practices

### Writing Reflection Prompts

1. **Keep it concise**: Subtitles should be short questions or prompts (ideally under 60 characters)
2. **Be specific**: Ask about specific emotions, actions, or experiences
3. **Use open-ended questions**: Encourage thoughtful responses rather than yes/no answers
4. **Vary the focus**: Rotate between gratitude, emotions, achievements, and challenges
5. **Match the time of day**: Morning prompts can focus on intentions, evening on reflections

### Example Prompt Categories

**Gratitude Prompts:**
- "What's one thing you're grateful for today?"
- "Who made a positive impact on you recently?"

**Emotional Check-ins:**
- "How are you feeling right now?"
- "What emotion needs your attention today?"

**Achievement Focus:**
- "What's one win you had today, no matter how small?"
- "What are you proud of accomplishing?"

**Challenge Reflection:**
- "What's one thing you learned from a recent challenge?"
- "What would make today feel successful?"

**Self-Care:**
- "How did you show up for yourself today?"
- "What does your body need right now?"

## Technical Integration

### Component Usage

The QuickReflectionWidget component handles:
- Loading content from `cardContentService`
- Real-time content updates via Supabase subscriptions
- Loading states with skeleton UI
- Refresh button with webhook triggering
- Click interaction to open journal area

### Service Layer

Content is managed through:
- `cardContentService.getCardContent('reflection')` - Fetch content
- `cardContentService.updateCard()` - Update content
- `cardContentService.subscribeToCardUpdates('reflection', callback)` - Real-time updates

### Webhook Configuration

Webhook setup is in `src/config/webhooks.config.ts`:

```typescript
{
  id: 'daily_reflection_webhook',
  name: 'Daily Reflection Refresh',
  url: 'https://your-webhook-url.com/reflection',
  method: 'POST',
  enabled: false, // Set to true to enable
  getPayload: (context: WebhookContext) => ({
    userId: context.userId,
    cardType: context.cardType,
    timestamp: context.timestamp,
    currentContent: context.currentContent
  })
}
```

## Related Documentation

- `API_DOCUMENTATION.md` - Card content API endpoints
- `WEBHOOK_CONFIGURATION.md` - Webhook setup and configuration
- `DAILY_INSPIRATION_REFRESH.md` - Similar refresh flow for inspiration card
