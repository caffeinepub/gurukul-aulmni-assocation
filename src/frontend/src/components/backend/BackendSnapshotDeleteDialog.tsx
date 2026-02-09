import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteBackendSnapshot } from '@/hooks/useBackendSnapshots';
import type { BackendSnapshot } from '@/backend';

interface BackendSnapshotDeleteDialogProps {
  snapshot: BackendSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BackendSnapshotDeleteDialog({
  snapshot,
  open,
  onOpenChange,
}: BackendSnapshotDeleteDialogProps) {
  const deleteMutation = useDeleteBackendSnapshot();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(snapshot.id);
      toast.success('Snapshot deleted successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete snapshot');
    }
  };

  const formatTimestamp = (nanos: bigint) => {
    const millis = Number(nanos) / 1_000_000;
    return new Date(millis).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Snapshot?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the snapshot captured at{' '}
            <span className="font-semibold">{formatTimestamp(snapshot.capturedAt)}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
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
