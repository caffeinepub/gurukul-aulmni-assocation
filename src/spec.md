# Specification

## Summary
**Goal:** Persist admin-only Backend status snapshots inside the Motoko canister state and show/manage them as a table with history on the Backend page.

**Planned changes:**
- Add an in-canister, upgrade-safe snapshot data model to store Backend status rows (id, capturedAt timestamp, and the existing count fields from getBackendStatus), protected by the existing admin guard.
- Implement admin-only backend APIs to capture a new snapshot, list snapshots (newest first), delete a snapshot by id, and clear all snapshots (with explicit errors for missing ids).
- Update the admin-only Backend page to display persisted snapshots in a sheet-like table, with actions to capture, refresh, delete rows, and clear all (with confirmation), and English loading/empty/error states.
- Add/extend React Query hooks to query and mutate snapshots only when authenticated/actor is available, and to invalidate/refetch the snapshot list after mutations.

**User-visible outcome:** Admins can capture Backend status snapshots into a persistent table, view the full snapshot history in a table on the Backend page, and delete individual snapshots or clear all snapshots, with updates reflected without reloading.
