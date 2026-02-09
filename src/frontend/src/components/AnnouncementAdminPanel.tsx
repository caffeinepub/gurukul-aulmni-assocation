import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AnnouncementComposerDialog from './AnnouncementComposerDialog';

export default function AnnouncementAdminPanel() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      <Button onClick={() => setIsCreating(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Announcement
      </Button>

      <AnnouncementComposerDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={() => setIsCreating(false)}
      />
    </>
  );
}
