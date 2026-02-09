import { useState } from 'react';
import { useSearchAlumniProfiles, useGetGraduationYears, useGetDepartments } from '@/hooks/useQueries';
import DirectoryFilters from '@/components/DirectoryFilters';
import AlumniCard from '@/components/AlumniCard';
import AlumniProfileDetailDialog from '@/components/AlumniProfileDetailDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import type { AlumniProfile } from '@/backend';

export default function DirectoryPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);

  const { data: profiles = [], isLoading } = useSearchAlumniProfiles(selectedYear, selectedDepartment);
  const { data: years = [] } = useGetGraduationYears();
  const { data: departments = [] } = useGetDepartments();

  const filteredProfiles = profiles.filter((profile) =>
    profile.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Alumni Directory</h1>
        </div>
        <p className="text-muted-foreground">
          Connect with {profiles.length} alumni from across the years
        </p>
      </div>

      <div className="mb-8">
        <DirectoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          years={years}
          departments={departments}
        />
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading alumni profiles...</p>
          </div>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Alumni Found</CardTitle>
            <CardDescription>
              {profiles.length === 0
                ? 'Be the first to create your profile!'
                : 'Try adjusting your search filters'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'alumnus' : 'alumni'}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, index) => (
              <AlumniCard key={index} profile={profile} onClick={() => setSelectedProfile(profile)} />
            ))}
          </div>
        </>
      )}

      <AlumniProfileDetailDialog
        profile={selectedProfile}
        open={!!selectedProfile}
        onOpenChange={(open) => !open && setSelectedProfile(null)}
      />
    </div>
  );
}
