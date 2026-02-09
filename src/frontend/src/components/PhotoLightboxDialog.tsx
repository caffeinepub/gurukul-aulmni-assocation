import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PhotoLightboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: Array<{ url: string; title?: string; description?: string }>;
  initialIndex?: number;
}

export default function PhotoLightboxDialog({
  open,
  onOpenChange,
  photos,
  initialIndex = 0,
}: PhotoLightboxDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, photos.length, onOpenChange]);

  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {currentPhoto.title && (
                  <DialogTitle className="text-xl">{currentPhoto.title}</DialogTitle>
                )}
                {currentPhoto.description && (
                  <DialogDescription className="mt-1">
                    {currentPhoto.description}
                  </DialogDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            {photos.length > 1 && (
              <p className="text-sm text-muted-foreground mt-2">
                Photo {currentIndex + 1} of {photos.length}
              </p>
            )}
          </DialogHeader>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 p-6 overflow-auto">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title || `Photo ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex - 1)}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
