# flow-b: Conversion Optimization Pass (9.9–10.0 Target)

Date: 2026-07-31
Status: Implemented and promoted to production (Phase 48, `docs/BUILD_LOG.md`). `/flow-b` is
retired; this content now lives at `/`. Not yet committed.

## Goal

`/flow-b` (Phase 47, see `2026-07-31-flow-b-grand-slam-offer-design.md` and `docs/BUILD_LOG.md`)
is live and tests a rewritten offer against the control homepage at `/`. This is a second,
narrower pass over the same page: a conversion-copy optimization, not a redesign. The objective,
per the user's own framing, is to make the page feel less like software and more like hiring the
best leasing employee the owner has ever had — every change increases clarity, trust, or
emotional impact, without adding complexity.

Core principle driving every rewrite below: every sentence answers "why should I care?" from the
owner's side, not "what does the product do?" from the software's side.

Read end to end, the page's narrative shifted over these two review rounds from "AI answers your
phone" to something closer to peace of mind: Hero (I won't miss rentals) → Problem (I didn't know
what I was losing) → How it works (I know exactly what to do next) → Trust (it won't guess) →
Calculator (here's what missed calls are costing me) → Tomorrow (here's what my life looks like)
→ Pricing (let's prove it before you commit). Each section-level change below should be read
against that arc, not just as an isolated copy swap.

## Non-goals

- No changes to `/` (`app/page.tsx`, `app/actions.ts`, `components/marketing/*` outside
  `flow-b/`) — same boundary as the original flow-b spec.
- No pricing changes. Numbers stay $99 first month / $199/mo founder pricing. Only framing around
  the pricing card changes.
- No new dependencies, no schema changes, no backend/action logic changes. This is a content and
  one-new-section pass over existing `components/marketing/flow-b/*` files plus one new file.
- No lifetime-value calculator framing — monthly/annual stays, per the original spec's own
  rejection of the two-year-horizon framing.
- No real founder photo yet — see Founder note below. A placeholder ships; the real photo is a
  manual swap-in later, not part of this implementation.

## "Digital Leasing Manager" framing — used exactly once, site-wide

This phrase is a mental model, not a repeated tagline. It appears in exactly one place: the Hero
body paragraph (below). Every other section refers to the product as "IntelliLease." The Trust
section and Footer, which would otherwise pick up this phrase, are written to avoid it (see
below) — this is a deliberate correction from an earlier draft of this same pass, which had it
appearing four times and started reading as branding instead of positioning.

## Section-by-section content changes

### Hero (`hero.tsx`)

Eyebrow — unchanged, single line: `For independent self-storage operators`

Headline — unchanged (per explicit instruction not to touch it):
> Capture more rentals — without hiring another employee.

Subheadline — two short lines, newspaper-headline scannability, replacing the current single
paragraph. ("Qualified renter" is internal language an owner wouldn't say — line 2 drops it. Both
of the user's suggested phrasings opened with "Wake up," which would repeat line 1's opener; line
2 below keeps their exact wording minus that redundant lead-in.):
> Wake up knowing every after-hours caller got an answer.
> Your highest-priority callbacks are already waiting.

Body paragraph — the one and only "digital leasing manager" mention on the page, written as a
confident statement, not a tentative metaphor ("think of it as..." is explicitly rejected):
> Your digital leasing manager answers every call, qualifies renters, and makes sure nothing
> falls through the cracks while you're busy running the property.

Checklist — unchanged from the prior draft (approved as "perfect," specifically calling out
"Keep your number" as friction-reducing):
- ✓ Every after-hours call gets answered — if we're ever unsure, it comes straight to you, not a
  guess.
- **Live this afternoon.** Keep your number. Nothing to install.
- **Forward your number. Send your price sheet. Done.**

CTAs: `Request Founder Pilot` (primary) · `See how it works` (secondary, unchanged anchor).

Side card (`CallTransformation`):
- Eyebrow "For example" → **"While you're home for the night"**
- Down-arrow label "IntelliLease answers" → **"Answered — you don't lift a finger."**
- Dark card label "Recommended Action" → **"Your next move"** (values below it unchanged: Timeline
  / Priority).

### Problem section (`problem-section.tsx`)

Light trim only — kept close to current copy per the original spec's own non-goal. Last sentence
tightens from the current version to:
> You never see that call as a loss. No missed-call badge. No unit rented. Just a renter who
> called the next facility instead — and you'll never know how many times it happened this month.

Headline unchanged: "A renter calls at 9pm. It rings. Nobody answers. They call the next
facility."

### How it works (`how-it-works.tsx`)

Eyebrow "See what happens" → **"Here's what changes for you"**
Headline → **"The phone rings. You don't miss the rental."** (keeps "rental" vocabulary
consistent with the rest of the page rather than introducing "sale" language)
Subhead unchanged: "One phone call. Zero extra hires."

- Step 01 — unchanged (already concrete, no software language: "A renter calls your facility.").
- Step 02 title → **"We answer — instantly."** (dialogue content unchanged)
- Step 03 title → **"You know exactly who to call back first."** Panel label "Rental Opportunity"
  → **"Today's follow-ups"** (noun-label, kept distinct from the step title's sentence phrasing
  rather than "Who to call today," which would repeat "who to call" from the title right above
  it); field "Recommended Action" → **"What to do"** (value unchanged: "Call customer
  immediately.")
- Step 04 — title unchanged (already owner-as-hero: "You follow up and rent the unit."). Label
  "Status: Converted" → **"Result"**.

### Integration / effort section (`integration-confidence.tsx`)

Structure and 3-step content unchanged (already tight and effort-reducing). One addition — a
micro-trust line appended after the existing PMS-integration paragraph:
> No prompts to configure. No new hardware. Keep your number. Setup included.

### Trust section (`trust-section.tsx`)

Checklist rewritten from feature-statements to owner-outcome statements. The fourth item carries
the highest-leverage trust point in the whole page (explicit user callout) and should be styled
distinctly from the other three — bolder weight or a subtly separated row, not just another
bullet:
- ✓ Every call gets answered — day or night.
- ✓ Nothing said on the phone gets lost or forgotten.
- ✓ You start every morning with your highest-value follow-ups already prioritized.
- ✓ **If we're ever not confident, the call comes straight to you — not a guess.** *(visually
  emphasized)*

Honest-early-stage paragraph — unchanged from the original flow-b copy (no "digital leasing
manager" prefix added; that phrase lives only in the Hero):
> Built specifically for independent storage operators. IntelliLease is currently working
> directly with a small number of early facilities to eliminate missed rental opportunities —
> not selling to everyone at once, and not pretending otherwise.

Its current closing sentence — *"You won't find customer logos or case studies here yet, because
there aren't any to show honestly. What you get instead is direct access to Steve, the founder
building it."* — splits in two: the first half stays as plain text; the second half is replaced
by an actual founder-note card (below) instead of just asserting it in prose.

**Founder note (new, embedded in this section, not a standalone section):**
A small card below the honesty paragraph: a placeholder avatar (styled circle/rounded-square with
initials "S" — no photo file exists in the repo; the real photo is a manual swap-in later, not
part of this implementation), name "Steve," role "Founder," and this bio verbatim (extended per
the user's second-round feedback — the closing "if it isn't, I'll tell you" is the strongest trust
line on the page):
> Hi, I'm Steve. I built IntelliLease because too many independent storage owners lose rentals
> simply because nobody can answer every call after hours.
>
> During the Founder Pilot you'll work directly with me. We'll review your calls together and
> decide whether IntelliLease is actually creating value for your facility.
>
> If it isn't, I'll tell you.

### Lost-revenue calculator (`roi-section.tsx`)

Add one line above the three inputs:
> Most independent facilities start with these numbers — adjust if yours are different.

Instant output unchanged: monthly + annual, no lifetime-value framing.

Lead-capture card heading "Want the full breakdown?" → **"Want a more accurate number for your
exact facility?"**
Subtext → *"Tell us a bit more and we'll walk through the real numbers together — no automated
email, just a conversation."*
Button "Get the full breakdown" → **"Estimate My Lost Rentals"**

### New section — `tomorrow-section.tsx` (new file, inserted between the calculator and pricing)

**"What changes tomorrow?"** — three cards, same visual pattern as the integration/effort
section's numbered-card grid:

| Card | Line | Sub-line |
|---|---|---|
| Tonight | Every after-hours caller gets an answer. | No voicemail. No hoping they call back. |
| Tomorrow Morning | You know exactly who wants a unit. | Your follow-up list is already prioritized. |
| Next Month | You know whether IntelliLease is paying for itself. | Real numbers, not a guess. |

("Every after-hours caller gets an answer" — picked over "hears a real answer" so it echoes the
Hero subhead's "after-hours caller" phrase directly, reinforcing the same problem across
sections.)

Added to `app/flow-b/page.tsx` between `<RoiSection />` and `<PricingSection />`.

### Pricing (`pricing-section.tsx`)

Body paragraph trimmed for length, same meaning:
> Forward your number, send your price sheet, and you're live this afternoon. This isn't "try the
> software for a month." It's finding out — with direct help from the person building it —
> whether this actually captures rentals you'd otherwise miss, without adding a single hire.

Bottom paragraph reworked to drop "lifetime revenue" language, for consistency with the
calculator's monthly framing, followed by a short bold closing line — the section's (and the
page's) final emotional impression, per the user's second-round feedback:
> One missed rental costs you real money today — not just once, but every month a unit sits
> empty. IntelliLease exists to make sure you stop losing calls before you ever notice them.
>
> **Don't hire another employee until you know whether IntelliLease can do the job first.**

"If the answers don't show real value, don't continue" — pulled out of the "Your first month" card
as a visually distinct emphasized callout (larger/bolder, not paragraph text) — flagged by the
user as one of the highest-value single changes in this pass.

Pricing numbers: **unchanged.**

CTAs: "Apply for the founder program" → **"Request Founder Pilot"**; "Talk to us" → **"Talk About
My Facility"**.

### Early access (`early-access.tsx`)

Body shortened to:
> We'll talk about your facility. Not sell you software.

Button "Request early access" → **"Request Founder Pilot"**

### Nav / Footer

Nav CTA "Join early access" → **"Request Founder Pilot"**.

Footer tagline changes so "digital leasing manager" doesn't appear a second time site-wide:
> Helping independent self-storage operators capture rentals they'd otherwise miss.

## Testing & verification

- `tsc --noEmit`, `eslint .`, full existing test suite must stay green (no logic changed, so no
  new tests expected — `missed-revenue.test.ts` is untouched since the calculator's math doesn't
  change, only its surrounding copy).
- Manual verification against local dev server: every renamed CTA resolves to the correct
  existing form action (no action/prop wiring changes — button text is the only thing changing on
  each `<button>`/`<a>`), the new "What changes tomorrow?" section renders between the calculator
  and pricing, the Trust section's founder-note card renders with the placeholder avatar and bio
  text, and grep confirms "digital leasing manager" (case-insensitive) appears exactly once across
  `components/marketing/flow-b/*`.
- Confirm `/` still has zero diff (unchanged non-goal from the original spec).
