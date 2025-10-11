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

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = authHeader.includes('service_role') 
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      : Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isServiceRequest = authHeader.includes('service_role');
    
    if (!isServiceRequest && authError) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const targetUserId = isServiceRequest ? (userId || user?.id) : user?.id;

    if (!targetUserId) {
      throw new Error('Cannot determine target user');
    }

    // Fetch card content
    const { data: cardData, error: fetchError } = await supabase
      .from('card_content')
      .select('*')
      .eq('user_id', targetUserId)
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
    const statusCode = errorMessage.includes('Unauthorized') ? 401 
                     : errorMessage.includes('Missing') ? 400 
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
