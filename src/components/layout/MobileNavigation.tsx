import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "chat" | "journal" | "user";

interface MobileNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onCreateNewChat: () => void;
  chatCount?: number;
}

export const MobileNavigation = ({
  currentView,
  onViewChange,
  onCreateNewChat,
  chatCount = 0,
}: MobileNavigationProps) => {
  const navItems = [
    {
      id: "chat" as const,
      label: "Chat",
      icon: MessageSquare,
      action: () => onViewChange("chat"),
    },
    {
      id: "new" as const,
      label: "New",
      icon: Plus,
      action: onCreateNewChat,
      special: true,
    },
    {
      id: "journal" as const,
      label: "Journal",
      icon: BookOpen,
      action: () => onViewChange("journal"),
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
          
          if (item.special) {
            return (
              <Button
                key={item.id}
                onClick={item.action}
                size="sm"
                className="h-touch-comfortable w-touch-comfortable rounded-full p-0"
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          }

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
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.id === "chat" && chatCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {chatCount > 99 ? "99+" : chatCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};