# Specification

## Summary
**Goal:** Fix the app getting stuck on perpetual loading by preventing unauthenticated backend queries, adding clear error + retry states for failed gating checks, and ensuring the landing page renders without depending on backend availability.

**Planned changes:**
- Ensure user/profile/admin/approval React Query hooks are disabled when the user is not authenticated so they do not run or contribute to loading spinners on protected routes.
- Update protected-route auth/approval gating UI to show explicit English error states (with a retry action) when required backend checks fail, instead of infinite loading.
- Adjust the landing page ("/") so it renders its content without any full-page loading state and without requiring backend queries for initial render, while still reflecting auth state once Internet Identity initializes.

**User-visible outcome:** When signed out, protected pages show the expected “Authentication Required” (or membership approval UI after login) rather than an endless spinner; when backend checks fail, users see a clear error with a retry button; and the landing page always renders reliably even if the backend is slow/unavailable.
