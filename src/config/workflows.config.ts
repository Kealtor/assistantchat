export interface WorkflowConfig {
  workflowName: string;
  description: string;
  webhookUrl: string;
  message?: string;
  emoji: string;
  color: string;
}

export const workflows: WorkflowConfig[] = [
  {
    workflowName: "Personal Coach",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/assistant",
    message: "Hey there, I'm your helpful AI-Assistant. How can i help you? \n Heres a helpful prompting template \n Imagine you are a helpful [role] \n Your task is to [task] \n I expect am output like this: [Output] \n Here are some constraints: [constraints]\n",
    emoji: "👨‍💼",
    color: "bg-primary"
  },
  {
    workflowName: "Journal Buddy",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/duplicate",
    message: "Hey I'm your Duplicate. I'm going to repeat after you, but in an annoying way!",
    emoji: "📖",
    color: "bg-primary"
  },{
    workflowName: "Habit Assistant",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/duplicate",
    message: "Hey I'm your Duplicate. I'm going to repeat after you, but in an annoying way!",
    emoji: "🔥",
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
