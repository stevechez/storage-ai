# /flow-b — Page Content Export

Exported for review. This mirrors what renders at `/flow-b` (Grand Slam Offer A/B variant),
section by section, in page order. Source: `apps/web/src/components/marketing/flow-b/*`.
Page-level: `<meta name="robots" content="noindex, nofollow">` — not indexed as duplicate content.

---

## Navbar

**IntelliLease** (logo, links to `/`)

Nav: How it works · Why trust it · Pricing

CTA (top right): **Join early access**

---

## Hero

*For independent self-storage operators*

# Capture more rentals — without hiring another employee.

Wake up to rental opportunities you would have missed overnight. IntelliLease answers every call,
figures out what the renter needs, and tells you exactly who to follow up with first.

- ✓ Every call answered, logged, and summarized — escalated to you if the assistant isn't confident.
- **Live this afternoon.** Your next missed call could become your next rental.
- **Forward your number. Send your price sheet. Done.**

**[Get early access]**   [See how it works →]

**Side panel — "For example":**

> **9:42 PM · Missed Call**
> "Need a 10x15, ASAP."
> Nobody was at the desk. The renter hung up not knowing if anyone heard them.

↓ *IntelliLease answers*

> **Recommended Action**
> Call back — 10x15 unit
> Timeline: ASAP
> Priority: **High**

---

## Problem section

*The office closed at 6*

## A renter calls at 9pm. It rings. Nobody answers. They call the next facility.

You never see that call as a loss — it just never shows up as anything. No missed-call badge on a
revenue report. No unit rented. It's the rental you didn't know you lost, and it happens every
week that phone isn't answered by someone who can say yes.

---

## How it works

*See what happens*

## See what happens after a renter calls.

One phone call. Zero extra hires.

**01 — A renter calls your facility.**
> *Incoming call*
> "Hi, I'm looking for a 10×10 unit next weekend."

↓

**02 — IntelliLease answers instantly.**
> **Assistant:** "Happy to help — what size unit, and when do you need it?"
> **Renter:** "A 10×10, some time this weekend."

↓

**03 — The conversation appears in your dashboard.**
> **Rental Opportunity**
> Customer Need: Wants to rent a unit
> Unit Size: 10×10
> Timeline: This weekend
> Priority: **High**
> Recommended Action: Call customer immediately.

↓

**04 — You follow up and rent the unit.**
> **Status: Converted**
> Called back within the hour. Renter signed for the 10×10 unit, moving in this weekend.

---

## Integration / effort section

*Will this disrupt my operation?*

## Everything else becomes our job.

**01 — Forward your number.**
Point your existing line to IntelliLease — nothing to install, no new hardware.

**02 — Send your price sheet.**
We set up your assistant to quote real availability and pricing from day one.

**03 — Done.**
You're live. Every call gets answered, logged, and summarized.

Works alongside the property management software you already use — SiteLink, storEDGE, and
others — with direct integrations prioritized based on what early operators actually need.

---

## Trust / certainty section

*Is this real?*

## Every call. Accounted for.

- ✓ Every call answered
- ✓ Every conversation recorded
- ✓ Every potential rental opportunity summarized
- ✓ Every uncertain call sent directly to you

Built specifically for independent storage operators. IntelliLease is currently working directly
with a small number of early facilities to eliminate missed rental opportunities — not selling to
everyone at once, and not pretending otherwise.

You won't find customer logos or case studies here yet, because there aren't any to show
honestly. What you get instead is direct access to Steve, the founder building it.

---

## Lost-revenue calculator section

*What does this cost me?*

## How Much Revenue Are Missed Calls Costing You?

Answer three questions about your facility and see the estimate instantly.

**Inputs (live-recomputed client-side):**
| Field | Default |
|---|---|
| Missed calls / mo | 8 |
| Likely renters | 3 |
| Avg. rate / unit | $180 |

**Output (default inputs):**
> 8 missed calls → 3 likely renters × ≈$180/mo
> **≈$540/mo**
> **≈$6,480/year**
> in estimated lost revenue.

**Lead-capture card — "Want the full breakdown?"**
Leave your details and we'll follow up directly — no automated email, just a real conversation.

Fields: Name* · Email* · Facility name · Biggest challenge (dropdown: Missed after-hours calls /
Staffing / Too many phone calls / Vacancies / Other)

Button: **Get the full breakdown** → on success: *"Thanks — we'll send the full breakdown."*

(Server action `submitMissedRevenueLead` recomputes the estimate server-side and tags the row
`source: 'flow-b-calculator'`.)

---

## Pricing section

*First 20 facilities only*

## A founder pilot, not just a free trial.

Forward your number, send your price sheet, and you're live this afternoon. This isn't "try the
software for a month" — it's a chance to find out, with direct help from the person building it,
whether IntelliLease actually captures rentals you'd otherwise miss, without adding a single hire.

**Founder program**
### $99 first month
then $199/mo, founder pricing locked in
- We set it up for you
- Direct founder access
- Help evaluating missed call opportunities
- Locked-in founder pricing

**[Apply for the founder program]**

**Multi-facility operators**
### Contact us
For operators managing multiple locations

Pricing for multiple facilities depends on how many locations you run and how they're currently
staffed. Reach out and we'll work out something fair together.

**[Talk to us]**

**Your first month — during your first month, we'll help you answer:**
- How many calls did we analyze?
- How many renters showed interest?
- How many follow-ups were identified?
- Were there opportunities you would have missed?

If the answers don't show real value, don't continue. That's the point of a pilot.

One missed rental can represent thousands of dollars in lifetime revenue. IntelliLease is designed
to help operators capture opportunities they never knew they lost — without adding payroll.

---

## Early access / Founder Pilot signup

*Get early access*

## Live this afternoon. No new hire required.

Tell us about your facility and we'll reach out — no sales pitch, just a real conversation about
whether this fits how you run things.

Fields: Name* · Email* · Facility name · Anything you want us to know (textarea)

Button: **Request early access** → on success: *"Thanks — we'll be in touch."*

(Server action `submitFlowBFounderSignup` tags the row `source: 'flow-b-founder-pilot'`.)

---

## Footer

**IntelliLease** — A digital leasing manager for independent self-storage facilities.

**Product:** How it works · Pricing · Founder pilot
**Company:** Why trust it · How it fits your operation · Contact ([stevechez@gmail.com](mailto:stevechez@gmail.com))
**Legal:** Privacy policy · Terms of service

© 2026 IntelliLease. Built for the operators who answer their own phones.
