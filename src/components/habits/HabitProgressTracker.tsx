import { format, subDays, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit, HabitEntry } from "@/services/habitService";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitProgressTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
  currentDate?: Date;
}

export const HabitProgressTracker = ({ habits, entries, currentDate }: HabitProgressTrackerProps) => {
  const isMobile = useIsMobile();
  // Generate days based on device: 7 for mobile, 14 for desktop
  const daysCount = isMobile ? 7 : 14;
  const baseDate = currentDate || new Date();
  const days = Array.from({ length: daysCount }, (_, i) => subDays(baseDate, i));
  
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
    <TooltipProvider>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Progress Tracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last {daysCount} days overview
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Habit Rows */}
            {habits.map((habit) => (
              <div 
                key={habit.id} 
                className={cn(
                  "grid gap-1 items-center",
                  isMobile ? "grid-cols-8" : ""
                )}
                style={!isMobile ? { gridTemplateColumns: '200px repeat(14, 1fr)' } : {}}
              >
                <div className={cn(
                  "flex items-center gap-3 pr-4",
                  isMobile ? "col-span-8 mb-2" : "w-48"
                )}>
                  <span className="text-xl">{habit.icon}</span>
                  {!isMobile && <span className="text-sm font-medium">{habit.name}</span>}
                  {isMobile && <span className="text-sm font-medium">{habit.name}</span>}
                </div>
                
                {isMobile && (
                  <div className="col-span-8 grid grid-cols-7 gap-1">
                    {days.map((day, dayIndex) => {
                      const entry = getEntryForHabitAndDate(habit.id, day);
                      const rating = entry?.rating || 0;
                      const notes = entry?.notes || "";
                      const hasContent = rating > 0 || notes.trim().length > 0;
                      
                      const cellContent = (
                        <div
                          className={cn(
                            "h-10 w-full rounded border border-border transition-colors aspect-square hover:scale-105 hover:shadow-md cursor-pointer",
                            getRatingColor(rating),
                             isSameDay(day, baseDate) && "ring-2 ring-primary ring-offset-1"
                          )}
                        />
                      );

                      return hasContent ? (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            {cellContent}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">{habit.name}</p>
                              <p className="text-xs text-muted-foreground">{format(day, 'MMM d, yyyy')}</p>
                              <p className="text-sm">Rating: {rating}/5</p>
                              {notes && (
                                <div className="border-t pt-1 mt-1">
                                  <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                                  <p className="text-sm whitespace-pre-wrap">{notes}</p>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div key={dayIndex}>
                          {cellContent}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!isMobile && days.map((day, dayIndex) => {
                  const entry = getEntryForHabitAndDate(habit.id, day);
                  const rating = entry?.rating || 0;
                  const notes = entry?.notes || "";
                  const hasContent = rating > 0 || notes.trim().length > 0;
                  
                  const cellContent = (
                    <div
                      className={cn(
                        "h-8 w-full rounded border border-border transition-colors aspect-square hover:scale-105 hover:shadow-md cursor-pointer",
                        getRatingColor(rating),
                        isSameDay(day, baseDate) && "ring-2 ring-primary ring-offset-1"
                      )}
                    />
                  );

                  return hasContent ? (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        {cellContent}
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-xs text-muted-foreground">{format(day, 'MMM d, yyyy')}</p>
                          <p className="text-sm">Rating: {rating}/5</p>
                          {notes && (
                            <div className="border-t pt-1 mt-1">
                              <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                              <p className="text-sm whitespace-pre-wrap">{notes}</p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={dayIndex}>
                      {cellContent}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Legend - Hide text on mobile */}
            <div className={cn(
              "flex items-center gap-4 pt-4 border-t text-xs text-muted-foreground",
              isMobile ? "justify-center" : ""
            )}>
              {!isMobile && <span>Rating:</span>}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-unrated border"></div>
                {!isMobile && <span>0</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-rating-1"></div>
                {!isMobile && <span>1</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-rating-2"></div>
                {!isMobile && <span>2</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-rating-3"></div>
                {!isMobile && <span>3</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-rating-4"></div>
                {!isMobile && <span>4</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-habit-rating-5"></div>
                {!isMobile && <span>5</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};