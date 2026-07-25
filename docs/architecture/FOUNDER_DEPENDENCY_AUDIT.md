# Founder Dependency Audit

Phase 41 Task 1 (+ Task 4's routing trace, folded in here rather than a separate file — it's not
a separate required deliverable and the two questions overlap almost entirely). Every claim below
was checked directly against the current code and database, not assumed from memory.

## Method

Grepped the entire `apps/web/src` tree for the two known hardcoded identifiers
(`PILOT_FACILITY_ID`, `DEMO_FACILITY_ID`) and for any other literal facility/organization
name or UUID in application logic, then read every matching file in full to judge whether the
reference is a real multi-tenancy blocker or a legitimate single-purpose default.

## Findings

### Must remove — fixed this phase

**`lib/vapi/transcripts.ts` hardcoded `PILOT_FACILITY_ID` for every Vapi call.** This was the
one real blocker: every inbound call through the Vapi pipeline, regardless of which phone number
was actually dialed, was written to the same hardcoded facility ID. A second facility's real calls
would have been silently attributed to the first facility's dashboard.

Fixed by:
- Adding `facilities.twilio_phone_number` (unique) and `facilities.vapi_assistant_id` columns
  (migration `20260725211357_add_facility_telephony_mapping.sql`).
- Adding `getFacilityByPhoneNumber()` (`lib/storage/facility.ts`), which resolves a facility from
  the number Vapi reports as called (`VapiEndOfCallReport.calledNumber`, itself already parsed
  from `message.phoneNumber.number` since Phase 39 — it just wasn't used for anything).
- `processVapiEndOfCallReport()` now calls this lookup instead of reading the constant, and
  throws a clear, specific error if the called number isn't mapped to any facility — this fails
  closed (no call is written) rather than silently misattributing it to the wrong tenant.
- The `PILOT_FACILITY_ID` constant itself is deleted; nothing in application code references a
  specific facility by name or ID anymore outside of `DEMO_FACILITY_ID` (see below).

Verified against a real webhook POST to the local dev server (not just read the code): a call to
a mapped test number correctly landed against that facility; a call to an unmapped number
correctly errored and wrote nothing to `calls` or `conversation_transcripts` — confirmed by
querying both tables directly afterward. See the routing trace below for the full path.

### Acceptable for founder pilot — not a blocker, left as-is

**`DEMO_FACILITY_ID` (`lib/storage/constants.ts`), used in `dashboard/page.tsx` and
`facility.ts`.** This is the public marketing-site demo ("Lonestar Self Storage") shown to
visitors who haven't been given a real `?facility=` link — a fixed, intentional single-purpose
default, not a stand-in for "the one real customer." Multiple real facilities coexist with this
without any conflict; it's not on the multi-tenant call-routing path at all.

**`app/dashboard/page.tsx`'s `?facility=<id>` query-param routing, with no authentication.**
Each real facility gets a private, unguessable-UUID dashboard link instead of a login — this is
the documented, deliberate trust model for this stage (`ONBOARDING_RUNBOOK.md`), already flagged
in `TECH_DEBT_REGISTER.md` as future work gated on real auth needs. Not something this phase
should touch; provisioning a facility doesn't require solving authentication.

**`VAPI_WEBHOOK_SECRET` is a single global environment variable, not per-facility.** Its only
job is proving a webhook request actually came from this project's own Vapi configuration — it
doesn't need to identify *which* facility, since that's the called-number lookup's job. One
shared secret across every assistant pointed at the same webhook URL is correct, not a
shortcut.

**`onboard-facility.mjs` requires manual invocation with `.env.production.local` credentials.**
This is the intended manual, founder-run process this phase is about documenting, not
automating — see `FOUNDER_PROVISIONING_CHECKLIST.md`.

### Future automation — correctly out of scope for this phase

**`setup-vapi-assistant.mjs` is a one-time, non-idempotent script** that creates exactly one
Vapi assistant and imports exactly one Twilio number, printing the resulting `VAPI_ASSISTANT_ID`
and `VAPI_WEBHOOK_SECRET` for manual entry into Vercel. Running it again for a second facility
works today (it takes no facility-specific input, it's just not wired to write the result into
`facilities.vapi_assistant_id`/`twilio_phone_number` automatically) — that wiring is a
reasonable next automation step, not a blocker. See `SELF_SERVICE_ROADMAP.md`.

**No automatic Twilio number purchase.** Buying the number is a manual Twilio console/API step
per facility; each one is a real recurring cost, so this is deliberately still a human decision,
not something to automate speculatively.

## Routing trace (Task 4)

The full lifecycle of a real inbound call, and exactly where tenant resolution happens today:

```
Incoming call to a Twilio number
        │
        ▼
Twilio                                    (owns the number, routes based on
        │                                  its own webhook configuration)
        ▼
Vapi (if the number has been imported into a Vapi assistant — see
      setup-vapi-assistant.mjs)
        │  Vapi answers, converses, and itself decides when the call ends
        ▼
POST /api/vapi/webhook                    (app/api/vapi/webhook/route.ts)
        │  verifies X-Vapi-Webhook-Secret, parses the end-of-call-report
        ▼
parseVapiEndOfCallReport()                (lib/vapi/webhook.ts — unchanged
        │                                  this phase, already extracted
        │                                  calledNumber from the payload)
        ▼
processVapiEndOfCallReport()              (lib/vapi/transcripts.ts — CHANGED
        │                                  this phase)
        │
        ├─▶ getFacilityByPhoneNumber(report.calledNumber)   ◀── tenant
        │        queries facilities.twilio_phone_number          resolution
        │        happens HERE, and only here, for real calls
        │
        ├─▶ insert into conversation_transcripts (facility_id = facility.id)
        │
        ▼
logCall()                                 (lib/storage/calls.ts — already
        │                                  facility-agnostic, takes an
        │                                  explicit facilityId)
        ▼
analyzeTranscript()                       (lib/storage/intelligence.ts —
        │                                  already facility-agnostic, pure
        │                                  function over a transcript string)
        ▼
Dashboard (/dashboard?facility=<id>)      (already facility-agnostic —
                                            reads whichever facility ID is
                                            in the URL, no hardcoding)
```

**Before this phase**, tenant resolution didn't happen at all — every call skipped straight to a
hardcoded ID at the `processVapiEndOfCallReport()` step. **After this phase**, resolution happens
exactly once, at the earliest possible point (the called number), and every downstream function
(`logCall`, `analyzeTranscript`, the dashboard) was already generic and needed no changes — they
only ever operated on whatever `facilityId` they were handed.

The manual "Log a Call" path (`app/api/events/call/route.ts`, `LogCallForm`) was never part of
this problem — it already takes an explicit `facilityId` from the form/request body, since it was
built (Phase 26) for exactly the multi-facility case this phase is now extending to telephony.

## What this confirms

The phase brief's premise holds: the architecture was already sound (facilities, organizations,
calls, and the analysis pipeline were never facility-specific in their design), and the actual
gap was narrow — one function, one hardcoded constant, one missing database column. No broader
refactor was needed.
