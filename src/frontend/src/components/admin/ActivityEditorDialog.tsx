import { useState, useEffect } from 'react';
import { useCreateActivity, useUpdateActivity, useDeleteActivity } from '@/hooks/useQueries';
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
import { X } from 'lucide-react';
import type { Activity } from '@/backend';

interface ActivityEditorDialogProps {
  mode: 'create' | 'edit' | 'delete';
  activity?: Activity;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function ActivityEditorDialog({ mode, activity, open, onOpenChange, trigger }: ActivityEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();

  useEffect(() => {
    if (mode === 'edit' && activity) {
      setTitle(activity.title);
      setDescription(activity.description);
      setPhotos(activity.photos || []);
    } else if (mode === 'create') {
      setTitle('');
      setDescription('');
      setPhotos([]);
    }
    setNewPhotoUrl('');
    setErrors({});
  }, [mode, activity, open]);

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          photos,
        });
        toast.success('Activity created successfully');
      } else if (mode === 'edit' && activity) {
        await updateMutation.mutateAsync({
          id: activity.id,
          activity: {
            title: title.trim(),
            description: description.trim(),
            photos,
          },
        });
        toast.success('Activity updated successfully');
      }
      onOpenChange?.(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save activity');
    }
  };

  const handleDelete = async () => {
    if (!activity) return;

    try {
      await deleteMutation.mutateAsync(activity.id);
      toast.success('Activity deleted successfully');
      onOpenChange?.(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete activity');
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
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{activity?.title}"? This action cannot be undone.
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Activity' : 'Edit Activity'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new activity. Title and description are required.'
              : 'Update the activity details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter activity title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter activity description"
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Enter photo URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoto();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddPhoto}>
                Add
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="space-y-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="flex-1 text-sm truncate">{photo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
