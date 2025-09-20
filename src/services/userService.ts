import { configurableSupabase as supabase } from "@/lib/supabase-client";

export type UserProfile = {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
};

export type UserPermission = {
  id: string;
  user_id: string;
  workflow_id: string;
  granted_at: Date;
  granted_by?: string;
};

export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          return await this.createUserProfile(userId);
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        created_at: new Date(profile.created_at),
        updated_at: new Date(profile.updated_at)
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Create user profile
  async createUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          display_name: '',
          bio: ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        created_at: new Date(profile.created_at),
        updated_at: new Date(profile.updated_at)
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  }): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        created_at: new Date(profile.created_at),
        updated_at: new Date(profile.updated_at)
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  // Get user permissions
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user permissions:', error);
        return [];
      }

      return permissions.map(permission => ({
        id: permission.id,
        user_id: permission.user_id,
        workflow_id: permission.workflow_id,
        granted_at: new Date(permission.granted_at),
        granted_by: permission.granted_by
      }));
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  },

  // Grant user permission for a workflow
  async grantPermission(userId: string, workflowId: string, grantedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          workflow_id: workflowId,
          granted_by: grantedBy
        });

      if (error) {
        console.error('Error granting permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      return false;
    }
  },

  // Revoke user permission for a workflow
  async revokePermission(userId: string, workflowId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('workflow_id', workflowId);

      if (error) {
        console.error('Error revoking permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      return false;
    }
  },

  // Check if user has permission for a workflow
  async hasPermission(userId: string, workflowId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('workflow_id', workflowId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }
};