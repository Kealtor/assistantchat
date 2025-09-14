import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end space-x-2 md:space-x-3 p-3 md:p-4 bg-surface-elevated rounded-lg border border-border shadow-sm">
        {/* Attachment Button - Hidden on small screens */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden sm:flex flex-shrink-0 h-8 w-8 p-0"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            className="min-h-[2.5rem] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm md:text-base"
            rows={1}
          />
          
          {/* Markdown Hint - Only on desktop */}
          <div className="hidden md:block absolute bottom-1 right-2 text-xs text-muted-foreground">
            Markdown supported
          </div>
        </div>

        {/* Emoji Button - Hidden on small screens */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden sm:flex flex-shrink-0 h-8 w-8 p-0"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 h-touch min-w-touch p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Input Tips - Only on desktop */}
      <div className="hidden md:block mt-2 text-xs text-muted-foreground">
        <span className="inline-block mr-4">💡 Try: "Help me plan my day" or "Summarize this text"</span>
        <span>Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘ + K</kbd> for quick commands</span>
      </div>
    </form>
  );
};