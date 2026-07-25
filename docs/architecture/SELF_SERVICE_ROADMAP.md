# Self-Service Onboarding Roadmap

Phase 41 Task 6. Identification only — nothing here is built, and nothing here should be built
until there's real evidence it's worth it (matching every prior phase's discipline about not
building ahead of demand). This exists so future automation decisions start from a real list
instead of memory.

## Why none of this is being built now

`FOUNDER_PROVISIONING_CHECKLIST.md`'s own timing report shows the current manual process takes
roughly 15–20 minutes per facility. At founder-pilot scale (a handful of facilities, onboarded
personally, each one a real relationship-building moment worth having anyway), automating any of
this buys back minutes at the cost of engineering days. That trade only flips once onboarding
volume or frequency actually demands it — which hasn't happened yet.

## Candidate automations, roughly in the order they'd start paying off

1. **Write `setup-vapi-assistant.mjs`'s output directly into `facilities.twilio_phone_number` /
   `vapi_assistant_id`**, instead of printing a SQL statement for the founder to run by hand.
   Smallest, safest first step — same script, same manual trigger, just skips one copy-paste.
   Worth doing whenever the SQL-update step starts feeling like a real point of friction or
   typo-risk, not before.

2. **Automatic Twilio number purchase** (via Twilio's own number-search + purchase API) as part
   of the provisioning script, instead of a manual console step. Real cost implication on every
   run (each number is a recurring charge) — should stay a deliberate, confirmed action even if
   automated, not a fire-and-forget step.

3. **Automatic Vapi assistant prompt configuration per facility** — today every assistant gets
   the same generic system prompt (`setup-vapi-assistant.mjs`'s `SYSTEM_PROMPT`). Real
   customization (facility-specific hours, unit types, policies) would need a real per-facility
   config source first — there isn't one yet, and inventing one before an actual operator asks
   for a specific customization would be building for a hypothetical, not a real need.

4. **Webhook assignment automation** — importing a purchased number into the right Vapi assistant
   automatically once both exist, rather than as an explicit script argument. Marginal win once
   items 1–2 already exist; not worth sequencing before them.

5. **Email verification for signups.** Right now `early_access_signups` has no verification step
   at all (see `ONBOARDING_RUNBOOK.md`) — this only matters once self-service signup exists,
   which is item 7 below, not before.

6. **Billing (Stripe or similar).** Explicitly out of scope for this phase and not sequenced here
   beyond acknowledging it exists as a future need — no pricing/billing logic should be designed
   until there's a real paying customer to design it around.

7. **A true self-service onboarding wizard** (signup → facility created → number provisioned →
   assistant configured → dashboard live, with no founder involvement) is the eventual endpoint
   of all of the above, and depends on all of them existing first. This is explicitly the last
   item, not a near-term goal — the founder-led process this phase documented is the intended
   experience for the current stage, not a stopgap being tolerated until this is built.

## What would actually trigger picking one of these up

Not a roadmap deadline — a real signal:
- Onboarding a facility starts happening often enough that 15–20 minutes per facility adds up to
  real founder time pressure (a volume problem, not a hypothetical one).
- A specific step in the checklist has caused a real mistake more than once (e.g., a typo'd phone
  number silently misrouting a call) — automating away a repeated real error is a better
  justification than automating for its own sake.
- An operator explicitly asks for self-service (not needing to wait on the founder) as a
  condition of moving forward.

Absent one of those, the manual process stays the process.
