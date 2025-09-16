import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, User, Plus, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "chat" | "journal" | "habits" | "user";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                "flex flex-col items-center justify-center min-h-touch-comfortable px-3 py-2 transition-colors",
                "rounded-lg relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};