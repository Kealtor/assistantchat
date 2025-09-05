import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface ChatAreaProps {
  workflow: string;
}

export const ChatArea = ({ workflow }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
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
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content, workflow),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-6 max-w-4xl mx-auto">
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