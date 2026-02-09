import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AnnouncementComposerDialog from './AnnouncementComposerDialog';
import AdminOnly from './AdminOnly';

export default function AnnouncementAdminPanel() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <AdminOnly fallback={null}>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Announcement Management</CardTitle>
          <CardDescription>Create and share important updates with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </CardContent>
      </Card>

      <AnnouncementComposerDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={() => setIsCreating(false)}
      />
    </AdminOnly>
  );
}
