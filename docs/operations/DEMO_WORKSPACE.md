# Demo Workspace

Phase 44c. How the permanent demonstration workspace is maintained, reset, and used. Treat this
document the way `docs/architecture/WORKSPACE_ARCHITECTURE.md` treats demo data itself — as
something curated and versioned, not something that evolves accidentally.

## What it is

One facility: **Lonestar Self Storage** (`facilities.id = '11111111-1111-1111-1111-111111111111'`,
also `DEMO_FACILITY_ID` in `lib/storage/constants.ts`), classified `workspace_type = 'demo'`
(Phase 44a). It exists solely for sales conversations, screenshots, recordings, and
documentation — never for development, regression testing, or as a stand-in for a real customer.
Founder testing and dogfooding happen in `internal`-classified facilities instead (Founder Pilot
Facility, Harbor Self Storage) — see `WORKSPACE_ARCHITECTURE.md`.

## What it looked like before this phase (a real incident, not a hypothetical)

Before Phase 44c, the demo facility had no protection against contamination. It already
happened once: a real "Log a Call" test submitted during Phase 40.5's hero-GIF recording landed
directly against the demo facility, sitting alongside the curated story until this phase found
and removed it. That's the exact failure mode everything below exists to prevent.

## How it's protected now

- **Manual "Log a Call" is hidden entirely for the demo workspace** (`dashboard/page.tsx`,
  gated on `workspace_type === 'demo'`). There is no way to add a call to the demo facility
  through the UI anymore — the only way in is the reset script below, which is deliberate.
- **The dashboard discloses it's a demo, tastefully.** A small `DemoBadge`
  (`components/storage/demo-badge.tsx`) reads "Demo Workspace · Sample leasing activity for
  demonstration purposes" — replacing the earlier alert-styled banner, which read like a
  developer warning rather than something a prospect should see during a sales conversation.
  This disclosure is kept deliberately, even though it's not needed during a live, narrated demo
  (you're already telling the prospect it's a demo) — it protects a screenshot, recording, or
  forwarded link from later being mistaken for a real customer's actual operation.

## The canonical dataset

Ten calls, a deliberately curated mix — not randomly generated, not meant to be edited casually.
Defined once, in exactly one place: `CANONICAL_CALLS` in
`apps/web/scripts/reset-demo-workspace.mjs`. The story: a range of unit sizes and urgency levels,
one older `converted` example (framed as "last month," intentionally outside the 24-hour window
described below), and a realistic mix of `new` / `contacted` / `converted` / `lost` outcomes so
every dashboard section — Good Morning, Today's Actions, Active Opportunities, Recent Results,
Revenue Impact — has something real to show, not a placeholder.

**Timestamps are relative to whenever the script runs, not fixed calendar dates.** This matters
for a real reason, not just tidiness: `summarizeRecentOutcomes()`
(`lib/storage/outcomes.ts`) computes "Recent Results (Last 24 Hours)" using an actual rolling
time window. Seeding fixed absolute dates (which is how earlier migrations originally built this
data) means the demo looks increasingly stale the longer it goes without a reset, and eventually
that section shows nothing at all — not a cosmetic problem, a real one, found by checking the
code, not assumed. Recomputing each call's `created_at` as "N hours before now" every time the
script runs is what makes the demo genuinely reusable rather than a one-time seed.

## Resetting it

```bash
cd apps/web
node scripts/reset-demo-workspace.mjs
```

Requires `apps/web/.env.production.local` (same convention as every other production script in
this project — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Deletes every existing
call against the demo facility and reinserts the ten canonical ones with fresh, relative
timestamps. Nothing else — no random generation, no facility/organization changes, no telephony
changes.

**This is a CLI script, deliberately not an in-app "Reset Demo" button.** The dashboard has no
authentication, and the demo dashboard link is specifically the one meant to be shared during
sales conversations — an in-app reset control would mean anyone holding that link could trigger
a destructive action, and would itself look out of place on a page meant to look like a real
operation. A terminal command requiring real production credentials is the safe equivalent of a
"developer/admin only" action in a system with no roles or auth to enforce that boundary any
other way.

## When to reset it

- Before any planned demo, recording, or set of marketing screenshots, if there's any chance
  something has changed since the last reset.
- Immediately, if you ever notice a call in the demo facility that doesn't match the ten in
  `CANONICAL_CALLS` — that's contamination, exactly like the Phase 40.5 incident above, and the
  fix is the same: run the script.
- There's no scheduled/automatic reset (explicitly out of scope for this phase) — this is a
  manual step you take before it matters, not a background job.

## Changing the story itself

Editing which calls exist, their outcomes, or their relative timing is a content decision, not a
routine code change — treat it like editing marketing copy: deliberate, reviewed, and done in
`CANONICAL_CALLS` directly (the one and only place this data is defined), not by writing ad hoc
SQL against production. After editing, run the script and re-verify the dashboard tells a
believable story before using it live.
