import { useMemo, useState } from 'react';
import type { BackendSnapshot } from '@/backend';

type SortColumn = 'capturedAt' | 'totalAlumniProfiles' | 'totalEvents' | 'totalAnnouncements' | 'totalGalleryImages' | 'totalActivities' | 'totalApprovedUsers' | 'totalPendingUsers';
type SortDirection = 'asc' | 'desc';
type FilterColumn = 'none' | 'totalAlumniProfiles' | 'totalEvents' | 'totalAnnouncements' | 'totalGalleryImages' | 'totalActivities' | 'totalApprovedUsers' | 'totalPendingUsers';

export function useBackendSnapshotTable(snapshots: BackendSnapshot[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('capturedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filterColumn, setFilterColumn] = useState<FilterColumn>('none');
  const [minFilter, setMinFilter] = useState('');
  const [maxFilter, setMaxFilter] = useState('');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setPageIndex(0);
  };

  const processedRows = useMemo(() => {
    let filtered = [...snapshots];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((snapshot) => {
        const capturedAtStr = new Date(Number(snapshot.capturedAt) / 1_000_000).toLocaleString('en-US').toLowerCase();
        const alumniStr = Number(snapshot.totalAlumniProfiles).toString();
        const eventsStr = Number(snapshot.totalEvents).toString();
        const announcementsStr = Number(snapshot.totalAnnouncements).toString();
        const galleryStr = Number(snapshot.totalGalleryImages).toString();
        const activitiesStr = Number(snapshot.totalActivities).toString();
        const approvedStr = Number(snapshot.totalApprovedUsers).toString();
        const pendingStr = Number(snapshot.totalPendingUsers).toString();

        return (
          capturedAtStr.includes(term) ||
          alumniStr.includes(term) ||
          eventsStr.includes(term) ||
          announcementsStr.includes(term) ||
          galleryStr.includes(term) ||
          activitiesStr.includes(term) ||
          approvedStr.includes(term) ||
          pendingStr.includes(term)
        );
      });
    }

    // Apply numeric range filter
    if (filterColumn !== 'none') {
      const min = minFilter ? Number(minFilter) : -Infinity;
      const max = maxFilter ? Number(maxFilter) : Infinity;

      filtered = filtered.filter((snapshot) => {
        const value = Number(snapshot[filterColumn]);
        return value >= min && value <= max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: number | bigint;
      let bVal: number | bigint;

      if (sortColumn === 'capturedAt') {
        aVal = a.capturedAt;
        bVal = b.capturedAt;
      } else {
        aVal = Number(a[sortColumn]);
        bVal = Number(b[sortColumn]);
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [snapshots, searchTerm, sortColumn, sortDirection, filterColumn, minFilter, maxFilter]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));

  // Reset to first page if current page is out of bounds
  if (pageIndex >= totalPages && totalPages > 0) {
    setPageIndex(0);
  }

  const paginatedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return processedRows.slice(start, end);
  }, [processedRows, pageIndex, pageSize]);

  return {
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
  };
}
