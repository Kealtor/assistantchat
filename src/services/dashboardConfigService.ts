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
      w: 12,
      h: 3,
      minW: 6,
      minH: 2
    },
    {
      id: 'reflection',
      type: 'reflection',
      x: 0,
      y: 3,
      w: 6,
      h: 3,
      minW: 4,
      minH: 2
    },
    {
      id: 'habits',
      type: 'habits',
      x: 6,
      y: 3,
      w: 6,
      h: 4,
      minW: 4,
      minH: 3
    },
    {
      id: 'journal',
      type: 'journal',
      x: 0,
      y: 6,
      w: 6,
      h: 4,
      minW: 4,
      minH: 3
    },
    {
      id: 'quickstart',
      type: 'quickstart',
      x: 0,
      y: 10,
      w: 12,
      h: 4,
      minW: 8,
      minH: 3
    }
  ]
};

export const dashboardConfigService = {
  async getUserLayout(userId: string): Promise<DashboardLayout> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('layout')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      return (data?.layout as unknown as DashboardLayout) || defaultLayout;
    } catch (error) {
      console.error('Error fetching dashboard layout:', error);
      return defaultLayout;
    }
  },

  async saveUserLayout(userId: string, layout: DashboardLayout): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_configs')
        .upsert({ 
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