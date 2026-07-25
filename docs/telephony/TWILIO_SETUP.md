# Twilio Setup

Phase 38. Written so a future Steve (or this Claude, cold) can recreate the entire telephony setup from nothing. As of this phase, Twilio credentials already exist in `apps/web/.env.local` for local testing — this doc still walks through the full account/number process for that reason, and because production needs its own separate configuration regardless.

## What this phase does and doesn't do

`/api/twilio/voice` answers an inbound call with a fixed spoken greeting and logs the raw call event (`telephony_events` table — Call SID, from/to numbers, direction, status). It does **not** transcribe, analyze, route, record, or touch the existing `calls`/dashboard pipeline at all. That's explicitly Phase 39's job. If you're trying to understand why a real call didn't show up as an "opportunity" on the dashboard: it's not supposed to yet.

## 1. Twilio account

- Console: [twilio.com/console](https://www.twilio.com/console)
- Account ownership: founder's own Twilio account (not a shared/team account) — this is a one-person pilot operation, matching how the Supabase and Vercel accounts are already set up for this project
- From the console home page, note the **Account SID** and **Auth Token** (click "show" to reveal the token) — these are the two credentials the app needs

**Authentication method:** Twilio signs every webhook request with an `X-Twilio-Signature` header, computed via HMAC-SHA1 over the request URL + sorted POST params, using the Auth Token as the signing key. `/api/twilio/voice` verifies this using the official `twilio` npm package's `validateRequest()` — not a hand-rolled implementation, since getting a security-critical signature check subtly wrong is exactly the kind of mistake worth a real dependency to avoid.

## 2. Environment variables

Three new variables, added to `apps/web/.env.local` for this phase (already done) and needed in the Vercel project's environment variables for production (not yet done — see "Production deployment" below):

| Variable | Where it comes from | Required in production? |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio console home page | For completeness; not currently read by any code path |
| `TWILIO_AUTH_TOKEN` | Twilio console home page (click "show") | **Yes** — signature validation fails closed without it |
| `TWILIO_FROM_NUMBER` | The number purchased in step 3 | For completeness; not currently read by any code path |

`turbo.json`'s `build.env` array declares all three, matching the pattern already established for the Supabase variables (this project hit a real bug once — documented in `BUILD_LOG.md` — where a server-only env var got silently stripped by Turborepo's strict mode until it was added there; declaring these proactively avoids rediscovering that the hard way).

**Local development does not need real values to work.** `/api/twilio/voice` only enforces signature validation when `NODE_ENV === 'production'` — in dev, it logs `Twilio signature validation skipped` and proceeds. This is deliberate (see Task 3's own allowance for deferring validation locally), not an oversight.

## 3. Phone number

Purchase via Console → Phone Numbers → Buy a Number. Requirements: Voice-capable, US local number. (SMS capability doesn't matter yet — Non-Goals for this phase explicitly exclude SMS.)

Document here once purchased:
- **Number:** _(fill in — not secret, safe to write in this file)_
- **Purpose:** primary founder pilot number — every inbound call during founder testing hits this one number, not yet mapped to any specific facility (`telephony_events` has no `facility_id`; see "Why no facility_id" below)
- **Region:** _(fill in — whatever US region was selected)_

### Configure the webhook

In the Twilio console, open the number's configuration page → **Voice Configuration** → "A call comes in" → **Webhook**, and set the URL to:

```
https://storage-ai-sigma.vercel.app/api/twilio/voice
```

Method: **HTTP POST**. This must match, byte-for-byte, the URL the app validates the signature against — no trailing slash, `https://` not `http://`. If signature validation starts failing unexpectedly in production, this mismatch is the first thing to check (see Troubleshooting).

## 4. Local testing

Signature validation is skipped outside production, so local testing doesn't need a tunnel or real Twilio traffic to verify the endpoint works — a plain `curl` simulating Twilio's POST shape is enough:

```bash
curl -i -X POST http://localhost:3000/api/twilio/voice \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&From=%2B15125550110&To=%2B15125559999&Direction=inbound&CallStatus=ringing"
```

Expect a `200` with `Content-Type: text/xml` and the greeting TwiML back, and a new row in `telephony_events` (`select * from telephony_events order by received_at desc limit 1;` against the local DB). This exact sequence was used to verify the endpoint during Phase 38 development, including confirming duplicate `CallSid`s (Twilio sometimes retries webhook delivery) still return a valid response instead of erroring, and that a missing `CallSid` doesn't log garbage.

To test against a **real Twilio call** while developing locally, you'd need a tunnel (e.g. `ngrok http 3000`) and to temporarily point the number's webhook at the tunnel URL — not done as part of this phase; the production deployment is the real integration test.

## 5. Production deployment

Not yet done as of this phase. Once ready:

1. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` to the Vercel project's **Settings → Environment Variables** — the same place the Supabase production credentials already live (`turbo.json` only declares variable *names*, never values; see `docs/operations/BACKUP_RECOVERY.md`).
2. Deploy (push to `main` — Vercel auto-deploys).
3. Point the Twilio number's webhook at `https://storage-ai-sigma.vercel.app/api/twilio/voice` (step 3 above).
4. Call the number for real. Confirm: the greeting plays, and a row appears in `telephony_events` in the production database (Supabase Studio, production project).

## Why no `facility_id`

`telephony_events` is deliberately not linked to any facility. There's one pilot number today, used for founder testing — mapping specific numbers to specific facilities (so a real customer's calls land on their own dashboard) is a real design decision that hasn't been made yet, and doesn't need to be made to prove the plumbing works. That mapping is implied but not built by this phase; don't assume it exists.

## Troubleshooting

**Signature validation fails in production (`403 Forbidden` on every call).** Almost always a URL mismatch — the exact string Twilio signs against is the webhook URL configured in its console, not derived from anything else. Confirm the console's webhook URL exactly matches `https://storage-ai-sigma.vercel.app/api/twilio/voice` (no trailing slash, correct protocol). Also confirm `TWILIO_AUTH_TOKEN` in Vercel's environment variables matches the current token in the Twilio console — regenerating the token (Console → Account → API keys & tokens) invalidates the old one immediately.

**Call connects but nothing appears in `telephony_events`.** The endpoint always answers the call first and logs second — a caller hearing the greeting doesn't guarantee the log write succeeded (deliberate: a DB hiccup shouldn't mean a caller hears dead air). Check Vercel's Function Logs for `Failed to log telephony event` — the error object printed there (Postgres error code + message) is the same shape used everywhere else in this app's logging (see `docs/operations/BACKUP_RECOVERY.md` on where those logs live and how long they're retained).

**Local `curl` test returns `403`.** Shouldn't happen — signature validation only runs when `NODE_ENV === 'production'`, and `next dev` never sets that. If it does happen, something's setting `NODE_ENV=production` locally; check your shell environment before assuming the code is broken.

**A real call doesn't show up on the operator dashboard.** Expected — see "What this phase does and doesn't do" above. `telephony_events` is intentionally invisible to the dashboard; wiring calls into the AI-analysis pipeline is Phase 39.
