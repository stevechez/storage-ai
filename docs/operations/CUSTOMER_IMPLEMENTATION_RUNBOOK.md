# IntelliLease Customer Implementation Runbook

The canonical document for onboarding a new facility. Written so this stops being something only
Steve and Claude know how to do, and becomes something the *project* knows how to do — an
engineer, contractor, or future developer should be able to follow this without a three-hour
explanation.

Everything in this document was verified directly against the real system (production database
schema, the real onboarding script, and two real onboardings — the Founder Pilot Facility and
Harbor Self Storage) rather than described from memory. Where an earlier draft of this document
described a manual dashboard workflow that doesn't match what the script actually does, this
version was corrected to match reality before being written down as canonical.

## Purpose

Provision a new self-storage facility onto IntelliLease: a dedicated phone number, an AI leasing
assistant, call processing, transcript analysis, and dashboard visibility — **without any
application code changes.** That claim isn't aspirational; it was proven for real in Phase 42.

## Architecture overview

A customer facility consists of:

```
Facility (database row)
   │
   ├── Twilio Phone Number      (real recurring cost, purchased in the Twilio console)
   ├── Vapi Assistant           (created via API, one per facility)
   ├── facilities.twilio_phone_number   ← the mapping that makes routing work
   ├── facilities.vapi_assistant_id     ← reference metadata, not used for routing
   └── Dashboard access          (unauthenticated, unguessable-UUID link)
```

Production call flow:

```
Caller
  │
  ▼
Twilio Phone Number
  │
  ▼
Vapi Assistant  (answers, converses, ends the call)
  │
  ▼
Vapi "end-of-call-report" webhook  →  POST /api/vapi/webhook
  │
  ▼
parseVapiEndOfCallReport()        (lib/vapi/webhook.ts)
  │
  ▼
getFacilityByPhoneNumber(calledNumber)   ← tenant resolution happens HERE,
  │                                          and only here (lib/storage/facility.ts)
  ▼
processVapiEndOfCallReport()      (lib/vapi/transcripts.ts)
  │
  ├──▶ insert into conversation_transcripts (facility_id = resolved facility)
  │
  ▼
logCall()                          (lib/storage/calls.ts — facility-agnostic)
  │
  ▼
analyzeTranscript()                (lib/storage/intelligence.ts — facility-agnostic)
  │
  ▼
Dashboard (/dashboard?facility=<id>)
```

Full architectural detail and the "why" behind this design lives in
`docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md`. This document is the *how*.

## Architecture decision: one assistant per facility (current)

**Chosen deliberately, not by default.** Two real options exist:

- **A — One Vapi Assistant object per facility (current, what this runbook documents).** Already
  built, already proven across two real facilities. No new real-time dependency in the
  call-answering path.
- **B — A single shared assistant with per-call dynamic configuration**, via Vapi's
  `assistant-request` webhook. The architecturally better long-term fit for many facilities (one
  prompt source of truth, no per-facility drift, naturally supports live per-facility
  greeting/hours/transfer). Deliberately **not built** — it introduces a new real-time dependency
  with a hard 7.5-second response budget and no operational precedent yet. Fully specified with
  real trigger conditions in `docs/architecture/SELF_SERVICE_ROADMAP.md`, item 3.

Do not build B without revisiting that document's trigger conditions first.

## Prerequisites

**Accounts:** Twilio console access, Vapi dashboard access, Vercel production access, Supabase
production access (all already exist; this section is a checklist, not a setup guide for them).

**Local file:** `apps/web/.env.production.local` — gitignored, never committed, holds the
platform-wide secrets below. If it doesn't already exist on your machine:

```
NEXT_PUBLIC_SUPABASE_URL=<production Supabase URL>
SUPABASE_SERVICE_ROLE_KEY=<production service role key>
VAPI_API_KEY=<Vapi Dashboard → API Keys>
TWILIO_ACCOUNT_SID=<Twilio console home page>
TWILIO_AUTH_TOKEN=<Twilio console home page, click "show">
TWILIO_FROM_NUMBER=<only needed if not passing --number explicitly>
VAPI_WEBHOOK_SECRET=<see "Critical: getting VAPI_WEBHOOK_SECRET right" below>
```

**Never store customer-specific values here.** These are global platform credentials, shared
across every facility. Customer-specific values (`twilio_phone_number`, `vapi_assistant_id`) live
in the `facilities` table, not in environment variables — that separation is the entire point of
Phase 41's architecture change.

### Critical: getting `VAPI_WEBHOOK_SECRET` right

This single value caused a real, three-retry-cycle production incident during Harbor Self
Storage's onboarding (Phase 42) — not a hypothetical warning. **Do not generate a new value or
guess at it.** Pull the real one directly from Vercel:

```
cd apps/web
vercel env pull .env.production.local --environment=production --yes
```

The `--environment=production` flag is not optional — omitting it can silently pull a different
environment's value, which will look like a normal secret string and fail in exactly the way
described below.

## Phase 1 — Create the facility record

```bash
cd apps/web
node scripts/onboard-facility.mjs \
  --name "Harbor Self Storage" \
  --address "4820 Harbor Blvd" --city "San Jose" --state CA \
  --timezone "America/Los_Angeles" \
  --phone "+14085550134" --contact-name "Joe Martinez" --contact-email "joe@harborselfstorage.com"
```

`--phone` is the facility's own real business contact number, for your records — **not** the
Twilio number IntelliLease will answer with. They're different columns
(`facilities.phone` vs. `facilities.twilio_phone_number`), and confusing them is a real mistake.

`facilities` required/relevant fields:

```
facilities
├── id                    (generated)
├── organization_id       (generated by the script — a new organization per facility)
├── name                  (required)
├── twilio_phone_number   (set in Phase 6, below)
└── vapi_assistant_id     (set in Phase 6, below)
```

There is currently no `status` column — every facility row is implicitly active. If a
pause/inactive state is ever needed, that's new schema work, not a value to set today.

**Known gap, confirmed for real (Phase 42):** office hours, a transfer number, and a greeting
preference will come up in almost any real intake conversation, and none of them have anywhere to
be stored yet — confirmed by attempting the insert and getting a genuine Postgres error, not
assumed. Keep those specifics in your own notes for now. See `docs/operations/FRICTION_LOG.md`.

**Verify:** the script prints the facility's `id` and a dashboard link. Open it — it should show
the facility name with zero opportunities and a working "Log a Call" form. That alone is already
a complete, working pilot before telephony exists at all (`docs/operations/ONBOARDING_RUNBOOK.md`)
— everything below adds real phone calls on top of it.

## Phase 2 — Purchase the Twilio number

Twilio Console → Phone Numbers → Buy a Number. Voice capability required; SMS/MMS optional and
currently unused. Note the number in E.164 format (e.g. `+14085836145`). **This is a real
recurring cost** — don't purchase speculatively.

Leave its voice webhook unconfigured — Vapi claims it in the next phase. (`/api/twilio/voice`
still exists and still works, but only as a fallback for a number that's been removed from Vapi;
it does no facility resolution and is not part of the real production path once a number is in
Vapi.)

## Phase 3 — Create the Vapi assistant and import the number

This one script call does everything the earlier draft of this runbook described as four
separate manual dashboard phases (create assistant, configure webhook URL, configure webhook
authentication, assign phone number) — verified directly against `setup-vapi-assistant.mjs`:

```bash
cd apps/web
node scripts/setup-vapi-assistant.mjs --facility-name "Harbor Self Storage" --number "+14085836145"
```

What this actually does, in order:
1. Creates a Vapi assistant named for the facility, using the shared production system prompt
   (do not create custom prompts per facility unless a real, specific need justifies it — see the
   architecture decision above for why prompt customization isn't built yet).
2. Sets that assistant's Server URL to `https://storage-ai-sigma.vercel.app/api/vapi/webhook` and
   its `X-Vapi-Webhook-Secret` header — both in the same API call that creates the assistant, not
   a separate dashboard step.
3. Imports the Twilio number into Vapi, bound to that assistant.
4. Prints the new assistant's ID and tells you whether `VAPI_WEBHOOK_SECRET` needs to change in
   Vercel (only true for the very first facility ever set up) or was reused (true for every
   facility after that — this script will not generate a fresh secret if one already exists in
   `.env.production.local`, specifically to prevent the exact incident described below).

Model and voice are not manually selected per facility — the script uses `gpt-4o-mini` and leaves
voice unset so Vapi's own account default applies, a deliberate Phase 39 decision, not an
oversight.

There is no separate "publish" step. Assistants created via Vapi's API are live immediately —
confirmed across three real onboardings (the original pilot, and now Harbor) where no one ever
performed a publish action and every one worked.

## Phase 4 — Record the mapping in the database

```sql
update facilities
set twilio_phone_number = '+14085836145',
    vapi_assistant_id = '<assistant id the script printed>'
where id = '<facility id from Phase 1>';
```

Run via Supabase Studio's SQL editor against **production**, or
`supabase db query --linked "..."`. This is the one step that actually makes inbound-call routing
find this facility — see `getFacilityByPhoneNumber()` in `lib/storage/facility.ts`. Everything
before this point can be perfectly correct and calls still won't route anywhere until this runs.

**Verify:** `select name, twilio_phone_number, vapi_assistant_id from facilities where id = '<id>';`
shows the values you just set.

## Phase 5 — Verification (mandatory, not optional)

**This phase is not optional, and it is not a formality.** A real onboarding (Harbor Self
Storage, Phase 42) hit exactly the failure this phase exists to catch, three times in a row,
before it was fixed. Skipping this phase means finding out a facility was never actually live
only when a real customer complains that no one called them back.

1. Call the number yourself.
2. Confirm Vapi answers — not silence, not the old static "under founder testing" greeting.
3. Say something concrete and specific: *"I need a 10x10 unit next month."*
4. Hang up.
5. Within a few seconds:
   ```sql
   select facility_id, caller_phone, transcript
   from conversation_transcripts
   order by received_at desc limit 1;
   ```
   `facility_id` **must** be this facility's ID, not any other's.
6. Open the facility's dashboard link and confirm the call appears as a real opportunity with a
   sensible unit size / priority / recommended action.

### If step 5 returns nothing, or the wrong facility

**The call can sound completely normal to the caller while every result silently vanishes.** This
is not a hypothetical — it's exactly what happened onboarding Harbor. Vapi answered, held a
normal conversation, and ended cleanly, while the webhook that reports the result back was being
rejected the entire time, with zero visible error to the caller or to the person onboarding the
facility.

1. Check Vercel's function logs for the exact window: `vercel logs <url> --since 5m`. The
   signature is unambiguous: `Rejected Vapi webhook: missing or invalid secret header`.
2. If you see that: the webhook secret configured on this facility's assistant doesn't match
   Vercel's deployed `VAPI_WEBHOOK_SECRET`. Re-pull the real value
   (`vercel env pull .env.production.local --environment=production --yes`), confirm in the Vapi
   Dashboard that you're editing the assistant actually bound to *this* number (Phone Numbers →
   the number → check the assigned assistant ID — don't trust the name; an earlier interrupted
   setup attempt can leave a second, similarly-named assistant behind), update its
   `X-Vapi-Webhook-Secret` header, and test again.
3. If `facility_id` is wrong rather than missing: check Phase 4's `update` ran against the
   correct facility and number — a typo'd E.164 number (commonly a missing `+1`) is the most
   likely cause, and `facilities.twilio_phone_number` has a unique constraint, so a genuine
   duplicate would have errored at insert time rather than silently routed wrong.

## Verification checklist

**Infrastructure**
- [ ] Twilio number purchased
- [ ] Vapi assistant created (via `setup-vapi-assistant.mjs`, not manually)
- [ ] Phone number imported into Vapi, bound to the correct assistant ID (not just correct name)
- [ ] `facilities.twilio_phone_number` and `facilities.vapi_assistant_id` both set

**Live call**
- [ ] Assistant answers and holds a normal conversation
- [ ] Assistant never invents pricing, availability, or a specific move-in date (system prompt
      constraint — see `SYSTEM_PROMPT` in `setup-vapi-assistant.mjs`)
- [ ] `conversation_transcripts` has a new row with the correct `facility_id`
- [ ] `calls` has a new row with the correct `facility_id`, and a sensible extracted intent / unit
      size / timeline / priority / recommended action
- [ ] The facility's dashboard shows the call

## Definition of done

A facility is onboarded when all of the following are true, verified directly — not assumed:

- [ ] Phone number is live and answers
- [ ] A real test call was placed and the assistant handled it correctly
- [ ] The webhook succeeded (`200`, not `403` — checked in logs, not inferred)
- [ ] The transcript is stored against the correct facility
- [ ] AI analysis was generated correctly
- [ ] The dashboard reflects the call

## Related documents

- `docs/operations/ONBOARDING_RUNBOOK.md` — the pre-telephony signup-to-first-value flow (early
  access signups, manual "Log a Call"); read this first if telephony isn't involved yet.
- `docs/operations/FOUNDER_PROVISIONING_CHECKLIST.md` — the original Phase 41/42 working document
  this runbook consolidates; kept for its detailed timing report and full Phase 42 incident
  narrative.
- `docs/operations/FRICTION_LOG.md` — every real gap found by actually onboarding a second
  facility, ranked by whether it would block go-live.
- `docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md` — why this architecture works the way it does.
- `docs/architecture/SELF_SERVICE_ROADMAP.md` — what's deliberately not automated yet, and why.
- `docs/operations/TECH_DEBT_REGISTER.md` — including the silent-webhook-failure entry.
