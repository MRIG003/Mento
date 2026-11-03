# ADR-001: Local-first storage behind async, role-scoped repositories

## Status
Accepted (Phase 2), 2026-11-03

## Context
v1 has no backend (out of scope), yet the code must be ready to swap in Supabase without UI changes. Data per device is
small (a few classes, hundreds of answers), plus photos. Storage contents can be stale, corrupt or edited.

## Decision
- JSON records in one versioned localStorage envelope `mento:db` `{ schemaVersion, data }`; device prefs in `mento:prefs`.
- Photos and other blobs in IndexedDB through an own ~50-line wrapper (no dependency).
- All repository methods are **async** and return `Result`, even though localStorage is sync, so a network adapter fits the same contract.
- Every read: parse → migrate (N→N+1 chain) → zod validate; failures are quarantined, never silently dropped.
- Role scopes (`TeacherScope`, `StudentLinkScope`, `PrincipalScope`) are the only API; boundaries are enforced in the data layer.
- Cross-tab consistency via the `storage` event (teacher tab + student tab on one device).

## Alternatives considered
- **IndexedDB for everything:** async-native and larger quota, but more code and harder debugging; not needed for small JSON. Rejected for records, kept for blobs.
- **A library (Dexie, idb-keyval, localForage):** adds a dependency for what ~50 lines can do. Rejected.
- **Supabase now:** needs accounts, auth, a DPDP-grade processor setup and cost. Out of scope; it's the planned replacement adapter.

## Consequences
Cross-phone use isn't possible in v1 (labelled Preview: sync). The localStorage ~5 MB limit is enough for records; photos are
compressed. The migration path is tested from day one (v1 → v2 fixture).
