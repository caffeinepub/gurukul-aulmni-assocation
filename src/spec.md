# Specification

## Summary
**Goal:** Enable admins to manage Gallery and Acts & Activities content via backend APIs and Admin Dashboard UI, and render these sections from backend data for approved members.

**Planned changes:**
- Add backend data models and admin-only create/update/delete APIs for Gallery items and Acts & Activities items, plus approved-member (or admin) read/list APIs with consistent access enforcement and clear unauthorized trap messages.
- Ensure new Gallery/Activities state persists across canister upgrades without impacting existing stored state (profiles, events, announcements, approvals, authorization/admin config).
- Add React Query hooks to list and mutate Gallery/Activities content (admin-only mutations), gated by actor readiness and authentication, with cache invalidation after successful mutations.
- Update `/gallery` and `/activities` pages to use backend-driven content (remove placeholder/hardcoded arrays), preserve `RequireApproved` gating, and show English empty/error states with retry.
- Add Admin Dashboard UI for admins to create, edit, and delete Gallery and Acts & Activities items with English validation/errors and without full page refresh on updates.

**User-visible outcome:** Admins can add/edit/delete Gallery and Acts & Activities entries from the Admin Dashboard; approved members can view the updated Gallery and Activities pages populated from backend data, with clear empty/error messaging.
