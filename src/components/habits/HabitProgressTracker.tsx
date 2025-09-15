import { format, subDays, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit, HabitEntry } from "@/services/habitService";
import { cn } from "@/lib/utils";

interface HabitProgressTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export const HabitProgressTracker = ({ habits, entries }: HabitProgressTrackerProps) => {
  // Generate the last 14 days - current day first (left), 14 days ago last (right)
  const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), i));
  
  const getRatingColor = (rating: number): string => {
    if (rating === 0) return "bg-habit-unrated";
    if (rating === 1) return "bg-habit-rating-1";
    if (rating === 2) return "bg-habit-rating-2";
    if (rating === 3) return "bg-habit-rating-3";
    if (rating === 4) return "bg-habit-rating-4";
    if (rating === 5) return "bg-habit-rating-5";
    return "bg-habit-unrated";
  };

  const getEntryForHabitAndDate = (habitId: string, date: Date): HabitEntry | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(e => e.habit_id === habitId && e.entry_date === dateStr) || null;
  };

  const getRatingForCell = (habitId: string, date: Date): number => {
    const entry = getEntryForHabitAndDate(habitId, date);
    return entry?.rating || 0;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Progress Tracker</CardTitle>
        <p className="text-sm text-muted-foreground">Last 14 days overview</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Habit Rows */}
          {habits.map((habit) => (
            <div key={habit.id} className="grid gap-1 items-center" style={{ gridTemplateColumns: '200px repeat(14, 1fr)' }}>
              <div className="w-48 flex items-center gap-3 pr-4">
                <span className="text-xl">{habit.icon}</span>
                <span className="text-sm font-medium">{habit.name}</span>
              </div>
              
              {days.map((day, dayIndex) => {
                const rating = getRatingForCell(habit.id, day);
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "h-8 w-full rounded border border-border transition-colors aspect-square",
                      getRatingColor(rating),
                      isSameDay(day, new Date()) && "ring-2 ring-primary ring-offset-1"
                    )}
                    title={`${habit.name} on ${format(day, 'MMM dd')}: ${rating}/5`}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center gap-4 pt-4 border-t text-xs text-muted-foreground">
            <span>Rating:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-unrated border"></div>
              <span>0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-rating-1"></div>
              <span>1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-rating-2"></div>
              <span>2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-rating-3"></div>
              <span>3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-rating-4"></div>
              <span>4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-habit-rating-5"></div>
              <span>5</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};