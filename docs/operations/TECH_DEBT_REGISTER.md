# Technical Debt Register

Captured, not fixed. Every item below was verified directly (code review + local database inspection during the Phase 24B reliability audit, 2026-07-24) — nothing here is speculative. Future work should be pulled from this register instead of memory, per Phase 29's own goal.

## Reliability

### No `loading.tsx` for `/dashboard`
**Risk:** Low — cosmetic, not a crash
**User impact:** On a slow connection, a blank white page during the Supabase round trips instead of a skeleton/spinner. Affects perceived reliability, not actual correctness
**Estimated effort:** Small — one file
**Priority:** Medium

### ~~No index on `calls.facility_id`~~ — Fixed Phase 34
Added `calls_facility_id_created_at_idx (facility_id, created_at desc)` (`supabase/migrations/20260724180000_add_calls_facility_id_index.sql`). Verified with `EXPLAIN ANALYZE`: no measurable effect at today's 11-row scale (Postgres correctly prefers a sequential scan on a table this small), but a 50,000-row synthetic test (inserted and cleaned up for the test, not left in the database) showed 158ms → 65ms, and the unindexed plan spilled to disk for the sort. See `PERFORMANCE_BASELINE.md`.

## Data Quality

### `early_access_signups.email` has no unique constraint
**Risk:** Low
**User impact:** None to the visitor — a resubmission just creates a duplicate row. Founder-facing noise only (harder to tell real distinct interest from a double-click) when reviewing signups
**Estimated effort:** Small — add a unique constraint, decide on conflict behavior (reject vs. upsert)
**Priority:** Low

## Communication Clarity

### `OpportunityPriority`'s `'low'` value is never actually produced
**Risk:** None — not a bug, just an unreachable branch
**User impact:** None. `detectPriority()` in `lib/storage/intelligence.ts` only ever returns `'high'` (timeline detected) or `'medium'` (no timeline) — every downstream label/color/action map defines a `'low'` case that real analysis can never trigger. Found during the Phase 32 trust/transparency review while tracing where "Priority" values come from
**Estimated effort:** Small — either remove `'low'` from the type and its maps, or give `detectPriority()` a real third tier if one is ever wanted. Changing detection logic is out of scope for a copy/clarity phase, so left alone
**Priority:** Low

## Type Safety

### Supabase clients have no generated `Database` type, so every query returns implicitly-`any` rows
**Risk:** Low today — no incidents caused by this yet
**User impact:** None directly. `createAdminClient()` (`lib/supabase/admin.ts`) calls `createClient()` with no generic type parameter, so every `.from(...).select(...)` result is `any` at the source. Phase 33 fixed the one call site this bit hardest (`getCurrentFacility()`, now explicitly typed `Promise<Facility>` against `types/storage.ts`, verified to actually catch typos via `tsc`), but `report.ts`'s raw `calls` rows and other direct queries are still untyped at the source — they just happen to be narrow enough in how they're used that nothing has broken yet
**Estimated effort:** Medium — run Supabase's type generator against the schema and pass the generated `Database` type into every `createClient()` call; touches every data-access file in `lib/storage/` and `lib/supabase/`, so out of scope for a low-risk-only phase
**Priority:** Low (raise if a real facility hits a bug traceable to a row-shape mismatch)

## Dead Code / Schema

### `leads`, `units`, `conversations` tables are fully unreferenced
**Risk:** Low — doesn't cause bugs, just carries confusion cost
**User impact:** None directly. Schema debt from before Sprint 6's `calls`-based model; `conversations` also still has two orphaned RLS policies for a table nothing queries
**Estimated effort:** Small — drop tables/policies, or formally document them as intentionally reserved for a future PMS integration if that's the actual intent
**Priority:** Low

### `lib/supabase/client.ts` / `server.ts` (anon-key clients) are defined but never imported anywhere
**Risk:** None currently — confirmed RLS is enabled with zero policies on every table these could touch, so the anon key gets zero access by default even if something did use it
**User impact:** None. Presumably left in place for future authentication work
**Estimated effort:** N/A — no action needed unless auth work starts and these turn out to be the wrong starting point
**Priority:** Low (informational only)

### `/leads` and `/facilities` are unlinked, pre-current-model placeholder pages
**Risk:** Low — copy is honest ("No leads yet" / "No facilities connected"), not confusing or embarrassing
**User impact:** None currently — not linked from any nav, dashboard, or footer, only reachable by typing the URL directly. Found during the Phase 30 production readiness audit
**Estimated effort:** Small — either delete (they predate the current `calls`-based model) or wire them up if there's a real reason to keep them
**Priority:** Low

---

## How to use this register

Add an item here the moment it's found, whether or not it gets fixed immediately — that's the entire point (per Phase 29: "capture, not immediately fix"). Keep the same five fields (Risk / User Impact / Estimated Effort / Priority) so entries stay comparable, and cite how the finding was actually verified, not assumed.
