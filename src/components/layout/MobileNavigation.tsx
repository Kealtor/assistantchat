import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, User, Plus, Target, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode } from "@/types/navigation";

interface MobileNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const MobileNavigation = ({
  currentView,
  onViewChange,
}: MobileNavigationProps) => {
  const navItems = [
    {
      id: "dashboard" as const,
      label: "Home",
      icon: Home,
      action: () => onViewChange("dashboard"),
    },
    {
      id: "chat" as const,
      label: "Chat",
      icon: MessageSquare,
      action: () => onViewChange("chat"),
    },
    {
      id: "journal" as const,
      label: "Journal",
      icon: BookOpen,
      action: () => onViewChange("journal"),
    },
    {
      id: "habits" as const,
      label: "Habits",
      icon: Target,
      action: () => onViewChange("habits"),
    },
    {
      id: "user" as const,
      label: "Profile",
      icon: User,
      action: () => onViewChange("user"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden shadow-lg">
      <div className="flex items-center justify-around px-space-xs py-space-xs safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                "flex flex-col items-center justify-center min-h-touch-comfortable min-w-[60px] px-space-xs py-space-xs transition-all duration-200",
                "rounded-lg relative touch-target",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95"
              )}
            >
              <Icon className="h-5 w-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};