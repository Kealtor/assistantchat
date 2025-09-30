import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import { HeroCard } from "./HeroCard";
import { QuickReflectionWidget } from "./QuickReflectionWidget";
import { HabitsSnapshot } from "./HabitsSnapshot";
import { RecentJournalWidget } from "./RecentJournalWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ViewMode } from "@/types/navigation";
import { QuickstartArea } from "../chat/QuickstartArea";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardAreaProps {
  onNavigate: (view: ViewMode) => void;
  workflows?: any[];
  activeWorkflow?: string;
  onWorkflowChange?: (workflow: string) => void;
  onCreateNewChat?: () => void;
}

export const DashboardArea = ({ 
  onNavigate, 
  workflows = [], 
  activeWorkflow = "", 
  onWorkflowChange = () => {}, 
  onCreateNewChat = () => {} 
}: DashboardAreaProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingHero, setRefreshingHero] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await dashboardService.fetchDashboardData(user.id);
      setDashboardData(data);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshHero = async () => {
    if (!user || !dashboardData) return;

    try {
      setRefreshingHero(true);
      const newMessage = await dashboardService.refreshHeroMessage(user.id);
      setDashboardData(prev => prev ? { ...prev, heroMessage: newMessage } : null);
      
      toast({
        title: "Message refreshed",
        description: "Your daily message has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh your daily message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingHero(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto bg-background safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto p-space-md space-y-space-lg">
          <div className="space-y-space-sm">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="space-y-space-md">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-space-md safe-area-inset-bottom">
        <div className="text-center space-y-space-md">
          <p className="text-muted-foreground text-size-base">Unable to load dashboard content</p>
          <button 
            onClick={loadDashboardData}
            className="text-primary hover:underline min-h-touch text-size-base font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout - keep original design
  if (isMobile) {
    return (
      <div className="h-full overflow-auto bg-background pb-20 safe-area-inset-bottom">
        <div className="w-full mx-auto p-space-md space-y-space-lg max-w-2xl">
          {/* Header */}
          <div className="space-y-space-xs">
            <h1 className="text-size-xl font-bold tracking-tight">Good morning</h1>
            <p className="text-muted-foreground text-size-sm">Let's make today meaningful</p>
          </div>

          {/* Dashboard Widgets */}
          <div className="space-y-space-md">
            <HeroCard 
              message={dashboardData.heroMessage}
              onRefresh={handleRefreshHero}
              isRefreshing={refreshingHero}
            />
            
            <QuickReflectionWidget 
              placeholder={dashboardData.reflectionPreview}
              onTap={() => onNavigate("journal")}
            />
            
            <HabitsSnapshot 
              habits={dashboardData.topHabits}
              onViewAll={() => onNavigate("habits")}
            />
            
            <RecentJournalWidget 
              snippet={dashboardData.recentJournalSnippet}
              onTap={() => onNavigate("journal")}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - card-based grid with homebase feel
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-space-md md:p-space-xl">
        {/* Header */}
        <div className="text-center mb-space-xl">
          <h1 className="text-size-2xl md:text-size-3xl font-bold tracking-tight mb-space-xs">Good morning</h1>
          <p className="text-muted-foreground text-size-base md:text-size-lg">Let's make today meaningful</p>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-space-lg">
          {/* Hero Card - Full Width */}
          <div className="w-full">
            <HeroCard 
              message={dashboardData.heroMessage}
              onRefresh={handleRefreshHero}
              isRefreshing={refreshingHero}
            />
          </div>
          
          {/* 2-Column Grid for Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <QuickReflectionWidget 
              placeholder={dashboardData.reflectionPreview}
              onTap={() => onNavigate("journal")}
            />
            
            <HabitsSnapshot 
              habits={dashboardData.topHabits}
              onViewAll={() => onNavigate("habits")}
            />
            
            <RecentJournalWidget 
              snippet={dashboardData.recentJournalSnippet}
              onTap={() => onNavigate("journal")}
            />
            
            {/* Empty slot for visual balance or future widget */}
            <div className="hidden md:block"></div>
          </div>

          {/* Quick Access - Full Width Bottom */}
          <div className="w-full mt-space-xl">
            <div className="bg-card border rounded-lg p-space-lg">
              <h2 className="text-size-lg font-semibold mb-space-md text-center">Quick Access</h2>
              <QuickstartArea
                activeWorkflow={activeWorkflow}
                onWorkflowChange={onWorkflowChange}
                onCreateNewChat={() => {
                  onCreateNewChat();
                  onNavigate("chat");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};