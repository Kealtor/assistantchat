import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ArrowLeft, MapPin, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardContentService } from "@/services/cardContentService";
import { useToast } from "@/hooks/use-toast";

// Types
interface SubMilestone {
  id: string;
  text: string;
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
        { id: "s1-1", text: "Define core features" },
        { id: "s1-2", text: "Build prototype" },
        { id: "s1-3", text: "User testing" },
        { id: "s1-4", text: "Refine UI/UX" },
        { id: "s1-5", text: "Deploy to production" },
      ],
    },
    {
      id: "m2",
      text: "Achieve Product-Market Fit",
      subMilestones: [
        { id: "s2-1", text: "Collect user feedback" },
        { id: "s2-2", text: "Iterate on features" },
        { id: "s2-3", text: "Identify key metrics" },
        { id: "s2-4", text: "Optimize conversion" },
        { id: "s2-5", text: "Reach 1000 active users" },
      ],
    },
    {
      id: "m3",
      text: "Scale Operations",
      subMilestones: [
        { id: "s3-1", text: "Automate workflows" },
        { id: "s3-2", text: "Expand team" },
        { id: "s3-3", text: "Implement analytics" },
        { id: "s3-4", text: "Optimize infrastructure" },
        { id: "s3-5", text: "Launch referral program" },
      ],
    },
    {
      id: "m4",
      text: "Expand Market Reach",
      subMilestones: [
        { id: "s4-1", text: "Research new markets" },
        { id: "s4-2", text: "Localize product" },
        { id: "s4-3", text: "Partner with influencers" },
        { id: "s4-4", text: "Launch marketing campaign" },
        { id: "s4-5", text: "Enter 3 new regions" },
      ],
    },
    {
      id: "m5",
      text: "Achieve Sustainability",
      subMilestones: [
        { id: "s5-1", text: "Reach profitability" },
        { id: "s5-2", text: "Establish brand presence" },
        { id: "s5-3", text: "Build community" },
        { id: "s5-4", text: "Secure strategic partnerships" },
        { id: "s5-5", text: "Plan long-term vision" },
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

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden"
      role="region"
      aria-label="Roadmap planner"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Roadmap
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-4 pt-0">
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
            {roadmapData.milestones.map((milestone, index) => (
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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                
                {editingId === milestone.id ? (
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-8"
                    aria-label={`Edit milestone ${index + 1}`}
                  />
                ) : (
                  <span
                    className="flex-1 font-medium text-sm truncate"
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
                )}

                {!isEditMode && editingId !== milestone.id && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
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
            <div className="flex items-center gap-2 mb-4 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleBack();
                  }
                }}
                aria-label="Back to all milestones"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Target className="w-5 h-5" />
                  <h3 className="font-semibold text-base">{selectedMilestone.text}</h3>
                </div>
              </div>

              <div className="space-y-2" role="list" aria-label="Sub-milestones">
                {selectedMilestone.subMilestones.map((sub, index) => (
                  <div
                    key={sub.id}
                    role="listitem"
                    className="flex items-start gap-3 p-2.5 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-medium text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>

                    {editingId === sub.id ? (
                      <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-8"
                        aria-label={`Edit sub-milestone ${index + 1}`}
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm"
                        onClick={() => !isEditMode && startEdit(sub.id, sub.text)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isEditMode) {
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