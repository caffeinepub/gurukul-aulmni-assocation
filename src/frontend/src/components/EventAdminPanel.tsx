import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EventEditorDialog from './EventEditorDialog';

export default function EventAdminPanel() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      <Button onClick={() => setIsCreating(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Event
      </Button>

      <EventEditorDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={() => setIsCreating(false)}
      />
    </>
  );
}
