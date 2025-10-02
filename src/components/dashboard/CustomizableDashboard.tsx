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
import { getUIWorkflows } from "@/config/workflows.config";
import { userService } from "@/services/userService";
import { useAdmin } from "@/hooks/useAdmin";

// Widget Components
import { HeroCard } from "./HeroCard";
import { QuickReflectionWidget } from "./QuickReflectionWidget";
import { HabitsSnapshot } from "./HabitsSnapshot";
import { RecentJournalWidget } from "./RecentJournalWidget";
import { QuickstartArea } from "../chat/QuickstartArea";
import { QuickAccessButtons } from "./QuickAccessButtons";

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
  const { isAdmin } = useAdmin();
  const isMobile = useIsMobile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingHero, setRefreshingHero] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [allowedWorkflows, setAllowedWorkflows] = useState(getUIWorkflows());

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadUserLayout();
      fetchUserPermissions();
    }
  }, [user, isAdmin]);

  const fetchUserPermissions = async () => {
    if (!user) {
      setAllowedWorkflows([]);
      setUserPermissions([]);
      return;
    }
    
    try {
      const permissions = await userService.getUserPermissions(user.id);
      const permissionWorkflows = permissions.map(p => p.workflow_id);
      setUserPermissions(permissionWorkflows);
      
      const allWorkflows = getUIWorkflows();
      const filtered = isAdmin 
        ? allWorkflows 
        : allWorkflows.filter(workflow => permissionWorkflows.includes(workflow.id));
      
      setAllowedWorkflows(filtered);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      setAllowedWorkflows([]);
      setUserPermissions([]);
    }
  };

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
              isEditMode={isEditMode}
            />
          </div>
        );
      case 'habits':
        return (
          <div className="h-full">
            <HabitsSnapshot
              habits={dashboardData.topHabits}
              onViewAll={() => onNavigate("habits")}
              isEditMode={isEditMode}
            />
          </div>
        );
      case 'journal':
        return (
          <div className="h-full">
            <RecentJournalWidget
              snippet={dashboardData.recentJournalSnippet}
              onTap={() => onNavigate("journal")}
              isEditMode={isEditMode}
            />
          </div>
        );
      case 'quickstart':
        return (
          <div className="bg-card border rounded-lg p-6 h-full flex flex-col overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
            <div className="flex-1 min-h-0">
              <QuickAccessButtons
                activeWorkflow={activeWorkflow}
                allowedWorkflows={allowedWorkflows}
                onWorkflowChange={onWorkflowChange}
                onCreateNewChat={() => {
                  onCreateNewChat();
                  onNavigate("chat");
                }}
                isEditMode={isEditMode}
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
      <div className="h-full overflow-auto bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="h-full overflow-auto bg-background">
        <div className="w-full mx-auto p-4 space-y-6 max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Good morning</h1>
              <p className="text-muted-foreground">Let's make today meaningful</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Widgets in order */}
          <div className="space-y-4">
            {layout.widgets
              .sort((a, b) => a.y - b.y)
              .map(widget => (
                <div key={widget.id} className="pointer-events-auto">
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Good morning</h1>
            <p className="text-muted-foreground text-lg">Let's make today meaningful</p>
          </div>
          
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={resetLayout} size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={saveLayout} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditMode(true)} size="sm">
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
          rowHeight={50}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactType="vertical"
          resizeHandles={['se']}
        >
        {layout.widgets.map(widget => (
          <div 
            key={widget.id} 
            className={`${isEditMode ? "cursor-move" : ""} h-full flex flex-col`}
            style={{ minHeight: `${(widget.minH || 2) * 50}px` }}
          >
            <div className="h-full overflow-auto">
              {renderWidget(widget)}
            </div>
            {isEditMode && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 z-10 shadow-sm">
                <span className="text-xs text-muted-foreground capitalize font-medium">{widget.type}</span>
              </div>
            )}
          </div>
        ))}
        </ResponsiveGridLayout>

        {isEditMode && (
          <Card className="mt-6 p-4 bg-muted/30 border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium">Drag</span> to reposition • <span className="font-medium">Resize handle</span> (bottom-right corner) to adjust height • <span className="font-medium">Save</span> to keep changes
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};