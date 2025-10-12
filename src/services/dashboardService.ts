import { supabase } from "@/integrations/supabase/client";
import { cardContentService, CardType } from "./cardContentService";
import { journalService } from "./journalService";

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
   * Fetches dashboard data - now from dynamic card content
   */
  async fetchDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Fetch dynamic card content
      const allContent = await cardContentService.getAllCardContent();
      
      // Build dashboard data from card content or use defaults
      const heroContent = allContent.find(c => c.card_type === 'hero');
      const reflectionContent = allContent.find(c => c.card_type === 'reflection');
      const habitsContent = allContent.find(c => c.card_type === 'habits');
      const journalContent = allContent.find(c => c.card_type === 'journal');

      // Fetch actual journal entries
      const journalEntries = await journalService.getUserEntries(userId);
      const lastEntry = journalEntries[0]; // Most recent entry
      const journalSnippet = lastEntry?.content 
        ? lastEntry.content.slice(0, 150) + (lastEntry.content.length > 150 ? '...' : '')
        : "No journal entries yet. Start writing to see your latest entry here.";

      const dashboardData: DashboardData = {
        heroMessage: heroContent?.content?.message || "Yesterday you stayed consistent with your reading habit – great job. Let's build on that today and make it another win!",
        reflectionPreview: reflectionContent?.content?.preview || "What's one thought you want to capture today?",
        topHabits: habitsContent?.content?.topHabits || [
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
        recentJournalSnippet: journalSnippet
      };
      
      return dashboardData;
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