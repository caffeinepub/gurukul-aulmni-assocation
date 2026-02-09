import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { Announcement } from '@/backend';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const announcementDate = new Date(Number(announcement.timestampNanos) / 1_000_000);
  const formattedDate = announcementDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{announcement.title}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{announcement.content}</p>
      </CardContent>
    </Card>
  );
}
