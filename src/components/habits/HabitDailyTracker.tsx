import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit, HabitEntry, habitService } from "@/services/habitService";
import { cn } from "@/lib/utils";
import { Flame, Edit3, Check, X, Info } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoPopover } from "@/components/ui/info-popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface HabitDailyTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
  onRatingUpdate: (habitId: string, date: string, rating: number) => void;
  onHabitUpdate: (habitId: string, updates: Partial<Habit>) => void;
  onNotesUpdate: (habitId: string, date: string, notes: string) => void;
}

export const HabitDailyTracker = ({ habits, entries, onRatingUpdate, onHabitUpdate, onNotesUpdate }: HabitDailyTrackerProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");
  const isMobile = useIsMobile();
  
  const getTodayRating = (habitId: string): number => {
    const entry = entries.find(e => e.habit_id === habitId && e.entry_date === today);
    return entry?.rating || 0;
  };

  const getTodayNotes = (habitId: string): string => {
    const entry = entries.find(e => e.habit_id === habitId && e.entry_date === today);
    return entry?.notes || "";
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

  const handleNotesEdit = (habitId: string, currentNotes: string) => {
    setEditingNotes(habitId);
    setTempNotes(currentNotes || "");
  };

  const handleNotesSave = async (habitId: string) => {
    await onNotesUpdate(habitId, today, tempNotes);
    setEditingNotes(null);
    setTempNotes("");
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setTempNotes("");
  };

  return (
    <TooltipProvider>
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
            
            if (isMobile) {
              // Mobile layout - vertical flow
              return (
                <div key={habit.id} className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
                  {/* Mobile: Habit name with acceptance criteria info */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-semibold">{habit.name}</h3>
                      {habit.acceptance_criteria && (
                        <>
                          <InfoPopover side="bottom" align="start">
                            <p className="text-sm whitespace-pre-wrap">{habit.acceptance_criteria}</p>
                          </InfoPopover>
                          {/* Desktop tooltip fallback */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground hidden lg:block">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm whitespace-pre-wrap">{habit.acceptance_criteria}</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                    {/* Streak data on far right for mobile */}
                    <div className="ml-auto flex gap-2 text-xs text-muted-foreground">
                      <span>🔥 {streak}d</span>
                      <span>📊 {average.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Mobile: Rating buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Today:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingClick(habit.id, rating)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 text-sm font-medium transition-all hover:scale-110",
                          currentRating === rating
                            ? `${getRatingColor(rating)} border-ring text-white`
                            : "border-border bg-background hover:border-ring"
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>

                  {/* Mobile: Notes block */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-muted-foreground">Notes</div>
                      {editingNotes !== habit.id && (
                        <button
                          onClick={() => handleNotesEdit(habit.id, getTodayNotes(habit.id))}
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    
                    {editingNotes === habit.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="min-h-[60px] text-sm"
                          placeholder="Additional notes or reminders"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleNotesSave(habit.id)}
                            className="p-1 hover:bg-green-100 rounded text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleNotesCancel}
                            className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-md bg-secondary/50 border border-border min-h-[60px] cursor-pointer hover:bg-secondary/70 transition-colors"
                           onClick={() => handleNotesEdit(habit.id, getTodayNotes(habit.id))}>
                        <div className="text-sm whitespace-pre-wrap">
                          {getTodayNotes(habit.id) || "Click to add notes for today..."}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile: Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentRating}/5</span>
                    </div>
                    <div className="w-full bg-habit-unrated rounded-full h-3">
                      <div
                        className={cn(
                          "h-3 rounded-full transition-all duration-300",
                          currentRating > 0 ? getRatingColor(currentRating).split(' ')[0] : "bg-habit-unrated"
                        )}
                        style={{ width: `${(currentRating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            // Desktop layout - keep current design mostly intact
            return (
              <div key={habit.id} className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
                {/* Desktop: Header with habit name, rating buttons, and streak data */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{habit.icon}</span>
                    <h3 className="text-2xl font-semibold">{habit.name}</h3>
                    
                    {/* Rating buttons right next to habit name */}
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
                  
                  {/* Streak data on far right */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>🔥 {streak} days</span>
                    <span>📊 {average.toFixed(1)}/5 avg</span>
                  </div>
                </div>

                {/* Desktop: Acceptance Criteria and Notes side by side */}
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
                  
                  {/* Notes - Editable */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    {editingNotes !== habit.id && (
                      <button
                        onClick={() => handleNotesEdit(habit.id, getTodayNotes(habit.id))}
                        className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    )}
                    </div>
                    
                    {editingNotes === habit.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="min-h-[60px] text-sm"
                          placeholder="Additional notes or reminders"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleNotesSave(habit.id)}
                            className="p-1 hover:bg-green-100 rounded text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleNotesCancel}
                            className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-md bg-secondary/50 border border-border min-h-[60px] cursor-pointer hover:bg-secondary/70 transition-colors"
                           onClick={() => handleNotesEdit(habit.id, getTodayNotes(habit.id))}>
                        <div className="text-sm whitespace-pre-wrap">
                          {getTodayNotes(habit.id) || "Click to add notes for today..."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop: Progress bar */}
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
    </TooltipProvider>
  );
};