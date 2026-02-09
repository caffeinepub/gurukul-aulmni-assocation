import { useState, useEffect } from 'react';
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
import type { GalleryImage } from '@/backend';

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
      newErrors.imageUrl = 'Image URL is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
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
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
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
