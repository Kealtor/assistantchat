import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Download, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { FileUploadService } from "@/services/fileUploadService";
import { MediaAttachment, Message } from "@/services/chatService";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message content.",
        variant: "destructive",
      });
    }
  };

  const handleAudioPlay = (url: string) => {
    setPlayingAudio(playingAudio === url ? null : url);
  };

  const renderMediaAttachment = (media: MediaAttachment, index: number) => {
    if (FileUploadService.isImageFile(media.type)) {
      return (
        <div key={index} className="mt-2 max-w-sm">
          <img 
            src={media.url} 
            alt={media.name}
            className="rounded-lg max-w-full h-auto border border-border"
            loading="lazy"
          />
          <p className="text-xs text-muted-foreground mt-1">{media.name}</p>
        </div>
      );
    }

    if (FileUploadService.isAudioFile(media.type)) {
      return (
        <div key={index} className="mt-2 p-3 bg-muted rounded-lg max-w-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleAudioPlay(media.url)}
            >
              {playingAudio === media.url ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{media.name}</p>
              <p className="text-xs text-muted-foreground">{FileUploadService.formatFileSize(media.size)}</p>
            </div>
          </div>
          {playingAudio === media.url && (
            <audio 
              controls 
              autoPlay
              className="w-full mt-2"
              onEnded={() => setPlayingAudio(null)}
            >
              <source src={media.url} type={media.type} />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      );
    }

    if (FileUploadService.isVideoFile(media.type)) {
      return (
        <div key={index} className="mt-2 max-w-md">
          <video 
            controls
            className="rounded-lg max-w-full h-auto border border-border"
          >
            <source src={media.url} type={media.type} />
            Your browser does not support the video element.
          </video>
          <p className="text-xs text-muted-foreground mt-1">{media.name}</p>
        </div>
      );
    }

    // For other file types, show as download link
    return (
      <div key={index} className="mt-2 p-3 bg-muted rounded-lg max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Download className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{media.name}</p>
            <p className="text-xs text-muted-foreground">{FileUploadService.formatFileSize(media.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3"
            onClick={() => window.open(media.url, '_blank')}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"} group`}>
      {!isUser && (
        <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] md:max-w-xs`}>
        <div className={`rounded-md p-3 md:p-4 ${
          isUser 
            ? "bg-chat-user text-chat-user-foreground" 
            : "bg-chat-assistant text-chat-assistant-foreground"
        }`}>
          <div className="space-y-1">
            {message.content && (
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}
            
            {/* Render media attachments */}
            {message.media && message.media.length > 0 && (
              <div className="space-y-2">
                {message.media.map((media, index) => renderMediaAttachment(media, index))}
              </div>
            )}
          </div>
          
          {/* Action buttons for assistant messages on hover (desktop only) */}
          {!isUser && (
            <div className="hidden md:flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-background/20"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {format(message.timestamp, "HH:mm")}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};