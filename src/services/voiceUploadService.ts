import { configurableSupabase as supabase } from "@/lib/supabase-client";
import { MediaAttachment } from "./chatService";

export class VoiceUploadService {
  private static readonly BUCKET_NAME = 'voice-notes';
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for voice notes

  static async uploadVoiceNote(blob: Blob, userId: string, duration: number): Promise<MediaAttachment> {
    if (blob.size > this.MAX_FILE_SIZE) {
      throw new Error('Voice note size must be less than 50MB');
    }

    const timestamp = new Date().getTime();
    const fileName = `voice-${timestamp}.webm`;
    const filePath = `${userId}/${fileName}`;

    // Convert blob to file
    const file = new File([blob], fileName, { type: blob.type });

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Voice upload error:', error);
      throw new Error(`Failed to upload voice note: ${error.message}`);
    }

    // Get the signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year expiry

    if (!urlData?.signedUrl) {
      throw new Error('Failed to get voice note URL');
    }

    return {
      url: urlData.signedUrl,
      name: `Voice Note (${this.formatDuration(duration)})`,
      type: blob.type,
      size: blob.size
    };
  }

  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}