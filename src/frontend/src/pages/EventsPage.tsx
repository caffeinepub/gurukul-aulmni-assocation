import { useState } from 'react';
import { useGetEvents } from '@/hooks/useQueries';
import { useAccess } from '@/hooks/useAccess';
import RequireApproved from '@/components/RequireApproved';
import EventCard from '@/components/EventCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';

export default function EventsPage() {
  return (
    <RequireApproved>
      <EventsContent />
    </RequireApproved>
  );
}

function EventsContent() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useGetEvents(false);
  const { data: pastEvents = [], isLoading: pastLoading } = useGetEvents(true);

  const isLoading = upcomingLoading || pastLoading;

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Events</h1>
        </div>
        <p className="text-muted-foreground">
          Stay updated on reunions, networking events, and special gatherings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading events...</p>
              </div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>No Upcoming Events</CardTitle>
                <CardDescription>Check back later for new events</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id.toString()} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading events...</p>
              </div>
            </div>
          ) : pastEvents.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>No Past Events</CardTitle>
                <CardDescription>Past events will appear here</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pastEvents.map((event) => (
                <EventCard key={event.id.toString()} event={event} isPast />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
