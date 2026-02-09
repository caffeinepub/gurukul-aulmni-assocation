import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EventEditorDialog from './EventEditorDialog';
import AdminOnly from './AdminOnly';

export default function EventAdminPanel() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <AdminOnly fallback={null}>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>Create and manage alumni events</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </CardContent>
      </Card>

      <EventEditorDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={() => setIsCreating(false)}
      />
    </AdminOnly>
  );
}
