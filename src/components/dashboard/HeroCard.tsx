import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCardProps {
  message: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const HeroCard = ({ message, onRefresh, isRefreshing }: HeroCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Daily Inspiration</span>
            </div>
            <p className="text-foreground leading-relaxed">
              {message}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex-shrink-0 text-primary hover:bg-primary/10"
          >
            <RefreshCw 
              className={cn(
                "w-4 h-4", 
                isRefreshing && "animate-spin"
              )} 
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};