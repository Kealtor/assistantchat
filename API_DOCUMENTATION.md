# Dashboard Card Content API Documentation

## Architecture Overview

- **Database**: `card_content` table stores dynamic content per user/card type
- **Edge Functions**: Three endpoints for CRUD operations with idempotency support
- **Authentication**: Supports both user JWT tokens and service role key for automation
- **Real-time**: Supabase real-time subscriptions for instant UI updates

## Endpoints

### 1. POST /update-card
Updates a single card's content for a user.

**URL**: `https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN or SERVICE_ROLE_KEY>
Content-Type: application/json
Idempotency-Key: <optional-unique-key>
```

**Request Body**:
```json
{
  "cardType": "hero",
  "content": {
    "message": "Great progress today! Keep it up.",
    "customField": "any data structure"
  },
  "userId": "optional-user-uuid-for-service-role-only"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "card_type": "hero",
    "user_id": "uuid",
    "content": { "message": "..." },
    "created_at": "2025-10-11T...",
    "updated_at": "2025-10-11T..."
  }
}
```

**Valid Card Types**: `hero`, `reflection`, `habits`, `journal`, `quickstart`, `roadmap`

---

### 2. POST /bulk-update-cards
Updates multiple cards in a single request.

**URL**: `https://paodisbyfnmiljjognxl.supabase.co/functions/v1/bulk-update-cards`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN or SERVICE_ROLE_KEY>
Content-Type: application/json
Idempotency-Key: <optional-unique-key>
```

**Request Body**:
```json
{
  "updates": [
    {
      "cardType": "hero",
      "content": { "message": "Welcome back!" }
    },
    {
      "cardType": "reflection",
      "content": { "preview": "What made you smile today?" }
    }
  ],
  "userId": "optional-user-uuid-for-service-role-only"
}
```

**Response** (200 OK or 207 Multi-Status):
```json
{
  "success": true,
  "processed": 2,
  "failed": 0,
  "results": [
    { "cardType": "hero", "success": true, "data": {...} },
    { "cardType": "reflection", "success": true, "data": {...} }
  ],
  "errors": []
}
```

---

### 3. GET /get-card
Retrieves card content for verification/testing.

**URL**: `https://paodisbyfnmiljjognxl.supabase.co/functions/v1/get-card?cardType=hero&userId=optional-uuid`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN or SERVICE_ROLE_KEY>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "card_type": "hero",
    "user_id": "uuid",
    "content": { "message": "..." },
    "created_at": "2025-10-11T...",
    "updated_at": "2025-10-11T..."
  }
}
```

---

## Authentication

### User JWT Token (for authenticated app users)
```bash
# Get token from Supabase auth session
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;
```

### Service Role Key (for n8n/automation)
```bash
# Use the service role key from Supabase dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Example Requests

### cURL: Update Single Card (User JWT)
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-123" \
  -d '{
    "cardType": "hero",
    "content": {
      "message": "You completed 5 habits today! Amazing consistency."
    }
  }'
```

### cURL: Bulk Update (Service Role)
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/bulk-update-cards \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: daily-update-2025-10-11" \
  -d '{
    "userId": "user-uuid-here",
    "updates": [
      {
        "cardType": "hero",
        "content": { "message": "Weekly review: 28/30 habits completed!" }
      },
      {
        "cardType": "reflection",
        "content": { "preview": "What was your biggest win this week?" }
      }
    ]
  }'
```

### cURL: Get Card Content
```bash
curl -X GET "https://paodisbyfnmiljjognxl.supabase.co/functions/v1/get-card?cardType=hero" \
  -H "Authorization: Bearer <USER_JWT_TOKEN>"
```

---

## n8n Workflow Integration

### High-Level Steps
1. **Trigger**: Schedule (Cron) or Webhook
2. **Authentication**: Store service role key in n8n credentials
3. **Data Preparation**: Build JSON payload with card updates
4. **HTTP Request**: POST to bulk-update-cards endpoint
5. **Error Handling**: Retry on failure, log results

### Minimal n8n Workflow JSON Export
```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyDay",
              "hour": 6,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Update Dashboard Cards",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "https://paodisbyfnmiljjognxl.supabase.co/functions/v1/bulk-update-cards",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "method": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "Idempotency-Key",
              "value": "={{$now.format('yyyy-MM-dd')}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "userId",
              "value": "USER_UUID_HERE"
            },
            {
              "name": "updates",
              "value": "[{\"cardType\":\"hero\",\"content\":{\"message\":\"Good morning! Today is a new opportunity.\"}}]"
            }
          ]
        },
        "options": {
          "retry": {
            "maxTries": 3
          }
        }
      },
      "credentials": {
        "httpHeaderAuth": {
          "name": "Supabase Service Role",
          "data": {
            "name": "Authorization",
            "value": "Bearer SERVICE_ROLE_KEY_HERE"
          }
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Update Dashboard Cards",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### n8n Setup Instructions
1. Import the workflow JSON above
2. Create HTTP Header Auth credential:
   - Name: `Supabase Service Role`
   - Header Name: `Authorization`
   - Header Value: `Bearer <YOUR_SERVICE_ROLE_KEY>`
3. Update the `userId` parameter with target user UUID
4. Customize the `updates` array with your card content
5. Test manually, then activate for scheduled runs

---

## React Integration

### Fetch Card Content (One-time)
```typescript
import { cardContentService } from '@/services/cardContentService';

const fetchHeroCard = async () => {
  try {
    const content = await cardContentService.getCardContent('hero');
    if (content) {
      setHeroMessage(content.content.message);
    }
  } catch (error) {
    console.error('Error fetching hero card:', error);
  }
};
```

### Subscribe to Real-time Updates
```typescript
import { useEffect, useState } from 'react';
import { cardContentService } from '@/services/cardContentService';

const HeroCard = () => {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Initial fetch
    cardContentService.getCardContent('hero').then(content => {
      if (content) setMessage(content.content.message);
    });

    // Subscribe to real-time updates
    const unsubscribe = cardContentService.subscribeToCardUpdates('hero', (payload) => {
      console.log('Hero card updated:', payload);
      if (payload.new) {
        setMessage(payload.new.content.message);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="card">
      <h2>Daily Motivation</h2>
      <p>{message}</p>
    </div>
  );
};
```

### Update Card from UI
```typescript
import { cardContentService } from '@/services/cardContentService';

const handleUpdateMessage = async (newMessage: string) => {
  try {
    await cardContentService.updateCard({
      cardType: 'hero',
      content: { message: newMessage }
    });
    toast.success('Card updated successfully');
  } catch (error) {
    toast.error('Failed to update card');
  }
};
```

---

## Deployment & Testing

### Deploy Edge Functions
```bash
# Functions are automatically deployed with Lovable
# No manual deployment needed
```

### Test with cURL
```bash
# 1. Get user token from browser console:
# const { data: { session } } = await supabase.auth.getSession(); console.log(session.access_token);

# 2. Test update-card
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"cardType":"hero","content":{"message":"Test message"}}'

# 3. Test get-card
curl -X GET "https://paodisbyfnmiljjognxl.supabase.co/functions/v1/get-card?cardType=hero" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Verify Database
```sql
-- Check card content
SELECT * FROM card_content WHERE user_id = 'YOUR_USER_ID';

-- Check update logs
SELECT * FROM card_update_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Operational Notes

### Idempotency
- Include `Idempotency-Key` header for safe retries
- Same key within 24h returns cached response without re-executing
- Recommended format: `{operation}-{date}-{identifier}`

### Rate Limiting
- Edge Functions auto-scale but respect Supabase project limits
- Recommended: Max 10 requests/second per user
- Bulk endpoint preferred for multiple updates

### Logging
- All requests logged to `card_update_logs` table
- Monitor via Supabase dashboard > Edge Functions > Logs
- Check for errors with: `SELECT * FROM card_update_logs WHERE request_data->>'error' IS NOT NULL;`

### Monitoring
- Track update frequency in Supabase logs
- Set up alerts for failed updates (>5% error rate)
- Monitor database size growth from logs table

### Fallback Behavior
- If API fails, UI falls back to default/cached content
- Service worker can cache last successful response
- Real-time updates ensure eventual consistency

### Security Best Practices
- Never expose service role key in client code
- Rotate service role key if compromised
- Use row-level security policies (already configured)
- Validate all input data in Edge Functions
- Monitor suspicious activity via update logs

---

## Content Structure Examples

### Hero Card
```json
{
  "message": "Your daily motivational message here",
  "subtitle": "Optional secondary text",
  "cta": {
    "text": "Take Action",
    "link": "/habits"
  }
}
```

**Example API Request:**
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5d59e0a7-ae64-4e04-8a14-85a39c1eae3f",
    "cardType": "hero",
    "content": {
      "message": "You completed 8 out of 10 habits today! Amazing consistency.",
      "subtitle": "Your 14-day streak is growing strong",
      "cta": {
        "text": "View Progress",
        "link": "/habits"
      }
    }
  }'
```

### Reflection Card (Quick Reflection Widget)
```json
{
  "preview": "Reflection prompt or preview text",
  "questions": [
    "What are you grateful for today?",
    "What did you learn?"
  ],
  "prompt": "Take a moment to reflect on your day"
}
```

**Example API Request:**
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5d59e0a7-ae64-4e04-8a14-85a39c1eae3f",
    "cardType": "reflection",
    "content": {
      "preview": "Reflect on your wins today",
      "prompt": "What made today special?",
      "questions": [
        "What are you most proud of today?",
        "What lesson did you learn?",
        "How did you show up for yourself?"
      ]
    }
  }'
```

### Habits Card
```json
{
  "topHabits": [
    {
      "id": "uuid",
      "name": "Morning Exercise",
      "completed": false,
      "streak": 7,
      "progress": 85
    }
  ],
  "summary": "5 of 7 habits completed this week"
}
```

### Journal Card
```json
{
  "snippet": "Preview of recent journal entry...",
  "entryCount": 42,
  "lastEntryDate": "2025-10-10"
}
```

### Roadmap Card
The Roadmap Card displays 5 main milestones, each with 5 sub-milestones. All text fields are editable via API.

```json
{
  "milestones": [
    {
      "id": "m1",
      "text": "Launch MVP",
      "subMilestones": [
        { "id": "s1-1", "text": "Define core features" },
        { "id": "s1-2", "text": "Build prototype" },
        { "id": "s1-3", "text": "User testing" },
        { "id": "s1-4", "text": "Refine UI/UX" },
        { "id": "s1-5", "text": "Deploy to production" }
      ]
    },
    {
      "id": "m2",
      "text": "Achieve Product-Market Fit",
      "subMilestones": [
        { "id": "s2-1", "text": "Collect user feedback" },
        { "id": "s2-2", "text": "Iterate on features" },
        { "id": "s2-3", "text": "Identify key metrics" },
        { "id": "s2-4", "text": "Optimize conversion" },
        { "id": "s2-5", "text": "Reach 1000 active users" }
      ]
    },
    {
      "id": "m3",
      "text": "Scale Operations",
      "subMilestones": [
        { "id": "s3-1", "text": "Automate workflows" },
        { "id": "s3-2", "text": "Expand team" },
        { "id": "s3-3", "text": "Implement analytics" },
        { "id": "s3-4", "text": "Optimize infrastructure" },
        { "id": "s3-5", "text": "Launch referral program" }
      ]
    },
    {
      "id": "m4",
      "text": "Expand Market Reach",
      "subMilestones": [
        { "id": "s4-1", "text": "Research new markets" },
        { "id": "s4-2", "text": "Localize product" },
        { "id": "s4-3", "text": "Partner with influencers" },
        { "id": "s4-4", "text": "Launch marketing campaign" },
        { "id": "s4-5", "text": "Enter 3 new regions" }
      ]
    },
    {
      "id": "m5",
      "text": "Achieve Sustainability",
      "subMilestones": [
        { "id": "s5-1", "text": "Reach profitability" },
        { "id": "s5-2", "text": "Establish brand presence" },
        { "id": "s5-3", "text": "Build community" },
        { "id": "s5-4", "text": "Secure strategic partnerships" },
        { "id": "s5-5", "text": "Plan long-term vision" }
      ]
    }
  ]
}
```

**Example API Request - Update All 5 Milestones:**
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5d59e0a7-ae64-4e04-8a14-85a39c1eae3f",
    "cardType": "roadmap",
    "content": {
      "milestones": [
        {
          "id": "m1",
          "text": "Build Fitness Foundation",
          "subMilestones": [
            { "id": "s1-1", "text": "Complete health assessment" },
            { "id": "s1-2", "text": "Create workout schedule" },
            { "id": "s1-3", "text": "Join gym or set up home gym" },
            { "id": "s1-4", "text": "Learn proper form" },
            { "id": "s1-5", "text": "Complete first 30 days" }
          ]
        },
        {
          "id": "m2",
          "text": "Develop Consistent Habits",
          "subMilestones": [
            { "id": "s2-1", "text": "Exercise 3x per week" },
            { "id": "s2-2", "text": "Track nutrition daily" },
            { "id": "s2-3", "text": "Sleep 7-8 hours nightly" },
            { "id": "s2-4", "text": "Practice mindfulness" },
            { "id": "s2-5", "text": "Maintain 60-day streak" }
          ]
        },
        {
          "id": "m3",
          "text": "Increase Strength & Endurance",
          "subMilestones": [
            { "id": "s3-1", "text": "Run 5K without stopping" },
            { "id": "s3-2", "text": "Double initial strength baseline" },
            { "id": "s3-3", "text": "Master 10 key exercises" },
            { "id": "s3-4", "text": "Reduce body fat by 5%" },
            { "id": "s3-5", "text": "Complete 90-day milestone" }
          ]
        },
        {
          "id": "m4",
          "text": "Achieve Peak Performance",
          "subMilestones": [
            { "id": "s4-1", "text": "Run 10K race" },
            { "id": "s4-2", "text": "Reach target weight" },
            { "id": "s4-3", "text": "Master advanced techniques" },
            { "id": "s4-4", "text": "Optimize nutrition plan" },
            { "id": "s4-5", "text": "Complete 6-month transformation" }
          ]
        },
        {
          "id": "m5",
          "text": "Sustain Long-Term Wellness",
          "subMilestones": [
            { "id": "s5-1", "text": "Maintain ideal fitness level" },
            { "id": "s5-2", "text": "Inspire others to start" },
            { "id": "s5-3", "text": "Set new challenge goals" },
            { "id": "s5-4", "text": "Build supportive community" },
            { "id": "s5-5", "text": "Celebrate 1-year anniversary" }
          ]
        }
      ]
    }
  }'
```

**Example - Update Single Milestone with Sub-milestones:**
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5d59e0a7-ae64-4e04-8a14-85a39c1eae3f",
    "cardType": "roadmap",
    "content": {
      "milestones": [
        {
          "id": "m1",
          "text": "Q1 2025 Goals",
          "subMilestones": [
            { "id": "s1-1", "text": "Complete morning routine 21 days" },
            { "id": "s1-2", "text": "Read 3 personal development books" },
            { "id": "s1-3", "text": "Meditate daily for 30 days" },
            { "id": "s1-4", "text": "Journal 5x per week" },
            { "id": "s1-5", "text": "Attend 2 networking events" }
          ]
        }
      ]
    }
  }'
```

**Important Notes:**
- Always include all 5 milestones when updating the roadmap
- Each milestone must have exactly 5 sub-milestones
- IDs should remain consistent (m1-m5 for milestones, s1-1 to s5-5 for sub-milestones)
- Only the `text` field is displayed and editable in the UI

### Bulk Update Example (All Three Cards)
```bash
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/bulk-update-cards \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: weekly-update-2025-10-12" \
  -d '{
    "userId": "5d59e0a7-ae64-4e04-8a14-85a39c1eae3f",
    "updates": [
      {
        "cardType": "hero",
        "content": {
          "message": "Fantastic week! You'\''ve completed 85% of your habits.",
          "subtitle": "Keep the momentum going strong",
          "cta": {
            "text": "See Details",
            "link": "/habits"
          }
        }
      },
      {
        "cardType": "reflection",
        "content": {
          "preview": "Weekly reflection time",
          "prompt": "What were your biggest wins this week?",
          "questions": [
            "What are you most proud of this week?",
            "What challenge did you overcome?",
            "What will you improve next week?"
          ]
        }
      },
      {
        "cardType": "roadmap",
        "content": {
          "milestones": [
            {
              "id": "m1",
              "text": "Complete Q4 Sprint",
              "subMilestones": [
                { "id": "s1-1", "text": "Finalize project requirements" },
                { "id": "s1-2", "text": "Complete development phase" },
                { "id": "s1-3", "text": "Run quality assurance" },
                { "id": "s1-4", "text": "Deploy to production" },
                { "id": "s1-5", "text": "Gather user feedback" }
              ]
            },
            {
              "id": "m2",
              "text": "Build Healthy Habits",
              "subMilestones": [
                { "id": "s2-1", "text": "Morning workout 5x/week" },
                { "id": "s2-2", "text": "Meal prep Sundays" },
                { "id": "s2-3", "text": "8 hours sleep nightly" },
                { "id": "s2-4", "text": "Daily meditation" },
                { "id": "s2-5", "text": "Track progress weekly" }
              ]
            },
            {
              "id": "m3",
              "text": "Professional Growth",
              "subMilestones": [
                { "id": "s3-1", "text": "Complete certification course" },
                { "id": "s3-2", "text": "Attend 2 industry conferences" },
                { "id": "s3-3", "text": "Network with 10 professionals" },
                { "id": "s3-4", "text": "Publish 3 articles" },
                { "id": "s3-5", "text": "Mentor junior colleague" }
              ]
            },
            {
              "id": "m4",
              "text": "Financial Wellness",
              "subMilestones": [
                { "id": "s4-1", "text": "Create monthly budget" },
                { "id": "s4-2", "text": "Save 20% of income" },
                { "id": "s4-3", "text": "Pay off credit card debt" },
                { "id": "s4-4", "text": "Start investment portfolio" },
                { "id": "s4-5", "text": "Build 6-month emergency fund" }
              ]
            },
            {
              "id": "m5",
              "text": "Personal Fulfillment",
              "subMilestones": [
                { "id": "s5-1", "text": "Read 12 books this year" },
                { "id": "s5-2", "text": "Learn new skill/hobby" },
                { "id": "s5-3", "text": "Volunteer monthly" },
                { "id": "s5-4", "text": "Quality time with family" },
                { "id": "s5-5", "text": "Plan dream vacation" }
              ]
            }
          ]
        }
      }
    ]
  }'
```
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 207 | Multi-Status (partial success in bulk) |
| 400 | Bad Request (invalid data) |
| 401 | Unauthorized (invalid/missing token) |
| 500 | Internal Server Error |

---

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review `card_update_logs` table for audit trail
- Verify RLS policies allow access
- Test with cURL to isolate UI vs API issues
