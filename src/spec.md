# Specification

## Summary
**Goal:** Let admins upload photos directly from their device for Gallery and Activities, and improve how users view photos on Gallery and Activities pages via an in-page lightbox.

**Planned changes:**
- Update `GalleryEditorDialog` to include an image file picker (PNG/JPG/WebP) that converts the chosen file to a Data URL, previews it, and saves it into the existing `imageUrl` field (while preserving URL-based input behavior).
- Update `ActivityEditorDialog` to include one or more image file pickers (PNG/JPG/WebP) that convert chosen files to Data URLs and append them to the existing `photos: string[]` list (while preserving the ability to add photo URLs).
- Add client-side validation for uploads in both dialogs (allowed MIME types and a maximum per-file size) with clear English error messages.
- Add an English helper note in both dialogs explaining that uploaded images are embedded in app data and that large images may be slow.
- Add a modal/lightbox viewer on `GalleryPage` to open images larger with title/description plus English-labeled Close/Next/Previous navigation across the gallery list and basic keyboard support (Escape closes).
- Add a modal/lightbox viewer on `ActivitiesPage` to open activity photo thumbnails larger with an English-labeled Close control (and optionally navigate within an activity’s photos), with basic keyboard support (Escape closes).

**User-visible outcome:** Admins can upload images from their device for gallery items and activity photos (with previews and basic validation), and site users can click photos in Gallery/Activities to view them in a larger, modal lightbox with simple navigation controls (gallery) and Close actions in English.
