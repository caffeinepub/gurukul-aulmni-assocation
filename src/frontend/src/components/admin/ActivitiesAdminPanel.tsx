import { useState } from 'react';
import { useGetActivities } from '@/hooks/useQueries';
import ActivityEditorDialog from './ActivityEditorDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Activity, Pencil, Trash2 } from 'lucide-react';
import type { Activity as ActivityType } from '@/backend';

export default function ActivitiesAdminPanel() {
  const { data: activities, isLoading } = useGetActivities();
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activities Management</h3>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove activities
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {!activities || activities.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No activities</CardTitle>
            <CardDescription>
              Get started by adding your first activity
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{activity.title}</CardTitle>
                    <CardDescription className="mt-2 whitespace-pre-wrap line-clamp-3">
                      {activity.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingActivity(activity)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <ActivityEditorDialog
                      mode="delete"
                      activity={activity}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              {activity.photos && activity.photos.length > 0 && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.photos.length} photo{activity.photos.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <ActivityEditorDialog
        mode="create"
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {editingActivity && (
        <ActivityEditorDialog
          mode="edit"
          activity={editingActivity}
          open={!!editingActivity}
          onOpenChange={(open) => !open && setEditingActivity(null)}
        />
      )}
    </div>
  );
}
