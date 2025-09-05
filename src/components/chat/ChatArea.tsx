import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  title: string;
  workflow: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

interface ChatAreaProps {
  workflow: string;
  chatSession: ChatSession | null;
  onUpdateChat: (chatId: string, updates: Partial<ChatSession>) => void;
}

export const ChatArea = ({ workflow, chatSession, onUpdateChat }: ChatAreaProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSendMessage = async (content: string) => {
    if (!chatSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    onUpdateChat(chatSession.id, { 
      messages: updatedMessages,
      title: updatedMessages.length === 1 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : chatSession.title,
      updatedAt: new Date()
    });
    
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content, workflow),
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      onUpdateChat(chatSession.id, { 
        messages: finalMessages,
        updatedAt: new Date()
      });
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateMockResponse = (userMessage: string, workflow: string): string => {
    const responses = {
      assistant: [
        "I understand you're looking for help with that. Let me think about the best approach...",
        "That's an interesting question! Here's what I think based on my knowledge...",
        "I'd be happy to help you with that. Let me break this down for you...",
      ],
      calendar: [
        "I've checked your calendar and here's what I found...",
        "Based on your schedule, I recommend scheduling that for...",
        "Your availability looks good for next week. Would you like me to...",
      ],
      notes: [
        "I've reviewed your notes and here are the key points...",
        "That's worth noting down. I'll help you organize this information...",
        "Based on your previous notes, this connects to...",
      ],
      tasks: [
        "I've added that to your task list with high priority...",
        "Looking at your current tasks, I suggest tackling this next...",
        "That task is now scheduled and I've set a reminder for...",
      ],
      search: [
        "I found several relevant results for your query...",
        "Here's what I discovered about that topic...",
        "Based on my search, here are the most relevant findings...",
      ],
    };

    const workflowResponses = responses[workflow as keyof typeof responses] || responses.assistant;
    return workflowResponses[Math.floor(Math.random() * workflowResponses.length)];
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-chat-assistant rounded-md p-4 max-w-xs">
                <p className="text-sm">Hello! I'm your AI assistant. How can I help you today?</p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-chat-assistant rounded-md p-4 max-w-xs animate-pulse">
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
      <div className="border-t border-border bg-card p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};