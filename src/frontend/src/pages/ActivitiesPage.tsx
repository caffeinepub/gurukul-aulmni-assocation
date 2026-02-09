import RequireApproved from '@/components/RequireApproved';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';

export default function ActivitiesPage() {
  // Placeholder activities data
  const activities = [
    {
      id: 1,
      title: 'Annual Sports Meet',
      description: 'Join us for a day of friendly competition and camaraderie with various sports activities including cricket, football, and athletics.',
      date: 'March 15, 2026',
      location: 'Gurukul Sports Complex',
      category: 'Sports',
      participants: 45,
    },
    {
      id: 2,
      title: 'Cultural Evening',
      description: 'Celebrate our rich cultural heritage with music, dance, and drama performances by talented alumni.',
      date: 'April 20, 2026',
      location: 'Main Auditorium',
      category: 'Cultural',
      participants: 120,
    },
    {
      id: 3,
      title: 'Career Mentorship Program',
      description: 'Connect with experienced alumni for career guidance and professional development opportunities.',
      date: 'Ongoing',
      location: 'Virtual & In-person',
      category: 'Professional',
      participants: 78,
    },
    {
      id: 4,
      title: 'Community Service Drive',
      description: 'Give back to the community through various social service initiatives and volunteer activities.',
      date: 'May 10, 2026',
      location: 'Various Locations',
      category: 'Social',
      participants: 62,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sports':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'Cultural':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'Professional':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'Social':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <RequireApproved>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Acts & Activities</h1>
          <p className="text-muted-foreground">
            Explore and participate in various alumni activities and programs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {activities.map((activity) => (
            <Card key={activity.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                  <CardTitle className="text-xl">{activity.title}</CardTitle>
                  <Badge className={getCategoryColor(activity.category)} variant="secondary">
                    {activity.category}
                  </Badge>
                </div>
                <CardDescription>{activity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{activity.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{activity.participants} participants</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state for when no activities exist */}
        {activities.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Activities Yet</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              There are currently no activities scheduled. Check back soon for upcoming programs and events.
            </p>
          </div>
        )}
      </div>
    </RequireApproved>
  );
}
