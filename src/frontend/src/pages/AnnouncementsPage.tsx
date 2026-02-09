import { useGetAnnouncements } from '@/hooks/useQueries';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import AnnouncementCard from '@/components/AnnouncementCard';
import AnnouncementAdminPanel from '@/components/AnnouncementAdminPanel';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Loader2 } from 'lucide-react';

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useGetAnnouncements();
  const { isAdmin } = useIsAdmin();

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Announcements</h1>
        </div>
        <p className="text-muted-foreground">
          Stay informed with the latest news and updates from the association
        </p>
      </div>

      {isAdmin && (
        <div className="mb-8">
          <AnnouncementAdminPanel />
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading announcements...</p>
          </div>
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Announcements</CardTitle>
            <CardDescription>Check back later for updates</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id.toString()} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
