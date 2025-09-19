import { supabase } from "@/integrations/supabase/client";

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  content: string;
  mood?: number;
  tags: string[];
  images: string[];
  created_at: Date;
  updated_at: Date;
};

export type CreateJournalEntryData = {
  user_id: string;
  entry_date: string;
  content: string;
  mood?: number;
  tags?: string[];
  images?: string[];
};

export type UpdateJournalEntryData = {
  content?: string;
  mood?: number;
  tags?: string[];
  images?: string[];
};

export const journalService = {
  // Get all journal entries for a user
  async getUserEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }

      return entries.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        entry_date: entry.entry_date,
        content: entry.content,
        mood: entry.mood || undefined,
        tags: entry.tags || [],
        images: entry.images || [],
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  },

  // Get journal entry for a specific date
  async getEntryByDate(userId: string, entryDate: string): Promise<JournalEntry | null> {
    try {
      const { data: entry, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', entryDate)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No entry found for this date
          return null;
        }
        console.error('Error fetching journal entry:', error);
        return null;
      }

      return {
        id: entry.id,
        user_id: entry.user_id,
        entry_date: entry.entry_date,
        content: entry.content,
        mood: entry.mood || undefined,
        tags: entry.tags || [],
        images: entry.images || [],
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      };
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      return null;
    }
  },

  // Create new journal entry
  async createEntry(data: CreateJournalEntryData): Promise<JournalEntry | null> {
    try {
      const { data: entry, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: data.user_id,
          entry_date: data.entry_date,
          content: data.content,
          mood: data.mood,
          tags: data.tags || [],
          images: data.images || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal entry:', error);
        return null;
      }

      return {
        id: entry.id,
        user_id: entry.user_id,
        entry_date: entry.entry_date,
        content: entry.content,
        mood: entry.mood || undefined,
        tags: entry.tags || [],
        images: entry.images || [],
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
  },

  // Update existing journal entry
  async updateEntry(entryId: string, data: UpdateJournalEntryData): Promise<JournalEntry | null> {
    try {
      const { data: entry, error } = await supabase
        .from('journal_entries')
        .update({
          content: data.content,
          mood: data.mood,
          tags: data.tags || [],
          images: data.images
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal entry:', error);
        return null;
      }

      return {
        id: entry.id,
        user_id: entry.user_id,
        entry_date: entry.entry_date,
        content: entry.content,
        mood: entry.mood || undefined,
        tags: entry.tags || [],
        images: entry.images || [],
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      };
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return null;
    }
  },

  // Delete journal entry
  async deleteEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error deleting journal entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  },

  // Get weekly stats for a user
  async getWeeklyStats(userId: string): Promise<{
    entriesThisWeek: number;
    averageMood: number;
    streak: number;
  }> {
    try {
      // Get entries from the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', oneWeekAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error fetching weekly stats:', error);
        return { entriesThisWeek: 0, averageMood: 0, streak: 0 };
      }

      const entriesThisWeek = entries.length;
      
      const moodEntries = entries.filter(entry => entry.mood !== null);
      const averageMood = moodEntries.length > 0 
        ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
        : 0;

      // Calculate streak by counting consecutive days from today backwards
      const allEntries = await this.getUserEntries(userId);
      const streak = this.calculateStreak(allEntries);

      return {
        entriesThisWeek,
        averageMood: Math.round(averageMood * 10) / 10,
        streak
      };
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return { entriesThisWeek: 0, averageMood: 0, streak: 0 };
    }
  },

  // Calculate consecutive day streak
  calculateStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Sort entries by date descending
    const sortedEntries = entries
      .map(entry => entry.entry_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date(today);
    
    // Check if there's an entry for today or yesterday to start the streak
    const hasRecentEntry = sortedEntries.some(date => {
      const entryDate = new Date(date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 1;
    });

    if (!hasRecentEntry) return 0;

    // Count consecutive days backwards from today
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = sortedEntries[i];
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      if (entryDate === currentDateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Check if the gap is exactly one day
        const daysDiff = Math.floor(
          (new Date(currentDateStr).getTime() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          // Continue streak
          currentDate = new Date(entryDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          // Streak is broken
          break;
        }
      }
    }

    return streak;
  }
};