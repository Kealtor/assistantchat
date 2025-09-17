import { configurableSupabase as supabase } from "@/lib/supabase-client";
import { MediaAttachment } from "./chatService";

export class FileUploadService {
  private static readonly BUCKET_NAME = 'chat-media';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static async uploadFile(file: File, userId: string): Promise<MediaAttachment> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size must be less than 10MB');
    }

    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year expiry

    if (!urlData?.signedUrl) {
      throw new Error('Failed to get file URL');
    }

    return {
      url: urlData.signedUrl,
      name: file.name,
      type: file.type,
      size: file.size
    };
  }

  static async uploadMultipleFiles(files: File[], userId: string): Promise<MediaAttachment[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId));
    return Promise.all(uploadPromises);
  }

  static isImageFile(type: string): boolean {
    return type.startsWith('image/');
  }

  static isAudioFile(type: string): boolean {
    return type.startsWith('audio/');
  }

  static isVideoFile(type: string): boolean {
    return type.startsWith('video/');
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}