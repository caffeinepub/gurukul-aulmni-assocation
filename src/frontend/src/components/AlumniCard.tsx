import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, GraduationCap } from 'lucide-react';
import type { AlumniProfile } from '@/backend';

interface AlumniCardProps {
  profile: AlumniProfile;
  onClick: () => void;
}

export default function AlumniCard({ profile, onClick }: AlumniCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-xl">{profile.fullName}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {profile.graduationYear}
          </Badge>
          <Badge variant="outline">{profile.department}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {profile.currentCity}, {profile.currentCountry}
          </span>
        </div>
        {profile.bio && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}
