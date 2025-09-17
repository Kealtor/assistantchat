import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { Message, ChatSession, MediaAttachment } from "@/services/chatService";
import { useState, useEffect, useRef } from "react";
import { getWorkflowByName } from "@/config/workflows.config";
import { toast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

interface ChatAreaProps {
  workflow: string;
  chatSession: ChatSession | null;
  onUpdateChat: (chatId: string, updates: { messages?: Message[], title?: string }) => void;
}

export const ChatArea = ({ workflow, chatSession, onUpdateChat }: ChatAreaProps) => {
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
      media
    };

    const updatedMessages = [...messages, userMessage];
    const newTitle = updatedMessages.length === 1 ? String(content).slice(0, 50) + (String(content).length > 50 ? '...' : '') : chatSession.title;
    
    onUpdateChat(chatSession.id, { 
      messages: updatedMessages,
      title: newTitle
    });
    
    setIsLoading(true);

    try {
      // Get the workflow configuration
      const workflowConfig = getWorkflowByName(workflow);
      if (!workflowConfig) {
        throw new Error(`Workflow '${workflow}' not found in configuration`);
      }

      // Prepare the webhook payload
      const payload = {
        message: content || " ",
        workflow: workflow,
        chatId: chatSession.id,
        userId: chatSession.user_id,
        timestamp: new Date().toISOString(),
        media: media || [],
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
          <p className="text-muted-foreground">Start a new conversation to begin</p>
        </div>
      </div>
    );
  }

return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 md:px-6 py-4">
        <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-chat-assistant rounded-md p-3 md:p-4 max-w-[85%] md:max-w-xs">
                <p className="text-sm whitespace-pre-line">
                  {workflowConfig?.message || "Hello! I'm your AI assistant. How can I help you today?"}
                </p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-chat-assistant rounded-md p-3 md:p-4 max-w-[85%] md:max-w-xs animate-pulse">
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

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
