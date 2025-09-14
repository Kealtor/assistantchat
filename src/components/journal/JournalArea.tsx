import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, BookOpen, TrendingUp, Heart, Edit2 } from "lucide-react";
import { format, isToday, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { journalService, JournalEntry } from "@/services/journalService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Bad", color: "text-red-500" },
  { value: 2, emoji: "😔", label: "Bad", color: "text-orange-500" },
  { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
  { value: 4, emoji: "😊", label: "Good", color: "text-green-500" },
  { value: 5, emoji: "🤩", label: "Excellent", color: "text-blue-500" },
];

export const JournalArea = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [journalEntry, setJournalEntry] = useState("");
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    entriesThisWeek: 0,
    averageMood: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserEntries();
      loadWeeklyStats();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadEntryForDate(selectedDate);
    }
  }, [selectedDate, user]);

  const loadUserEntries = async () => {
    if (!user) return;
    
    const entries = await journalService.getUserEntries(user.id);
    setJournalEntries(entries);
  };

  const loadEntryForDate = async (date: Date) => {
    if (!user) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = await journalService.getEntryByDate(user.id, dateStr);
    
    if (entry) {
      setCurrentEntry(entry);
      setJournalEntry(entry.content);
      setSelectedMood(entry.mood || null);
    } else {
      setCurrentEntry(null);
      setJournalEntry("");
      setSelectedMood(null);
    }
    setIsEditing(false);
  };

  const loadWeeklyStats = async () => {
    if (!user) return;
    
    const stats = await journalService.getWeeklyStats(user.id);
    setWeeklyStats(stats);
  };

  const handleSaveEntry = async () => {
    if (!user || !journalEntry.trim()) return;
    
    setSaving(true);
    const entryDate = format(selectedDate, "yyyy-MM-dd");
    
    let savedEntry;
    
    if (currentEntry) {
      // Update existing entry
      savedEntry = await journalService.updateEntry(currentEntry.id, {
        content: journalEntry.trim(),
        mood: selectedMood || undefined,
        tags: []
      });
    } else {
      // Create new entry
      savedEntry = await journalService.createEntry({
        user_id: user.id,
        entry_date: entryDate,
        content: journalEntry.trim(),
        mood: selectedMood || undefined,
        tags: []
      });
    }
    
    if (savedEntry) {
      setCurrentEntry(savedEntry);
      toast({
        title: currentEntry ? "Entry updated" : "Entry saved",
        description: `Your journal entry has been ${currentEntry ? "updated" : "saved"} successfully.`,
      });
      
      // Refresh data
      loadUserEntries();
      loadWeeklyStats();
    } else {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    }
    
    setSaving(false);
    setIsEditing(false);
  };

  const handleMoodChange = (mood: number) => {
    setSelectedMood(mood);
  };

  const handleEditEntry = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentEntry) {
      setJournalEntry(currentEntry.content);
      setSelectedMood(currentEntry.mood || null);
    }
    setIsEditing(false);
  };

  const hasEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return journalEntries.some(entry => entry.entry_date === dateStr);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication required</h3>
          <p className="text-muted-foreground">Please sign in to access your journal</p>
        </div>
      </div>
    );
  }

  // Reusable components
  const WeeklyStats = () => (
    <Card>
      <CardHeader className="pb-3 px-4">
        <CardTitle className="text-base flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Entries</span>
          <Badge variant="secondary">{weeklyStats.entriesThisWeek} / 7</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Avg Mood</span>
          <div className="flex items-center space-x-1">
            <span className="text-lg">
              {weeklyStats.averageMood > 0 
                ? moodEmojis.find(m => m.value === Math.round(weeklyStats.averageMood))?.emoji || "😐"
                : "😐"
              }
            </span>
            <span className="text-sm font-medium">
              {weeklyStats.averageMood > 0 ? weeklyStats.averageMood.toFixed(1) : "0"}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Streak</span>
          <Badge variant={weeklyStats.streak > 0 ? "default" : "secondary"}>
            {weeklyStats.streak} days
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const CalendarSection = () => (
    <Card>
      <CardHeader className="pb-3 px-4">
        <CardTitle className="text-base flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border-0 max-w-full mx-auto"
          modifiers={{
            hasEntry: (date) => hasEntryForDate(date),
            today: (date) => isToday(date),
          }}
          modifiersClassNames={{
            hasEntry: "relative after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full",
            today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary ring-offset-2",
            selected: "bg-primary text-primary-foreground hover:bg-primary/90",
          }}
        />
      </CardContent>
    </Card>
  );

  const MoodTracker = () => (
    <Card>
      <CardHeader className="pb-3 px-4">
        <CardTitle className="text-base flex items-center">
          <Heart className="h-4 w-4 mr-2" />
          Mood Tracker
        </CardTitle>
        <CardDescription className="px-0">How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-5 gap-2">
          {moodEmojis.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleMoodChange(mood.value)}
              className="h-12 sm:h-16 flex flex-col items-center justify-center p-2 min-h-12 touch-target"
            >
              <span className="text-lg sm:text-xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium hidden sm:block">{mood.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const JournalTabs = () => (
    <Tabs defaultValue="write" className="h-full flex flex-col lg:min-h-0">
      <div className="border-b border-border bg-card p-4 flex-shrink-0">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="write" className="flex items-center touch-target">
            <BookOpen className="h-4 w-4 mr-2" />
            Write
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center touch-target">
            <CalendarDays className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="write" className="flex-1 overflow-auto lg:min-h-0">
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {format(selectedDate, "EEEE, MMMM do, yyyy")}
            </h2>
            <p className="text-muted-foreground">
              What's on your mind today? Take a moment to reflect and capture your thoughts.
            </p>
          </div>

          {currentEntry && !isEditing ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {format(selectedDate, "MMMM do, yyyy")} Entry
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditEntry}
                      className="h-10 w-10 p-0 touch-target"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {currentEntry.mood && (
                      <>
                        <span className="text-lg">
                          {moodEmojis.find(m => m.value === currentEntry.mood)?.emoji}
                        </span>
                        <Badge variant="secondary">
                          {moodEmojis.find(m => m.value === currentEntry.mood)?.label}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">{currentEntry.content}</p>
                <div className="flex flex-wrap gap-2">
                  {currentEntry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write about your day, your thoughts, goals, or anything that comes to mind..."
                className="min-h-48 sm:min-h-64 resize-none text-base"
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {selectedMood && (
                    <div className="flex items-center space-x-2">
                      <span>Mood:</span>
                      <span className="text-lg">
                        {moodEmojis.find(m => m.value === selectedMood)?.emoji}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {moodEmojis.find(m => m.value === selectedMood)?.label}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="touch-target"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    onClick={handleSaveEntry}
                    disabled={!journalEntry.trim() || saving}
                    className="touch-target"
                  >
                    {saving ? "Saving..." : currentEntry ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="history" className="flex-1 overflow-hidden lg:min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6 space-y-6">
            <h2 className="text-xl font-semibold">Journal History</h2>
            
            <div className="space-y-4">
              {journalEntries.length > 0 ? (
                journalEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {format(new Date(entry.entry_date), "EEEE, MMMM do, yyyy")}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {entry.mood && (
                            <>
                              <span className="text-lg">
                                {moodEmojis.find(m => m.value === entry.mood)?.emoji}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {moodEmojis.find(m => m.value === entry.mood)?.label}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed mb-4">{entry.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No journal entries yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start writing to see your entries here</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full max-h-screen overflow-hidden">
        {/* Left Panel - Calendar & Mood Tracker */}
        <div className="w-80 border-r border-border bg-surface mr-6">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <CalendarSection />
              <MoodTracker />
              <WeeklyStats />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Journal Editor & History */}
        <div className="flex-1 flex flex-col min-h-0">
          <JournalTabs />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* 1. Weekly Streak */}
            <WeeklyStats />
            
            {/* 2. Calendar */}
            <CalendarSection />
            
            {/* 3. Mood Tracker */}
            <MoodTracker />
            
            {/* 4. Journal Entries */}
            <div className="min-h-0 flex-1">
              <JournalTabs />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};