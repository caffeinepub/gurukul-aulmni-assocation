import { useState } from 'react';
import { useGetGalleryImages } from '@/hooks/useQueries';
import GalleryEditorDialog from './GalleryEditorDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Image, Pencil, Trash2 } from 'lucide-react';
import type { GalleryImage } from '@/backend';

export default function GalleryAdminPanel() {
  const { data: galleryImages, isLoading } = useGetGalleryImages();
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gallery Management</h3>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove gallery images
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      {!galleryImages || galleryImages.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No gallery images</CardTitle>
            <CardDescription>
              Get started by adding your first gallery image
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image) => (
            <Card key={image.id.toString()}>
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {image.imageUrl ? (
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base">{image.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {image.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingImage(image)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <GalleryEditorDialog
                  mode="delete"
                  image={image}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GalleryEditorDialog
        mode="create"
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {editingImage && (
        <GalleryEditorDialog
          mode="edit"
          image={editingImage}
          open={!!editingImage}
          onOpenChange={(open) => !open && setEditingImage(null)}
        />
      )}
    </div>
  );
}
