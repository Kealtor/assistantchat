import { configurableSupabase as supabase } from "@/lib/supabase-client";

export type MediaAttachment = {
  url: string;
  name: string;
  type: string;
  size: number;
  bucket: string;
  filename: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: MediaAttachment[];
};

export type ChatSession = {
  id: string;
  title: string;
  workflow: string;
  chat_type: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
  user_id: string;
  pinned?: boolean;
};

export type CreateChatData = {
  title: string;
  workflow: string;
  chat_type: string;
  user_id: string;
};

export type UpdateChatData = {
  title?: string;
  messages?: Message[];
  pinned?: boolean;
};

export const chatService = {
  // Create a new chat
  async createChat(data: CreateChatData): Promise<ChatSession | null> {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .insert({
          title: data.title,
          workflow: data.workflow,
          chat_type: data.chat_type,
          user_id: data.user_id,
          messages: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        return null;
      }

      return {
        id: chat.id,
        title: chat.title,
        workflow: chat.workflow,
        chat_type: chat.chat_type,
        messages: Array.isArray(chat.messages) ? (chat.messages as unknown as Message[]) : [],
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at),
        user_id: chat.user_id,
        pinned: chat.pinned || false
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  },

  // Get all chats for a user
  async getUserChats(userId: string): Promise<ChatSession[]> {
    try {
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        return [];
      }

      return chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        workflow: chat.workflow,
        chat_type: chat.chat_type,
        messages: Array.isArray(chat.messages) ? (chat.messages as unknown as Message[]) : [],
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at),
        user_id: chat.user_id,
        pinned: chat.pinned || false
      }));
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  // Update a chat
  async updateChat(chatId: string, updates: UpdateChatData): Promise<ChatSession | null> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }
      
      if (updates.messages !== undefined) {
        updateData.messages = updates.messages;
      }

      if (updates.pinned !== undefined) {
        updateData.pinned = updates.pinned;
      }

      const { data: chat, error } = await supabase
        .from('chats')
        .update(updateData)
        .eq('id', chatId)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat:', error);
        return null;
      }

      return {
        id: chat.id,
        title: chat.title,
        workflow: chat.workflow,
        chat_type: chat.chat_type,
        messages: Array.isArray(chat.messages) ? (chat.messages as unknown as Message[]) : [],
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at),
        user_id: chat.user_id,
        pinned: chat.pinned || false
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      return null;
    }
  },

  // Delete a chat
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  },

  // Get a single chat by ID
  async getChatById(chatId: string): Promise<ChatSession | null> {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) {
        console.error('Error fetching chat:', error);
        return null;
      }

      return {
        id: chat.id,
        title: chat.title,
        workflow: chat.workflow,
        chat_type: chat.chat_type,
        messages: Array.isArray(chat.messages) ? (chat.messages as unknown as Message[]) : [],
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at),
        user_id: chat.user_id,
        pinned: chat.pinned || false
      };
    } catch (error) {
      console.error('Error fetching chat:', error);
      return null;
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
};