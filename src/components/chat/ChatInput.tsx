import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, Upload, X, Mic, Square } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { MediaAttachment } from "@/services/chatService";
import { Progress } from "@/components/ui/progress";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { VoiceUploadService } from "@/services/voiceUploadService";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string, media?: MediaAttachment[]) => void;
  disabled?: boolean;
  chatId: string;
}

export const ChatInput = ({ onSendMessage, disabled, chatId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const [shouldSendImmediately, setShouldSendImmediately] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, uploading, uploadProgress } = useFileUpload();
  const { 
    isRecording, 
    recording, 
    startRecording, 
    stopRecording, 
    deleteRecording,
    recordingTime 
  } = useVoiceRecording();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's an audio preview, send it
    if (showAudioPreview && recording) {
      handleSendVoiceNote();
      return;
    }
    
    if ((message.trim() || selectedFiles.length > 0) && !disabled && !uploading && !isRecording) {
      let media: MediaAttachment[] = [];
      
      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        try {
          media = await uploadFiles(selectedFiles, chatId);
        } catch (error) {
          return; // Error is handled in the hook
        }
      }
      
      onSendMessage(message.trim(), media);
      setMessage("");
      setSelectedFiles([]);
    }
  };

  const handleVoiceRecording = async () => {
    if (recording) {
      deleteRecording();
      setShowAudioPreview(false);
    }
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSendDuringRecording = async () => {
    // Stop recording and send immediately without preview
    setShouldSendImmediately(true);
    stopRecording();
  };

  const handleSendAudioPreview = () => {
    if (recording) {
      handleSendVoiceNote();
    }
  };

  const handleDeleteAudioPreview = () => {
    deleteRecording();
    setShowAudioPreview(false);
  };

  // Handle recording completion
  useEffect(() => {
    if (recording && !isRecording) {
      if (shouldSendImmediately) {
        // Send immediately without showing preview
        handleSendVoiceNote();
        setShouldSendImmediately(false);
      } else {
        // Show preview for user to review
        setShowAudioPreview(true);
      }
    }
  }, [recording, isRecording, shouldSendImmediately]);

  const handleSendVoiceNote = async () => {
    if (!recording) return;

    setIsUploading(true);
    try {
      // Get the current user ID
      const { configurableSupabase } = await import("@/lib/supabase-client");
      const { data: { user } } = await configurableSupabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const mediaAttachment = await VoiceUploadService.uploadVoiceNote(
        recording.blob,
        user.id,
        chatId,
        recording.duration
      );

      onSendMessage("", [mediaAttachment]);
      deleteRecording();
      setShowAudioPreview(false);
      
      toast({
        title: "Voice note sent!",
        description: "Your voice note has been uploaded and sent."
      });
    } catch (error) {
      console.error('Error uploading voice note:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload voice note",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !uploading && !isRecording) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

return (
    <div 
      className="relative h-full flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-background px-3 py-2 rounded-md text-sm">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate">{progress.fileName}</span>
                <span className={`${
                  progress.status === 'completed' ? 'text-green-600' : 
                  progress.status === 'error' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {progress.status === 'completed' ? 'Complete' : 
                   progress.status === 'error' ? 'Failed' : 
                   `${progress.progress}%`}
                </span>
              </div>
              {progress.status === 'uploading' && (
                <Progress value={progress.progress} className="h-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording voice note... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Audio Preview */}
      {showAudioPreview && recording && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <audio
              controls
              src={recording.url}
              className="flex-1"
              preload="metadata"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteAudioPreview}
              disabled={isUploading}
            >
              🗑️
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex-1 flex flex-col">
        <div className="flex-1 flex items-end space-x-2 md:space-x-3 p-3 md:p-4 bg-surface-elevated rounded-lg border border-border shadow-sm">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv,.json,.xml,.xls,.xlsx,.ppt,.pptx"
          />
          
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex flex-shrink-0 h-8 w-8 p-0"
            disabled={disabled || uploading || isRecording}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

        {/* Message Input */}
        <div className="flex-1 relative flex flex-col">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording voice note..." : "Type your message..."}
            disabled={disabled || isRecording}
            className="h-full min-h-[2.5rem] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm md:text-base"
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

          {/* Send/Voice/Stop Buttons */}
          {isRecording ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={handleStopRecording}
                disabled={disabled || uploading || isUploading}
                className="flex-shrink-0 h-touch min-w-touch p-0 bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSendDuringRecording}
                disabled={disabled || uploading || isUploading}
                className="flex-shrink-0 h-touch min-w-touch p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </>
          ) : message.trim() || selectedFiles.length > 0 || showAudioPreview ? (
            <Button
              type="submit"
              size="sm"
              disabled={disabled || uploading || isUploading}
              className="flex-shrink-0 h-touch min-w-touch p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleVoiceRecording}
              disabled={disabled || uploading || isUploading}
              className="flex-shrink-0 h-touch min-w-touch p-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Input Tips - Only on desktop */}
        <div className="hidden md:block mt-2 text-xs text-muted-foreground">
          <span className="inline-block mr-4">💡 Try: "Help me plan my day" or "Summarize this text"</span>
          <span>Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘ + K</kbd> for quick commands</span>
        </div>
      </form>
    </div>
  );
};