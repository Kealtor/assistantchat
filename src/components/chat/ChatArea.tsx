import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { QuickstartArea } from "./QuickstartArea";
import { Message, ChatSession, MediaAttachment } from "@/services/chatService";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getWorkflowByName } from "@/config/workflows.config";
import { toast } from "@/hooks/use-toast";
import { getActiveInstance } from "@/config/supabase-instances";
import { MessageSquare } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface ChatAreaProps {
  workflow: string;
  chatSession: ChatSession | null;
  onUpdateChat: (chatId: string, updates: { messages?: Message[], media?: MediaAttachment[], title?: string }) => void;
  onWorkflowChange?: (workflow: string) => void;
  onCreateNewChat?: () => void;
}

export const ChatArea = ({ workflow, chatSession, onUpdateChat, onWorkflowChange, onCreateNewChat }: ChatAreaProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const workflowConfig = getWorkflowByName(workflow);
  
  const messages = chatSession?.messages || [];
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, media?: MediaAttachment[]) => {
    if (!chatSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      mediaIds: media ? media.map((_, index) => `${Date.now()}-${index}`) : undefined
    };

    const updatedMessages = [...messages, userMessage];
    
    // Add media with unique IDs that match the message references
    const newMediaWithIds = media ? media.map((mediaItem, index) => ({
      ...mediaItem,
      id: `${Date.now()}-${index}`
    })) : [];
    
    const updatedMedia = [...(chatSession.media || []), ...newMediaWithIds];
    const newTitle = updatedMessages.length === 1 ? String(content).slice(0, 50) + (String(content).length > 50 ? '...' : '') : chatSession.title;
    
    onUpdateChat(chatSession.id, { 
      messages: updatedMessages,
      media: updatedMedia,
      title: newTitle
    });
    
    setIsLoading(true);

    try {
      // Get the workflow configuration
      const workflowConfig = getWorkflowByName(workflow);
      if (!workflowConfig) {
        throw new Error(`Workflow '${workflow}' not found in configuration`);
      }

      // Get active Supabase instance info
      const activeInstance = getActiveInstance();
      
      // Prepare the webhook payload
      const payload = {
        message: content || " ",
        workflow: workflow,
        chatId: chatSession.id,
        userId: chatSession.user_id,
        timestamp: new Date().toISOString(),
        media: media || [],
        // Supabase instance and execution context
        supabaseInstance: {
          name: activeInstance.name,
          url: activeInstance.url,
          description: activeInstance.description
        },
        executionMode: process.env.NODE_ENV || 'development',
        // messageHistory: messages.map(msg => ({
        //  role: msg.role,
        //  content: msg.content,
        //  timestamp: msg.timestamp.toISOString(),
        //  media: msg.media || []
        //}))
      };

      // Call the webhook
      const response = await fetch(workflowConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      console.log('Raw webhook response:', responseData);
      
      // Handle the webhook response format: array with output.message.content
      let responseContent = 'No response received from workflow';
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];
        if (firstItem.output?.message?.content) {
          responseContent = firstItem.output.message.content;
        }
      }
      
      // Ensure it's a string
      responseContent = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent);
      
      console.log('Final response content:', responseContent);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      onUpdateChat(chatSession.id, { 
        messages: finalMessages
      });
    } catch (error) {
      console.error('Error calling workflow webhook:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to get response from workflow. Please try again.",
        variant: "destructive",
      });

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      onUpdateChat(chatSession.id, { 
        messages: finalMessages
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (!chatSession) {
    return (
      <QuickstartArea
        activeWorkflow={workflow}
        onWorkflowChange={onWorkflowChange || (() => {})}
        onCreateNewChat={onCreateNewChat || (() => {})}
      />
    );
  }

return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* Messages Area */}
      <ResizablePanel defaultSize={75} minSize={30}>
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 md:px-6 py-4">
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-chat-assistant rounded-md p-3 md:p-4 max-w-[95%] md:max-w-[85%] lg:max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {workflowConfig?.message || "Hello! I'm your AI assistant. How can I help you today?"}
                  </p>
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              // Get media for this message based on mediaIds
              const messageMedia = message.mediaIds ? 
                (chatSession?.media || []).filter(media => 
                  message.mediaIds?.includes((media as any).id)
                ) : [];
              // First assistant message is the initial workflow message
              const isInitial = index === 0 && message.role === "assistant";
              return (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  media={messageMedia}
                  isInitialMessage={isInitial}
                />
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-chat-assistant rounded-md p-3 md:p-4 max-w-[95%] md:max-w-[85%] lg:max-w-[80%] animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Input Area */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
        <div className="h-full border-t border-border bg-card p-4 md:p-6 flex flex-col min-h-0">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} chatId={chatSession.id} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
