# Founder Provisioning Checklist

Written in Phase 41 (Task 2), then actually exercised end-to-end in Phase 42 ("Become Joe") — a
real dry run onboarding a real-looking fictional operator, Harbor Self Storage, against real
production infrastructure. Both phases' worked examples appear below; the process itself is
unchanged, since the dry run didn't surface any step that was wrong, only gaps in what the
*product* can do (see `FRICTION_LOG.md`), not what this checklist says to do.

This process is manual by design — see `docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md`. The goal
of this phase was making it *repeatable*, not automating it.

**Known gap, confirmed for real in Phase 42:** the intake conversation with a real operator will
surface office hours, a transfer number, and a greeting preference — none of which have anywhere
to go yet (`facilities` has no columns for them, confirmed by actually attempting the insert and
getting a Postgres error). This doesn't block onboarding; it just means those specifics live in
your own notes for now, not the database. See `FRICTION_LOG.md`.

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

**This step is not optional, and this is not a hypothetical warning** — Phase 42's real dry run
hit exactly the failure mode this step exists to catch. Joe's assistant can answer the phone,
hold a completely normal-sounding conversation, and hang up cleanly, while the *entire* result
silently vanishes — no error to the caller, no error to you. The specific cause: the webhook
secret configured on Joe's Vapi assistant doesn't match Vercel's deployed `VAPI_WEBHOOK_SECRET`
(easy to get wrong if `.env.production.local` was pulled from the wrong Vercel environment, or
copied by hand with a stray space). **If step 5's query returns nothing after a real call that
you know connected:**
1. Check Vercel's function logs for `/api/vapi/webhook` around that timestamp
   (`vercel logs <url> --since 5m`). `Rejected Vapi webhook: missing or invalid secret header`
   confirms this exact issue.
2. Re-pull the real value: `vercel env pull .env.production.local --environment=production --yes`
   (the `--environment=production` flag matters — omitting it can silently pull a different
   environment's value).
3. In the Vapi Dashboard, confirm you're editing the assistant actually bound to Joe's number
   (Phone Numbers → the number → check its assigned assistant ID matches) — not a
   similarly-named but different assistant, which can happen if an earlier setup attempt was
   interrupted partway through.
4. Update that assistant's `X-Vapi-Webhook-Secret` custom header to the freshly-pulled value, and
   test again.

## Rollback / cleanup if something goes wrong mid-setup

- **Wrong number imported into the wrong assistant:** delete the phone number from Vapi's
  dashboard and re-run `setup-vapi-assistant.mjs` — it's not idempotent, so this is expected and
  safe to do again.
- **Facility row created but never finished telephony:** harmless — it just behaves like any
  other manually-onboarded facility (`ONBOARDING_RUNBOOK.md`'s "Log a Call" flow still works)
  until steps 2–4 are completed.
- **Twilio number purchased but plans changed:** release it from the Twilio console — it's a
  real recurring cost sitting idle otherwise.

## Provisioning time report

Honesty about what's measured vs. estimated, rather than one falsely-precise total. Phase 41's
figures were produced against local Supabase, as a proxy. Phase 42 completed the entire process
for real, end to end, onboarding Harbor Self Storage against production — including a real
failure and recovery, which is itself honest data, not noise to discard.

| Step | Time | Basis |
|---|---|---|
| 1. Database (org + facility) | **~2 minutes** | **Measured, twice now.** Two `supabase db query --linked` calls against production, ~2 seconds each of actual execution; the 2-minute figure is realistic human time around that. |
| 2. Twilio number purchase | ~5–7 minutes | **Estimated still** — not separately timestamped, but Steve completed this for real for Harbor (`+14085836145`) without reporting difficulty, consistent with the estimate. |
| 3. Vapi assistant + number import | ~4–6 minutes | **Estimated for the mechanical steps** (running the script, reading its output) — consistent with what happened, when it worked. |
| 4. Verification (real test call) | ~3–5 minutes **when it works on the first try** | **Measured — and it didn't work on the first try.** The clean-path estimate holds for the call itself. What actually happened: **~45 minutes** of debugging a webhook-secret mismatch (three full retry cycles: call → check logs → adjust config → call again) before a call actually landed correctly. See `FRICTION_LOG.md`'s top entry — this is a real, now-documented failure mode, not this checklist being wrong. |
| **Total (clean path)** | **~15–20 minutes** | Holds, if the webhook secret is pulled correctly the first time. |
| **Total (this actual run)** | **~60 minutes** | Real, observed, including diagnosing and fixing the webhook-secret issue. The gap between these two numbers *is* the webhook-secret checklist section above — follow it and the clean-path number should hold next time. |

**What this means for automation priority (feeds `SELF_SERVICE_ROADMAP.md`):** the only step
that's genuinely fast and now measured twice is the database step, because it's the only one
already scripted end-to-end. Steps 2–3 are where a real onboarding will actually spend its time.
The right next update to this table is Steve's real stopwatch numbers for Harbor's Twilio/Vapi
setup, whenever he completes it.
