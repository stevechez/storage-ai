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

### Correction — this fix was wrong, reverted

The next deploy attempt failed differently: `Error: No Next.js version detected... check your Root Directory setting matches the directory of your package.json file.` The build's own printed `devDependencies` (`turbo`, `typescript`) confirmed Root Directory is genuinely the repo root, not `apps/web` — those are the *root* package.json's devDependencies, not `apps/web`'s (`next`, `react`, etc.). Declaring `"framework": "nextjs"` in `vercel.json` while Root Directory stays at the repo root was the direct cause: Vercel validated the Next.js version against the root `package.json`, which has no `next` dependency (only `apps/web/package.json` does).

Confirmed `apps/web` has no `workspace:` dependency on `packages/database` — it's fully self-contained. That makes the correct fix simpler than the one just applied: set Vercel's **Root Directory to `apps/web`** (a dashboard setting, not something this repo can control) and let Next.js zero-config detection handle everything, rather than keeping Root Directory at the repo root with custom `buildCommand`/`outputDirectory` overrides. Deleted `vercel.json` entirely — once Root Directory is corrected, no override should be needed. `turbo.json`'s env-var fix from the previous entry is left in place regardless (still correct for local `turbo build`/`turbo dev`, harmless either way even if Vercel no longer invokes turbo directly for this app).

## Sprint 20 — Trust Sprint

Date: 2026-07-24

### Goal

Move a visitor from "I understand what this does" to "I trust this enough to ask for a demo," following external cold-visitor review of the deployed homepage.

### Audit before building

Per the sprint's own "one question per section" requirement, audited what already existed before touching anything: Hero already avoided AI-hype framing and stated customer/problem/outcome clearly — no rebuild needed. The Problem section already contained almost exactly the review's "strongest message discovered" ("you never know you lost a 9pm call") nearly verbatim. How It Works already avoided over-explaining AI. Real redundancy found in `BenefitsSection`: three of its four cards substantially restated How It Works' four steps as outcomes (Capture→"recover missed opportunities", Prioritize→"know who needs follow-up", Measure→"measure revenue impact"). Integration confidence and a dedicated trust section didn't exist anywhere — the one honest "early access" framing line was buried inside the signup form itself, arriving after skepticism would already need addressing, not before.

### Completed

- Deleted `BenefitsSection` (redundant, per the audit above)
- Added three new sections, each answering exactly one of the three skeptic questions identified by the external review, placed after How It Works and before the CTA:
  - `IntegrationConfidence` ("Will this disrupt my operation?") — no new hardware, no phone replacement, works with existing workflow
  - `TrustSection` ("Is this real?") — honest early-access framing per the sprint's explicit instruction: no invented customers, no fake testimonials, "this is early access" instead of pretending otherwise
  - `RoiSection` ("What does this cost me?") — the $100/mo × 24 months = $2,400 lost-revenue framing, reframing "cost" as "revenue already being lost," not a calculator
- Updated `Navbar`'s second link (previously "Benefits" → `#benefits`) to "Why trust it" → `#early-stage`
- Trimmed the Early Access section's intro line, which previously restated the same "small number of early operators" message now covered by the new dedicated Trust section

### Outcome

The homepage now walks a skeptical visitor through all three doubts identified by the external review, in order, right before the ask — without inventing a single customer, testimonial, or unsupported claim.

## Add-on — Pricing section

Date: 2026-07-24

### Goal

Add real, transparent pricing to the landing page — flagged as the top remaining trust blocker ("is the demo a sales trap?").

### Completed

- New `PricingSection` (`#pricing`): Single Facility ($199/mo founder price, 5 listed features, CTA to Early Access) and Multi-Facility Operators ("Contact us", same Early Access form as the destination — no fabricated separate contact channel), plus a short ROI line folded directly into the section rather than a separate one
- Placed right after the existing `RoiSection`, before `IntegrationConfidence`/`TrustSection`/`EarlyAccess` — deliberately anchors the cost-of-a-missed-rental math first, then reveals the actual number, so $199/mo lands as small by comparison rather than the first thing a visitor sees before understanding the product
- Added "Pricing" to `Navbar`

### Design decisions

- Kept the existing `RoiSection` distinct rather than merging it into `PricingSection` — one builds the pain/value case before any number is shown, the other reveals the actual price; collapsing them would lose the anchoring effect
- "Contact us" for multi-facility operators points at the same real Early Access form, consistent with the earlier decision not to invent a placeholder contact email

### Outcome

The pricing question is now answered directly and transparently, with the founder-pricing framing ("early partners get rewarded for going first," not "this is permanent") stated plainly rather than implied.

## Add-on — Founder Program pricing revision

Date: 2026-07-24

### Goal

Reframe "Founder Pricing" as a "Founder Program" pilot — a trial says "try this software," a pilot says "help us prove this solves a real problem," which fits a pre-first-customer product better.

### Completed

- Rewrote the Founder tier: `$99` first month → `$199/mo` founder pricing locked in (bridges "willing to test this" into "buying a product," rather than a full free trial, which tends to attract visitors asking "is this interesting?" instead of "how do I get value?")
- Updated the included-features list to: Setup assistance, Direct founder access, Help evaluating missed call opportunities, Locked-in founder pricing
- Added a "Your first month" success-checklist block: the four questions the pilot exists to answer (calls analyzed, renters showing interest, follow-ups identified, opportunities that would've been missed), closing with "if the answers don't show real value, don't continue" — reframes the pilot as measuring a business outcome rather than testing software
- Updated eyebrow/headline to "First 20 facilities only" / "A founder pilot, not just a free trial," and the CTA to "Apply for the founder program"

### Outcome

The pricing section now asks for a specific, bounded commitment in exchange for specific, bounded proof — not "try it and see," but "let's find out together, and if it doesn't work, stop."

## Sprint 21 / Sprint 22 — Customer Discovery (prepared, not completed)

Date: 2026-07-24

### Goal

Replace assumptions with evidence: 5 real conversations with independent storage operators, same core questions each time, at least 3 assumptions confirmed and at least 3 challenged.

### Status: still zero real conversations

Sprint 22's own handoff states it plainly: "Sprints 17–21 prepared us for customer conversations, but no real operator interviews have yet occurred." That makes this the fourth sprint in a row (17, 18, 21, 22) aimed at exactly this same unmet goal. Rather than create a fourth parallel set of near-duplicate templates for Sprint 22, folded its genuine refinements into the existing Sprint 21 materials in `docs/customer-validation/`:

- Added 2 more discovery questions to `OUTREACH_AND_DISCOVERY.md` (current software, whether they've looked for a solution before)
- Added Sprint 22's post-conversation reflection questions (what surprised me, what assumption was wrong, what language they used vs. didn't, what felt emotional, would this change the homepage)
- Added the synthesis/governance requirement: summary of all conversations, top five insights, top three operator-suggested product changes, and a Sprint 23 recommendation based entirely on that evidence — explicitly, no feature work should start until that review happens
- `ASSUMPTION_LOG.md`: added the explicit Sprint 21 target (≥3 confirmed, ≥3 challenged) as a checklist
- `OPERATOR_FEEDBACK.md`: added a "Quote worth remembering" field to the per-conversation template, and a Sprint 21 summary rollup section (biggest surprise / biggest objection / feature requested / quote worth remembering)

Not marking this complete — the templates were already about as ready as they can be after Sprint 21; what's missing isn't more preparation, it's the actual conversations. No further document refinement should be treated as progress on this until real conversations happen.

## Phase 24B — Reliability Audit (Critical + High)

Date: 2026-07-24

### Goal

Harden the already-built product before the first founder pilot customers — not feature work, not customer discovery. Explicitly scoped to reliability, since bugs are real regardless of whether an operator conversation has happened yet.

### Audit method

Could not reach actual production logs/advisors — `mcp__Supabase__list_projects` only returns projects tied to this Claude.ai account, and the real production project (`hscgmcfbresuqwiuzdfw`, confirmed from `.env.local` and the live dashboard) isn't among them. Audited instead via full code review plus direct structural inspection of the local Supabase schema (RLS, constraints, indexes) via `docker exec`, which mirrors production's schema even without access to production's live logs.

### Findings (prioritized)

**Critical**
1. Zero `error.tsx` anywhere in the app — any unhandled exception showed Next.js's raw default error screen, not something in StorageAI's voice
2. `app/api/events/call/route.ts` didn't guard `request.json()` — malformed body threw unhandled instead of hitting the route's own clean error response

**High**
3. `getCurrentFacility()`'s `.single()` has no fallback — compounds with #1 (no boundary to catch it gracefully)
4. `updateFollowUpStatusAction` (Mark Contacted/Converted/Lost) had no error handling — a DB failure would crash instead of failing quietly

**Medium/Low (not fixed this pass, listed for later)**
5. No `loading.tsx` for `/dashboard` — blank page during data fetch on a slow connection
6. No index on `calls.facility_id` — full scan on every dashboard load, invisible at demo scale
7. `early_access_signups.email` has no unique constraint
8. `leads`, `units`, `conversations` tables (and `conversations`' orphaned RLS policies) are fully unreferenced by any code — dead schema from before Sprint 6
9. `lib/supabase/client.ts`/`server.ts` (anon-key clients) are defined but never imported anywhere — not a current risk (RLS-with-no-policies means zero anon access by default), just unused scaffolding for future auth work

### Completed (Critical + High)

- `app/error.tsx` (new) — app-wide error boundary
- `app/dashboard/error.tsx` (new) — dashboard-scoped, more specific message
- `app/api/events/call/route.ts` — `request.json()` wrapped in try/catch (→ clean `400` on malformed body), added validation that `facilityId`/`caller` are present
- `app/dashboard/actions.ts` — `updateFollowUpStatus` wrapped in try/catch; failure now logs server-side and returns quietly instead of crashing. Trade-off, kept deliberately minimal: failure isn't surfaced to the operator — a visible indicator would mean converting the status buttons to `useActionState`, more scope than "fix the crash"

### Verified live, not just compiled

Malformed JSON → clean `400`. Missing required fields → clean `400`. Valid request → still `200`, inserts correctly. Dashboard still loads (`200`) after adding both error boundaries.

### Unplanned but more important finding: local dev was writing to production

While verifying the API fix with a real POST, the test row didn't appear in the local database. Investigation: `.env.local` had both a `#LOCAL` and a `#PRODUCTION` block with the same keys duplicated. Next.js's env loader (`@next/env`, built on `dotenv`) resolves duplicate keys with **last occurrence winning**, so the production block silently overrode local for every request — `pnpm dev` had been running against the real production database the entire session, not the disposable local one. Confirmed via a direct query against production with the real service-role key, deleted the stray test row from production, removed the `#PRODUCTION` block from `.env.local` (user confirmed), restarted the dev server, and re-verified with a second test POST that it now correctly lands in the local database. This was a real, silent risk for any local development that writes data — not something this reliability audit set out to find, but the most consequential thing it caught.

### Outcome

The four most trust-relevant reliability gaps are fixed and verified against real requests, not just typechecked. Medium/Low items are logged for later. Local development environment now actually points at local infrastructure.

## Phase 26 Workstream 1 — Signup-to-First-Value Audit

Date: 2026-07-24

### Goal

Audit the current signup flow, identify every gap between a real signup and a real customer getting value, and produce a manual onboarding runbook plus a concrete implementation task list. No code changed this pass — findings and tasks only, per explicit instruction.

### Central finding

The Early Access form and the rest of the product are fully disconnected. Verified directly: `submitEarlyAccessSignup()` only inserts into `early_access_signups` — nothing notifies the founder, and nothing connects that table to `facilities`. More significantly, `/dashboard` is a single static route hardcoded to one constant (`DEMO_FACILITY_ID`), with zero per-facility parameterization anywhere in the app, and there is no authentication anywhere in the codebase (confirmed via full-codebase search — `profiles` table exists in the schema but no code references Supabase Auth). Most significantly: there is no path for a real customer's real phone calls to enter the system at all — the only ingestion path is a direct API POST, with no telephony integration (by design) and no manual-entry UI either.

**Plainly: if someone paid for the Founder Pilot today, there is currently no operational path to give them value with their own real data.** The product is a fully real, fully working demo of one fixed facility — not yet a multi-tenant product.

### Delivered

`docs/operations/ONBOARDING_RUNBOOK.md`:
- Signup flow audit (what `submitEarlyAccessSignup` actually does, verified against the code)
- A step-by-step gap table tracing signup → facility created → dashboard viewable → real calls ingested → login, marking each step Works/Gap
- A manual runbook documenting exactly what's possible today (SQL to hand-create a facility, and why viewing its dashboard and getting real calls into it still aren't possible without code changes)
- Four prioritized implementation tasks: (1) make `/dashboard` viewable per-facility via a query param, no auth needed yet; (2) a manual call-logging form reusing the existing ingestion endpoint — closes the biggest gap without touching the telephony boundary; (3) founder signup notification, recommending a manual periodic check over building notification infra at pilot scale; (4) scripting facility creation instead of hand-written SQL. Explicitly did not list authentication as a task — private unguessable links (Task 1) are a reasonable stand-in for a handful of founder-supported pilot customers

### Outcome

The actual blocker to "first customer success" isn't onboarding polish — it's that the product can't yet serve a second tenant with real data at all. That's now a concrete, ordered task list instead of an assumption.

## Phase 26 Workstream 1 — Tasks 1 & 2 implemented

Date: 2026-07-24

### Goal

Close the two biggest gaps from the audit above: the dashboard can't show a second facility, and there's no way for real call data to enter the system without telephony integration.

### Completed

- **Task 1 — per-facility dashboard.** `getCurrentFacility(facilityId?)` now accepts an optional ID (defaults to `DEMO_FACILITY_ID`); `/dashboard` reads it from a `?facility=` search param (Next.js's async `searchParams` prop, confirmed against this project's actual installed Next.js docs rather than assumed). No auth — a private link is a reasonable trust model for a handful of founder-supported pilots
- **Task 2 — manual call logging.** New `lib/storage/calls.ts` (`logCall()`) extracted as the single shared insert path; `app/api/events/call/route.ts` refactored to use it instead of duplicating the logic; new `logCallAction` Server Action (`app/dashboard/actions.ts`) using the same `useActionState` pattern as the Early Access form; new `LogCallForm` client component, placed prominently at the top of the dashboard as the primary data-entry point, with copy that's honest about why it exists ("No phone system connected yet — until there is, log a call here...")

### Verified live, end to end, not just compiled

- `/dashboard` with no param, with the demo facility's real ID, and with a nonexistent ID — the last one correctly triggers `dashboard/error.tsx` (confirmed both error boundaries are correctly bundled as client chunks, so the friendly fallback will render in a real browser even though curl only shows the digest-only server shell for a client-rendered error boundary)
- Logged a real test call through the actual insert path (confirmed it landed in the *local* database, not production) and confirmed on the rendered dashboard that it received full analysis — correct intent, unit size, timeline, priority, a generated response draft, and status-tracking buttons, identical treatment to every other call. Cleaned up all test artifacts afterward (local DB row, temp script, oversized tool-result files)

### Outcome

A real operator's real call can now get real value the same day, without waiting on telephony integration — logged by hand today, automated later. Tasks 3 and 4 (signup notification, scripted facility creation) remain open in the runbook.

## Phase 28 — Tasks 2 & 5 only (Tasks 1, 3, 4 explicitly rejected)

Date: 2026-07-24

### Scope decision

Phase 28 proposed five tasks. Pushed back on three before starting: Task 1 (signup notification) was already addressed in the Phase 26 runbook with a specific reason to defer it (zero real signups exist yet — nothing to notify about); Tasks 3 (Pilot Health Dashboard) and 4 (Founder Administration — pause/pricing/status) are new feature surfaces designed against zero real pilot facilities, the same premature-building pattern flagged in earlier phases. User agreed and explicitly removed 1, 3, and 4, keeping only Task 2 (facility creation workflow) and Task 5 (documentation).

### Completed — Task 2: facility creation script

- Migration `20260724164308_add_facility_contact_fields.sql`: added `phone`, `contact_name`, `contact_email` to `facilities`. Deliberately did not add any pricing-status or pause/active/pending field — that's the rejected Task 4
- `apps/web/scripts/onboard-facility.mjs`: creates the organization + facility pair from CLI args, replacing hand-written SQL. Reads production credentials from a new `.env.production.local` file — deliberately **not** `.env.local`, since that file is what `next dev` auto-loads, and mixing production credentials into it is exactly what caused local dev to silently write to production earlier this session. Refuses to run if the configured URL points at `localhost`/`127.0.0.1`, as a hard safety check against that exact mistake recurring
- Script placed at `apps/web/scripts/` rather than the existing root `scripts/` — `@supabase/supabase-js` only resolves from `apps/web/node_modules` under this repo's pnpm layout (confirmed by the first test run failing with `ERR_MODULE_NOT_FOUND` until relocated)

### Verified, not just written

- Both required-args and missing-file error paths produce the correct message
- The localhost safety guard was tested directly: pointed a temporary `.env.production.local` at `127.0.0.1` and confirmed the script refuses to run rather than silently proceeding
- The actual insert logic (organization + facility with all three new columns) was verified against the local database with a throwaway equivalent script, confirmed the row shape is correct, then cleaned up immediately — did not run the real script against production, since there's no real customer to onboard yet and doing so would create fake data in the live database

### Completed — Task 5: documentation

Rewrote `docs/operations/ONBOARDING_RUNBOOK.md` in place (not a new fragmented file) to add:
- A founder onboarding checklist reflecting the now-working tools (the script, the per-facility dashboard link, the Log a Call form)
- A pilot support section covering the three most likely "that doesn't look right" situations, tied to the actual mechanism (`analyzeTranscript()` is rule-based keyword matching with no external dependency, `buildResponseMessage()` is a static template) rather than generic troubleshooting advice
- Recovery procedures for the three failure modes Phase 28 asked about — notably, clarified that "AI processing fails" isn't a real failure mode for this architecture at all (no external call to fail), redirecting that concern to what it actually means here: a rule-matching gap worth a code fix, not an outage to recover from

### Outcome

Facility onboarding is now a documented, scripted, safety-guarded five-minute task instead of remembered SQL — and the runbook now doubles as the actual support reference for the first real pilot, when one exists.

## Phase 29 — Tasks 1, 3, 4, 5 (Task 2 rejected as redundant)

Date: 2026-07-24

### Scope decision

Phase 29 proposed five documentation tasks. Flagged Task 2 (Product Decision Register) before starting: it would duplicate what `BUILD_LOG.md` already does — every entry here already records problem, evidence, decision, alternatives, and outcome, dated. User agreed to skip it and keep `BUILD_LOG.md` as the single authoritative history. Also flagged that Tasks 1 (Observation Log) and 4 (Retrospective Template) overlap — both are "what happened during a real pilot interaction," just different granularity — and combined them into one file rather than two near-identical ones.

### Completed

- `docs/operations/PILOT_LOG.md` (Tasks 1+4 combined) — chronological per-interaction template plus a retrospective prompt block. No entries yet; none invented — genuinely empty until a real pilot interaction happens
- `docs/operations/SUCCESS_METRICS.md` (Task 3) — defines the five metrics, and for each one names the exact existing function/field that already computes it (`getMorningReport().totalCalls`, `getTodaysActions().length`, `estimateRevenueImpact()`'s `identifiedCount`/`estimatedMonthlyRevenue`/`estimatedCapturedRevenue`, one derived formula for "follow-ups completed"). No new instrumentation needed — everything asked for already exists in the product
- `docs/operations/TECH_DEBT_REGISTER.md` (Task 5) — pre-populated with the five verified findings from the Phase 24B reliability audit (no `loading.tsx`, no index on `calls.facility_id`, no unique constraint on `early_access_signups.email`, dead `leads`/`units`/`conversations` schema, unused anon-key Supabase clients), each with Risk/User Impact/Estimated Effort/Priority. No speculative items added

### Outcome

Three lightweight, evidence-grounded operational docs, no code changed, no placeholder content anywhere — each one either references real existing product behavior or stays honestly empty until real pilot data exists to put in it.

## Phase 30 — Production Readiness Review

Date: 2026-07-24

### Goal

Final review before onboarding Founder Customer #1 — not a build phase, a verification pass across links, the actual first-customer journey, security/config, and repo cleanliness.

### Real bug found and fixed: Demo Banner shown on every facility

Task 2 (first customer journey audit) walked the actual journey end-to-end: created an organization + facility exactly as the onboarding script would, viewed its dashboard, logged a real call, confirmed full analysis. In the process, found that `DemoBanner` was hardcoded to render on every facility, not just the actual demo one — a brand-new, genuinely empty real facility's dashboard said *"This is a live demonstration using sample leasing activity,"* which is actively wrong for a real paying customer looking at their own data. Confirmed via the live production URL this hasn't affected anyone yet (only the demo facility has ever been viewed in production) — caught before Customer #1, exactly what this review exists to do. Fixed: `app/dashboard/page.tsx` now only renders `DemoBanner` when `facility.id === DEMO_FACILITY_ID`. Verified live on both sides — real facility no longer shows it, demo facility still does.

### Other completed work

- **Task 1 (readiness audit):** all marketing anchors verified against their targets, all routes (including `/leads`, `/facilities`) return `200` on live production, zero placeholder/TODO content anywhere in source. One low-severity finding: `/leads` and `/facilities` are unlinked pre-current-model placeholder pages — added to the Tech Debt Register rather than duplicated across docs
- **Task 3 (security & config):** confirmed RLS + `service_role` grants are correct on all 8 tables (including the newer `facilities` contact columns), confirmed `.env.local` is still local-only, confirmed zero hardcoded secrets in source, confirmed `.gitignore` covers `.env.production.local` before that file was ever created
- **Task 4 (dependency/repo cleanup):** no unused dependencies beyond what's already logged (`@supabase/ssr` is only used by the already-flagged dead anon-key clients), no commented-out code, no duplicate utilities, no stray backup files. Migrations deliberately left untouched — append-only by design, not a cleanup target
- **Task 5 (launch checklist):** `docs/operations/LAUNCH_CHECKLIST.md` — Technical/Product/Operations, each item with a fast concrete check, explicitly excludes the three items rejected in Phase 28 (signup notification, health dashboard, administration) with a one-line reminder why

### Delivered

`docs/operations/PRODUCTION_READINESS_REVIEW.md` (the full findings) and `docs/operations/LAUNCH_CHECKLIST.md` (the reusable, run-before-every-onboarding checklist). `TECH_DEBT_REGISTER.md` gained one new entry.

### Outcome

The product now has a verified, not just assumed, first-customer journey — and the one real bug it surfaced was fixed and confirmed before any real customer could see it.

## Phase 31 — Founder Experience Refinement

Date: 2026-07-24

### Goal

Polish-only pass across five areas (Dashboard Clarity, Copy, Empty States, Error Recovery, Consistency) — explicitly no new features, no architecture changes. Success is reduced operator hesitation, not new capability.

### Findings, ranked by impact

1. **Phone numbers weren't clickable (High).** Both "Today's Actions" and "Active Opportunities" recommend the operator call the customer, but the phone number was rendered as plain text (`formatPhoneNumber()`), forcing a manual dial on every follow-up. Fixed with a new shared `ClickablePhone` component (`tel:` link, falls back to plain text when there's no number) used in both `operator-actions.tsx` and `leasing-queue.tsx`. Verified live: every phone number on the dashboard now renders as an `href="tel:+1..."` link.

2. **Status updates failed silently (High).** `updateFollowUpStatusAction` (Mark Contacted/Converted/Lost) caught DB errors and only `console.error`'d them — the operator would click a button, nothing would visibly happen, and they'd have no way to know whether it worked. Fixed by converting the action to `useActionState` (`(prevState, formData) => Promise<UpdateStatusFormState>`) and wrapping the buttons in a new `FollowUpStatusForm` client component that renders `"That didn't save — try again."` on failure. Verified via `tsc`, `eslint`, the full Vitest suite (31 passed), and live confirmation the buttons still render correctly.

3. **Copy (checked, no changes needed).** Reviewed all operator-facing copy for jargon or internal terminology — none found. Existing strings ("No phone system connected yet — until there is, log a call here...") already write from the operator's side of the screen.

4. **Empty states (checked, no changes needed).** Every empty state already explains what's missing and what happens next (e.g., "No leasing opportunities yet. As soon as a customer calls, StorageAI will capture it here.") rather than just showing blank space.

5. **Visual consistency (checked, no changes needed).** Border-radius (`rounded-lg` cards vs. `rounded-md` buttons/inputs) and padding (`p-5` dominant) are consistent and intentional, not accidental drift.

### Outcome

Two real, verified gaps between what the UI recommends ("call the customer," "update status") and what it actually let the operator do — both fixed, tested, and confirmed live. The other three review areas were genuinely already in good shape; no changes invented to justify the pass.

## Phase 32 — Operator Trust & Transparency Review

Date: 2026-07-24

### Goal

Not a feature phase. Review whether operators can understand *why* StorageAI's outputs (priority, recommended action, revenue estimate) say what they say — copy/labeling only, no changes to the underlying analysis logic.

### Confirmed problems (fixed)

1. **The same call showed two different "Recommended Action" values with no explanation why.** Traced live on the dashboard: a call in "new"/"contacted" status appears in both Today's Actions and Active Opportunities. Today's Actions overrides the action text with an urgency instruction (`getTodaysActions()` → "Call customer immediately." / "Follow up today."), while Active Opportunities shows the original content-based action from `analyzeTranscript()` ("Send pricing and availability"). Both were labeled identically as "Recommended Action," so the same call looked like it was giving contradictory advice. Fixed by giving `OpportunityCard` an optional `actionLabel` prop; Today's Actions now reads "Suggested Next Step" (urgency) while Active Opportunities keeps "Recommended Action" (content) — same data, now honestly labeled as two different questions.

2. **Priority had no visible reasoning.** The card showed "Priority: High" in red with nothing explaining why. Since `detectPriority()` is driven entirely by whether a timeline keyword was found, the reasoning was already fully derivable from data already on the card. Added `describePriorityReason()` (TDD, `lib/storage/intelligence.test.ts`) — a pure function that reads back the actual detected timeline, e.g. `Customer mentioned a timeline: "asap".` or `No timeline mentioned yet.` — rendered under the Priority field.

3. **Opportunity data was presented as flat fact, with no signal it's an inferred read of a transcript** — inconsistent with `RevenueImpactCard`, which already discloses its estimate is "not real billing data." Added a matching disclosure line to `OpportunityCard`: "Based on an automatic read of the call — always confirm details with the customer."

### Checked, no problem found

- **Copy/language audit (Task 4):** reviewed all AI-related wording (`OpportunityCard`, `RevenueImpactCard`, `ResponseDraftCard`, `DemoBanner`, `LogCallForm`, `dashboard/error.tsx`) — no overconfident claims ("will convert," "knows"), no unexplained jargon. Already written in the hedged, operator-facing style Phase 32 asked for.
- **Empty/error states:** dashboard error boundary already avoids blaming the operator and gives a concrete next step ("Try again — if it keeps happening, that's worth telling us about.").

### Documented, not built

- `OpportunityPriority`'s `'low'` value is never actually produced by `detectPriority()` (only `'high'`/`'medium'` occur in practice) — logged in `TECH_DEBT_REGISTER.md` rather than changed, since altering detection logic is out of scope for a labeling-only phase.

### Verification

`tsc --noEmit`, `eslint`, and the full Vitest suite (33/33, up from 31) all pass. Confirmed live against the dev server: Today's Actions cards render "Suggested Next Step," Active Opportunities cards render "Recommended Action," priority reasoning renders with the real detected timeline value, and the new disclosure line renders on every opportunity card.

### Outcome

The dashboard no longer shows two different "recommended" instructions for the same call under an identical label, and every AI-derived field on the opportunity card now says why it says what it says — without touching any analysis logic or adding a new capability.
