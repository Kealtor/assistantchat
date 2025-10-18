import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { webhookService } from "@/services/webhookService";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { cardContentService } from "@/services/cardContentService";

interface HeroCardProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

interface HeroContent {
  message: string;
}

export const HeroCard = ({ onRefresh, isRefreshing }: HeroCardProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("Yesterday you stayed consistent with your reading habit – great job. Let's build on that today and make it another win!");
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = async () => {
    // Trigger webhook if configured
    if (user) {
      try {
        await webhookService.trigger('daily_inspiration_webhook', {
          userId: user.id,
          cardType: 'daily_inspiration',
          timestamp: new Date().toISOString(),
          currentContent: { message }
        });
      } catch (error) {
        console.error('Webhook trigger failed:', error);
      }
    }
    
    // Call the original refresh handler
    onRefresh();
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await cardContentService.getCardContent('hero');
        if (data?.content) {
          const heroContent = data.content as HeroContent;
          setMessage(heroContent.message);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    // Subscribe to real-time updates
    const unsubscribe = cardContentService.subscribeToCardUpdates('hero', (payload) => {
      if (payload.new?.content) {
        const heroContent = payload.new.content as HeroContent;
        setMessage(heroContent.message);
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg flex flex-col overflow-hidden">
        <CardContent className="p-6 relative flex-1 flex items-center">
          <div className="w-full animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20" />
              <div className="h-6 bg-primary/20 rounded w-1/3" />
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-full" />
              <div className="h-5 bg-muted rounded w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg flex flex-col overflow-hidden">
      <CardContent className="p-6 relative flex-1 flex items-center">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-primary">Daily Inspiration</span>
          </div>
          <p className="text-base text-foreground leading-relaxed pr-12">
            {message}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="absolute top-4 right-4 text-primary hover:bg-primary/10"
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