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
          onClick={onRefresh}
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