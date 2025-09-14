import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, MoreVertical } from "lucide-react";
import { format } from "date-fns";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-3xl`}>
        {/* Avatar - Hidden on small screens */}
        <div className={`hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full items-center justify-center text-sm font-medium ${
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        }`}>
          {isUser ? "U" : "AI"}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} flex-1`}>
          {/* Message Bubble */}
          <div className={`group relative rounded-lg px-3 py-2 md:px-4 md:py-3 shadow-chat ${
            isUser 
              ? "bg-chat-user text-chat-user-foreground ml-2 md:ml-4" 
              : "bg-chat-assistant text-chat-assistant-foreground mr-2 md:mr-4"
          }`}>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
              </p>
            </div>

            {/* Message Actions - Only on desktop hover */}
            {!isUser && (
              <div className="hidden md:flex absolute -bottom-8 left-0 items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-muted-foreground mt-1 md:mt-2 ${isUser ? "mr-2 md:mr-4" : "ml-2 md:ml-4"}`}>
            {format(message.timestamp, "h:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
};