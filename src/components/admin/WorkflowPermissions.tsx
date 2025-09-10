import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, User, Search } from "lucide-react";

const AVAILABLE_WORKFLOWS = [
  { id: "assistant", name: "Assistant", emoji: "🤖" },
  { id: "calendar", name: "Calendar", emoji: "📅" },
  { id: "notes", name: "Notes", emoji: "📝" },
  { id: "tasks", name: "Tasks", emoji: "✅" },
  { id: "search", name: "Search", emoji: "🔍" },
];

export const WorkflowPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGrantPermission = async () => {
    if (!targetUserId || !selectedWorkflow) {
      toast({
        title: "Error",
        description: "Please enter a user ID and select a workflow.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const success = await userService.grantPermission(targetUserId, selectedWorkflow, user?.id);
    
    if (success) {
      toast({
        title: "Permission granted",
        description: `Successfully granted ${selectedWorkflow} access to user.`,
      });
      setTargetUserId("");
      setSelectedWorkflow("");
    } else {
      toast({
        title: "Error",
        description: "Failed to grant permission. Please check the user ID and try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Workflow Permissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Grant Workflow Access
          </CardTitle>
          <CardDescription>
            Grant users access to specific workflows. All users have assistant access by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter user UUID..."
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You can find user IDs in the Supabase dashboard under Authentication → Users
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow</label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_WORKFLOWS.filter(w => w.id !== 'assistant').map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      <div className="flex items-center gap-2">
                        <span>{workflow.emoji}</span>
                        <span>{workflow.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGrantPermission} 
            disabled={!targetUserId || !selectedWorkflow || loading}
            className="w-full md:w-auto"
          >
            {loading ? "Granting..." : "Grant Access"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Workflows</CardTitle>
          <CardDescription>
            Overview of all available workflows in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_WORKFLOWS.map((workflow) => (
              <div key={workflow.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{workflow.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.id}</p>
                  </div>
                </div>
                {workflow.id === 'assistant' && (
                  <Badge variant="secondary" className="text-xs">
                    Default Access
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">How to grant permissions:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Find the user ID in Supabase Dashboard → Authentication → Users</li>
              <li>Copy the UUID from the user's record</li>
              <li>Paste it in the "User ID" field above</li>
              <li>Select the workflow you want to grant access to</li>
              <li>Click "Grant Access"</li>
            </ol>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">Notes:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>All users automatically get Assistant workflow access</li>
              <li>Users will see only workflows they have permission for in their sidebar</li>
              <li>Permissions take effect immediately after granting</li>
              <li>You can revoke permissions using the Supabase dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};