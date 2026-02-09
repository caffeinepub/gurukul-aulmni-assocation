import RequireApproved from '@/components/RequireApproved';
import BackendUnavailableCard from '@/components/BackendUnavailableCard';
import { useGetActivities } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Image } from 'lucide-react';

export default function ActivitiesPage() {
  return (
    <RequireApproved>
      <ActivitiesContent />
    </RequireApproved>
  );
}

function ActivitiesContent() {
  const { data: activities, isLoading, isError, refetch } = useGetActivities();

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return <BackendUnavailableCard onRetry={refetch} title="Unable to Load Activities" description="There was an error loading activities. Please try again." />;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Acts & Activities</h1>
        </div>
        <p className="text-muted-foreground">
          Explore and participate in various alumni activities and events
        </p>
      </div>

      {!activities || activities.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No activities yet</CardTitle>
            <CardDescription>
              Activities will appear here once they are added by administrators
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {activities.map((activity) => (
            <Card key={activity.id.toString()}>
              <CardHeader>
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription className="mt-2 whitespace-pre-wrap">
                  {activity.description}
                </CardDescription>
              </CardHeader>
              {activity.photos && activity.photos.length > 0 && (
                <CardContent>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {activity.photos.map((photoUrl, index) => (
                      <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={`${activity.title} photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
