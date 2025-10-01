import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  progress: number;
}

interface HabitsSnapshotProps {
  habits: Habit[];
  onViewAll: () => void;
  isEditMode?: boolean;
}

export const HabitsSnapshot = ({ habits, onViewAll, isEditMode = false }: HabitsSnapshotProps) => {
  const handleToggleHabit = (habitId: string, e: React.MouseEvent) => {
    if (isEditMode) return;
    e.stopPropagation();
    // This would integrate with the habit service to update completion
    console.log('Toggle habit:', habitId);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Habits</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={isEditMode ? undefined : onViewAll}
            className="text-primary hover:bg-primary/10"
            disabled={isEditMode}
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={(e) => handleToggleHabit(habit.id, e)}
                  className="flex-shrink-0"
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    habit.completed && "line-through text-muted-foreground"
                  )}>
                    {habit.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  <span>{habit.streak}</span>
                </div>
              </div>
            </div>
            
            <div className="ml-8">
              <Progress value={habit.progress} className="h-1.5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};