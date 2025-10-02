import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare } from "lucide-react";
import { getUIWorkflows } from "@/config/workflows.config";

interface QuickAccessButtonsProps {
  activeWorkflow: string;
  allowedWorkflows: ReturnType<typeof getUIWorkflows>;
  onWorkflowChange: (workflowId: string) => void;
  onCreateNewChat: () => void;
  isEditMode?: boolean;
}

export const QuickAccessButtons = ({
  activeWorkflow,
  allowedWorkflows,
  onWorkflowChange,
  onCreateNewChat,
  isEditMode = false,
}: QuickAccessButtonsProps) => {
  // Auto-select first workflow if none selected
  const effectiveWorkflow = activeWorkflow || (allowedWorkflows.length > 0 ? allowedWorkflows[0].id : '');

  const handleQuickStart = (workflowId: string, e: React.MouseEvent) => {
    if (isEditMode) return;
    e.stopPropagation();
    const targetWorkflow = workflowId || effectiveWorkflow;
    if (targetWorkflow) {
      onWorkflowChange(targetWorkflow);
      setTimeout(() => {
        onCreateNewChat();
      }, 100);
    }
  };

  const handleWorkflowChange = (workflowId: string, e: React.MouseEvent) => {
    if (isEditMode) return;
    e.stopPropagation();
    onWorkflowChange(workflowId);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-4">
        {/* Workflow Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allowedWorkflows.map((workflow) => (
            <TooltipProvider key={workflow.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={effectiveWorkflow === workflow.id ? "default" : "outline"}
                    size="lg"
                    className={`h-20 w-full flex flex-col items-center justify-center gap-2 transition-all ${
                      effectiveWorkflow === workflow.id 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={(e) => handleWorkflowChange(workflow.id, e)}
                    disabled={isEditMode}
                    aria-label={`Select ${workflow.name} workflow`}
                  >
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {workflow.emoji}
                    </span>
                    <span className="text-xs font-medium line-clamp-1">
                      {workflow.name}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workflow.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Start Chat Button */}
        {allowedWorkflows.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              onClick={(e) => handleQuickStart(effectiveWorkflow, e)}
              className="px-8 h-12 text-base font-medium"
              disabled={!effectiveWorkflow || isEditMode}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Chat
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
