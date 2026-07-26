# Friction Log — Phase 42 ("Become Joe")

Every entry below came from actually onboarding a real-looking fictional operator (Harbor Self
Storage) against real production infrastructure, not from imagining what might be confusing.
Ranked against the phase's one rule: **would this stop Joe from going live?** Yes → High
Priority. No → Parking Lot. Resisting the urge to rank things "important-feeling" instead of
strictly against that question, per the phase's own instruction not to polish.

## High Priority — would stop Joe from confidently going live

### Joe has no way to see his own phone number or connection status
Confirmed by actually looking: nothing on `/dashboard` shows which phone number is his, or
whether Vapi is actually live on it. Today, "going live" is entirely something Steve tells Joe
happened — Joe has no independent way to verify it himself. This isn't a backend correctness
issue (routing works, verified in Phase 41 and again below) — it's that the *product* gives Joe
no way to confirm his own status. That directly fails Step 4's actual question ("can Joe be
handed the keys"), not just a nice-to-have.

**Not building this now** — per the phase's own instruction (write it down, don't build it).

### A wrong Vapi webhook secret fails silently, with no visible error to the founder
The single biggest real obstacle in this entire phase, discovered by actually hitting it, not
anticipated in advance. Onboarding Harbor's real Twilio number and Vapi assistant went smoothly,
but the resulting assistant sent a webhook secret that didn't match Vercel's deployed
`VAPI_WEBHOOK_SECRET` (most likely `.env.production.local` was pulled from the wrong Vercel
environment). The consequence: **the phone call worked completely normally for the caller** —
Vapi answered, held a real conversation, ended cleanly — while every single result silently
vanished. No error reached Joe, no error reached the founder-in-Joe's-chair; the only evidence
was `Rejected Vapi webhook: missing or invalid secret header` sitting in Vercel's function logs,
findable only by someone who knows to look there. It took three full retry cycles (each a real
phone call) to fix, purely because nothing surfaced the failure anywhere visible.

This is worse than a loud failure: a facility could go through this exact sequence, believe
they're live because the call sounded fine, and lose real customer calls for days before anyone
noticed the dashboard staying empty. **Would this stop Joe from going live?** It literally did,
three times, in this exact dry run — the only reason it's not ranked even more urgently is that
`FOUNDER_PROVISIONING_CHECKLIST.md`'s verification step (check the database after a real test
call) is specifically designed to catch this before Joe is ever told he's live. That verification
step is now load-bearing, not optional, and the checklist has been updated to name this exact
failure mode directly rather than a generic "if it's wrong, check for typos."

**Not building automated alerting for this now** — per the phase's own instruction — but this is
the strongest concrete candidate this project has found yet for *some* kind of webhook-delivery
visibility, whenever automation work resumes.

## Parking Lot — real, but doesn't block go-live

### No facility settings have anywhere to be stored
Confirmed for real, not assumed: attempted `update facilities set office_hours = ...` against
production and got a clean Postgres error — the column doesn't exist. Same is true for a
transfer number and a greeting preference; `facilities` has no columns for any of the three.
Doesn't block go-live because the system doesn't currently *use* any of them for anything —
there's no after-hours logic, no live-transfer feature, and the assistant's greeting is a fixed
script property, not read from the database at call time.

### The assistant's greeting is generic, not facility-specific
`setup-vapi-assistant.mjs`'s `firstMessage` is hardcoded to "Thanks for calling — how can I help
you today?" — no facility name, for any facility. The `SYSTEM_PROMPT` is similarly generic
("a self-storage facility"). Real quality gap (a caller might wonder if they reached the right
place), but doesn't stop calls from being answered, understood, or logged correctly — so by the
phase's strict rule, this doesn't block go-live even though it's the first thing every caller
hears.

### No live call transfer to Joe's transfer number
Related to the settings gap above but worth naming separately: even if a transfer number were
stored, there's no actual transfer capability built — the assistant's current behavior for
anything it can't answer is "someone will follow up," not a live handoff. A real feature, not
just a missing field.

### No facility settings/edit UI
Joe can't see or update his own address, hours, or contact info without asking Steve to run SQL.
Fine at pilot scale (one facility, one founder who already has DB access) — becomes real
friction only once there are enough facilities that "ask Steve" doesn't scale, which is exactly
`SELF_SERVICE_ROADMAP.md`'s territory, not this phase's.

### No dashboard-link recovery if Joe loses it
The private-link trust model (`ONBOARDING_RUNBOOK.md`) has no "I lost my link" path other than
contacting Steve directly. Acceptable today (that direct contact *is* the current support
model), becomes real friction only at higher operator counts.

### `setup-vapi-assistant.mjs` still requires a manual database write-back
Already identified as candidate automation #1 in `SELF_SERVICE_ROADMAP.md` — re-confirmed here
by actually running through the process, not a new finding.

## What this confirms

Most items found this phase were already anticipated in Phase 41's dependency audit or Phase 40's
tech-debt register. Two were not, and both came specifically from *actually doing it* rather than
tracing code: the dashboard giving Joe no way to see his own connection status, and the silent
webhook-secret failure mode. Both are exactly the kind of thing this phase existed to surface —
neither would have been found by reading the code, only by really being Joe.
