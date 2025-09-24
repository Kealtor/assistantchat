import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { getUIWorkflows } from "@/config/workflows.config";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useAdmin } from "@/hooks/useAdmin";

interface QuickstartAreaProps {
  activeWorkflow: string;
  onWorkflowChange: (workflow: string) => void;
  onCreateNewChat: () => void;
}

export const QuickstartArea = ({ activeWorkflow, onWorkflowChange, onCreateNewChat }: QuickstartAreaProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [allowedWorkflows, setAllowedWorkflows] = useState(getUIWorkflows());

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) return;
      
      try {
        const permissions = await userService.getUserPermissions(user.id);
        const permissionWorkflows = permissions.map(p => p.workflow_id);
        setUserPermissions(permissionWorkflows);
        
        // Filter workflows based on permissions or admin status
        const allWorkflows = getUIWorkflows();
        const filtered = isAdmin 
          ? allWorkflows 
          : allWorkflows.filter(workflow => permissionWorkflows.includes(workflow.id));
        
        setAllowedWorkflows(filtered);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
        setAllowedWorkflows([]);
      }
    };

    fetchUserPermissions();
  }, [user, isAdmin]);

  const handleQuickStart = (workflowId: string) => {
    onWorkflowChange(workflowId);
    setTimeout(() => {
      onCreateNewChat();
    }, 100);
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Chat AI</h1>
          <p className="text-muted-foreground text-lg">
            Choose a workflow to start your conversation
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {allowedWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                activeWorkflow === workflow.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onWorkflowChange(workflow.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${workflow.color} flex items-center justify-center text-white text-lg`}>
                    {workflow.emoji}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    {activeWorkflow === workflow.id && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {workflow.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button 
            size="lg" 
            onClick={() => handleQuickStart(activeWorkflow)}
            className="px-8 py-3 h-12 text-base font-medium"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Start New Chat
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">
              {allowedWorkflows.find(w => w.id === activeWorkflow)?.name}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};