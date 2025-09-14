export interface WorkflowConfig {
  workflowName: string;
  description: string;
  webhookUrl: string;
  emoji: string;
  color: string;
}

export const workflows: WorkflowConfig[] = [
  {
    workflowName: "assistant",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/assistant",
    emoji: "🤖",
    color: "bg-primary"
  }
];

// Helper function to get workflow by name
export const getWorkflowByName = (name: string): WorkflowConfig | undefined => {
  return workflows.find(workflow => workflow.workflowName === name);
};

// Helper function to get the default workflow (first one)
export const getDefaultWorkflow = (): WorkflowConfig => {
  return workflows[0];
};

// Helper function to transform workflow config for UI components
export const getUIWorkflows = () => {
  return workflows.map(workflow => ({
    id: workflow.workflowName,
    name: workflow.workflowName.charAt(0).toUpperCase() + workflow.workflowName.slice(1),
    emoji: workflow.emoji,
    color: workflow.color,
    description: workflow.description,
    webhookUrl: workflow.webhookUrl
  }));
};
