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
import { toast } from 'sonner';
import { useCreateBackendSnapshotFromValues, useUpdateBackendSnapshot } from '@/hooks/useBackendSnapshots';
import type { BackendSnapshot, EditableBackendSnapshot } from '@/backend';

interface BackendSnapshotEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: BackendSnapshot | null;
}

export default function BackendSnapshotEditorDialog({
  open,
  onOpenChange,
  snapshot,
}: BackendSnapshotEditorDialogProps) {
  const isEditing = !!snapshot;
  const createMutation = useCreateBackendSnapshotFromValues();
  const updateMutation = useUpdateBackendSnapshot();

  const [formData, setFormData] = useState({
    capturedAt: '',
    totalAlumniProfiles: '',
    totalEvents: '',
    totalAnnouncements: '',
    totalGalleryImages: '',
    totalActivities: '',
    totalApprovedUsers: '',
    totalPendingUsers: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (snapshot) {
      const capturedDate = new Date(Number(snapshot.capturedAt) / 1_000_000);
      const year = capturedDate.getFullYear();
      const month = String(capturedDate.getMonth() + 1).padStart(2, '0');
      const day = String(capturedDate.getDate()).padStart(2, '0');
      const hours = String(capturedDate.getHours()).padStart(2, '0');
      const minutes = String(capturedDate.getMinutes()).padStart(2, '0');
      const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        capturedAt: dateTimeLocal,
        totalAlumniProfiles: Number(snapshot.totalAlumniProfiles).toString(),
        totalEvents: Number(snapshot.totalEvents).toString(),
        totalAnnouncements: Number(snapshot.totalAnnouncements).toString(),
        totalGalleryImages: Number(snapshot.totalGalleryImages).toString(),
        totalActivities: Number(snapshot.totalActivities).toString(),
        totalApprovedUsers: Number(snapshot.totalApprovedUsers).toString(),
        totalPendingUsers: Number(snapshot.totalPendingUsers).toString(),
      });
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        capturedAt: dateTimeLocal,
        totalAlumniProfiles: '0',
        totalEvents: '0',
        totalAnnouncements: '0',
        totalGalleryImages: '0',
        totalActivities: '0',
        totalApprovedUsers: '0',
        totalPendingUsers: '0',
      });
    }
    setErrors({});
  }, [snapshot, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.capturedAt) {
      newErrors.capturedAt = 'Captured date and time is required';
    }

    const numericFields = [
      'totalAlumniProfiles',
      'totalEvents',
      'totalAnnouncements',
      'totalGalleryImages',
      'totalActivities',
      'totalApprovedUsers',
      'totalPendingUsers',
    ];

    numericFields.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (value === '') {
        newErrors[field] = 'This field is required';
      } else if (isNaN(Number(value)) || Number(value) < 0) {
        newErrors[field] = 'Must be a non-negative number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const capturedAtDate = new Date(formData.capturedAt);
      const capturedAtNanos = BigInt(capturedAtDate.getTime() * 1_000_000);

      const editableSnapshot: EditableBackendSnapshot = {
        capturedAt: capturedAtNanos,
        totalAlumniProfiles: BigInt(formData.totalAlumniProfiles),
        totalEvents: BigInt(formData.totalEvents),
        totalAnnouncements: BigInt(formData.totalAnnouncements),
        totalGalleryImages: BigInt(formData.totalGalleryImages),
        totalActivities: BigInt(formData.totalActivities),
        totalApprovedUsers: BigInt(formData.totalApprovedUsers),
        totalPendingUsers: BigInt(formData.totalPendingUsers),
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: snapshot.id,
          snapshot: editableSnapshot,
        });
        toast.success('Snapshot updated successfully');
      } else {
        await createMutation.mutateAsync(editableSnapshot);
        toast.success('Snapshot created successfully');
      }

      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save snapshot');
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Snapshot' : 'Add New Snapshot'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the snapshot record with new values.'
              : 'Create a new snapshot record with custom values.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="capturedAt">
              Captured At <span className="text-destructive">*</span>
            </Label>
            <Input
              id="capturedAt"
              type="datetime-local"
              value={formData.capturedAt}
              onChange={(e) => handleChange('capturedAt', e.target.value)}
              className={errors.capturedAt ? 'border-destructive' : ''}
            />
            {errors.capturedAt && (
              <p className="text-sm text-destructive">{errors.capturedAt}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAlumniProfiles">
                Total Alumni Profiles <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalAlumniProfiles"
                type="number"
                min="0"
                value={formData.totalAlumniProfiles}
                onChange={(e) => handleChange('totalAlumniProfiles', e.target.value)}
                className={errors.totalAlumniProfiles ? 'border-destructive' : ''}
              />
              {errors.totalAlumniProfiles && (
                <p className="text-sm text-destructive">{errors.totalAlumniProfiles}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalEvents">
                Total Events <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalEvents"
                type="number"
                min="0"
                value={formData.totalEvents}
                onChange={(e) => handleChange('totalEvents', e.target.value)}
                className={errors.totalEvents ? 'border-destructive' : ''}
              />
              {errors.totalEvents && (
                <p className="text-sm text-destructive">{errors.totalEvents}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAnnouncements">
                Total Announcements <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalAnnouncements"
                type="number"
                min="0"
                value={formData.totalAnnouncements}
                onChange={(e) => handleChange('totalAnnouncements', e.target.value)}
                className={errors.totalAnnouncements ? 'border-destructive' : ''}
              />
              {errors.totalAnnouncements && (
                <p className="text-sm text-destructive">{errors.totalAnnouncements}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalGalleryImages">
                Total Gallery Images <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalGalleryImages"
                type="number"
                min="0"
                value={formData.totalGalleryImages}
                onChange={(e) => handleChange('totalGalleryImages', e.target.value)}
                className={errors.totalGalleryImages ? 'border-destructive' : ''}
              />
              {errors.totalGalleryImages && (
                <p className="text-sm text-destructive">{errors.totalGalleryImages}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalActivities">
                Total Activities <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalActivities"
                type="number"
                min="0"
                value={formData.totalActivities}
                onChange={(e) => handleChange('totalActivities', e.target.value)}
                className={errors.totalActivities ? 'border-destructive' : ''}
              />
              {errors.totalActivities && (
                <p className="text-sm text-destructive">{errors.totalActivities}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalApprovedUsers">
                Total Approved Users <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalApprovedUsers"
                type="number"
                min="0"
                value={formData.totalApprovedUsers}
                onChange={(e) => handleChange('totalApprovedUsers', e.target.value)}
                className={errors.totalApprovedUsers ? 'border-destructive' : ''}
              />
              {errors.totalApprovedUsers && (
                <p className="text-sm text-destructive">{errors.totalApprovedUsers}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPendingUsers">
                Total Pending Users <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalPendingUsers"
                type="number"
                min="0"
                value={formData.totalPendingUsers}
                onChange={(e) => handleChange('totalPendingUsers', e.target.value)}
                className={errors.totalPendingUsers ? 'border-destructive' : ''}
              />
              {errors.totalPendingUsers && (
                <p className="text-sm text-destructive">{errors.totalPendingUsers}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
