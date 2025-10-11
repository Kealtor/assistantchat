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
   * Update card content via Edge Function (supports user JWT)
   */
  async updateCard(request: UpdateCardRequest, idempotencyKey?: string): Promise<CardContent> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const { data, error } = await supabase.functions.invoke('update-card', {
        body: request,
        headers,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Update failed');

      return data.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  /**
   * Bulk update multiple cards via Edge Function
   */
  async bulkUpdateCards(request: BulkUpdateRequest, idempotencyKey?: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const { data, error } = await supabase.functions.invoke('bulk-update-cards', {
        body: request,
        headers,
      });

      if (error) throw error;

      return data;
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
