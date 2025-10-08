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
      <div className="h-full overflow-auto bg-background">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="space-y-4">
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
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load dashboard content</p>
          <button 
            onClick={loadDashboardData}
            className="text-primary hover:underline"
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
      <div className="h-full overflow-auto bg-background">
        <div className="w-full mx-auto p-4 space-y-6 max-w-2xl">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Good morning</h1>
            <p className="text-muted-foreground">Let's make today meaningful</p>
          </div>

          {/* Dashboard Widgets */}
          <div className="space-y-4">
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
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Good morning</h1>
          <p className="text-muted-foreground text-lg">Let's make today meaningful</p>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Hero Card - Full Width */}
          <div className="w-full">
            <HeroCard 
              message={dashboardData.heroMessage}
              onRefresh={handleRefreshHero}
              isRefreshing={refreshingHero}
            />
          </div>
          
          {/* 2-Column Grid for Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickReflectionWidget 
              placeholder={dashboardData.reflectionPreview}
              onTap={() => onNavigate("journal")}
            />
            
            <HabitsSnapshot 
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
          <div className="w-full mt-8">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Quick Access</h2>
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