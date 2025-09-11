import { configurableSupabase as supabase } from '@/lib/supabase-client';

export const adminService = {
  /**
   * Check if the current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.is_admin === true;
    } catch (error) {
      console.error('Error in isAdmin:', error);
      return false;
    }
  },

  /**
   * Get user's profile with admin status
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  /**
   * Set admin status for a user (only admins can do this)
   */
  async setAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('user_id', userId);

      if (error) {
        console.error('Error setting admin status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setAdminStatus:', error);
      return false;
    }
  }
};