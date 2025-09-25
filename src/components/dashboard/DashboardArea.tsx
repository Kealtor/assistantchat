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
        <div className="max-w-2xl mx-auto p-4 space-y-6">
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

  // Desktop layout - broader with quick access
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Dashboard Widgets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Good morning</h1>
              <p className="text-muted-foreground text-lg">Let's make today meaningful</p>
            </div>

            {/* Dashboard Widgets */}
            <div className="space-y-6">
              <HeroCard 
                message={dashboardData.heroMessage}
                onRefresh={handleRefreshHero}
                isRefreshing={refreshingHero}
              />
              
              <QuickReflectionWidget 
                placeholder={dashboardData.reflectionPreview}
                onTap={() => onNavigate("journal")}
              />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

          {/* Right Column - Quick Access */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
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