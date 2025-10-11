# Dashboard Card Content API - Deployment & Testing Guide

## Quick Start

### 1. Database Setup ✅
Already completed! The following tables are created:
- `card_content` - Stores dynamic card content per user
- `card_update_logs` - Audit trail of all updates

### 2. Edge Functions Deployment

#### Option A: Automatic Deployment (Lovable)
Edge functions are automatically deployed with Lovable:
- `/update-card` - Update single card
- `/bulk-update-cards` - Update multiple cards
- `/get-card` - Retrieve card content

#### Option B: Manual Deployment (Your Own Supabase Instance)

**Prerequisites:**
- Supabase CLI installed: `npm install -g supabase`
- Supabase account and project created

**Step 1: Install Supabase CLI**
```bash
npm install -g supabase
```

**Step 2: Link to Your Supabase Project**
```bash
# Login to Supabase
supabase login

# Link your local project to your Supabase instance
supabase link --project-ref YOUR_PROJECT_REF

# Find your project ref at: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/general
```

**Step 3: Deploy Edge Functions**
```bash
# Deploy all functions at once
supabase functions deploy update-card
supabase functions deploy bulk-update-cards
supabase functions deploy get-card

# Or deploy all in one command
supabase functions deploy
```

**Step 4: Set Environment Secrets**
```bash
# The functions need access to Supabase credentials
# These are automatically available in Supabase-hosted functions:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY

# If you need to set custom secrets for other integrations:
supabase secrets set MY_SECRET_KEY=your_value_here

# List all secrets
supabase secrets list
```

**Step 5: Verify Deployment**
```bash
# Check function logs
supabase functions logs update-card

# Test the endpoint
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"cardType": "hero", "content": {"message": "Test"}}'
```

**Important Notes:**
- Edge functions use Deno runtime, not Node.js
- Functions are deployed to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/FUNCTION_NAME`
- The `supabase/config.toml` file contains function configuration
- RLS policies must be properly configured in your database

### 3. Get Your Service Role Key

For n8n automation, you need the Supabase service role key:

1. Go to: https://supabase.com/dashboard/project/paodisbyfnmiljjognxl/settings/api
2. Copy the `service_role` key (⚠️ Keep it secret!)
3. Use in n8n HTTP Header Auth:
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_SERVICE_ROLE_KEY`

### 4. Test the API

#### Option A: Test from Browser Console (Logged-in User)

```javascript
// 1. Get your session token
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session.access_token);

// 2. Test update
const response = await fetch('https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cardType: 'hero',
    content: {
      message: 'Test message from browser console!'
    }
  })
});

const result = await response.json();
console.log('Result:', result);

// 3. Verify update
const card = await supabase
  .from('card_content')
  .select('*')
  .eq('card_type', 'hero')
  .single();
console.log('Card content:', card.data);
```

#### Option B: Test with cURL (Service Role)

```bash
# Replace YOUR_SERVICE_ROLE_KEY with actual key
SERVICE_KEY="YOUR_SERVICE_ROLE_KEY"
USER_ID="YOUR_USER_UUID"

# Test single update
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/update-card \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"cardType\": \"hero\",
    \"content\": {
      \"message\": \"Test from cURL!\"
    }
  }"

# Test bulk update
curl -X POST https://paodisbyfnmiljjognxl.supabase.co/functions/v1/bulk-update-cards \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"updates\": [
      {
        \"cardType\": \"hero\",
        \"content\": {\"message\": \"Bulk test message 1\"}
      },
      {
        \"cardType\": \"reflection\",
        \"content\": {\"preview\": \"Bulk test preview 2\"}
      }
    ]
  }"

# Get card content
curl -X GET "https://paodisbyfnmiljjognxl.supabase.co/functions/v1/get-card?cardType=hero&userId=$USER_ID" \
  -H "Authorization: Bearer $SERVICE_KEY"
```

### 5. Set Up n8n Workflow

#### Step 1: Import Workflow
1. Open n8n
2. Click "Add workflow" → "Import from File"
3. Select `n8n-workflow-example.json`

#### Step 2: Create Service Role Credential
1. Go to Credentials → Add Credential
2. Select "HTTP Header Auth"
3. Name: `Supabase Service Role`
4. Header Name: `Authorization`
5. Header Value: `Bearer YOUR_SERVICE_ROLE_KEY`
6. Save

#### Step 3: Configure User ID
1. Open "Prepare Update Data" node
2. Replace `USER_UUID_REPLACE_ME` with your actual user UUID
3. Save

#### Step 4: Test & Activate
1. Click "Test workflow" to run manually
2. Check Edge Function logs for success
3. Activate workflow for scheduled runs

### 6. Monitor & Debug

#### View Edge Function Logs
https://supabase.com/dashboard/project/paodisbyfnmiljjognxl/functions/update-card/logs

#### Check Update History
```sql
SELECT 
  cl.created_at,
  cc.card_type,
  cl.update_source,
  cl.request_data
FROM card_update_logs cl
JOIN card_content cc ON cc.id = cl.card_content_id
ORDER BY cl.created_at DESC
LIMIT 20;
```

#### View Current Card Content
```sql
SELECT 
  card_type,
  content,
  updated_at
FROM card_content
WHERE user_id = 'YOUR_USER_ID'
ORDER BY card_type;
```

### 7. Troubleshooting

#### Issue: "Missing authorization header"
- Ensure `Authorization` header is included
- Check service role key is correct
- Verify Bearer prefix: `Bearer YOUR_KEY`

#### Issue: "Unauthorized"
- For user JWT: User must be logged in
- For service role: Use correct service_role key, not anon key

#### Issue: "Invalid cardType"
- Valid types: `hero`, `reflection`, `habits`, `journal`, `quickstart`, `roadmap`
- Check spelling and lowercase

#### Issue: Updates not appearing in UI
- Check browser console for errors
- Verify real-time subscription is active
- Refresh page to force re-fetch

#### Issue: Idempotency not working
- Ensure `Idempotency-Key` header is set
- Keys are case-sensitive
- Keys expire after 24 hours

### 8. Production Checklist

- [ ] Service role key stored securely in n8n credentials
- [ ] Test all card types with sample content
- [ ] Verify real-time updates work in UI
- [ ] Set up n8n error notifications
- [ ] Monitor Edge Function invocation count
- [ ] Review RLS policies for security
- [ ] Document content structure for each card
- [ ] Set up backup/restore for card_content table

### 9. Security Notes

⚠️ **CRITICAL**: Pre-existing security warnings detected:
1. Enable leaked password protection: https://supabase.com/docs/guides/auth/password-security
2. Upgrade Postgres version for security patches

These are infrastructure-level settings in your Supabase dashboard and should be addressed for production use.

### 10. Next Steps

1. Customize card content structures for your needs
2. Add more card types if needed
3. Create n8n workflows for different schedules (weekly summaries, etc.)
4. Build admin UI for manual card updates
5. Implement content templates for common messages
6. Add A/B testing for different message variants

---

## Support Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Edge Function Logs**: https://supabase.com/dashboard/project/paodisbyfnmiljjognxl/functions
- **n8n Workflow Example**: `n8n-workflow-example.json`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/paodisbyfnmiljjognxl
