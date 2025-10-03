import { Button } from "@/components/ui/button";
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
  
  console.log('🎯 QuickAccessButtons render', {
    activeWorkflow,
    effectiveWorkflow,
    allowedWorkflows: allowedWorkflows.map(w => w.id),
    isEditMode
  });

  const handleQuickStart = (workflowId: string) => {
    console.log('🟢 handleQuickStart called', { workflowId, isEditMode, effectiveWorkflow });
    if (isEditMode) {
      console.log('⚠️ Blocked by edit mode');
      return;
    }
    const targetWorkflow = workflowId || effectiveWorkflow;
    console.log('✅ Target workflow:', targetWorkflow);
    if (targetWorkflow) {
      onWorkflowChange(targetWorkflow);
      setTimeout(() => {
        onCreateNewChat();
      }, 100);
    }
  };

  const handleWorkflowChange = (workflowId: string) => {
    console.log('🔵 handleWorkflowChange called', { workflowId, isEditMode, activeWorkflow });
    if (isEditMode) {
      console.log('⚠️ Blocked by edit mode');
      return;
    }
    console.log('✅ Calling onWorkflowChange with:', workflowId);
    onWorkflowChange(workflowId);
  };

  return (
    <div className="flex flex-col gap-4 touch-auto relative z-10">
      {/* Workflow Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 relative z-10">
        {allowedWorkflows.map((workflow) => (
          <Button
            key={workflow.id}
            type="button"
            variant={effectiveWorkflow === workflow.id ? "default" : "outline"}
            size="lg"
            className={`h-20 w-full flex flex-col items-center justify-center gap-2 transition-all touch-manipulation relative z-10 ${
              effectiveWorkflow === workflow.id 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'hover:bg-accent'
            }`}
            onClick={(e) => {
              console.log('🖱️ Button clicked:', workflow.name, workflow.id, e);
              handleWorkflowChange(workflow.id);
            }}
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
        ))}
      </div>

      {/* Start Chat Button */}
      {allowedWorkflows.length > 0 && (
        <div className="flex justify-center pt-2 relative z-10">
          <Button
            type="button"
            size="lg"
            onClick={() => handleQuickStart(effectiveWorkflow)}
            className="px-8 h-12 text-base font-medium touch-manipulation relative z-10"
            disabled={!effectiveWorkflow || isEditMode}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Start Chat
          </Button>
        </div>
      )}
    </div>
  );
};
