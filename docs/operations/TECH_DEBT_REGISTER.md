# Technical Debt Register

Captured, not fixed (unless struck through). Started during the Phase 24B reliability audit and added to by every phase since — each entry names the phase that found it and how it was verified, so nothing here is speculative. Future work should be pulled from this register instead of memory, per Phase 29's own goal.

## Phase 37 reprioritization

Every remaining open item below, re-ranked by actual product readiness rather than discovery order. One real conclusion worth stating plainly: nothing in this register is "must resolve before first founder customer" — every item that was actually customer-blocking has already been fixed in the phase it was found, which is why nothing here has ever carried a "High" priority.

**Must resolve before first founder customer:** the original Phase 37 conclusion ("none") holds again — the one item that broke it (below) is now fully resolved, not just built.

**Can wait until after first customer** (each explicitly gated on real usage supplying evidence that doesn't exist yet):
- `'converted'`/`'lost'` are not enforced as terminal statuses
- Supabase clients have no generated `Database` type
- Vapi webhook retry can drop a call if `logCall()` fails after the transcript insert already succeeded (new, see below) — no evidence it has happened
- ~~**Telephony (Twilio number + Vapi assistant) is single-tenant**~~ — Fixed Phase 41. `lib/vapi/transcripts.ts` hardcoded `PILOT_FACILITY_ID` for every Vapi call; replaced with `getFacilityByPhoneNumber()`, resolving the facility from the number the caller actually dialed (`facilities.twilio_phone_number`, new column) instead of a code constant. A second facility can now get its own Twilio number and Vapi assistant via configuration alone — see `docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md` and `docs/operations/FOUNDER_PROVISIONING_CHECKLIST.md`. Verified against a real webhook POST: a mapped number correctly routes to its facility, an unmapped number fails closed (errors, writes nothing) rather than misattributing the call.

**Future scalability** (not urgent now; relevant once the product or team outgrows today's scale):
- No server-side check that a submitted `facilityId` matches an authenticated identity
- No persistent log archive beyond Vercel's default retention

**Nice-to-have** (zero measured risk; fix opportunistically if ever touching the same code, not worth a dedicated pass):
- `OpportunityPriority`'s `'low'` value is never actually produced
- `lib/supabase/client.ts` / `server.ts` (anon-key clients) — intentionally kept scaffolding, not really debt
- `profiles` table is fully unreferenced (new finding, see below)

## Data Integrity

### `processVapiEndOfCallReport()` can drop a call on a specific retry timing
**Risk:** Low — narrow window, no evidence it has occurred
**User impact:** None observed. Idempotency for Vapi webhook retries is keyed off the `conversation_transcripts` insert's unique constraint on `vapi_call_id` — if that insert succeeds but the subsequent `logCall()` call then fails (e.g. a transient DB error), the call never makes it into `calls`. A retry of the same webhook sees the transcript already exists, correctly treats it as a duplicate, and skips reprocessing — including skipping the `logCall()` that never actually happened the first time. Found while building the idempotency guard itself (Phase 39), not from a real incident
**Estimated effort:** Small — track a separate "fully processed" flag (e.g. a `processed_at` column) rather than overloading one insert's uniqueness for two purposes
**Priority:** Low (Can wait until after first customer — revisit if this is ever actually observed, e.g. a gap between `conversation_transcripts` and `calls` row counts)

## Deployment

### ~~No automated migration deployment — production schema silently drifted for ~10 phases~~ — Fixed Phase 38
Discovered while debugging an unrelated Twilio issue: production's schema had been frozen since roughly Phase 27/28, including missing the columns `scripts/onboard-facility.mjs` requires — meaning the onboarding script would have failed on a real signup, uncaught since Phase 28. Full incident writeup, including screenshotted verification queries, in `TWILIO_SETUP.md`'s "Production schema drift" section.

Fixed in three parts: (1) applied the five missing migrations directly against production, verified via schema queries and a real signed webhook test; (2) reconciled the migration tracking table itself via `supabase migration repair --status applied --linked`, since the migrations had been applied as raw SQL rather than through Supabase's migration system; (3) closed the structural root cause with `.github/workflows/deploy-migrations.yml`, which runs `supabase db push --linked` automatically on every push to `main` touching `supabase/migrations/**` — the CLI/CI equivalent of Supabase's Dashboard GitHub integration, which needs a browser OAuth handshake this Claude can't complete.

**Verified live, not just built:** after the two required GitHub secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) were added, manually dispatched the workflow (`workflow_dispatch`, added for exactly this) via the GitHub API and confirmed every step — checkout, Supabase CLI setup, project link, migration push — completed successfully against production, using only the CI secrets with no local cached state involved. Run: `https://github.com/stevechez/storage-ai/actions/runs/30152606928`.

## Reliability

### ~~No `loading.tsx` for `/dashboard`~~ — Fixed Phase 37
Added `app/dashboard/loading.tsx`, a plain skeleton matching the dashboard's own gray/black system (no new design tokens introduced). Verified via `pnpm build` — route table unaffected, no type/lint errors.

### ~~No index on `calls.facility_id`~~ — Fixed Phase 34
Added `calls_facility_id_created_at_idx (facility_id, created_at desc)` (`supabase/migrations/20260724180000_add_calls_facility_id_index.sql`). Verified with `EXPLAIN ANALYZE`: no measurable effect at today's 11-row scale (Postgres correctly prefers a sequential scan on a table this small), but a 50,000-row synthetic test (inserted and cleaned up for the test, not left in the database) showed 158ms → 65ms, and the unindexed plan spilled to disk for the sort. See `PERFORMANCE_BASELINE.md`.

### ~~`updateFollowUpStatus` silently no-ops on a stale/nonexistent call ID~~ — Fixed Phase 35
`.update({ status }).eq('id', callId)` with no matching row returns success with zero rows affected — confirmed directly (`UPDATE 0` via `psql`) before fixing. Fixed by adding `.select('id')` and throwing if nothing came back; this now correctly surfaces through the existing `updateFollowUpStatusAction` error path ("That didn't save — try again.") built in Phase 31, instead of the operator seeing a status change that silently didn't happen. Verified against the real local database: a bad ID now throws, a real call ID still updates and reverts cleanly.

## Data Integrity

### No server-side check that a submitted `facilityId` matches an authenticated identity
**Risk:** Low today — no incidents, and no auth system exists yet to check against
**User impact:** None currently. `LogCallForm` sends `facilityId` as a plain hidden form field; the API route and Server Action trust whatever value arrives. Nothing stops a technically-inclined bad actor from POSTing a different facility's ID. Acceptable because there is no session/login system at all yet — every dashboard link is a private, unguessable-UUID capability link, which is the documented trust model (`ONBOARDING_RUNBOOK.md`) for this stage. Found while reviewing data lifecycle integrity in Phase 35
**Estimated effort:** N/A now — this is the correct design for a pre-auth pilot. Relevant again the moment real authentication is built; the fix then is validating `facilityId` against the authenticated user's own facility, not sooner
**Priority:** Low (Phase 37: Future scalability — revisit only when auth work begins, not before)

### `'converted'`/`'lost'` are not enforced as terminal statuses
**Risk:** Low
**User impact:** None observed. The UI (`FollowUpStatusForm`) only hides the button matching the *current* status — from a `'lost'` call, "Mark Contacted" and "Mark Converted" are still offered, so a call can move backward out of a resolved state. The database's `calls_status_check` constraint allows any of the four values in any order — there's no state-machine enforcement anywhere. Found while reviewing status-transition integrity in Phase 35
**Estimated effort:** Small — either a UI restriction or a DB trigger, once there's a real product decision about whether operators should ever need to reopen a resolved call (plausible: "marked lost by mistake"). Not fixed — that's a product-behavior decision
**Priority:** Low (Phase 37: Can wait until after first customer — revisit if a real operator reports needing this, or reports being confused they could do it)

## Data Quality

### ~~`early_access_signups.email` has no unique constraint~~ — Fixed Phase 37
Added `early_access_signups_email_key` unique constraint (`supabase/migrations/20260725120000_add_early_access_signups_email_unique.sql`). Paired with an `app/actions.ts` change: `submitEarlyAccessSignup` now catches the specific unique-violation error code (`23505`) and still returns the normal success message, rather than a confusing generic error — otherwise the constraint alone would have turned a harmless resubmit into a worse experience than before. Verified against the real local database: first submit succeeds, duplicate submit still returns success, and a direct `psql` insert confirmed the constraint itself correctly rejects the duplicate at the DB layer. Test rows cleaned up after.

## Communication Clarity

### `OpportunityPriority`'s `'low'` value is never actually produced
**Risk:** None — not a bug, just an unreachable branch
**User impact:** None. `detectPriority()` in `lib/storage/intelligence.ts` only ever returns `'high'` (timeline detected) or `'medium'` (no timeline) — every downstream label/color/action map defines a `'low'` case that real analysis can never trigger. Found during the Phase 32 trust/transparency review while tracing where "Priority" values come from
**Estimated effort:** Small — either remove `'low'` from the type and its maps, or give `detectPriority()` a real third tier if one is ever wanted. Considered fixing in Phase 37 but declined: removing it cleanly touches ~8 files including 5 test fixtures for a purely cosmetic type-narrowing with no user-facing or operational payoff — a worse effort-to-value ratio than the items actually fixed this phase
**Priority:** Low (Phase 37: Nice-to-have)

## Type Safety

### Supabase clients have no generated `Database` type, so every query returns implicitly-`any` rows
**Risk:** Low today — no incidents caused by this yet
**User impact:** None directly. `createAdminClient()` (`lib/supabase/admin.ts`) calls `createClient()` with no generic type parameter, so every `.from(...).select(...)` result is `any` at the source. Phase 33 fixed the one call site this bit hardest (`getCurrentFacility()`, now explicitly typed `Promise<Facility>` against `types/storage.ts`, verified to actually catch typos via `tsc`), but `report.ts`'s raw `calls` rows and other direct queries are still untyped at the source — they just happen to be narrow enough in how they're used that nothing has broken yet
**Estimated effort:** Medium — run Supabase's type generator against the schema and pass the generated `Database` type into every `createClient()` call; touches every data-access file in `lib/storage/` and `lib/supabase/`
**Priority:** Low (Phase 37: Can wait until after first customer — raise if a real facility hits a bug traceable to a row-shape mismatch)

## Observability

### No persistent log archive beyond Vercel's default retention
**Risk:** Low
**User impact:** None yet. All server-side logging (`console.error` at every real failure point, plus Next.js's own automatic logging of uncaught Server Component errors — confirmed live in Phase 35 by triggering a real "facility not found" error and observing the exact Postgres error code land in server output) goes to stdout, which Vercel captures as Function Logs with plan-dependent retention. There's no export/archive beyond that
**Estimated effort:** N/A — no action; would mean adding a logging service, which multiple phases' Non-Goals have explicitly ruled out
**Priority:** Low (Phase 37: Future scalability — revisit only if usage volume ever makes Vercel's default retention insufficient)

## Dead Code / Schema

### ~~`leads`, `units`, `conversations` tables are fully unreferenced~~ — Fixed Phase 37
Dropped all three (`supabase/migrations/20260725120100_drop_dead_leads_units_conversations.sql`), `conversations` first since it held the only FK into `leads`. Reconfirmed immediately before dropping: 0 rows in all three tables, zero code references anywhere in `apps/web/src`. `conversations`' two orphaned RLS policies (the only explicit policies anywhere in the schema, on a table nothing queried) went with it.

### `lib/supabase/client.ts` / `server.ts` (anon-key clients) are defined but never imported anywhere
**Risk:** None currently — confirmed RLS is enabled with zero policies on every table these could touch, so the anon key gets zero access by default even if something did use it
**User impact:** None. Presumably left in place for future authentication work
**Estimated effort:** N/A — no action needed unless auth work starts and these turn out to be the wrong starting point
**Priority:** Low (Phase 37: Nice-to-have — informational only, this is intentional scaffolding, not debt)

### ~~`/leads` and `/facilities` are unlinked, pre-current-model placeholder pages~~ — Fixed Phase 37
Deleted both (`app/leads/`, `app/facilities/`) rather than wiring them up — three phases (30, 33, 36) had flagged this without a decision being made; Phase 37 exists specifically to convert that kind of open compromise into a deliberate decision, and the register itself already leaned toward delete (dead pre-model scaffolding, zero product purpose). Reconfirmed zero references anywhere before deleting. Verified live: both now correctly `404`; `/` and `/dashboard` unaffected.

### ~~`packages/database` appears to be vestigial~~ — Fixed Phase 37
Deleted. Verified first: not referenced by any application import, not named explicitly in `pnpm-workspace.yaml` (glob-matched only), the `supabase` CLI it declared as a dependency has always actually been invoked as a global Homebrew install throughout this project rather than through this package, and no CI references it. `pnpm install` after deletion completed cleanly (lockfile correctly dropped the workspace member); `pnpm test`/`pnpm lint`/`pnpm build` all still pass from the repo root afterward.

### `profiles` table is fully unreferenced
**Risk:** Low — doesn't cause bugs
**User impact:** None. `id uuid references auth.users(id)` — scaffolding for a Supabase Auth-based login system that was never built, same underlying pattern as the anon-key clients above. Zero rows, zero code references anywhere in `apps/web/src`. Found while gathering evidence for the `leads`/`units`/`conversations` cleanup above (same investigation, same criteria) but not included in that migration since it wasn't yet a named register item — per Phase 37's own instruction that "nothing should be invented," fixing it required first documenting it, not doing both in the same breath
**Estimated effort:** Small — one `drop table` once someone decides it's worth a dedicated look, or leave it for whenever real auth work starts and either reuses or replaces it
**Priority:** Low (Phase 37: Nice-to-have)

---

## How to use this register

Add an item here the moment it's found, whether or not it gets fixed immediately — that's the entire point (per Phase 29: "capture, not immediately fix"). Keep the same five fields (Risk / User Impact / Estimated Effort / Priority) so entries stay comparable, and cite how the finding was actually verified, not assumed. When resolving an item, strike it through in place with a "Fixed Phase N" note rather than deleting it — the register is a history, not just a current-state snapshot.
