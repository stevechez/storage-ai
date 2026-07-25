# Pilot Success Metrics

Defined before any pilot customer exists, per Phase 29 Task 3 — deliberately just definitions, no new dashboard or instrumentation. All five map directly onto values the product already computes; none of this requires new code to start tracking.

| Metric | Where it already lives |
|---|---|
| Calls processed | `getFollowUps(facilityId).length` (`lib/storage/follow-up.ts`) — every call ever received for the facility |
| Calls requiring follow-up | `getTodaysActions(followUps).length` (`lib/storage/actions.ts`) — currently unresolved (`new`/`contacted`) opportunities |
| Follow-ups completed | Not a single existing field — derive as `summarizeOutcomes(followUps).converted + summarizeOutcomes(followUps).lost` (`lib/storage/outcomes.ts`): calls that reached a resolution, either way |
| Opportunities identified | `estimateRevenueImpact(followUps).identifiedCount` (`lib/storage/revenue.ts`) — converted + pending, deliberately excludes lost opportunities |
| Estimated revenue impact | `estimateRevenueImpact(followUps).estimatedMonthlyRevenue` and `.estimatedCapturedRevenue` — same fields already shown on the dashboard's Revenue Impact card |

## What "success" means for the first pilot

Not a target number — a comparison. For each real pilot facility, the number that matters is whether the operator, looking at their own dashboard, says the analysis matched what actually happened on the call. That's a conversation (log it in `PILOT_LOG.md`), not a metric this table can capture on its own.

## Explicitly not tracked

Vanity metrics that don't map to an existing, real computation were left out on purpose — page views, session length, login frequency (there's no login yet), feature click counts. If one of these becomes genuinely decision-relevant later, add it here with the same "where it already lives" discipline, not before.
