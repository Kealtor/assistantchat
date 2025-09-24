import { supabase } from "@/integrations/supabase/client";

export interface DashboardData {
  heroMessage: string;
  reflectionPreview: string;
  topHabits: Array<{
    id: string;
    name: string;
    completed: boolean;
    streak: number;
    progress: number;
  }>;
  recentJournalSnippet: string;
}

export const dashboardService = {
  /**
   * Fetches dashboard data from the webhook
   */
  async fetchDashboardData(userId: string): Promise<DashboardData> {
    try {
      // For now, we'll create a mock response that would come from the webhook
      // In production, this would call the actual webhook URL
      const mockData: DashboardData = {
        heroMessage: "Yesterday you stayed consistent with your reading habit – great job. Let's build on that today and make it another win!",
        reflectionPreview: "What's one thought you want to capture today?",
        topHabits: [
          {
            id: "1",
            name: "Morning Exercise",
            completed: false,
            streak: 7,
            progress: 85
          },
          {
            id: "2", 
            name: "Read 30 minutes",
            completed: true,
            streak: 12,
            progress: 90
          },
          {
            id: "3",
            name: "Meditation",
            completed: false,
            streak: 3,
            progress: 65
          }
        ],
        recentJournalSnippet: "Today I felt grateful for the small moments that brought me joy..."
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /**
   * Refreshes the hero message by calling the webhook
   */
  async refreshHeroMessage(userId: string): Promise<string> {
    try {
      // Mock refresh - in production this would call the webhook
      const refreshedMessages = [
        "Your consistency is building something powerful. Keep showing up for yourself.",
        "Small steps lead to big changes. What will you choose to focus on today?",
        "You're making progress, even when it doesn't feel like it. Trust the process.",
        "Today is another opportunity to grow. What matters most to you right now?"
      ];
      
      const randomMessage = refreshedMessages[Math.floor(Math.random() * refreshedMessages.length)];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return randomMessage;
    } catch (error) {
      console.error('Error refreshing hero message:', error);
      throw error;
    }
  }
};