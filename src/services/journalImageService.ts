import { configurableSupabase as supabase } from "@/lib/supabase-client";

export type JournalImageAttachment = {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export class JournalImageService {
  private static readonly BUCKET_NAME = 'journal-images';
  private static readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  static async uploadImage(file: File, userId: string): Promise<JournalImageAttachment> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File too large (max 20MB)');
    }

    if (!this.isImageFile(file.type)) {
      throw new Error('File must be an image');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image');
    }

    // Get signed URL for the uploaded file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw new Error('Failed to generate image URL');
    }

    return {
      url: signedUrlData.signedUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }

  static async uploadMultipleImages(files: File[], userId: string): Promise<JournalImageAttachment[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, userId));
    return Promise.all(uploadPromises);
  }

  static isImageFile(type: string): boolean {
    return type.startsWith('image/');
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async deleteImage(imageUrl: string, userId: string): Promise<boolean> {
    try {
      // Extract file path from signed URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/[^\/]+\/(.+)/);
      
      if (!pathMatch) {
        console.error('Could not extract file path from URL:', imageUrl);
        return false;
      }

      const filePath = pathMatch[1];
      
      // Only allow deletion if the file belongs to the user
      if (!filePath.startsWith(userId + '/')) {
        console.error('Unauthorized deletion attempt');
        return false;
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}