import RequireApproved from '@/components/RequireApproved';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  return (
    <RequireApproved>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">
            Browse photos and memories from our alumni community
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder gallery items */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="p-0">
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-semibold">Event Photo {item}</h3>
                  <p className="text-sm text-muted-foreground">
                    A memorable moment from our alumni gathering
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state for when no photos exist */}
        {false && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Photos Yet</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              The gallery is currently empty. Check back soon for photos from upcoming events and activities.
            </p>
          </div>
        )}
      </div>
    </RequireApproved>
  );
}
