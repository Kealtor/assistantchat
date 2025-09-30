import { useState, useEffect, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useAuth } from "@/hooks/useAuth";
import { dashboardConfigService, DashboardWidget, DashboardLayout } from "@/services/dashboardConfigService";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Save, RotateCcw, Plus } from "lucide-react";
import { ViewMode } from "@/types/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

// Widget Components
import { HeroCard } from "./HeroCard";
import { QuickReflectionWidget } from "./QuickReflectionWidget";
import { HabitsSnapshot } from "./HabitsSnapshot";
import { RecentJournalWidget } from "./RecentJournalWidget";
import { QuickstartArea } from "../chat/QuickstartArea";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface CustomizableDashboardProps {
  onNavigate: (view: ViewMode) => void;
  workflows?: any[];
  activeWorkflow?: string;
  onWorkflowChange?: (workflow: string) => void;
  onCreateNewChat?: () => void;
}

export const CustomizableDashboard = ({
  onNavigate,
  workflows = [],
  activeWorkflow = "",
  onWorkflowChange = () => {},
  onCreateNewChat = () => {}
}: CustomizableDashboardProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingHero, setRefreshingHero] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadUserLayout();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const data = await dashboardService.fetchDashboardData(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadUserLayout = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userLayout = await dashboardConfigService.getUserLayout(user.id);
      setLayout(userLayout);
    } catch (error) {
      console.error('Error loading layout:', error);
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
    } catch (error) {
      console.error('Error refreshing hero message:', error);
    } finally {
      setRefreshingHero(false);
    }
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!layout || !isEditMode) return;

    const updatedWidgets = layout.widgets.map(widget => {
      const gridItem = newLayout.find(item => item.i === widget.id);
      if (gridItem) {
        return {
          ...widget,
          x: gridItem.x,
          y: gridItem.y,
          w: gridItem.w,
          h: gridItem.h
        };
      }
      return widget;
    });

    setLayout({ widgets: updatedWidgets });
  };

  const saveLayout = async () => {
    if (!user || !layout) return;

    try {
      await dashboardConfigService.saveUserLayout(user.id, layout);
      setIsEditMode(false);
      // Reload to ensure we have the saved version
      await loadUserLayout();
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  const resetLayout = async () => {
    if (!user) return;

    try {
      await dashboardConfigService.resetToDefault(user.id);
      await loadUserLayout();
      setIsEditMode(false);
    } catch (error) {
      console.error('Error resetting layout:', error);
    }
  };

  const gridLayout = useMemo(() => {
    if (!layout) return [];
    
    return layout.widgets.map(widget => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW,
      minH: widget.minH,
      maxW: widget.maxW,
      maxH: widget.maxH
    }));
  }, [layout]);

  const renderWidget = (widget: DashboardWidget) => {
    if (!dashboardData) return null;

    switch (widget.type) {
      case 'hero':
        return (
          <div className="h-full">
            <HeroCard
              message={dashboardData.heroMessage}
              onRefresh={handleRefreshHero}
              isRefreshing={refreshingHero}
            />
          </div>
        );
      case 'reflection':
        return (
          <div className="h-full">
            <QuickReflectionWidget
              placeholder={dashboardData.reflectionPreview}
              onTap={() => onNavigate("journal")}
            />
          </div>
        );
      case 'habits':
        return (
          <div className="h-full">
            <HabitsSnapshot
              habits={dashboardData.topHabits}
              onViewAll={() => onNavigate("habits")}
            />
          </div>
        );
      case 'journal':
        return (
          <div className="h-full">
            <RecentJournalWidget
              snippet={dashboardData.recentJournalSnippet}
              onTap={() => onNavigate("journal")}
            />
          </div>
        );
      case 'quickstart':
        return (
          <div className="bg-card border rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
            <div className="flex-1 min-h-0">
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
        );
      default:
        return <div className="h-full">Unknown widget type</div>;
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto bg-background safe-area-inset-bottom">
        <div className="max-w-6xl mx-auto p-space-md md:p-space-lg">
          <div className="flex justify-between items-center mb-space-lg">
            <div className="space-y-space-xs">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="space-y-space-md">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!layout || !dashboardData) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load dashboard</p>
          <Button onClick={loadUserLayout} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Mobile layout - simplified without grid
  if (isMobile) {
    return (
      <div className="h-full overflow-auto bg-background pb-20 safe-area-inset-bottom">
        <div className="w-full mx-auto p-space-md space-y-space-lg max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center gap-space-sm">
            <div className="space-y-space-xs min-w-0 flex-1">
              <h1 className="text-size-xl font-bold tracking-tight truncate">Good morning</h1>
              <p className="text-muted-foreground text-size-sm truncate">Let's make today meaningful</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="min-h-touch min-w-touch flex-shrink-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Widgets in order */}
          <div className="space-y-space-md">
            {layout.widgets
              .sort((a, b) => a.y - b.y)
              .map(widget => (
                <div key={widget.id} className="min-h-[120px]">
                  {renderWidget(widget)}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout with grid
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-space-md lg:p-space-lg">
        {/* Header with controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-space-lg gap-space-md">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <h1 className="text-size-2xl lg:text-size-3xl font-bold tracking-tight mb-space-xs">Good morning</h1>
            <p className="text-muted-foreground text-size-base lg:text-size-lg">Let's make today meaningful</p>
          </div>
          
          <div className="flex gap-space-sm w-full lg:w-auto justify-end">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={resetLayout} size="sm" className="min-h-touch">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={saveLayout} size="sm" className="min-h-touch">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditMode(true)} size="sm" className="min-h-touch">
                <Edit className="w-4 h-4 mr-2" />
                Customize
              </Button>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactType="vertical"
        >
        {layout.widgets.map(widget => (
          <div key={widget.id} className={`${isEditMode ? "cursor-move" : ""} h-full overflow-hidden rounded-lg`}>
            {renderWidget(widget)}
            {isEditMode && (
              <div className="absolute top-space-xs right-space-xs bg-background/90 rounded p-space-xs z-10 shadow-sm">
                <span className="text-size-xs text-muted-foreground capitalize">{widget.type}</span>
              </div>
            )}
          </div>
        ))}
        </ResponsiveGridLayout>

        {isEditMode && (
          <Card className="mt-6 p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Drag and resize widgets to customize your dashboard. Click Save when done.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};