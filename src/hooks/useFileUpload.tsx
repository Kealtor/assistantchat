import { useState, useCallback } from 'react';
import { FileUploadService } from '@/services/fileUploadService';
import { MediaAttachment } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const uploadFiles = useCallback(async (files: File[]): Promise<MediaAttachment[]> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }

    setUploading(true);
    
    // Initialize progress tracking
    const initialProgress = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }));
    setUploadProgress(initialProgress);

    try {
      const uploadedFiles: MediaAttachment[] = [];
      
      // Upload files one by one to track progress better
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Update progress to show starting upload
          setUploadProgress(prev => 
            prev.map((p, index) => 
              index === i ? { ...p, progress: 10 } : p
            )
          );

          const result = await FileUploadService.uploadFile(file, user.id);
          uploadedFiles.push(result);

          // Update progress to completed
          setUploadProgress(prev => 
            prev.map((p, index) => 
              index === i ? { ...p, progress: 100, status: 'completed' } : p
            )
          );
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          
          // Update progress to error
          setUploadProgress(prev => 
            prev.map((p, index) => 
              index === i ? { ...p, status: 'error' } : p
            )
          );

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      return uploadedFiles;
    } finally {
      setUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000);
    }
  }, [user]);

  return {
    uploadFiles,
    uploading,
    uploadProgress
  };
};