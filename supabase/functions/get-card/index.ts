import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cardType = url.searchParams.get('cardType');
    const userId = url.searchParams.get('userId');
    
    if (!cardType) {
      throw new Error('Missing cardType parameter');
    }

    if (!userId) {
      throw new Error('Missing userId parameter');
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.includes('service_role')) {
      throw new Error('Service role key required');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch card content
    const { data: cardData, error: fetchError } = await supabase
      .from('card_content')
      .select('*')
      .eq('user_id', userId)
      .eq('card_type', cardType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    if (!cardData) {
      return new Response(
        JSON.stringify({
          success: true,
          data: null,
          message: 'No content found for this card'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
    console.error('Error in get-card function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('Service role') ? 401 
                     : errorMessage.includes('Missing') || errorMessage.includes('required') ? 400 
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
