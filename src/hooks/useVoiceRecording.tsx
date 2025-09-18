import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  recording: VoiceRecording | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  deleteRecording: () => void;
  recordingTime: number;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<VoiceRecording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Check for MediaRecorder support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
        throw new Error('Voice recording is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        setRecording({
          blob: audioBlob,
          url: audioUrl,
          duration
        });

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "An error occurred while recording. Please try again.",
          variant: "destructive"
        });
        stopRecording();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak now to record your voice note."
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      
      let errorMessage = 'Failed to start recording';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
          errorMessage = 'Microphone access denied. Please allow microphone permission and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please check your device settings.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Recording Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const deleteRecording = useCallback(() => {
    if (recording) {
      URL.revokeObjectURL(recording.url);
      setRecording(null);
    }
  }, [recording]);

  return {
    isRecording,
    recording,
    startRecording,
    stopRecording,
    deleteRecording,
    recordingTime
  };
};