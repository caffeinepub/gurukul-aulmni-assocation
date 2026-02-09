import { useState, useEffect, useRef } from 'react';
import { useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { GalleryImage } from '@/backend';
import { convertImageToDataUrl, MAX_FILE_SIZE_BYTES } from '@/utils/imageDataUrl';

interface GalleryEditorDialogProps {
  mode: 'create' | 'edit' | 'delete';
  image?: GalleryImage;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function GalleryEditorDialog({ mode, image, open, onOpenChange, trigger }: GalleryEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; imageUrl?: string; description?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateGalleryImage();
  const updateMutation = useUpdateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();

  useEffect(() => {
    if (mode === 'edit' && image) {
      setTitle(image.title);
      setImageUrl(image.imageUrl);
      setDescription(image.description);
    } else if (mode === 'create') {
      setTitle('');
      setImageUrl('');
      setDescription('');
    }
    setErrors({});
  }, [mode, image, open]);

  const validate = () => {
    const newErrors: { title?: string; imageUrl?: string; description?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL or file is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await convertImageToDataUrl(file);
    
    if (result.error) {
      toast.error(result.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (result.dataUrl) {
      setImageUrl(result.dataUrl);
      toast.success('Image loaded successfully');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim(),
        });
        toast.success('Gallery image created successfully');
      } else if (mode === 'edit' && image) {
        await updateMutation.mutateAsync({
          id: image.id,
          image: {
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            description: description.trim(),
          },
        });
        toast.success('Gallery image updated successfully');
      }
      onOpenChange?.(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save gallery image');
    }
  };

  const handleDelete = async () => {
    if (!image) return;

    try {
      await deleteMutation.mutateAsync(image.id);
      toast.success('Gallery image deleted successfully');
      onOpenChange?.(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete gallery image');
    }
  };

  if (mode === 'delete') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{image?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Gallery Image' : 'Edit Gallery Image'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new image to the gallery. All fields are required.'
              : 'Update the gallery image details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="space-y-3">
              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image File
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or WebP (max {maxSizeMB}MB)
                </p>
              </div>

              {/* URL Input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter URL</span>
                </div>
              </div>

              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
            
            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center text-muted-foreground"><svg class="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-sm">Invalid image</span></div>';
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <strong>Note:</strong> Uploaded images are embedded in app data. Large images may impact performance.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter image description"
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
