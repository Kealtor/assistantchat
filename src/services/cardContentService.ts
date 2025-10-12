import { supabase } from "@/integrations/supabase/client";

export type CardType = 'hero' | 'reflection' | 'habits' | 'journal' | 'quickstart' | 'roadmap';

export interface CardContent {
  id: string;
  card_type: CardType;
  user_id: string;
  content: any; // Can be any JSON structure
  created_at: string;
  updated_at: string;
}

export interface UpdateCardRequest {
  cardType: CardType;
  content: Record<string, any>;
  userId?: string; // Only for service role requests
}

export interface BulkUpdateRequest {
  updates: UpdateCardRequest[];
  userId?: string; // Only for service role requests
}

export const cardContentService = {
  /**
   * Fetch card content for the authenticated user
   */
  async getCardContent(cardType: CardType): Promise<CardContent | null> {
    try {
      const { data, error } = await supabase
        .from('card_content')
        .select('*')
        .eq('card_type', cardType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${cardType} card content:`, error);
      throw error;
    }
  },

  /**
   * Fetch all card content for the authenticated user
   */
  async getAllCardContent(): Promise<CardContent[]> {
    try {
      const { data, error } = await supabase
        .from('card_content')
        .select('*')
        .order('card_type');

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching all card content:', error);
      throw error;
    }
  },

  /**
   * Update card content via direct database access (RLS protected)
   */
  async updateCard(request: UpdateCardRequest): Promise<CardContent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if card exists
      const { data: existing } = await supabase
        .from('card_content')
        .select('id')
        .eq('card_type', request.cardType)
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existing) {
        // Update existing card
        const { data, error } = await supabase
          .from('card_content')
          .update({
            content: request.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new card
        const { data, error } = await supabase
          .from('card_content')
          .insert({
            card_type: request.cardType,
            user_id: user.id,
            content: request.content
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  /**
   * Bulk update multiple cards via direct database access (RLS protected)
   */
  async bulkUpdateCards(request: BulkUpdateRequest) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const results = await Promise.allSettled(
        request.updates.map(update => 
          this.updateCard({ ...update, userId: user.id })
        )
      );

      const processed = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason.message);

      return {
        success: failed === 0,
        processed,
        failed,
        results: results.map((r, i) => ({
          cardType: request.updates[i].cardType,
          success: r.status === 'fulfilled',
          data: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? r.reason.message : null
        })),
        errors
      };
    } catch (error) {
      console.error('Error bulk updating cards:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time updates for card content
   */
  subscribeToCardUpdates(cardType: CardType, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`card-content-${cardType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_content',
          filter: `card_type=eq.${cardType}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to all card content updates
   */
  subscribeToAllCardUpdates(callback: (payload: any) => void) {
    const channel = supabase
      .channel('card-content-all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_content'
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
