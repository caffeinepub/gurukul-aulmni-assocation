import RequireApproved from '@/components/RequireApproved';
import BackendUnavailableCard from '@/components/BackendUnavailableCard';
import { useGetGalleryImages } from '@/hooks/useQueries';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from 'lucide-react';

export default function GalleryPage() {
  return (
    <RequireApproved>
      <GalleryContent />
    </RequireApproved>
  );
}

function GalleryContent() {
  const { data: galleryImages, isLoading, isError, refetch } = useGetGalleryImages();

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return <BackendUnavailableCard onRetry={refetch} title="Unable to Load Gallery" description="There was an error loading the gallery. Please try again." />;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Image className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Photo Gallery</h1>
        </div>
        <p className="text-muted-foreground">
          Browse photos from alumni events and gatherings
        </p>
      </div>

      {!galleryImages || galleryImages.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No gallery items yet</CardTitle>
            <CardDescription>
              Gallery items will appear here once they are added by administrators
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryImages.map((item) => (
            <Card key={item.id.toString()} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
