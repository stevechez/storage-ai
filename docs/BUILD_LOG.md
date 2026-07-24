# StorageAI Build Log

## Sprint 3 — Operator Dashboard

Date: 2026-07-22

### Goal

Display live operator activity from the calls table.

### Completed

- Built first dashboard page
- Connected dashboard to Supabase
- Displayed live calls
- Displayed total calls answered
- Verified end-to-end data flow

### Challenges

- Fixed Supabase service-role permissions
- Resolved UUID foreign key issues
- Aligned schema from conversations → calls

### Outcome

StorageAI is now a functioning web application instead of just an API.

## Sprint 6 — The First Decision

Date: 2026-07-23

### Goal

Transform an incoming call transcript into an actionable leasing opportunity instead of a raw transcript.

### Completed

- Added `LeasingOpportunity` domain type (`src/types/leasing.ts`): intent, unit size, timeline, priority, recommended action
- Added `analyzeTranscript()` (`src/lib/storage/intelligence.ts`) using deterministic keyword rules, composed from independently replaceable `detectIntent` / `detectUnitSize` / `detectTimeline` / `detectPriority` / `detectRecommendedAction` functions
- Added `OpportunityCard` component displaying Customer Need, Unit Size, Timeline, Priority, and Recommended Action using the existing dashboard visual language
- Added vitest as a dev dependency and wrote a test-first regression test for `analyzeTranscript()`

### Challenges

- None — deterministic keyword rules were sufficient to satisfy the sprint's acceptance case (rental intent taking precedence over an embedded pricing question)

### Outcome

StorageAI can now interpret a transcript as a `LeasingOpportunity` and display it as an actionable card, without any LLM or external AI dependency. Detection logic is isolated behind `analyzeTranscript()` so it can be swapped for an AI-based extractor later without changing the public API.

## Sprint 7 — Morning Briefing

Date: 2026-07-23

### Goal

Transform individual leasing opportunities into an actionable morning work queue, so the operator knows what to do today instead of reading a call log.

### Completed

- Added `MorningReport` type (`src/types/leasing.ts`)
- Added `summarizeOpportunities()` (`src/lib/storage/report.ts`), a pure aggregation function counting opportunities by priority and intent, and selecting the single highest-priority opportunity as the recommended first follow-up
- Rewrote `getMorningReport()` to run each call's transcript through `analyzeTranscript()` and delegate to `summarizeOpportunities()`
- Added `OpportunitySummary` and `MorningReport` components; replaced the dashboard's old "Calls Answered" stat row with the Morning Brief (priority/intent counts plus "Today's First Call", reusing `OpportunityCard`)
- Test-first regression tests for `summarizeOpportunities()`, matching the sprint's own acceptance numbers

### Challenges

- The morning-brief-level recommended action ("Call customer immediately.") doesn't match what `analyzeTranscript()` would produce for the same transcript ("Send availability link") — resolved by having the report layer override `recommendedAction` on the top opportunity, since Sprint 6's per-call action and Sprint 7's urgency-to-act-now framing are different questions answered from the same field

### Outcome

The dashboard leads with priorities instead of raw call counts. `summarizeOpportunities()` stays decoupled from Supabase, so it's independently testable and reusable if the underlying data source changes.

## Sprint 8 — The Follow-Up Engine

Date: 2026-07-23

### Goal

Give leasing opportunities a lifecycle (new/contacted/converted/lost) so operators can track what happened after a call, not just what was identified.

### Completed

- Migration adding a `status` column to `calls` (`supabase/migrations/20260723133759_add_call_follow_up_status.sql`), defaulting to `'new'`, constrained to `new`/`contacted`/`converted`/`lost`
- Added `OpportunityStatus` and `FollowUp` types (`src/types/leasing.ts`)
- Added `lib/storage/follow-up.ts`: `buildFollowUp()` (pure, test-first), `getFollowUps()`, and `updateFollowUpStatus()`
- Added a Server Action (`app/dashboard/actions.ts`) and `LeasingQueue` / `OpportunityStatusBadge` components so operators can mark a call Contacted/Converted/Lost directly from the dashboard
- Replaced the "Recent Calls" list with the "Leasing Queue" on the dashboard
- Seed migration with demo calls across all three trackable statuses, for local verification

### Challenges

- `LeasingOpportunity` is computed fresh from a transcript on every read and isn't persisted anywhere, so there was nothing to attach a status to. Resolved by tying status to the originating `calls` row (one column) rather than introducing a new opportunities/follow-ups table — keeps the "not a CRM" constraint intact
- The already-running dev server 500'd on every route (not just the ones touched this sprint) because Turbopack blocks the whole app on any compile error, and `components/marketing/*.tsx` were still empty stub files from earlier work. Restarted the dev server and gave those six files minimal placeholder exports (`return null`) purely to unblock verification — no real marketing content was added

### Outcome

Leasing opportunities now have a trackable lifecycle end-to-end: verified locally that changing a call's status via the mutation path is immediately reflected in the Leasing Queue's grouping and available actions.

## Sprint 9 — The Customer Response Assistant

Date: 2026-07-23

### Goal

Help operators respond faster to identified leasing opportunities by suggesting a message they can review and send themselves.

### Completed

- Added `ResponseChannel` and `ResponseDraft` types (`src/types/leasing.ts`)
- Added `lib/storage/responses.ts`: `buildResponseMessage()` (pure, test-first, deterministic templates keyed by intent) and `generateResponseDraft()` (ties a draft to a `FollowUp`'s `callId`, defaults to the `phone` channel)
- Added `ResponseDraftCard`, a client component showing the suggested message with a "Copy Response" button (the only interactive/client piece in this sprint)
- Wired a generated draft into each Leasing Queue item, alongside the existing opportunity card and status actions

### Challenges

- None — the same template-composition approach used for `analyzeTranscript()` and the follow-up action phrasing extended cleanly here. Deliberately did not fabricate a customer name (no name data exists, only `caller_phone`), so drafts open with "Hi there," instead of a guessed name

### Outcome

Operators now see a ready-to-send suggested message next to every leasing opportunity, with a one-click copy action. The operator remains the sender — nothing is sent automatically. `buildResponseMessage()` is isolated so it can be swapped for an AI-generated version later without changing `generateResponseDraft()`'s interface or the UI.

## Sprint 10 — Conversion Intelligence

Date: 2026-07-23

### Goal

Answer "which opportunities became rentals?" so the business impact of StorageAI is measurable, not just the workflow.

### Completed

- Added `OpportunityOutcome` and `OutcomeSummary` types (`src/types/leasing.ts`)
- Added `lib/storage/outcomes.ts`: `deriveOutcome()` (pure, test-first) and `summarizeOutcomes()` (pure, test-first)
- Added `OutcomeSummary` component showing "N identified · N converted · N lost · N pending" on the dashboard
- Gave `OpportunityStatusBadge` a small ✅/❌ touch on Converted/Lost so per-opportunity outcome reads clearly at a glance

### Challenges

- The spec's `OpportunityOutcome` (pending/converted/lost) overlaps almost entirely with Sprint 8's existing `OpportunityStatus` (new/contacted/converted/lost) — same entity, same "converted"/"lost" values, same operator action. Rather than add a second, competing status field on `calls`, `deriveOutcome()` maps the existing status onto the outcome vocabulary (new + contacted → pending), so there's exactly one place an operator marks what happened, and one new thing this sprint actually adds: the aggregate conversion summary the founder framing was really after ("50 identified, 20 converted"). No new column, no new selector UI, no duplicate source of truth

### Outcome

StorageAI can now state a measurable outcome across all identified opportunities, computed from the same status data operators already maintain — the summary and the per-call detail are always consistent because they come from the same source.

## Sprint 11 — Operator Command Center

Date: 2026-07-23

### Goal

Turn the dashboard into a daily command view: who needs attention, why, what to do next, and what happened recently — all in seconds.

### Completed

- Added `createdAt` to `FollowUp` (surfacing `calls.created_at`, already fetched, not new persistence) so results can be time-windowed
- Added `OperatorAction` type and `lib/storage/actions.ts`: `getTodaysActions()` (pure, test-first) — filters follow-ups to unresolved (`new`/`contacted`), sorts by priority, and overrides the action with an urgency phrase, same technique as Sprint 7's follow-up override
- Added `lib/storage/outcomes.ts`: `summarizeRecentOutcomes()` (pure, test-first) — a 24-hour rolling window over `summarizeOutcomes()`
- Added `OperatorActions` (renders Today's Actions) and `OperatorSummary` (the "Good Morning" line: high-priority count, needs-follow-up count, converted-recently count) components
- Gave `OutcomeSummary` a `title` prop so it could be reused for "Recent Results" instead of building a near-duplicate component
- Restructured the dashboard: dropped Morning Brief's "Today's First Call" (now superseded by the full Today's Actions list), renamed "Leasing Queue" → "Active Opportunities" (same component/data), replaced the all-time Conversion Summary with the recent-windowed "Recent Results"

### Challenges

- The spec's three sections overlapped with what Sprints 7–10 already built (a single top recommendation, the queue, an all-time outcome summary). Building all three as literally-new additions would have produced duplicate status/priority concepts on one page — explicitly flagged as a failure condition in the spec's own checklist. Resolved by consolidating rather than adding: same underlying data, reorganized into the three-section structure the sprint asked for
- Verified against live (not synthetic) data that the 24-hour window behaves correctly: the original demo call, now ~28 hours old, correctly dropped out of "Recent Results" while still correctly appearing in "Today's Actions" since it remains unresolved regardless of age

### Outcome

The dashboard now leads with "what should I do next," not a log of everything that happened. All three sections are derived from data that already existed — no new tables, no new status concepts, no new selector UI.

## Sprint 12 — Operator Demo Readiness

Date: 2026-07-23

### Goal

Make StorageAI demo-ready: a prospect should understand the value within five minutes, using real numbers rather than explanatory copy.

### Completed

- Richer demo data (`supabase/migrations/20260723160802_seed_sprint_12_demo_calls.sql`): 7 new calls bringing the total to 11, covering after-hours/weekend calls (the core missed-call thesis, previously absent from the demo data), varied intents/timelines/priorities, and — for the first time — a `lost` example, so every dashboard section shows a real, varied story instead of a thin, repetitive one
- Replaced the generic "StorageAI Operator Dashboard" tagline with a real-numbers value statement ("N rental opportunities need attention today"), reusing the already-computed Today's Actions count rather than adding new copy or logic
- Tightened empty-state copy on `OperatorActions` and `LeasingQueue` to explain what StorageAI does even when there's nothing to show, instead of a bare "nothing here" message
- Added `DemoBanner`, a small labeled strip clarifying this is sample data for a prospect, not a real customer's live facility
- Fixed a real inconsistency the richer data exposed: Morning Brief's "High Priority" tile counted opportunities from *all* calls (including already-converted/lost ones), while Good Morning's "High Priority Opportunities" (Sprint 11) only counts unresolved ones. With the old thin dataset these coincidentally matched; with realistic data they diverged (6 vs. 4) in exactly the "which number do I trust" way Sprint 12 is meant to eliminate. `getMorningReport()` now filters to unresolved calls before computing its breakdown, so both numbers — and `recommendedFollowUp`, which could previously have recommended calling an already-converted customer — are consistent

### Challenges

- The richer demo data itself surfaced the metric-consistency bug above; it wasn't visible before because the old dataset was too thin to expose the divergence

### Outcome

A prospect looking at the dashboard now sees a believable business story — including a loss, not just wins — and every number on the page means the same thing everywhere it appears.

## Sprint 13 — First Customer Readiness

Date: 2026-07-24

### Goal

Polish the existing workflow so a storage operator can sit through a five-minute demo and understand the value without explanation — refinement, not new features.

### Completed

- Added `lib/storage/format.ts`: `formatPhoneNumber()` (pure, test-first), formatting US numbers as `(512) 555-0110` instead of raw `+15125550110` everywhere a caller's phone is shown
- Renamed the demo facility from "StorageAI Demo Facility" to "Lonestar Self Storage" (with a real-sounding address) via migration — a facility named after the product itself undercut a prospect picturing it as *their* facility
- **Consolidated "Good Morning" and "Morning Brief" into one section.** Applying the sprint's own rubric ("if a section cannot answer its assigned question, simplify or remove it") to the current implementation: Morning Brief was supposed to answer "what happened overnight," but it showed a current-snapshot intent breakdown — nearly the same question Good Morning already answered, and after Sprint 12's consistency fix, its "High Priority" tile was now a literal duplicate of Good Morning's "High Priority Opportunities." Rather than build new "overnight activity" tracking (out of scope — refinement, not expansion), merged them: Good Morning now shows the headline numbers plus the Rental/Pricing/Availability breakdown as one section, one heading. `morning-report.tsx` and its "🔥 High Priority" tile were removed since they no longer added information
- **Reordered dashboard sections** to match the sprint's own "Demo Story": Good Morning → Today's Actions → Active Opportunities → Recent Results — action and in-progress work now come before the outcome recap, instead of showing results before the work that produced them
- Gave "Recent Results" its own section heading (previously the only section without one) and renamed its internal card label to "Last 24 Hours" so the heading and the card no longer say the same thing twice

### Challenges

- None new — this sprint mostly applied the "one question per section" test the spec itself provided to the actual implementation, which is what surfaced the Good Morning / Morning Brief overlap
- Found two unrelated, unused files (`lib/storage/dashboard.ts`, `lib/storage/analytics.ts`) — an older, orphaned `getMorningReport()`/`getDashboardStats()` pair not imported anywhere. Left untouched as out of scope; flagged for cleanup

### Outcome

The dashboard now has one section per question, in the order the demo story is told, with consistent phone formatting and a facility identity a prospect can actually picture as their own.

## Sprint 14 — First Customer Trust

Date: 2026-07-24

### Goal

Increase credibility of the existing experience — no new capabilities, just removing the remaining signs this is a prototype.

### Completed

- Fixed the browser tab: root `layout.tsx` still had the raw Next.js starter metadata (`title: "Create Next App"`, `description: "Generated by create next app"`) — the single most visible leftover prototype artifact, present in every screenshot and demo. Replaced with real StorageAI metadata
- Removed a debug `console.log('SERVICE KEY EXISTS: ...')` from `app/api/events/call/route.ts` that fired on every server start
- Deleted `lib/storage/dashboard.ts` and `lib/storage/analytics.ts` — the dead, unimported `getDashboardStats()`/`getMorningReport()` pair flagged (but left untouched) in Sprint 13, now confirmed unused a second time and removed
- Updated the stale "Current sprint: Sprint 6" line in root `CLAUDE.md`, which hadn't been touched since before Sprint 6 shipped

### Challenges

- Checked `Facility.pms_provider`/`pms_facility_id` (seeded as `'mock'`/`'demo-facility-001'`) as a candidate fix, but neither field is rendered anywhere in the UI — changing invisible data wouldn't affect credibility, so left as-is rather than touching the database for no visible benefit

### Outcome

The application no longer shows any literal "this was scaffolded, not built" signals — the browser tab, the API route, and the codebase itself are clean of leftover prototype artifacts, without touching any working functionality.

## Sprint 15 — Revenue Impact

Date: 2026-07-24

### Goal

Answer the question every storage owner eventually asks — "is this helping me make more money?" — with a simple, honestly-labeled estimate rather than real financial reporting.

### Completed

- Added `RevenueImpact` type (`src/types/leasing.ts`)
- Added `lib/storage/revenue.ts`: `estimateRevenueImpact()` and `formatEstimatedRevenue()` (both pure, test-first). `estimateRevenueImpact()` reuses `summarizeOutcomes()` rather than re-counting opportunities — no duplicate business logic
- Added `RevenueImpactCard`, placed as the final section on the dashboard — the closing "here's what this is worth" statement
- `formatEstimatedRevenue()` always prefixes amounts with `≈` so the estimate is visible in the number itself, not just in a caption

### Design decisions

- **Lost opportunities are excluded from every revenue figure.** `identifiedCount = converted + pending` — a lost opportunity never was and never will be revenue, so counting it would inflate the estimate and violate "estimate, don't fabricate"
- **Two figures, not one.** The headline "Estimated Monthly Revenue" is `(converted + pending) × rate` — the total monthly revenue footprint the identified opportunities represent, matching the spec's own worked example. A secondary line, "≈$X already captured from converted rentals," is `converted × rate` — the realized-value figure that most directly answers the founder's validation question ("would this help justify paying for StorageAI")
- **A single flat assumed rate** ($135/month, from the spec's own example), not a per-unit-size pricing model — real per-unit rates don't exist in the data, and building a size-to-price table would be a small forecasting engine, explicitly out of scope. The rate is a parameter (`estimateRevenueImpact(followUps, rate)`) so a future sprint with real facility pricing can pass it in without changing the function's logic
- Every rendered instance of the estimate is labeled as such — "Estimated Monthly Revenue," the `≈` prefix, and a footer disclaimer ("not real billing data") — so nothing on the card could be mistaken for actual billing

### Outcome

The dashboard now closes with a concrete dollar figure grounded entirely in the existing opportunity/outcome data — no new persistence, no fabricated numbers, and every estimate clearly marked as one.

## Sprint 16 — Operator Demo Mode

Date: 2026-07-24

### Goal

Make a polished demo experience — where a prospect understands StorageAI's value without explanation.

### Audit before building

Most of this sprint's acceptance criteria were already satisfied by earlier sprints: the Demo Banner (Sprint 12), the realistic "Lonestar Self Storage" identity (Sprint 13), the section-by-section narrative ordering — Good Morning → Today's Actions → Active Opportunities (includes suggested responses) → Recent Results → Revenue Impact (Sprints 11/13/15) — and an audit of every dashboard/component string turned up no stray AI-hype language beyond the product name itself. Rather than build redundant new components, this sprint made the one real gap concrete.

### Completed

- Rewrote `DemoBanner`'s copy: it previously led with `"Demo Facility — ..."`, using "Demo Facility" as a quasi-label immediately before naming the real facility — undercutting "the operator should imagine it as their own facility" (this sprint's own stated goal for facility identity). Replaced with `"This is a live demonstration using sample leasing activity for {facilityName} — illustrating how StorageAI works on a real facility's calls."`, matching the sprint's own suggested banner copy while still disclosing clearly that it's a demo

### Outcome

The demo now discloses itself as a demonstration without ever implying the facility itself is fake — the disclosure and the realistic identity no longer compete with each other in the same sentence.

## Sprint 17 — First Operator Validation

Date: 2026-07-24

### Goal

Not more code — a repeatable process for learning whether a real independent storage operator would pay for this. Implementation owner for this sprint is the founder; Claude's role was preparing the supporting materials, not conducting the actual conversations.

### Completed

Created `docs/customer-validation/`:

- `IDEAL_CUSTOMER_PROFILE.md` — target profile (independent/family-owned, 1–5 facilities, no call center), who to avoid initially (REITs, enterprise chains), and concrete ways to find real prospects
- `DEMO_SCRIPT.md` — a 5-minute script walking the actual live dashboard (not a hypothetical one), built around the real after-hours seed example (the 9pm/10x15/ASAP call) as the through-line from problem to business value
- `OUTREACH_AND_DISCOVERY.md` — a short, low-pressure outreach message template and the discovery question sequence, with follow-ups and guidance on what to record after each call
- `PROSPECT_LIST.md` — a tracking template with status stages, deliberately left unfilled: there's no way to know which real independent facilities exist near the founder, so inventing sample entries would be actively misleading rather than useful

### Challenges

- The natural failure mode for this sprint is treating list-building or script-polishing as a substitute for the actual conversations. Noted directly in `PROSPECT_LIST.md`: the bar is a handful of real conversations, not a long researched list

### Outcome

No application code changed. The founder now has what's needed to start real operator conversations; the next entry in this log should reflect what was actually learned, not what was prepared.

## Sprint 18 — Operator Feedback Loop

Date: 2026-07-24

### Goal

Turn real operator conversations into product decisions — evidence over assumption.

### Status: templates prepared, sprint not actually completable yet

Confirmed directly before doing anything further: no real operator conversations have happened yet (Sprint 17's `PROSPECT_LIST.md` is still the empty template). Sprint 18's own success criteria require real feedback to have been collected and at least one assumption confirmed or challenged — neither is possible without those conversations, so this sprint is **not** being marked done. Fabricating operator quotes or assumption evidence to check the boxes would defeat the entire point of the sprint.

### Completed

- `docs/customer-validation/OPERATOR_FEEDBACK.md` — a reusable per-conversation template (facility type/size, current call process, pain points, existing tools, strong reactions, objections, requested features, buying signal), ready to fill in after real conversations
- `docs/customer-validation/ASSUMPTION_LOG.md` — pre-populated with the actual load-bearing assumptions behind everything built in Sprints 1–17 (pulled from real product decisions, not invented for this file) — e.g. that after-hours missed calls are painful enough to matter, that a suggested response draft is trusted enough to use, that the daily workflow shape matches how operators actually work. Evidence/Decision columns are blank, waiting on real conversations

### Outcome

Sprint 18 stays open until real conversations happen. Come back to this entry once `OPERATOR_FEEDBACK.md` has real entries and update it with what was actually learned — that's the deliverable, not the templates.

## Sprint 19 — Public Product Experience

Date: 2026-07-24

### Goal

Make the marketing site match the operator dashboard's level of polish — every CTA works, no placeholder content, nothing implied that isn't actually built.

### Audit before building

Every `components/marketing/*.tsx` file except `Navbar` was still the empty `return null;` stub added back in Sprint 8 to unblock the dev server. `Navbar`'s "Join Early Access" button linked to `#early-access`, which had no destination — exactly the bug the sprint doc named. This was effectively building the landing page for real, not patching it. Also found and fixed a real, previously-unnoticed bug: `globals.css` hardcoded `body { font-family: Arial, ...}`, completely overriding the Geist fonts already loaded via `next/font` — this affected the whole app, not just marketing.

### Completed

- **Design system** (`globals.css`, `layout.tsx`): added a concrete/ink/steel/signal/dusk/lamp color palette drawn from self-storage's own material world (steel roll-up doors, safety-orange signage, a facility at night), Archivo as a display face (Geist Sans/Mono retained for body/utility, so the marketing site and dashboard visibly share a type family), fixed the font-family bug, added `prefers-reduced-motion` handling
- **Hero** — headline + a live-feeling artifact showing the product's real thesis: a "9:42 PM · Missed Call" card crossfading into the actual recommended-action framing, built from the real seed example (10x15, ASAP, High priority)
- **Problem section** — the one deliberately dark section, built around "a renter calls at 9pm, nobody answers, they call the next facility"
- **How it works** — four real, accurate steps (Capture → Prioritize → Respond → Measure) mapped directly onto what's actually built; numbered because it's a genuine sequence, not decoration
- **Benefits** — four cards using the sprint's own example phrases almost verbatim ("Recover missed rental opportunities," etc.), each grounded in a real, shipped capability
- **Early Access** — a real, working signup form (`app/actions.ts`, a Server Action using `useActionState`), not a `mailto:` or dead anchor. New `early_access_signups` table (migration `20260724061253`)
- **Footer** — real internal links only; deliberately did *not* invent a placeholder contact email, since a fake `.example` address would violate the exact "no placeholder content" principle this sprint is about — "Contact the founder" points at the same real Early Access form instead
- Fixed `page.tsx`'s layout wrapper, which previously constrained everything to a centered `max-w-3xl` box (unworkable for full-width sections), and removed an unused `next/image` import

### Challenges

- The Early Access form's first end-to-end test failed with a permission error: `service_role` grants from Sprint 2's setup migration only covered tables that existed at the time, not new ones. Added an explicit grant to the new table's migration and re-verified the insert succeeds
- No browser automation tool is available in this environment, so mobile/responsive layout was verified by reviewing the Tailwind breakpoint classes (grid columns collapsing, CTAs wrapping), not by an actual rendered screenshot — noted honestly rather than claimed as fully verified

### Outcome

The public site now tells the same story Sprints 11–16 already built into the dashboard, using real product examples throughout, with a working Early Access form that actually captures interest instead of just looking like it does.

## Fix — Vercel build failure on /dashboard

Date: 2026-07-24

### Problem

First Vercel deployment failed: `Export encountered an error on /dashboard/page`, with the real exception swallowed behind an opaque digest. Vercel also warned that `SUPABASE_SERVICE_ROLE_KEY` was "set on your Vercel project, but missing from turbo.json."

### Root cause

Confirmed rather than assumed: Turborepo 2.x (installed: 2.10.6) defaults to **strict env mode** — a task only receives the env vars explicitly listed in its `env` array, plus a small set of auto-inferred `NEXT_PUBLIC_*` vars for recognized frameworks like Next.js. `turbo.json`'s `build` task declared no `env` array at all. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` were auto-inferred and got through; `SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_`-prefixed) was not, and was stripped from the build process entirely — exactly matching the warning naming that one variable specifically. `/dashboard` has no `dynamic` export, so Next.js attempted to statically prerender it at build time, which meant executing `getCurrentFacility()` during `next build` with `createAdminClient()` receiving `undefined` for the service role key — `supabase-js` throws constructing a client with an invalid key, and that thrown error is what became the opaque digest.

### Fix

- `turbo.json`: added `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to the `build` task's `env` array
- `apps/web/src/app/dashboard/page.tsx`: added `export const dynamic = 'force-dynamic'` — correct regardless of the env issue, since this page is live operational data (calls, opportunities, follow-ups) that should never be frozen into a static build artifact

### Verification

Reproduced the fix locally with the exact command Vercel runs (`pnpm build` → `turbo build`), not just `next build` in isolation. Confirmed via the build's own route table: `/dashboard` now shows as `ƒ (Dynamic, server-rendered on demand)` instead of being included in static generation, and the turbo env-var warning is gone.

### Still needed (not something this fix can do)

`turbo.json` declaring the variable *name* only controls whether Turborepo passes it through during the build — it doesn't supply the *value*. The actual production Supabase credentials still need to be configured directly in the Vercel project's Environment Variables settings; nothing in this repo (including `.env.local`) reaches Vercel's build automatically.

## Fix — Vercel "No Output Directory named public" after a successful build

Date: 2026-07-24

### Problem

After the env/dynamic-rendering fix above, the build itself succeeded on Vercel — route table matched the local one exactly — but deployment then failed with `Error: No Output Directory named "public" found after the Build completed.`

### Root cause

No `vercel.json` existed anywhere in the repo, so Vercel's output-directory detection was entirely dependent on its dashboard project settings. Confirmed the project's Root Directory is the monorepo root (not `apps/web`), which is Vercel's default when a project is first imported without manual changes. With Root Directory at the repo root and no framework/output override, Vercel has no way to know the Next.js build output lives at `apps/web/.next` — it falls back to expecting a flat static `public/` folder at the root, which doesn't exist.

### Fix

Added `vercel.json` at the repo root:

```json
{
	"framework": "nextjs",
	"buildCommand": "turbo build",
	"outputDirectory": "apps/web/.next"
}
```

### Verification

Confirmed `vercel.json` doesn't affect local builds (it's only read by Vercel's platform) — `pnpm build` still succeeds identically. Could not verify this resolves the actual Vercel deployment directly — no Vercel account/API access from this environment — so this is the best-informed fix based on Vercel's documented Turborepo-monorepo-with-root-level-Root-Directory pattern, not something confirmed against a real deploy. Next deploy attempt is the real test.
