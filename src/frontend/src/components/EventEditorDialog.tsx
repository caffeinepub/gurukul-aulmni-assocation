import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { Event, EditableEvent } from '@/backend';

interface EventEditorDialogProps {
  event?: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EventEditorDialog({ event, open, onOpenChange, onSuccess }: EventEditorDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  useEffect(() => {
    if (event) {
      const eventDate = new Date(Number(event.timestampNanos) / 1_000_000);
      setFormData({
        title: event.title,
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location,
        description: event.description,
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
      });
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const timestampNanos = BigInt(dateTime.getTime() * 1_000_000);

    const editableEvent: EditableEvent = {
      title: formData.title,
      timestampNanos,
      location: formData.location,
      description: formData.description,
    };

    try {
      if (event) {
        await updateMutation.mutateAsync({ id: event.id, event: editableEvent });
        toast.success('Event updated successfully!');
      } else {
        await createMutation.mutateAsync(editableEvent);
        toast.success('Event created successfully!');
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteMutation.mutateAsync(event.id);
      toast.success('Event deleted successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to delete event. Please try again.');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update event details' : 'Add a new event for the alumni community'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Annual Alumni Reunion"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Campus Auditorium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event details and agenda..."
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {event ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
