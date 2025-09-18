import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { VoiceUploadService } from "@/services/voiceUploadService";
import { MediaAttachment } from "@/services/chatService";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface VoiceRecorderProps {
  onSendVoiceNote: (media: MediaAttachment) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onSendVoiceNote, disabled }: VoiceRecorderProps) => {
  const {
    isRecording,
    recording,
    startRecording,
    stopRecording,
    deleteRecording,
    recordingTime
  } = useVoiceRecording();
  
  const [isUploading, setIsUploading] = useState(false);

  const handleStartRecording = async () => {
    if (recording) {
      deleteRecording();
    }
    await startRecording();
  };

  const handleSendRecording = async () => {
    if (!recording) return;

    setIsUploading(true);
    try {
      // Get the current user ID (you may need to adjust this based on your auth setup)
      const { data: { user } } = await import("@/lib/supabase-client").then(m => m.configurableSupabase.auth.getUser());
      if (!user) {
        throw new Error('User not authenticated');
      }

      const mediaAttachment = await VoiceUploadService.uploadVoiceNote(
        recording.blob,
        user.id,
        recording.duration
      );

      onSendVoiceNote(mediaAttachment);
      deleteRecording();
      
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recording && !isRecording) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Voice Note ({formatTime(recording.duration)})</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={deleteRecording}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-primary hover:text-primary"
              onClick={handleSendRecording}
              disabled={isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <audio
          controls
          src={recording.url}
          className="w-full h-8"
          controlsList="nodownload"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording... {formatTime(recordingTime)}
        </div>
      )}
      
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={isRecording ? stopRecording : handleStartRecording}
        disabled={disabled || isUploading}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};