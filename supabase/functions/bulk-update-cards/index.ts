import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

const validateBulkUpdateRequest = (data: any) => {
  if (!Array.isArray(data.updates)) {
    throw new Error('Missing or invalid updates array');
  }
  
  for (const update of data.updates) {
    if (!update.cardType || !['hero', 'reflection', 'habits', 'journal', 'quickstart', 'roadmap'].includes(update.cardType)) {
      throw new Error(`Invalid cardType: ${update.cardType}`);
    }
    if (!update.content || typeof update.content !== 'object') {
      throw new Error(`Invalid content for cardType: ${update.cardType}`);
    }
  }
  
  if (data.userId && typeof data.userId !== 'string') {
    throw new Error('Invalid userId format');
  }
  
  return true;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const idempotencyKey = req.headers.get('idempotency-key');
    
    if (!authHeader || !authHeader.includes('service_role')) {
      throw new Error('Service role key required');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    validateBulkUpdateRequest(body);

    const { updates, userId } = body;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Check idempotency
    if (idempotencyKey) {
      const { data: existingLog } = await supabase
        .from('card_update_logs')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (existingLog) {
        console.log('Duplicate bulk request detected, returning success');
        return new Response(
          JSON.stringify({ success: true, message: 'Already processed (idempotent)', processed: 0 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Process all updates
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { data: cardData, error: upsertError } = await supabase
          .from('card_content')
          .upsert({
            user_id: userId,
            card_type: update.cardType,
            content: update.content
          }, {
            onConflict: 'user_id,card_type'
          })
          .select()
          .single();

        if (upsertError) throw upsertError;

        // Log the update
        await supabase.from('card_update_logs').insert({
          card_content_id: cardData.id,
          updated_by: null,
          update_source: 'service',
          idempotency_key: idempotencyKey,
          request_data: update
        });

        results.push({ cardType: update.cardType, success: true, data: cardData });
      } catch (error) {
        console.error(`Error updating ${update.cardType}:`, error);
        errors.push({ 
          cardType: update.cardType, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`Bulk update completed: ${results.length} successful, ${errors.length} failed`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        processed: results.length,
        failed: errors.length,
        results,
        errors
      }),
      {
        status: errors.length === 0 ? 200 : 207, // 207 Multi-Status for partial success
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in bulk-update-cards function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('Service role') ? 401 
                     : errorMessage.includes('Invalid') || errorMessage.includes('required') ? 400 
                     : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
