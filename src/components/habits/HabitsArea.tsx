import { useState, useEffect } from "react";
import { HabitProgressTracker } from "./HabitProgressTracker";
import { HabitDailyTracker } from "./HabitDailyTracker";
import { HabitSettings } from "./HabitSettings";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { habitService, Habit, HabitEntry } from "@/services/habitService";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";

export const HabitsArea = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHabitsData();
    }
  }, [user]);

  const loadHabitsData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Load habits
    let userHabits = await habitService.getUserHabits(user.id);
    
    // Initialize default habits if none exist
    if (userHabits.length === 0) {
      await habitService.initializeDefaultHabits(user.id);
      userHabits = await habitService.getUserHabits(user.id);
    }
    
    setHabits(userHabits);
    
    // Load entries for last 14 days
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 13), 'yyyy-MM-dd');
    
    const habitEntries = await habitService.getHabitEntries(user.id, startDate, endDate);
    setEntries(habitEntries);
    
    setLoading(false);
  };

  const handleRatingUpdate = async (habitId: string, date: string, rating: number) => {
    if (!user) return;
    
    if (rating === 0) {
      // Remove entry if rating is 0
      await habitService.deleteHabitEntry(habitId, date);
      setEntries(prev => prev.filter(e => !(e.habit_id === habitId && e.entry_date === date)));
    } else {
      // Create or update entry
      const entry = await habitService.upsertHabitEntry({
        habit_id: habitId,
        user_id: user.id,
        entry_date: date,
        rating: rating
      });
      
      if (entry) {
        setEntries(prev => {
          const filtered = prev.filter(e => !(e.habit_id === habitId && e.entry_date === date));
          return [...filtered, entry];
        });
      }
    }
  };

  const handleHabitUpdate = async (habitId: string, updates: any) => {
    const updatedHabit = await habitService.updateHabit(habitId, updates);
    if (updatedHabit) {
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
    }
  };

  const handleHabitCreate = async (habitData: any) => {
    if (!user) return;
    
    const newHabit = await habitService.createHabit({
      ...habitData,
      user_id: user.id
    });
    
    if (newHabit) {
      setHabits(prev => [...prev, newHabit]);
    }
  };

  const handleHabitDelete = async (habitId: string) => {
    const success = await habitService.deleteHabit(habitId);
    if (success) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      setEntries(prev => prev.filter(e => e.habit_id !== habitId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Habit Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily habits and build lasting routines
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-4">
            <HabitSettings
              habits={habits}
              onHabitUpdate={handleHabitUpdate}
              onHabitCreate={handleHabitCreate}
              onHabitDelete={handleHabitDelete}
              onClose={() => setShowSettings(false)}
            />
          </Card>
        )}

        {/* Main Content - Stacked vertically */}
        <div className="space-y-6">
          {/* Daily Tracker - On top */}
          <HabitDailyTracker 
            habits={habits}
            entries={entries}
            onRatingUpdate={handleRatingUpdate}
          />
          
          {/* Progress Tracker - Below with full width */}
          <HabitProgressTracker 
            habits={habits} 
            entries={entries}
          />
        </div>
      </div>
    </div>
  );
};