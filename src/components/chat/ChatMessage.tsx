import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Download, Play, Pause, FileText, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { FileUploadService } from "@/services/fileUploadService";
import { MediaAttachment, Message } from "@/services/chatService";

interface ChatMessageProps {
  message: Message;
  media?: MediaAttachment[];
}

export const ChatMessage = ({ message, media }: ChatMessageProps) => {
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

    // For document and other file types
    const isDocument = FileUploadService.isDocumentFile(media.type);
    const fileIcon = FileUploadService.getFileIcon(media.type, media.name);
    
    return (
      <div key={index} className="mt-2 p-3 bg-muted rounded-lg max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">
              {fileIcon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{media.name}</p>
            <p className="text-xs text-muted-foreground">
              {FileUploadService.formatFileSize(media.size)}
              {isDocument && ' • Document'}
            </p>
          </div>
          <div className="flex gap-1">
            {/* View/Preview button for PDFs and documents */}
            {isDocument && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => window.open(media.url, '_blank')}
                title="View document"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {/* Download button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                const link = document.createElement('a');
                link.href = media.url;
                link.download = media.name;
                link.click();
              }}
              title="Download file"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
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
            {media && media.length > 0 && (
              <div className="space-y-2">
                {media.map((mediaItem, index) => renderMediaAttachment(mediaItem, index))}
              </div>
            )}
          </div>
          
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-1">
          <span>{format(message.timestamp, "HH:mm")}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-background/20"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
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