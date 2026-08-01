# flow-b: Grand Slam Offer A/B Variant

Date: 2026-07-31
Status: Implemented (Phase 47, `docs/BUILD_LOG.md`), not yet committed or deployed

## Goal

Stand up a second marketing landing page at `/flow-b` that tests a rewritten offer
("Grand Slam Offer" framework — bigger dream outcome, higher perceived likelihood, faster
time-to-value, lower perceived effort) against the live homepage at `/`, without changing `/`
at all. `/` remains the control (flow A); `/flow-b` is the variant (flow B).

Source material for the rewrite: the four-part strategy document the user supplied (offer
restructuring, 30-day outreach plan, buyer-objection rewrites, price-ladder strategy). Only
Parts 1 (offer) and 3 (objection-handling copy) drive actual page content. Part 2 (30-day
outreach plan) and Part 4 (broader SaaS price-ladder strategy) are sales/marketing operations,
not page content — nothing from them gets built as a section.

## Success criteria

Flow B is considered successful if it produces a meaningfully higher visitor-to-lead conversion
rate than the control while maintaining lead quality.

**Primary metric** — Founder Pilot signup conversion rate, compared between `source =
'flow-b-founder-pilot'` and the control's signups. Measurable today with existing
infrastructure: it's a query over `early_access_signups`, no new tooling required.

**Secondary metrics (directional, not yet instrumented)** — calculator completion rate,
calculator → lead form conversion, scroll depth to pricing, CTA click-through rate. This
codebase has no analytics/event-tracking tool today (no PostHog, GA, Plausible, etc.), so none
of these are measurable as stated without adding one. That's a real gap, not a detail to gloss
over — but adding an analytics dependency isn't part of this spec. `submitMissedRevenueLead`'s
row count (leads captured via the calculator) is the one secondary signal available for free
from the `source` tagging already in this design. If click/scroll-level metrics turn out to
matter, that's a separate, explicit follow-up decision (which tool, what it costs, what it
tracks) — not something to bolt on silently here.

## Non-goals

- No changes to `apps/web/src/app/page.tsx` or `apps/web/src/app/actions.ts`.
- No new pricing tiers or a "Free / $27 / $97 / Premium" ladder — the real product still has one
  offer (Founder Pilot, $99 first month / $199/mo). Pricing is the one variable held constant
  between flow A and flow B, per the user's explicit call to test messaging only, not messaging
  + pricing at once.
- No email-automation integration (no Resend/SendGrid/etc. exists in this codebase today, and
  `CLAUDE.md` prohibits adding dependencies without justification). The lost-revenue calculator
  computes and displays its estimate instantly, client-side — nothing is emailed.
- Nothing from the 30-day outreach plan (Part 2) is built into the page.

## Routing & file structure

- `apps/web/src/app/flow-b/page.tsx` — new route. Exports `metadata = { robots: { index: false,
  follow: false } }` so the experiment isn't indexed as duplicate content.
- `apps/web/src/components/marketing/flow-b/` — one forked file per section, mirroring the
  existing `components/marketing/` structure 1:1: `navbar.tsx`, `hero.tsx`,
  `problem-section.tsx`, `how-it-works.tsx`, `integration-confidence.tsx`, `trust-section.tsx`,
  `roi-section.tsx`, `pricing-section.tsx`, `early-access.tsx`, `footer.tsx`.
- `apps/web/src/app/flow-b/actions.ts` — new, separate server actions file. `app/actions.ts` is
  untouched.
- `apps/web/src/lib/storage/missed-revenue.ts` — new pure function for the calculator math, with
  a vitest test alongside it (matching the existing `lib/storage/*.test.ts` convention).

## Section-by-section content changes

**Navbar / Footer** — forked verbatim except every `href="/#section"` is rewritten to
`href="/flow-b/#section"`. Without this fix, in-page nav links on `/flow-b` would silently
navigate visitors back to the live homepage. `submitFlowBFounderSignup`'s form action lives in
the forked `early-access.tsx`, not in the nav.

This experiment intentionally rewrites messaging but should preserve the existing visual design,
spacing, typography, and overall layout wherever practical, so the primary variable under test is
the offer rather than the presentation.

**Hero** — dream outcome upgraded from "never miss a call" to "capture more rentals without
hiring another employee" / "wake up to rental opportunities you would have missed overnight."
(Not "reservations" — the product answers calls, qualifies renters, and notifies staff; it
doesn't create reservations automatically, and the copy shouldn't imply it does.) Certainty added
(every call answered, logged, summarized; escalates to you if the assistant isn't confident).
Speed: "Live this afternoon." plus a second line underneath connecting speed to outcome: "Your
next missed call could become your next rental." Effort: "Forward your number. Send your price
sheet. Done."

**Problem section** — kept close to the current copy (already effective); light tightening only,
no structural change.

**How it works** — kept structurally as-is; Phase 46a's single-story format ("show, don't
explain") already matches the doc's tangibility fix. Copy nudged toward the effort-free framing
established in the hero.

**Integration / effort section** — rewritten around the three-step onboarding promise (forward
your number → send your price sheet → done), presented as a large visual 3-step checklist rather
than paragraphs — fewer visible steps reads as less work.

**Trust / certainty section** — repurposed from the current "this is early, no fake case
studies" framing into a certainty-stacked checklist, keeping the honest early-stage message
below it (that message stays true and isn't contradicted by the doc):

```
✓ Every call answered
✓ Every conversation recorded
✓ Every rental opportunity summarized
✓ Every uncertain call sent directly to you
```

**Lost-revenue section (forked from `roi-section.tsx`)** — retitled to sell curiosity instead of
a tool: "How Much Revenue Are Missed Calls Costing You?" Contains:
1. An interactive calculator, computed instantly client-side, with three inputs and sensible
   defaults matching the doc's own example:
   - Missed rental calls per month (default 8) — contextual/display only.
   - Of those, how many would likely have rented? (default 3)
   - Average monthly rate per unit (default $180)
   Output: monthly revenue lost (`likelyRenters × avgMonthlyRate`) and annual revenue lost
   (`× 12`) — e.g. 3 × $180 = $540/mo → $6,480/year. This replaces the current
   rate-×-24-months framing, which asks owners to think in a two-year horizon they don't
   naturally use.
2. Below the instant result, a "get the full breakdown" lead-capture form: name, email,
   optional facility name, and a `biggest_challenge` dropdown (Missed after-hours calls /
   Staffing / Too many phone calls / Vacancies / Other) — submits via `submitMissedRevenueLead`.

**Pricing section** — same real offer, same numbers ($99 first month / $199/mo founder pricing,
multi-facility contact tier). Only the surrounding copy changes, per the dream-outcome / speed /
effort framing — pricing itself is the held-constant variable.

**Early access section** — forked; posts to `submitFlowBFounderSignup`. CTA microcopy picks up
the speed/certainty language established in the hero.

## Backend changes

- One additive migration: `alter table early_access_signups add column source text;` — nullable,
  no default change to existing rows, no change to `submitEarlyAccessSignup`'s behavior.
- `submitFlowBFounderSignup` (in `app/flow-b/actions.ts`) — same shape as the original action,
  inserts with `source: 'flow-b-founder-pilot'`.
- `submitMissedRevenueLead` (in `app/flow-b/actions.ts`) — captures name, email, optional
  facility name, inserts into the same `early_access_signups` table with
  `source: 'flow-b-calculator'`. The calculator inputs/result and the `biggest_challenge`
  selection are folded into the existing `message` column as a formatted string — no new columns
  beyond `source`, since this is a single experiment page, not a permanent schema.
- `lib/storage/missed-revenue.ts` exports a pure function, e.g.
  `estimateLostRevenue({ likelyRenters, avgMonthlyRate }): { monthlyRevenueLost, annualRevenueLost }`,
  covered by a vitest test.

## Testing & verification

- `tsc --noEmit`, `eslint .`, full existing test suite must stay green.
- New vitest test for `estimateLostRevenue`.
- Manual verification against local dev server: `/` renders unchanged (diff against current
  behavior), `/flow-b` renders all forked sections, nav/footer anchors stay on `/flow-b`, the
  calculator computes correctly for the default and a couple of edited inputs, both forms
  (`submitFlowBFounderSignup`, `submitMissedRevenueLead`) successfully insert rows with the
  correct `source` tag.
