# Founder Provisioning Checklist

Phase 41 Task 2. A real, runnable walkthrough for onboarding a second facility onto real
telephony (not just the manual "Log a Call" flow, which `ONBOARDING_RUNBOOK.md` already covers
and doesn't need any of this). Worked example throughout: **Joe's Self Storage**.

This process is manual by design — see `docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md`. The goal
of this phase was making it *repeatable*, not automating it.

## Before you start

You need, once per facility:
- A name, address, city, state (same as any manual onboarding)
- A phone number they want IntelliLease to answer (a new number you purchase, or Joe's own if
  he's willing to point it here — most real operators will want a separate number so their
  existing line is untouched, matching the site's own "nothing to install, no phone lines to
  switch" claim)
- About 20–30 minutes, uninterrupted (Twilio/Vapi dashboard steps involve some waiting on
  propagation)

`apps/web/.env.production.local` must already exist with production credentials — if this is
truly the first-ever facility, see `docs/telephony/TWILIO_SETUP.md` and `VAPI_SETUP.md` for how
that file gets built up; this checklist assumes it already has `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `VAPI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and (from
the first facility's setup) `VAPI_WEBHOOK_SECRET`.

## 1. Database — create the organization and facility

```bash
cd apps/web
node scripts/onboard-facility.mjs \
  --name "Joe's Self Storage" \
  --address "123 Main St" --city Austin --state TX \
  --timezone "America/Chicago" \
  --phone "+15125550100" --contact-name "Joe Smith" --contact-email "joe@joesstorage.com"
```

- `--phone` here is Joe's own real business contact number (for your records) — **not** the
  Twilio number you're about to set up. Don't confuse the two; they're different columns
  (`facilities.phone` vs. `facilities.twilio_phone_number`).
- The script prints the new facility's `id` and a dashboard link
  (`https://storage-ai-sigma.vercel.app/dashboard?facility=<id>`). Save the ID — you need it in
  step 3.

**Verify:** open the printed dashboard link. It should show "Joe's Self Storage" with zero
opportunities and a working "Log a Call" form — that alone is already a complete, working pilot
even before telephony (per `ONBOARDING_RUNBOOK.md`). Everything below adds real phone calls on
top of that.

## 2. Telephony — purchase and configure the Twilio number

1. Twilio Console → Phone Numbers → Buy a Number. Requirements: Voice-capable, US local number
   (matching Joe's area code is good practice, not required).
2. Note the number in E.164 format (e.g. `+15125559876`).
3. Leave its voice webhook unconfigured for now — Vapi will claim it in the next step, not
   `/api/twilio/voice` (that endpoint is dev/fallback-only once a number is in Vapi; see the
   dependency audit).

**Verify:** the number appears in the Twilio console with an active status.

## 3. Vapi — create the assistant and import the number

```bash
node scripts/setup-vapi-assistant.mjs --facility-name "Joe's Self Storage" --number "+15125559876"
```

This creates a new Vapi assistant named for the facility and imports the number you just bought,
pointed at the same shared webhook (`/api/vapi/webhook`) every facility uses. Follow its printed
"Next steps" exactly — it tells you whether `VAPI_WEBHOOK_SECRET` needs to go into Vercel (only
true for the very first facility ever set up) or whether it reused the existing one (true for
every facility after that).

4. Record the two values it prints on **Joe's facility row**:

```sql
update facilities
set twilio_phone_number = '+15125559876',
    vapi_assistant_id = '<assistant id the script printed>'
where id = '<facility id from step 1>';
```

Run this via Supabase Studio's SQL editor against the **production** project, or
`supabase db query --linked "..."` from the CLI. This is the one step that actually makes
inbound-call routing find Joe's facility — see `getFacilityByPhoneNumber()` in
`lib/storage/facility.ts`.

**Verify:** `select name, twilio_phone_number, vapi_assistant_id from facilities where id = '<id>';`
shows the values you just set.

## 4. Verification — make a real test call

1. Call `+15125559876` yourself.
2. Confirm Vapi answers (not a generic "under founder testing" greeting, not silence).
3. Say something concrete and real, e.g. "I need a 10x10 unit next week."
4. Hang up.
5. Within a few seconds, check:
   ```sql
   select facility_id, caller_phone, transcript
   from conversation_transcripts
   order by received_at desc limit 1;
   ```
   `facility_id` must be **Joe's** facility ID, not any other facility's — this is the entire
   point of this phase. If it's wrong or the row doesn't exist, stop and check step 3's `update`
   ran against the right facility and the right number (typos in E.164 formatting — a missing
   `+1` — are the most likely cause).
6. Open Joe's dashboard link from step 1 and confirm the call appears as a real opportunity with
   a sensible unit size / priority / recommended action — the same analysis every other call
   gets, per `lib/storage/intelligence.ts`.

Only once all of this is confirmed is Joe's facility actually done — a created database row
alone is not "provisioned."

## Rollback / cleanup if something goes wrong mid-setup

- **Wrong number imported into the wrong assistant:** delete the phone number from Vapi's
  dashboard and re-run `setup-vapi-assistant.mjs` — it's not idempotent, so this is expected and
  safe to do again.
- **Facility row created but never finished telephony:** harmless — it just behaves like any
  other manually-onboarded facility (`ONBOARDING_RUNBOOK.md`'s "Log a Call" flow still works)
  until steps 2–4 are completed.
- **Twilio number purchased but plans changed:** release it from the Twilio console — it's a
  real recurring cost sitting idle otherwise.

## Provisioning time report (Phase 41 Task 5)

Honesty about what's measured vs. estimated, rather than one falsely-precise total:

| Step | Time | Basis |
|---|---|---|
| 1. Database (org + facility) | **~2 minutes** | **Measured.** Ran the actual insert operations against local Supabase (schema-identical to production) and timed them for real: sub-second at the database layer. The realistic 2-minute figure is the human time around that — typing facility details, reading the printed dashboard link, opening it to confirm — not raw query latency, which is negligible. |
| 2. Twilio number purchase | ~5–7 minutes | **Estimated**, not re-measured this phase — deliberately did not purchase a second real number, since that's a real recurring cost and a decision for Steve, not something to spend speculatively just to produce a timing number. Estimate is based on the documented steps in `TWILIO_SETUP.md` (console navigation, area-code search, purchase confirmation) for someone who's done it once before. |
| 3. Vapi assistant + number import | ~4–6 minutes | **Estimated.** `setup-vapi-assistant.mjs` itself runs in seconds (two API calls); the time is mostly the human step of reading its printed output and running the follow-up SQL update from step 3 above. Not re-measured for the same reason as Twilio — running it for real requires a real Twilio number to import. |
| 4. Verification (real test call) | ~3–5 minutes | **Estimated**, based on the Phase 39 founder verification calls (dialing, talking, waiting a few seconds, then checking the DB and dashboard) — those calls happened for real but for the *first* facility, not a timed second one. |
| **Total** | **~15–20 minutes** | Mixed measured/estimated — see above. |

**What this means for automation priority (feeds Task 6):** the only step that's genuinely fast
and low-friction today is the database step, because it's the only one already scripted
end-to-end. Steps 2–3 are where a real second onboarding will actually spend its time, and where
automation would pay off first if this ever needs to happen often — see
`SELF_SERVICE_ROADMAP.md`. The right next data point isn't a better estimate; it's actually
timing a real second facility with a stopwatch the next time one gets onboarded for real.
