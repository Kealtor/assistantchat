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
    if (rating === 1) return "bg-habit-rating-1 hover:bg-habit-rating-1/80";
    if (rating === 2) return "bg-habit-rating-2 hover:bg-habit-rating-2/80";
    if (rating === 3) return "bg-habit-rating-3 hover:bg-habit-rating-3/80";
    if (rating === 4) return "bg-habit-rating-4 hover:bg-habit-rating-4/80";
    if (rating === 5) return "bg-habit-rating-5 hover:bg-habit-rating-5/80";
    return "bg-habit-unrated hover:bg-habit-unrated/80";
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
            <div key={habit.id} className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
              {/* Block 1: Header with habit info + streak data + rating buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>🔥 {streak} days</span>
                      <span>📊 {average.toFixed(1)}/5 avg</span>
                    </div>
                  </div>
                </div>
                
                {/* Rating buttons inline */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium mr-2">Today:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingClick(habit.id, rating)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 text-sm font-medium transition-all hover:scale-110",
                        currentRating === rating
                          ? `${getRatingColor(rating)} border-ring text-white`
                          : "border-border bg-background hover:border-ring"
                      )}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block 2: Acceptance Criteria and Notes side by side */}
              {(habit.acceptance_criteria || habit.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Acceptance Criteria */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Acceptance Criteria</div>
                    <div className="p-3 rounded-md bg-muted/50 border border-border min-h-[60px]">
                      <div className="text-sm whitespace-pre-wrap">
                        {habit.acceptance_criteria || "No acceptance criteria set"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <div className="p-3 rounded-md bg-secondary/50 border border-border min-h-[60px]">
                      <div className="text-sm whitespace-pre-wrap">
                        {habit.notes || "Additional notes or reminders"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Block 3: Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentRating}/5</span>
                </div>
                <div className="w-full bg-habit-unrated rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      currentRating > 0 ? getRatingColor(currentRating).split(' ')[0] : "bg-habit-unrated"
                    )}
                    style={{ width: `${(currentRating / 5) * 100}%` }}
                  />
                </div>
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