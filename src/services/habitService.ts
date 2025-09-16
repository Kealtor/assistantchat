import { supabase } from "@/integrations/supabase/client";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  acceptance_criteria?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  rating: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitData {
  name: string;
  color?: string;
  icon?: string;
  position: number;
  acceptance_criteria?: string;
  notes?: string;
  user_id: string;
}

export interface UpdateHabitData {
  name?: string;
  color?: string;
  icon?: string;
  position?: number;
  acceptance_criteria?: string;
  notes?: string;
}

export interface CreateHabitEntryData {
  habit_id: string;
  user_id: string;
  entry_date: string;
  rating: number;
  notes?: string;
}

export const habitService = {
  // Get user's habits
  getUserHabits: async (userId: string): Promise<Habit[]> => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('position');
    
    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
    
    return data || [];
  },

  // Create a new habit
  createHabit: async (data: CreateHabitData): Promise<Habit | null> => {
    const { data: habit, error } = await supabase
      .from('habits')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating habit:', error);
      return null;
    }
    
    return habit;
  },

  // Update a habit
  updateHabit: async (habitId: string, data: UpdateHabitData): Promise<Habit | null> => {
    const { data: habit, error } = await supabase
      .from('habits')
      .update(data)
      .eq('id', habitId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating habit:', error);
      return null;
    }
    
    return habit;
  },

  // Delete a habit
  deleteHabit: async (habitId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);
    
    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
    
    return true;
  },

  // Get habit entries for a date range
  getHabitEntries: async (userId: string, startDate: string, endDate: string): Promise<HabitEntry[]> => {
    const { data, error } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date');
    
    if (error) {
      console.error('Error fetching habit entries:', error);
      return [];
    }
    
    return data || [];
  },

  // Create or update habit entry for a specific date
  upsertHabitEntry: async (data: CreateHabitEntryData): Promise<HabitEntry | null> => {
    const { data: entry, error } = await supabase
      .from('habit_entries')
      .upsert(data, {
        onConflict: 'habit_id,entry_date'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting habit entry:', error);
      return null;
    }
    
    return entry;
  },

  // Delete habit entry
  deleteHabitEntry: async (habitId: string, entryDate: string): Promise<boolean> => {
    const { error } = await supabase
      .from('habit_entries')
      .delete()
      .eq('habit_id', habitId)
      .eq('entry_date', entryDate);
    
    if (error) {
      console.error('Error deleting habit entry:', error);
      return false;
    }
    
    return true;
  },

  // Calculate streak for a habit
  calculateStreak: (entries: HabitEntry[]): number => {
    if (entries.length === 0) return 0;
    
    // Sort by date descending to start from today
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.entry_date);
      entryDate.setHours(0, 0, 0, 0);
      
      // If there's a gap, stop counting
      if (entryDate.getTime() !== currentDate.getTime()) {
        break;
      }
      
      // Only count if rating > 0
      if (entry.rating > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Calculate 7-day average for a habit
  calculate7DayAverage: (entries: HabitEntry[]): number => {
    if (entries.length === 0) return 0;
    
    const last7Days = entries.slice(-7);
    const sum = last7Days.reduce((acc, entry) => acc + entry.rating, 0);
    return sum / last7Days.length;
  },

  // Initialize default habits for a new user
  initializeDefaultHabits: async (userId: string): Promise<void> => {
    const defaultHabits = [
      { name: 'Exercise', color: '#ef4444', icon: '💪', position: 1 },
      { name: 'Read', color: '#3b82f6', icon: '📚', position: 2 },
      { name: 'Meditate', color: '#8b5cf6', icon: '🧘', position: 3 },
      { name: 'Hydrate', color: '#06b6d4', icon: '💧', position: 4 },
      { name: 'Sleep Early', color: '#10b981', icon: '😴', position: 5 }
    ];

    for (const habit of defaultHabits) {
      await habitService.createHabit({
        ...habit,
        user_id: userId
      });
    }
  }
};