import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { habitService, Habit, HabitEntry } from "@/services/habitService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HabitsSnapshotProps {
  onViewAll: () => void;
  isEditMode?: boolean;
}

interface HabitWithStatus extends Habit {
  completed: boolean;
  streak: number;
  progress: number;
}

export const HabitsSnapshot = ({ onViewAll, isEditMode = false }: HabitsSnapshotProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      loadHabitsData();
    }
  }, [user]);

  const loadHabitsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [habitsData, entriesData] = await Promise.all([
        habitService.getUserHabits(user.id),
        habitService.getHabitEntries(
          user.id,
          format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
          today
        )
      ]);

      // Initialize default habits if none exist
      if (habitsData.length === 0) {
        await habitService.initializeDefaultHabits(user.id);
        const newHabits = await habitService.getUserHabits(user.id);
        const habitsWithStatus = newHabits.slice(0, 5).map(habit => 
          calculateHabitStatus(habit, entriesData)
        );
        setHabits(habitsWithStatus);
      } else {
        const habitsWithStatus = habitsData.slice(0, 5).map(habit => 
          calculateHabitStatus(habit, entriesData)
        );
        setHabits(habitsWithStatus);
      }

      setEntries(entriesData);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHabitStatus = (habit: Habit, allEntries: HabitEntry[]): HabitWithStatus => {
    const habitEntries = allEntries.filter(e => e.habit_id === habit.id);
    const todayEntry = habitEntries.find(e => e.entry_date === today);
    const last7Days = habitEntries.filter(e => {
      const entryDate = new Date(e.entry_date);
      const daysAgo = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    
    const streak = habitService.calculateStreak(habitEntries);
    const progress = last7Days.length > 0 
      ? (last7Days.filter(e => e.rating > 0).length / 7) * 100 
      : 0;

    return {
      ...habit,
      completed: todayEntry ? todayEntry.rating > 0 : false,
      streak,
      progress: Math.round(progress)
    };
  };

  const handleToggleHabit = async (habitId: string, e: React.MouseEvent) => {
    if (isEditMode || !user) return;
    e.stopPropagation();

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    try {
      if (habit.completed) {
        // Mark as incomplete by deleting entry
        await habitService.deleteHabitEntry(habitId, today);
      } else {
        // Mark as complete with rating of 5
        await habitService.upsertHabitEntry({
          habit_id: habitId,
          user_id: user.id,
          entry_date: today,
          rating: 5
        });
      }

      // Reload data to update UI
      await loadHabitsData();
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Habits</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
        {habits.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No habits yet. Visit the Habits tab to create some!
          </p>
        ) : (
          habits.map((habit) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
};