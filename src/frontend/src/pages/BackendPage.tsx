import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Database, RefreshCw, Plus, Trash2, AlertTriangle, Search, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import { useBackendSnapshotTable } from '@/hooks/useBackendSnapshotTable';
import BackendSnapshotEditorDialog from '@/components/backend/BackendSnapshotEditorDialog';
import BackendSnapshotDeleteDialog from '@/components/backend/BackendSnapshotDeleteDialog';
import type { BackendSnapshot } from '@/backend';

export default function BackendPage() {
  const { data: snapshots, isLoading, isError, error, refetch, isFetching } = useListBackendSnapshots();
  const createSnapshot = useCreateBackendSnapshot();
  const clearAllSnapshots = useClearAllBackendSnapshots();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<BackendSnapshot | null>(null);
  const [deleteSnapshot, setDeleteSnapshot] = useState<BackendSnapshot | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    handleSort,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    minFilter,
    maxFilter,
    setMinFilter,
    setMaxFilter,
    filterColumn,
    setFilterColumn,
    processedRows,
    paginatedRows,
    totalPages,
  } = useBackendSnapshotTable(snapshots || []);

  const handleCaptureSnapshot = async () => {
    try {
      await createSnapshot.mutateAsync();
      toast.success('Snapshot captured successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to capture snapshot');
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

  const handleAddNew = () => {
    setEditingSnapshot(null);
    setEditorOpen(true);
  };

  const handleEdit = (snapshot: BackendSnapshot) => {
    setEditingSnapshot(snapshot);
    setEditorOpen(true);
  };

  const handleDelete = (snapshot: BackendSnapshot) => {
    setDeleteSnapshot(snapshot);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3 inline" /> : 
      <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, processedRows.length);

  return (
    <AdminOnly>
      <div className="container mx-auto max-w-[1600px] space-y-6 py-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backend Snapshots Database</h1>
            <p className="mt-2 text-muted-foreground">
              Manage and analyze backend status snapshots
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
              onClick={handleAddNew}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCaptureSnapshot}
              disabled={createSnapshot.isPending}
            >
              <Database className="mr-2 h-4 w-4" />
              {createSnapshot.isPending ? 'Capturing...' : 'Capture Current'}
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
                Add your first backend status snapshot to start tracking changes over time.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
                <Button variant="secondary" onClick={handleCaptureSnapshot} disabled={createSnapshot.isPending}>
                  <Database className="mr-2 h-4 w-4" />
                  {createSnapshot.isPending ? 'Capturing...' : 'Capture Current'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {snapshots && !isLoading && snapshots.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Snapshot Records
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {processedRows.length} of {snapshots.length} record{snapshots.length !== 1 ? 's' : ''}
                    {processedRows.length !== snapshots.length && ' (filtered)'}
                  </CardDescription>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search all fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <div className="min-w-[140px]">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Filter Column
                    </label>
                    <Select value={filterColumn} onValueChange={(value) => setFilterColumn(value as typeof filterColumn)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Filter</SelectItem>
                        <SelectItem value="totalAlumniProfiles">Alumni</SelectItem>
                        <SelectItem value="totalEvents">Events</SelectItem>
                        <SelectItem value="totalAnnouncements">Announcements</SelectItem>
                        <SelectItem value="totalGalleryImages">Gallery</SelectItem>
                        <SelectItem value="totalActivities">Activities</SelectItem>
                        <SelectItem value="totalApprovedUsers">Approved</SelectItem>
                        <SelectItem value="totalPendingUsers">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filterColumn !== 'none' && (
                    <>
                      <div className="min-w-[100px]">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Min
                        </label>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minFilter}
                          onChange={(e) => setMinFilter(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="min-w-[100px]">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Max
                        </label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxFilter}
                          onChange={(e) => setMaxFilter(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Table */}
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px] font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('capturedAt')}>
                          Captured At {getSortIcon('capturedAt')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalAlumniProfiles')}>
                          Alumni {getSortIcon('totalAlumniProfiles')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalEvents')}>
                          Events {getSortIcon('totalEvents')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalAnnouncements')}>
                          Announcements {getSortIcon('totalAnnouncements')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalGalleryImages')}>
                          Gallery {getSortIcon('totalGalleryImages')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalActivities')}>
                          Activities {getSortIcon('totalActivities')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalApprovedUsers')}>
                          Approved {getSortIcon('totalApprovedUsers')}
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('totalPendingUsers')}>
                          Pending {getSortIcon('totalPendingUsers')}
                        </TableHead>
                        <TableHead className="w-[120px] text-center font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No records match your search or filter criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((snapshot) => (
                          <TableRow key={snapshot.id.toString()} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-sm">
                              {new Date(Number(snapshot.capturedAt) / 1_000_000).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(snapshot.totalAlumniProfiles)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(snapshot.totalEvents)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(snapshot.totalAnnouncements)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(snapshot.totalGalleryImages)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(snapshot.totalActivities)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-green-600 dark:text-green-400 font-medium">
                              {Number(snapshot.totalApprovedUsers)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                              {Number(snapshot.totalPendingUsers)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(snapshot)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(snapshot)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Controls */}
              {processedRows.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{endIndex} of {processedRows.length}
                    </span>
                    <Select value={pageSize.toString()} onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPageIndex(0);
                    }}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="25">25 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(0)}
                      disabled={pageIndex === 0}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(pageIndex - 1)}
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {pageIndex + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(pageIndex + 1)}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(totalPages - 1)}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Editor Dialog */}
      <BackendSnapshotEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        snapshot={editingSnapshot}
      />

      {/* Delete Dialog */}
      {deleteSnapshot && (
        <BackendSnapshotDeleteDialog
          snapshot={deleteSnapshot}
          open={!!deleteSnapshot}
          onOpenChange={(open) => !open && setDeleteSnapshot(null)}
        />
      )}
    </AdminOnly>
  );
}
