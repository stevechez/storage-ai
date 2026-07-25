# Founder Demo Script

Phase 40. A literal, runnable 10-minute script — every dashboard element and every line of dialogue below is something already verified working against the real product this session, not a description of how it's supposed to work. If something here stops matching reality, fix the product or fix this doc immediately; don't let them drift apart.

**Before you start:** have `https://storage-ai-sigma.vercel.app/dashboard?facility=7f35d8c8-deeb-40aa-b778-1981085cc0e8` open (the Founder Pilot Facility's dashboard — bookmark it, this is the one you demo from) and your phone ready to call **+1 (831) 432-9642**.

## Opening (30 seconds)

Say this, close to verbatim:

> "IntelliLease is a digital leasing employee for self-storage facilities. It answers missed calls, figures out what the renter needs, and gives you a clear next action — so a call after you've locked up doesn't just disappear. I want to show you the whole thing, live, in the next ten minutes."

Don't say "AI chatbot," "voice bot," or "automation platform" — that's not how this product is positioned, and it undersells it. It's a leasing employee that happens to work by phone.

## 1. Show the dashboard (2–3 minutes)

Walk through what's already on screen, top to bottom:

- **"Good Morning"** — the day's activity at a glance: how many opportunities need attention, how many are rental/pricing/availability questions.
- **"Today's Actions"** — the calls that actually need a follow-up right now, sorted by urgency. Point out the phone number is clickable (`tel:` link) — click-to-call, no copying a number into another app.
- **"Active Opportunities"** — every opportunity with its full read: what the renter needs, unit size, timeline, priority, and *why* it's marked that priority (point out the small gray text under "Priority" — it names the actual timeline the renter gave, not a black-box score).
- **"Revenue Impact"** — what this represents in real dollars, with an explicit disclosure that it's an estimate, not real billing data. Don't oversell this number; the honesty here is part of the pitch.

The point of this section: nothing on this screen required a developer, a PMS integration, or manual data entry to produce. It's the byproduct of calls happening.

## 2. Make a live call (3–4 minutes)

Call **+1 (831) 432-9642** on speakerphone, right in front of them. Say:

> "Hi, I'm looking for a 10x10 storage unit next month."

Let the assistant respond naturally — it'll confirm the unit size and timing, ask for a callback number, and end the call professionally. Then immediately refresh the dashboard.

Show, in order:
1. The transcript captured under "Active Opportunities" — read a line or two out loud.
2. The analysis: intent ("Wants to rent a unit"), unit size ("10x10"), and the recommended action.
3. Point out explicitly: **this took zero manual steps.** The call happened, and the opportunity was just there.

## 3. Show the safety behavior (2–3 minutes)

This is the part that earns trust, not the part to rush through. Say:

> "Now here's the part that actually matters — watch what it does when I ask something it shouldn't just make up."

Call again. Ask directly:

> "How much is a 10x10 a month?"

The assistant will decline to quote a price and offer a human follow-up instead — verified, real behavior, not a hoped-for one (see `docs/operations/PILOT_LOG.md`'s 2026-07-25 entry for the actual transcript this is based on: *"I don't have pricing details on hand right now, but I can have someone from the facility call you with that information."*).

Say plainly:

> "It will never quote a price or confirm a unit is available, because it doesn't actually know either of those things — you do. It always hands that back to a real person. That's on purpose."

This is the moment to be explicit that the assistant is a filter and a first responder, not a replacement for the operator's own judgment on pricing and inventory.

## Close

Don't oversell what's next. Say something like:

> "That's the whole loop — a call comes in, it gets understood, and you get a clear next step. If that's useful, the next step is a founder-supported pilot: I stay closely involved while you actually use it on real calls."

See `docs/marketing/OPERATOR_ONE_PAGER.md` for what to leave behind, and `docs/operations/PILOT_SUCCESS_CRITERIA.md` for what a successful pilot actually looks like if they ask.

## If something goes wrong mid-demo

- **Call doesn't connect / no greeting plays:** don't troubleshoot live. Fall back to the dashboard walkthrough and the existing real transcripts already in `docs/operations/PILOT_LOG.md` — "here's what happened the last time I tested this" is still a real, honest demo.
- **Dashboard looks empty:** you're probably not on the Founder Pilot Facility's URL (`?facility=7f35d8c8-deeb-40aa-b778-1981085cc0e8`) — check the address bar first, not the product.
- **Assistant says something off-script:** don't panic or apologize excessively. Name it plainly ("that's not quite right, and that's useful pilot feedback") and log it in `docs/operations/PILOT_LOG.md` afterward — an imperfect real answer is more credible than a scripted-looking one anyway.
