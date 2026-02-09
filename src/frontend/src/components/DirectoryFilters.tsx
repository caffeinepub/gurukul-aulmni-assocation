import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface DirectoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  selectedDepartment: string | null;
  onDepartmentChange: (department: string | null) => void;
  years: number[];
  departments: string[];
}

export default function DirectoryFilters({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedDepartment,
  onDepartmentChange,
  years,
  departments,
}: DirectoryFiltersProps) {
  const hasActiveFilters = searchQuery || selectedYear || selectedDepartment;

  const clearFilters = () => {
    onSearchChange('');
    onYearChange(null);
    onDepartmentChange(null);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search by Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search alumni..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Graduation Year</Label>
          <Select
            value={selectedYear?.toString() || 'all'}
            onValueChange={(value) => onYearChange(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger id="year">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={selectedDepartment || 'all'}
            onValueChange={(value) => onDepartmentChange(value === 'all' ? null : value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
