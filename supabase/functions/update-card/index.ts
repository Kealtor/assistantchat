import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

// Zod-like validation helper
const validateUpdateCardRequest = (data: any) => {
  if (!data.cardType || !['hero', 'reflection', 'habits', 'journal', 'quickstart', 'roadmap'].includes(data.cardType)) {
    throw new Error('Invalid or missing cardType');
  }
  if (!data.content || typeof data.content !== 'object') {
    throw new Error('Invalid or missing content object');
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
    
    // if (!authHeader || !authHeader.includes('service_role')) {
    //   throw new Error('Service role key required');
    // }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      throw new Error('Invalid service role key');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    validateUpdateCardRequest(body);

    const { cardType, content, userId } = body;

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
        console.log('Duplicate request detected, returning success');
        return new Response(
          JSON.stringify({ success: true, message: 'Already processed (idempotent)' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Upsert card content
    const { data: cardData, error: upsertError } = await supabase
      .from('card_content')
      .upsert({
        user_id: userId,
        card_type: cardType,
        content: content
      }, {
        onConflict: 'user_id,card_type'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    // Log the update
    await supabase.from('card_update_logs').insert({
      card_content_id: cardData.id,
      updated_by: null,
      update_source: 'service',
      idempotency_key: idempotencyKey,
      request_data: { cardType, content }
    });

    console.log(`Successfully updated ${cardType} card for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: cardData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in update-card function:', error);
    
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
