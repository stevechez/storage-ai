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

3. **Move from one Vapi Assistant object per facility to a single shared assistant with
   per-call dynamic configuration**, via Vapi's `assistant-request` server webhook (confirmed
   via Vapi's real docs, not memory: leave a phone number's `assistantId` blank and Vapi POSTs
   your server for either an existing assistant ID or a full inline config, with a hard 7.5-second
   response budget). This is the actual mechanism that would let a facility's greeting, prompt,
   and (eventually) transfer number be read live from `facilities` on every call — solving two
   Friction Log items (generic greeting, no live transfer) — plus removing the real drift problem
   the one-assistant-per-facility model has: updating the prompt template today doesn't touch any
   *existing* facility's already-created assistant, only future ones.
   Real cost of doing this now: a brand-new real-time dependency in the call-answering critical
   path that doesn't exist today — if that webhook is ever slow or down, a call gets no assistant
   at all, a new failure mode with no precedent yet. Deliberately not built during Phase 42's
   Harbor onboarding for exactly that reason — evaluated (see `docs/BUILD_LOG.md`'s Phase 42
   entry) and consciously deferred, not overlooked. Worth doing once either: assistant-config
   drift across facilities becomes a real observed problem, or a real operator specifically asks
   for live-updatable greeting/hours/transfer behavior.

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
