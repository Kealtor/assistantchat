import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ArrowLeft, MapPin, Target, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardContentService } from "@/services/cardContentService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Types
interface SubMilestone {
  id: string;
  text: string;
  completed: boolean;
}

interface Milestone {
  id: string;
  text: string;
  subMilestones: SubMilestone[];
}

interface RoadmapData {
  milestones: Milestone[];
}

interface RoadmapCardProps {
  isEditMode?: boolean;
  onChange?: (data: RoadmapData) => void;
}

// Default data
const DEFAULT_ROADMAP: RoadmapData = {
  milestones: [
    {
      id: "m1",
      text: "Launch MVP",
      subMilestones: [
        { id: "s1-1", text: "Define core features", completed: false },
        { id: "s1-2", text: "Build prototype", completed: false },
        { id: "s1-3", text: "User testing", completed: false },
        { id: "s1-4", text: "Refine UI/UX", completed: false },
        { id: "s1-5", text: "Deploy to production", completed: false },
      ],
    },
    {
      id: "m2",
      text: "Achieve Product-Market Fit",
      subMilestones: [
        { id: "s2-1", text: "Collect user feedback", completed: false },
        { id: "s2-2", text: "Iterate on features", completed: false },
        { id: "s2-3", text: "Identify key metrics", completed: false },
        { id: "s2-4", text: "Optimize conversion", completed: false },
        { id: "s2-5", text: "Reach 1000 active users", completed: false },
      ],
    },
    {
      id: "m3",
      text: "Scale Operations",
      subMilestones: [
        { id: "s3-1", text: "Automate workflows", completed: false },
        { id: "s3-2", text: "Expand team", completed: false },
        { id: "s3-3", text: "Implement analytics", completed: false },
        { id: "s3-4", text: "Optimize infrastructure", completed: false },
        { id: "s3-5", text: "Launch referral program", completed: false },
      ],
    },
    {
      id: "m4",
      text: "Expand Market Reach",
      subMilestones: [
        { id: "s4-1", text: "Research new markets", completed: false },
        { id: "s4-2", text: "Localize product", completed: false },
        { id: "s4-3", text: "Partner with influencers", completed: false },
        { id: "s4-4", text: "Launch marketing campaign", completed: false },
        { id: "s4-5", text: "Enter 3 new regions", completed: false },
      ],
    },
    {
      id: "m5",
      text: "Achieve Sustainability",
      subMilestones: [
        { id: "s5-1", text: "Reach profitability", completed: false },
        { id: "s5-2", text: "Establish brand presence", completed: false },
        { id: "s5-3", text: "Build community", completed: false },
        { id: "s5-4", text: "Secure strategic partnerships", completed: false },
        { id: "s5-5", text: "Plan long-term vision", completed: false },
      ],
    },
  ],
};

export const RoadmapCard = ({ isEditMode = false, onChange }: RoadmapCardProps) => {
  const [roadmapData, setRoadmapData] = useState<RoadmapData>(DEFAULT_ROADMAP);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const selectedMilestone = roadmapData.milestones.find(m => m.id === selectedMilestoneId);

  // Fetch initial content and subscribe to updates
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await cardContentService.getCardContent('roadmap');
        if (content?.content?.milestones) {
          setRoadmapData(content.content as RoadmapData);
        }
      } catch (error) {
        console.error('Error fetching roadmap content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

    // Subscribe to real-time updates
    const unsubscribe = cardContentService.subscribeToCardUpdates('roadmap', (payload) => {
      if (payload.new?.content?.milestones) {
        setRoadmapData(payload.new.content as RoadmapData);
      }
    });

    return unsubscribe;
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Handle data changes
  const notifyChange = async (newData: RoadmapData) => {
    setRoadmapData(newData);
    onChange?.(newData);
    
    // Save to API
    try {
      await cardContentService.updateCard({
        cardType: 'roadmap',
        content: newData
      });
    } catch (error) {
      console.error('Error updating roadmap:', error);
      toast({
        title: "Update failed",
        description: "Could not save roadmap changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start editing
  const startEdit = (id: string, currentText: string) => {
    if (isEditMode) return;
    setEditingId(id);
    setEditValue(currentText);
  };

  // Save edit
  const saveEdit = () => {
    if (!editingId || !editValue.trim()) {
      cancelEdit();
      return;
    }

    const newData = { ...roadmapData };
    
    // Check if editing a milestone
    const milestoneIndex = newData.milestones.findIndex(m => m.id === editingId);
    if (milestoneIndex !== -1) {
      newData.milestones[milestoneIndex].text = editValue;
      notifyChange(newData);
      setEditingId(null);
      return;
    }

    // Check if editing a sub-milestone
    for (let i = 0; i < newData.milestones.length; i++) {
      const subIndex = newData.milestones[i].subMilestones.findIndex(s => s.id === editingId);
      if (subIndex !== -1) {
        newData.milestones[i].subMilestones[subIndex].text = editValue;
        notifyChange(newData);
        setEditingId(null);
        return;
      }
    }

    setEditingId(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (editingId) {
        cancelEdit();
      } else if (selectedMilestoneId) {
        setSelectedMilestoneId(null);
      }
    }
  };

  // Zoom into milestone
  const handleMilestoneClick = (milestoneId: string) => {
    if (isEditMode || editingId) return;
    setSelectedMilestoneId(milestoneId);
  };

  // Close zoomed view
  const handleBack = () => {
    setSelectedMilestoneId(null);
  };

  // Toggle sub-milestone completion
  const toggleSubMilestone = (milestoneId: string, subId: string) => {
    const newData = { ...roadmapData };
    const milestone = newData.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      const sub = milestone.subMilestones.find(s => s.id === subId);
      if (sub) {
        sub.completed = !sub.completed;
        notifyChange(newData);
      }
    }
  };

  // Calculate milestone progress
  const getMilestoneProgress = (milestone: Milestone) => {
    const completed = milestone.subMilestones.filter(s => s.completed).length;
    const total = milestone.subMilestones.length;
    return { completed, total, isComplete: completed === total };
  };

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden"
      role="region"
      aria-label="Roadmap planner"
    >
      <CardHeader className={cn("pt-6 pb-3", isMobile ? "px-3" : "px-6")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className={cn("flex-shrink-0 text-muted-foreground", isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <h3 className={cn("font-semibold truncate", isMobile ? "text-base" : "text-lg")}>
              {selectedMilestoneId && selectedMilestone ? selectedMilestone.text : "Roadmap"}
            </h3>
          </div>
          {selectedMilestoneId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className={cn("flex-shrink-0", isMobile && "px-2")}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleBack();
                }
              }}
              aria-label="Back to all milestones"
            >
              <ArrowLeft className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Back</span>}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("flex-1 overflow-hidden pb-6 pt-0", isMobile ? "px-3" : "px-6")}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Loading roadmap...</p>
          </div>
        ) : (
          <>
            {/* Main roadmap view */}
            <div
          className={cn(
            "transition-all duration-300 ease-in-out h-full",
            selectedMilestoneId ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
          )}
        >
          <div className="space-y-2" role="list" aria-label="Milestones">
            {roadmapData.milestones.map((milestone, index) => {
              const progress = getMilestoneProgress(milestone);
              return (
                <div
                  key={milestone.id}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                    !isEditMode && "cursor-pointer hover:bg-accent/50 active:scale-[0.99]"
                  )}
                  onClick={() => handleMilestoneClick(milestone.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isEditMode) {
                      handleMilestoneClick(milestone.id);
                    }
                  }}
                  tabIndex={isEditMode ? -1 : 0}
                >
                  <div className={cn("flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0", isMobile ? "w-7 h-7" : "w-8 h-8")}>
                    {progress.isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    {editingId === milestone.id ? (
                      <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="h-8"
                        aria-label={`Edit milestone ${index + 1}`}
                      />
                    ) : (
                      <>
                        <span
                          className={cn("font-medium truncate", isMobile ? "text-sm" : "text-base")}
                          onClick={(e) => {
                            if (!isEditMode) {
                              e.stopPropagation();
                              startEdit(milestone.id, milestone.text);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isEditMode) {
                              e.stopPropagation();
                              startEdit(milestone.id, milestone.text);
                            }
                          }}
                          tabIndex={isEditMode ? -1 : 0}
                          role="button"
                          aria-label={`Milestone ${index + 1}: ${milestone.text}. Press Enter to edit or expand.`}
                        >
                          {milestone.text}
                        </span>
                        {!isMobile && (
                          <span className="text-sm text-muted-foreground">
                            {progress.completed}/{progress.total} completed
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditMode && editingId !== milestone.id && (
                    <ChevronRight className={cn("text-muted-foreground flex-shrink-0", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zoomed milestone view */}
        {selectedMilestone && (
          <div
            className={cn(
              "transition-all duration-300 ease-in-out h-full flex flex-col",
              selectedMilestoneId ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
            )}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2" role="list" aria-label="Sub-milestones">
                {selectedMilestone.subMilestones.map((sub, index) => (
                  <div
                    key={sub.id}
                    role="listitem"
                    className={cn("flex items-center rounded-lg border bg-card transition-all cursor-pointer hover:bg-accent/50", isMobile ? "gap-2 p-2" : "gap-3 p-3")}
                    onClick={() => toggleSubMilestone(selectedMilestoneId!, sub.id)}
                  >
                    <div className={cn("flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0", isMobile ? "w-7 h-7" : "w-8 h-8")}>
                      {sub.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingId === sub.id ? (
                        <Input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Edit sub-milestone ${index + 1}`}
                        />
                      ) : (
                        <span
                          className={cn(
                            "font-medium break-words",
                            isMobile ? "text-sm" : "text-base",
                            sub.completed && "line-through text-muted-foreground"
                          )}
                          onClick={(e) => {
                            if (!isEditMode) {
                              e.stopPropagation();
                              startEdit(sub.id, sub.text);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isEditMode) {
                              e.stopPropagation();
                              startEdit(sub.id, sub.text);
                            }
                          }}
                          tabIndex={isEditMode ? -1 : 0}
                          role="button"
                          aria-label={`Sub-milestone ${index + 1}: ${sub.text}. Press Enter to edit.`}
                        >
                          {sub.text}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
};