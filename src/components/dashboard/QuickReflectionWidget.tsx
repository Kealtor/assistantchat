import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cardContentService } from "@/services/cardContentService";
import { cn } from "@/lib/utils";

interface QuickReflectionWidgetProps {
  placeholder: string;
  onTap: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isEditMode?: boolean;
}

interface ReflectionContent {
  title: string;
  subtitle: string;
}

export const QuickReflectionWidget = ({ placeholder, onTap, onRefresh, isRefreshing, isEditMode = false }: QuickReflectionWidgetProps) => {
  const [content, setContent] = useState<ReflectionContent>({
    title: "Quick Reflection",
    subtitle: placeholder
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await cardContentService.getCardContent('reflection');
        if (data?.content) {
          setContent(data.content as ReflectionContent);
        }
      } catch (error) {
        console.error('Error loading reflection content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    // Subscribe to real-time updates
    const unsubscribe = cardContentService.subscribeToCardUpdates('reflection', (payload) => {
      if (payload.new?.content) {
        setContent(payload.new.content as ReflectionContent);
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full transition-all flex flex-col overflow-hidden">
        <CardContent className="p-6 flex-1 flex items-center">
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-5 bg-muted rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`h-full transition-all flex flex-col overflow-hidden ${!isEditMode ? 'cursor-pointer hover:shadow-md hover:bg-accent/50 active:scale-[0.99]' : ''}`}
      onClick={isEditMode ? undefined : onTap}
    >
      <CardContent className="p-6 flex-1 flex items-center relative">
        <div className="flex items-center gap-3 w-full pr-12">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <PenTool className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{content.title}</h3>
            <p className="text-base text-muted-foreground">
              {content.subtitle}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={isRefreshing}
          className="absolute top-4 right-4"
        >
          <RefreshCw 
            className={cn(
              "w-4 h-4", 
              isRefreshing && "animate-spin"
            )} 
          />
        </Button>
      </CardContent>
    </Card>
  );
};