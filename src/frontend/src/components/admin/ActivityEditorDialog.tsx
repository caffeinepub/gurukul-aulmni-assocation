import { useState, useEffect, useRef } from 'react';
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
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import type { Activity } from '@/backend';
import { convertImageToDataUrl, MAX_FILE_SIZE_BYTES } from '@/utils/imageDataUrl';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await convertImageToDataUrl(file);
      
      if (result.error) {
        errors.push(`${file.name}: ${result.error}`);
      } else if (result.dataUrl) {
        newPhotos.push(result.dataUrl);
      }
    }

    if (newPhotos.length > 0) {
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} image(s) added successfully`);
    }

    if (errors.length > 0) {
      toast.error(`Failed to add ${errors.length} image(s)`, {
        description: errors[0],
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
  const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            
            {/* File Upload */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="activity-file-input"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image Files
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or WebP (max {maxSizeMB}MB each, multiple files supported)
              </p>
            </div>

            {/* URL Input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or add by URL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Enter photo URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhotoUrl();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddPhotoUrl}>
                Add
              </Button>
            </div>

            {photos.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium">{photos.length} photo(s) added:</p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square bg-muted rounded-md overflow-hidden">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <strong>Note:</strong> Uploaded images are embedded in app data. Large images may impact performance.
            </p>
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
