import { supabase } from "@/integrations/supabase/client";

export interface DashboardWidget {
  id: string;
  type: 'hero' | 'reflection' | 'habits' | 'journal' | 'quickstart';
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export const defaultLayout: DashboardLayout = {
  widgets: [
    {
      id: 'hero',
      type: 'hero',
      x: 0,
      y: 0,
      w: 2,
      h: 3,
      minW: 1,
      minH: 2,
      maxW: 2,
      maxH: 12
    },
    {
      id: 'reflection',
      type: 'reflection',
      x: 0,
      y: 3,
      w: 1,
      h: 3,
      minW: 1,
      minH: 2,
      maxW: 2,
      maxH: 12
    },
    {
      id: 'habits',
      type: 'habits',
      x: 1,
      y: 3,
      w: 1,
      h: 4,
      minW: 1,
      minH: 3,
      maxW: 2,
      maxH: 16
    },
    {
      id: 'journal',
      type: 'journal',
      x: 0,
      y: 6,
      w: 1,
      h: 4,
      minW: 1,
      minH: 3,
      maxW: 2,
      maxH: 16
    },
    {
      id: 'quickstart',
      type: 'quickstart',
      x: 0,
      y: 10,
      w: 2,
      h: 6,
      minW: 1,
      minH: 4,
      maxW: 2,
      maxH: 20
    }
  ]
};

export const dashboardConfigService = {
  async getUserLayout(userId: string): Promise<DashboardLayout> {
    try {
      // Get the most recent layout for the user
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('layout')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return (data?.layout as unknown as DashboardLayout) || defaultLayout;
    } catch (error) {
      console.error('Error fetching dashboard layout:', error);
      return defaultLayout;
    }
  },

  async saveUserLayout(userId: string, layout: DashboardLayout): Promise<void> {
    try {
      // Delete any existing configs for this user first to prevent duplicates
      await supabase
        .from('dashboard_configs')
        .delete()
        .eq('user_id', userId);

      // Insert the new layout
      const { error } = await supabase
        .from('dashboard_configs')
        .insert({ 
          user_id: userId, 
          layout: layout as any 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      throw error;
    }
  },

  async resetToDefault(userId: string): Promise<void> {
    try {
      await this.saveUserLayout(userId, defaultLayout);
    } catch (error) {
      console.error('Error resetting dashboard layout:', error);
      throw error;
    }
  }
};