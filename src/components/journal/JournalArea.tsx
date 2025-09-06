import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, BookOpen, TrendingUp, Smile, Frown, Meh, Heart, Zap } from "lucide-react";
import { format } from "date-fns";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Bad", color: "text-red-500" },
  { value: 2, emoji: "😔", label: "Bad", color: "text-orange-500" },
  { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
  { value: 4, emoji: "😊", label: "Good", color: "text-green-500" },
  { value: 5, emoji: "🤩", label: "Excellent", color: "text-blue-500" },
];

export const JournalArea = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [journalEntry, setJournalEntry] = useState("");
  const [moodsByDate, setMoodsByDate] = useState<Map<string, number>>(new Map());

  // Helper functions for mood management
  const getCurrentDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  const getCurrentMood = (date: Date) => {
    return moodsByDate.get(getCurrentDateKey(date)) || null;
  };
  
  const setMoodForDate = (date: Date, mood: number) => {
    const dateKey = getCurrentDateKey(date);
    setMoodsByDate(prev => new Map(prev.set(dateKey, mood)));
  };

  // Mock journal entries
  const journalEntries = [
    {
      date: new Date(),
      entry: "Had a productive day working on the new project. Feeling energized about the progress we've made.",
      mood: 4,
      tags: ["work", "productivity", "energy"],
    },
    {
      date: new Date(Date.now() - 86400000),
      entry: "Spent time reflecting on goals for the quarter. Need to focus more on personal development.",
      mood: 3,
      tags: ["reflection", "goals", "development"],
    },
  ];

  const handleSaveEntry = () => {
    if (journalEntry.trim()) {
      // Here you would save the journal entry
      console.log("Saving entry:", {
        date: selectedDate,
        entry: journalEntry,
        mood: getCurrentMood(selectedDate),
      });
      setJournalEntry("");
    }
  };

  const currentEntry = journalEntries.find(
    entry => format(entry.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="flex h-full max-h-screen overflow-hidden">
      {/* Left Panel - Calendar & Mood Tracker */}
      <div className="w-80 border-r border-border bg-surface">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-3 px-4">
                <CardTitle className="text-base flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0 w-full"
                />
              </CardContent>
            </Card>

            {/* Mood Tracker */}
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
                      variant={getCurrentMood(selectedDate) === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMoodForDate(selectedDate, mood.value)}
                      className="h-12 flex flex-col items-center justify-center p-1"
                    >
                      <span className="text-lg mb-1">{mood.emoji}</span>
                      <span className="text-xs">{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
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
                  <Badge variant="secondary">5 / 7</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Mood</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">😊</span>
                    <span className="text-sm font-medium">4.2</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <Badge variant="default">12 days</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Journal Editor & History */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="write" className="h-full flex flex-col">
          <div className="border-b border-border bg-card p-4 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="write" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Write
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="flex-1 min-h-0 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {format(selectedDate, "EEEE, MMMM do, yyyy")}
                </h2>
                <p className="text-muted-foreground">
                  What's on your mind today? Take a moment to reflect and capture your thoughts.
                </p>
              </div>

              {currentEntry ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Today's Entry</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {moodEmojis.find(m => m.value === currentEntry.mood)?.emoji}
                        </span>
                        <Badge variant="secondary">
                          {moodEmojis.find(m => m.value === currentEntry.mood)?.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed mb-4">{currentEntry.entry}</p>
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
                    className="min-h-64 resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCurrentMood(selectedDate) && (
                        <div className="flex items-center space-x-2">
                          <span>Mood:</span>
                          <span className="text-lg">
                            {moodEmojis.find(m => m.value === getCurrentMood(selectedDate))?.emoji}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {moodEmojis.find(m => m.value === getCurrentMood(selectedDate))?.label}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleSaveEntry}
                      disabled={!journalEntry.trim()}
                    >
                      Save Entry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold">Journal History</h2>
                
                <div className="space-y-4">
                  {journalEntries.map((entry, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {format(entry.date, "EEEE, MMMM do")}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {moodEmojis.find(m => m.value === entry.mood)?.emoji}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {moodEmojis.find(m => m.value === entry.mood)?.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed mb-4">{entry.entry}</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};