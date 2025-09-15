import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { Habit } from "@/services/habitService";
import { toast } from "sonner";

interface HabitSettingsProps {
  habits: Habit[];
  onHabitUpdate: (habitId: string, updates: any) => void;
  onHabitCreate: (habitData: any) => void;
  onHabitDelete: (habitId: string) => void;
  onClose: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const DEFAULT_ICONS = [
  '💪', '📚', '🧘', '💧', '😴', '🏃', '🥗', '✍️', '🎯', '🎵',
  '🎨', '💼', '🏠', '🧠', '❤️', '🌱', '☀️', '🔥'
];

export const HabitSettings = ({ 
  habits, 
  onHabitUpdate, 
  onHabitCreate, 
  onHabitDelete,
  onClose 
}: HabitSettingsProps) => {
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [creatingHabit, setCreatingHabit] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    color: '', 
    icon: '', 
    acceptance_criteria: '', 
    notes: '' 
  });

  const handleEditStart = (habit: Habit) => {
    setEditingHabit(habit.id);
    setEditForm({
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      acceptance_criteria: habit.acceptance_criteria || '',
      notes: habit.notes || ''
    });
  };

  const handleEditSave = (habitId: string) => {
    if (!editForm.name.trim()) {
      toast.error("Habit name is required");
      return;
    }

    onHabitUpdate(habitId, {
      name: editForm.name.trim(),
      color: editForm.color,
      icon: editForm.icon,
      acceptance_criteria: editForm.acceptance_criteria.trim() || null,
      notes: editForm.notes.trim() || null
    });
    
    setEditingHabit(null);
    toast.success("Habit updated successfully");
  };

  const handleEditCancel = () => {
    setEditingHabit(null);
    setEditForm({ name: '', color: '', icon: '', acceptance_criteria: '', notes: '' });
  };

  const handleCreateStart = () => {
    setCreatingHabit(true);
    setEditForm({
      name: '',
      color: DEFAULT_COLORS[0],
      icon: DEFAULT_ICONS[0],
      acceptance_criteria: '',
      notes: ''
    });
  };

  const handleCreateSave = () => {
    if (!editForm.name.trim()) {
      toast.error("Habit name is required");
      return;
    }

    if (habits.length >= 5) {
      toast.error("Maximum 5 habits allowed");
      return;
    }

    const nextPosition = Math.max(...habits.map(h => h.position), 0) + 1;

    onHabitCreate({
      name: editForm.name.trim(),
      color: editForm.color,
      icon: editForm.icon,
      position: nextPosition,
      acceptance_criteria: editForm.acceptance_criteria.trim() || null,
      notes: editForm.notes.trim() || null
    });
    
    setCreatingHabit(false);
    setEditForm({ name: '', color: '', icon: '', acceptance_criteria: '', notes: '' });
    toast.success("Habit created successfully");
  };

  const handleCreateCancel = () => {
    setCreatingHabit(false);
    setEditForm({ name: '', color: '', icon: '', acceptance_criteria: '', notes: '' });
  };

  const handleDelete = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit? All associated data will be lost.")) {
      onHabitDelete(habitId);
      toast.success("Habit deleted successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Habit Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Existing Habits */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <Card key={habit.id}>
            <CardContent className="p-4">
              {editingHabit === habit.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`name-${habit.id}`}>Name</Label>
                      <Input
                        id={`name-${habit.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Habit name"
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {DEFAULT_ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setEditForm({ ...editForm, icon })}
                            className={`w-8 h-8 text-lg hover:bg-muted rounded border-2 transition-colors ${
                              editForm.icon === icon ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditForm({ ...editForm, color })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            editForm.color === color ? 'border-foreground scale-110' : 'border-muted'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`acceptance-${habit.id}`}>Acceptance Criteria</Label>
                    <Textarea
                      id={`acceptance-${habit.id}`}
                      value={editForm.acceptance_criteria}
                      onChange={(e) => setEditForm({ ...editForm, acceptance_criteria: e.target.value })}
                      placeholder="What does success look like for this habit?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`notes-${habit.id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${habit.id}`}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Additional notes or reminders"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(habit.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{habit.icon}</span>
                    <div>
                      <span className="font-medium">{habit.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Position {habit.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(habit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(habit.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Habit */}
      {creatingHabit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter habit name"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {DEFAULT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditForm({ ...editForm, icon })}
                      className={`w-8 h-8 text-lg hover:bg-muted rounded border-2 transition-colors ${
                        editForm.icon === icon ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditForm({ ...editForm, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      editForm.color === color ? 'border-foreground scale-110' : 'border-muted'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="new-acceptance">Acceptance Criteria</Label>
              <Textarea
                id="new-acceptance"
                value={editForm.acceptance_criteria}
                onChange={(e) => setEditForm({ ...editForm, acceptance_criteria: e.target.value })}
                placeholder="What does success look like for this habit?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="new-notes">Notes</Label>
              <Textarea
                id="new-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Additional notes or reminders"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateSave}>
                Create Habit
              </Button>
              <Button size="sm" variant="outline" onClick={handleCreateCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleCreateStart}
          disabled={habits.length >= 5}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Habit {habits.length >= 5 && "(Max 5)"}
        </Button>
      )}

      <div className="text-xs text-muted-foreground">
        <p>• You can have up to 5 habits at a time</p>
        <p>• Each habit can be rated from 1 (poor) to 5 (excellent) daily</p>
        <p>• Streaks count consecutive days with any rating &gt; 0</p>
      </div>
    </div>
  );
};
