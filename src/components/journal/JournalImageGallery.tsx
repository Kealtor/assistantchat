import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div 
              className="cursor-pointer hover:opacity-90 transition-opacity active:scale-95 transform transition-transform duration-150"
              onClick={() => openImageModal(index)}
            >
              <AspectRatio ratio={1}>
                <img
                  src={imageUrl}
                  alt={`Journal image ${index + 1}`}
                  className="w-full h-full object-cover rounded-md border border-border"
                />
              </AspectRatio>
            </div>
            
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

      {/* Mobile-optimized image viewer dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeImageModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] lg:max-w-4xl lg:max-h-[90vh] p-0 bg-black/95 border-0">
          {selectedImageIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 h-10 w-10 p-0"
                onClick={closeImageModal}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Navigation buttons for multiple images */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 p-0 lg:h-14 lg:w-14"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-6 w-6 lg:h-8 lg:w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 p-0 lg:h-14 lg:w-14"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8" />
                  </Button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 text-white px-4 py-2 rounded-full text-sm lg:text-base">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Main image */}
              <img
                src={images[selectedImageIndex]}
                alt={`Journal image ${selectedImageIndex + 1} - Full size`}
                className="max-w-full max-h-full object-contain rounded-md cursor-pointer"
                onClick={closeImageModal}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};