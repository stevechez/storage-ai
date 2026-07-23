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
