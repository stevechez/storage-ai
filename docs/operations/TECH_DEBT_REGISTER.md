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

### ~~`updateFollowUpStatus` silently no-ops on a stale/nonexistent call ID~~ — Fixed Phase 35
`.update({ status }).eq('id', callId)` with no matching row returns success with zero rows affected — confirmed directly (`UPDATE 0` via `psql`) before fixing. Fixed by adding `.select('id')` and throwing if nothing came back; this now correctly surfaces through the existing `updateFollowUpStatusAction` error path ("That didn't save — try again.") built in Phase 31, instead of the operator seeing a status change that silently didn't happen. Verified against the real local database: a bad ID now throws, a real call ID still updates and reverts cleanly. Low real-world likelihood today (no delete path exists for calls, so IDs don't currently go stale) — fixed anyway since it was a one-line, zero-risk change that closes a real silent-failure class.

## Data Integrity

### No server-side check that a submitted `facilityId` matches an authenticated identity
**Risk:** Low today — no incidents, and no auth system exists yet to check against
**User impact:** None currently. `LogCallForm` sends `facilityId` as a plain hidden form field; the API route and Server Action trust whatever value arrives. Nothing stops a technically-inclined bad actor from POSTing a different facility's ID. Acceptable because there is no session/login system at all yet — every dashboard link is a private, unguessable-UUID capability link, which is the documented trust model (`ONBOARDING_RUNBOOK.md`) for this stage. Found while reviewing data lifecycle integrity in Phase 35
**Estimated effort:** N/A now — this is the correct design for a pre-auth pilot. Relevant again the moment real authentication is built; the fix then is validating `facilityId` against the authenticated user's own facility, not sooner
**Priority:** Low (informational — revisit only when auth work begins, not before)

### `'converted'`/`'lost'` are not enforced as terminal statuses
**Risk:** Low
**User impact:** None observed. The UI (`FollowUpStatusForm`) only hides the button matching the *current* status — from a `'lost'` call, "Mark Contacted" and "Mark Converted" are still offered, so a call can move backward out of a resolved state. The database's `calls_status_check` constraint allows any of the four values in any order — there's no state-machine enforcement anywhere. Found while reviewing status-transition integrity in Phase 35
**Estimated effort:** Small — either a UI restriction or a DB trigger, once there's a real product decision about whether operators should ever need to reopen a resolved call (plausible: "marked lost by mistake"). Not fixed — that's a product-behavior decision, out of scope for a resilience-only phase
**Priority:** Low (revisit if a real operator reports needing this, or reports being confused they could do it)

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

## Observability

### No persistent log archive beyond Vercel's default retention
**Risk:** Low
**User impact:** None yet. All server-side logging (`console.error` at every real failure point, plus Next.js's own automatic logging of uncaught Server Component errors — confirmed live in Phase 35 by triggering a real "facility not found" error and observing the exact Postgres error code land in server output) goes to stdout, which Vercel captures as Function Logs with plan-dependent retention. There's no export/archive beyond that. Explicitly not fixed — Phase 35's Non-Goals rule out adding observability platforms, and there's no evidence yet that Vercel's default retention is insufficient
**Estimated effort:** N/A — no action; would mean adding a logging service, which is exactly what this phase was told not to do
**Priority:** Low (informational only)

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
