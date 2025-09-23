import { configurableSupabase as supabase } from "@/lib/supabase-client";
import { MediaAttachment } from "./chatService";

export class FileUploadService {
  private static readonly BUCKET_NAME = 'chat-media';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static async uploadFile(file: File, userId: string, chatId: string): Promise<MediaAttachment> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size must be less than 10MB');
    }

    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${userId}/${chatId}/${fileName}`;

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
      size: file.size,
      bucket: this.BUCKET_NAME,
      filename: fileName
    };
  }

  static async uploadMultipleFiles(files: File[], userId: string, chatId: string): Promise<MediaAttachment[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId, chatId));
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

  static isDocumentFile(type: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml'
    ];
    return documentTypes.includes(type);
  }

  static getFileIcon(type: string, name: string): string {
    if (this.isImageFile(type)) return '🖼️';
    if (this.isAudioFile(type)) return '🎵';
    if (this.isVideoFile(type)) return '🎬';
    
    // Document specific icons
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('excel') || type.includes('sheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📋';
    if (type === 'text/plain' || name.endsWith('.txt')) return '📃';
    if (type === 'text/csv' || name.endsWith('.csv')) return '📊';
    if (type === 'application/json' || name.endsWith('.json')) return '🔧';
    if (type.includes('xml') || name.endsWith('.xml')) return '🔧';
    
    return '📎';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}