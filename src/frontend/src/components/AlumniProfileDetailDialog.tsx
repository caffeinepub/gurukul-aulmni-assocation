import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, GraduationCap, Mail } from 'lucide-react';
import type { AlumniProfile } from '@/backend';

interface AlumniProfileDetailDialogProps {
  profile: AlumniProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AlumniProfileDetailDialog({ profile, open, onOpenChange }: AlumniProfileDetailDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{profile.fullName}</DialogTitle>
          <DialogDescription>Alumni Profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Class of {profile.graduationYear}
            </Badge>
            <Badge variant="outline">{profile.department}</Badge>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.currentCity}, {profile.currentCountry}
            </p>
          </div>

          {profile.bio && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-semibold">Bio</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            </>
          )}

          {profile.contactInfo && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h3>
                <p className="text-sm text-muted-foreground break-all">{profile.contactInfo}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
