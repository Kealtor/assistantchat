import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit, HabitEntry, habitService } from "@/services/habitService";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface HabitDailyTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
  onRatingUpdate: (habitId: string, date: string, rating: number) => void;
}

export const HabitDailyTracker = ({ habits, entries, onRatingUpdate }: HabitDailyTrackerProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const getTodayRating = (habitId: string): number => {
    const entry = entries.find(e => e.habit_id === habitId && e.entry_date === today);
    return entry?.rating || 0;
  };

  const getHabitEntries = (habitId: string): HabitEntry[] => {
    return entries.filter(e => e.habit_id === habitId).sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
  };

  const getStreak = (habitId: string): number => {
    const habitEntries = getHabitEntries(habitId);
    return habitService.calculateStreak(habitEntries);
  };

  const get7DayAverage = (habitId: string): number => {
    const habitEntries = getHabitEntries(habitId);
    return habitService.calculate7DayAverage(habitEntries);
  };

  const getRatingColor = (rating: number): string => {
    if (rating === 1) return "bg-red-500 hover:bg-red-600";
    if (rating === 2) return "bg-orange-500 hover:bg-orange-600";
    if (rating === 3) return "bg-yellow-500 hover:bg-yellow-600";
    if (rating === 4) return "bg-lime-500 hover:bg-lime-600";
    if (rating === 5) return "bg-green-500 hover:bg-green-600";
    return "bg-muted hover:bg-muted/80";
  };

  const handleRatingClick = (habitId: string, rating: number) => {
    const currentRating = getTodayRating(habitId);
    const newRating = currentRating === rating ? 0 : rating;
    onRatingUpdate(habitId, today, newRating);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Daily Tracker</CardTitle>
        <p className="text-sm text-muted-foreground">
          Rate your habits for {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {habits.map((habit) => {
          const currentRating = getTodayRating(habit.id);
          const streak = getStreak(habit.id);
          const average = get7DayAverage(habit.id);
          
          return (
            <div key={habit.id} className="space-y-3">
              {/* Habit Header */}
              <div className="flex items-center gap-3">
                <span className="text-xl">{habit.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{habit.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      <span>Streak: {streak}</span>
                    </div>
                    <span>7-day avg: {average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {/* Rating Buttons */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(habit.id, rating)}
                    className={cn(
                      "w-8 h-8 rounded text-xs font-bold text-white transition-all transform hover:scale-105 active:scale-95",
                      currentRating === rating 
                        ? getRatingColor(rating)
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                    title={`Rate ${habit.name}: ${rating}/5`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    currentRating > 0 ? getRatingColor(currentRating).split(' ')[0] : "bg-muted"
                  )}
                  style={{ width: `${(currentRating / 5) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {habits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits found. Click Settings to create your first habit!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};