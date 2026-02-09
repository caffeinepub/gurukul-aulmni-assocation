import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, RefreshCw, Plus, Trash2, AlertTriangle } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import {
  useListBackendSnapshots,
  useCreateBackendSnapshot,
  useDeleteBackendSnapshot,
  useClearAllBackendSnapshots,
} from '@/hooks/useBackendSnapshots';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useState } from 'react';

export default function BackendPage() {
  const { data: snapshots, isLoading, isError, error, refetch, isFetching } = useListBackendSnapshots();
  const createSnapshot = useCreateBackendSnapshot();
  const deleteSnapshot = useDeleteBackendSnapshot();
  const clearAllSnapshots = useClearAllBackendSnapshots();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleCaptureSnapshot = async () => {
    try {
      await createSnapshot.mutateAsync();
      toast.success('Snapshot captured successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to capture snapshot');
    }
  };

  const handleDeleteSnapshot = async (id: bigint) => {
    try {
      await deleteSnapshot.mutateAsync(id);
      toast.success('Snapshot deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete snapshot');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllSnapshots.mutateAsync();
      setClearDialogOpen(false);
      toast.success('All snapshots cleared successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear snapshots');
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
    <AdminOnly>
      <div className="container mx-auto max-w-7xl space-y-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backend Snapshots</h1>
            <p className="mt-2 text-muted-foreground">
              Persisted backend status snapshots stored in the canister
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCaptureSnapshot}
              disabled={createSnapshot.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              {createSnapshot.isPending ? 'Capturing...' : 'Capture Snapshot'}
            </Button>
            {snapshots && snapshots.length > 0 && (
              <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={clearAllSnapshots.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Clear All Snapshots?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} from the database. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {clearAllSnapshots.isPending ? 'Clearing...' : 'Clear All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading snapshots...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Snapshots</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3">
              <p>
                {error instanceof Error
                  ? error.message
                  : 'Failed to fetch backend snapshots. Please try again.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="w-fit">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {snapshots && !isLoading && snapshots.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No snapshots yet</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Capture your first backend status snapshot to start tracking changes over time.
              </p>
              <Button onClick={handleCaptureSnapshot} disabled={createSnapshot.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createSnapshot.isPending ? 'Capturing...' : 'Capture First Snapshot'}
              </Button>
            </CardContent>
          </Card>
        )}

        {snapshots && !isLoading && snapshots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Snapshot History
              </CardTitle>
              <CardDescription>
                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} stored (newest first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Captured At</TableHead>
                      <TableHead className="text-right">Alumni</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      <TableHead className="text-right">Announcements</TableHead>
                      <TableHead className="text-right">Gallery</TableHead>
                      <TableHead className="text-right">Activities</TableHead>
                      <TableHead className="text-right">Approved</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshots.map((snapshot) => (
                      <TableRow key={snapshot.id.toString()}>
                        <TableCell className="font-medium">
                          {formatTimestamp(snapshot.capturedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(snapshot.totalAlumniProfiles)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(snapshot.totalEvents)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(snapshot.totalAnnouncements)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(snapshot.totalGalleryImages)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(snapshot.totalActivities)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {Number(snapshot.totalApprovedUsers)}
                        </TableCell>
                        <TableCell className="text-right text-amber-600 dark:text-amber-400">
                          {Number(snapshot.totalPendingUsers)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSnapshot(snapshot.id)}
                            disabled={deleteSnapshot.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  );
}
