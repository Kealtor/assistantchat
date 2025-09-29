export interface WorkflowConfig {
  workflowName: string;
  description: string;
  webhookUrl: string;
  message?: string;
  emoji: string;
  color: string;
  default: boolean;
}

export const workflows: WorkflowConfig[] = [
  {
    workflowName: "Personal Coach",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/assistant",
    message: "Hey there, I'm your helpful AI-Assistant. How can i help you? \n Heres a helpful prompting template \n Imagine you are a helpful [role] \n Your task is to [task] \n I expect am output like this: [Output] \n Here are some constraints: [constraints]\n",
    emoji: "👨‍💼",
    color: "bg-primary",
    default: true
  },
  {
    workflowName: "Prompting Architect",
    description: "General purpose prompting architect",
    webhookUrl: "https://n8n.kealtor.de/webhook/prompt-architect",
    message: `<role> 
              I am a user who needs help designing an AI prompt.
              </role>

              <context>
              [Paste chat history or background here]
              </context>
              
              <input>
              [Write your new message or request here]
              </input>

              <task>
              Reformulate my request into a high-quality AI prompt I can use directly.
              </task>
              
              <constraints>
              - Be concise and structured.
              - Retain all important details.
              - Optimize for clarity and usability.
              </constraints>

              <output>
              Return the final optimized prompt.
              </output>
              `,
    emoji: "🏛️",
    color: "bg-primary",
    default: true
  },
  {
    workflowName: "Journal Buddy",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/duplicate",
    message: "Hey I'm your Duplicate. I'm going to repeat after you, but in an annoying way!",
    emoji: "📖",
    color: "bg-primary",
    default: false
  },{
    workflowName: "Habit Assistant",
    description: "General AI assistant for various tasks and conversations",
    webhookUrl: "https://n8n.kealtor.de/webhook/duplicate",
    message: "Hey I'm your Duplicate. I'm going to repeat after you, but in an annoying way!",
    emoji: "🔥",
    color: "bg-primary",
    default: false
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
