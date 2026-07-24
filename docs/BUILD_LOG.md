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
