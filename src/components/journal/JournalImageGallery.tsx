import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalImageGalleryProps {
  images: string[];
  editable?: boolean;
  onRemoveImage?: (imageUrl: string) => void;
}

export const JournalImageGallery = ({ 
  images, 
  editable = false, 
  onRemoveImage 
}: JournalImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-90 transition-opacity">
                  <AspectRatio ratio={1}>
                    <img
                      src={imageUrl}
                      alt={`Journal image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border border-border"
                    />
                  </AspectRatio>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-2">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={`Journal image ${index + 1} - Full size`}
                    className="max-w-full max-h-full object-contain rounded-md"
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            {editable && onRemoveImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(imageUrl);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};