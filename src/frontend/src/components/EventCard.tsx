import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import type { Event } from '@/backend';

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

export default function EventCard({ event, isPast }: EventCardProps) {
  const eventDate = new Date(Number(event.timestampNanos) / 1_000_000);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card className={isPast ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          {isPast && <Badge variant="secondary">Past</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <p className="mt-4 text-sm text-muted-foreground">{event.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
