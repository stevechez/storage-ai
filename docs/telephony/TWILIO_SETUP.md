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

- **Number:** `+18314329642`
- **Purpose:** primary founder pilot number — every inbound call during founder testing hits this one number, not yet mapped to any specific facility (`telephony_events` has no `facility_id`; see "Why no facility_id" below)
- **Note:** this number pre-existed on the Twilio account — it was previously configured (voice webhook pointed at a since-inactive project, `lunch-break-ai`) but confirmed unused before being repurposed for StorageAI in this phase. Not a number bought fresh for this project.

### Webhook configuration

Set via the Twilio REST API (`incomingPhoneNumbers(sid).update({ voiceUrl, voiceMethod })`), not the console UI — same effect, done from a script using the credentials already in `.env.local`. Current configuration, confirmed by reading it back after the update:

```
Voice URL:    https://storage-ai-sigma.vercel.app/api/twilio/voice
Voice Method: POST
```

If this ever needs to change (new number, new domain), update it either via the console (number's configuration page → **Voice Configuration** → "A call comes in" → **Webhook**) or the same REST API call. Whichever way, the URL must match, byte-for-byte, what the app validates the signature against — no trailing slash, `https://` not `http://`. If signature validation starts failing unexpectedly, this mismatch is the first thing to check (see Troubleshooting).

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

Status: **done and verified end-to-end.**

- [x] Code deployed (`/api/twilio/voice` live at `https://storage-ai-sigma.vercel.app/api/twilio/voice`)
- [x] Twilio webhook URL configured (see above)
- [x] Vercel environment variables set (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — Production + Preview)
- [x] Production database has `telephony_events` (see "Production schema drift" below — this was the actual blocker, not the webhook config)
- [x] Verified with a genuinely signed test request (`twilio.getExpectedTwilioSignature()` against the real Auth Token, not a guess): `200`, correct TwiML, and the row landed in `telephony_events` — confirmed by querying it directly, not inferred from the response

## Production schema drift (found and fixed while verifying this phase)

While debugging why a correctly-signed webhook request still failed, discovered that **production's schema had been frozen since roughly Phase 27/28** — every migration from `20260724164308_add_facility_contact_fields.sql` onward had only ever been applied to the local Docker database, never to the real hosted Supabase project. This wasn't a Twilio-specific problem; it was a systemic gap in how migrations get from `supabase/migrations/` to production (there's no CI/CD pipeline that does this automatically — see `docs/operations/BACKUP_RECOVERY.md` — every migration has always required someone to run it against production by hand, and that had stopped happening several phases ago without anyone noticing, because nothing had exercised production's schema directly until this phase).

**The most consequential part of this, unrelated to Twilio:** `facilities.phone`, `.contact_name`, `.contact_email` didn't exist in production — meaning `scripts/onboard-facility.mjs` would have failed on a real signup, silently invalidating every "founder onboarding is ready" claim made since Phase 28. Nobody had actually run the script against production to find this out.

Confirmed via direct schema queries (`information_schema.tables`, `information_schema.columns`, `pg_indexes`, `pg_constraint` — screenshotted from the cloud SQL editor, not assumed) that production was missing all of:
- `facilities.phone` / `.contact_name` / `.contact_email` (Phase 28)
- `calls_facility_id_created_at_idx` (Phase 34)
- `early_access_signups_email_key` unique constraint (Phase 37)
- The `leads`/`units`/`conversations` drop (Phase 37) — all three were still present in production
- `telephony_events` (Phase 38, this phase)

Fixed by running all five migrations' SQL directly against production, in dependency order, after confirming `leads`/`units`/`conversations` were empty there too (so dropping them was safe). Re-verified afterward: the same schema queries now show everything present, and a real signed Twilio webhook request now genuinely writes to `telephony_events` in production — confirmed by querying the table directly for the specific test `CallSid`, not by response status alone.

At the time the drift was found, this Claude believed it had no way to run SQL against production directly — true via the Supabase MCP connection (tied to an unrelated account) and the nonexistent `.env.production.local`, but turned out **not** true of the `supabase` CLI, which was already authenticated and linked to the real project (`hscgmcfbresuqwiuzdfw`) the whole time. Every fix above still went through Steve running SQL in the cloud SQL editor, since that was already underway before this was discovered — but it's worth naming plainly: the assumption "I have no access" should have been verified, not assumed, the same discipline this whole project applies to everything else.

Once that was found, closed the actual root cause: `.github/workflows/deploy-migrations.yml` runs `supabase db push --linked` against production automatically on every push to `main` touching `supabase/migrations/**`. Supabase's own Dashboard GitHub integration needs a browser OAuth flow this Claude can't complete, so this is the CLI/CI equivalent instead — same outcome, fully code-reviewable. See `docs/operations/TECH_DEBT_REGISTER.md`'s "No automated migration deployment" entry for what's still needed to activate it (two GitHub repo secrets, Steve-only).

## Why no `facility_id`

`telephony_events` is deliberately not linked to any facility. There's one pilot number today, used for founder testing — mapping specific numbers to specific facilities (so a real customer's calls land on their own dashboard) is a real design decision that hasn't been made yet, and doesn't need to be made to prove the plumbing works. That mapping is implied but not built by this phase; don't assume it exists.

## Troubleshooting

**Signature validation fails in production (`403 Forbidden` on every call).** Two different root causes look identical from a caller's perspective — tell them apart with a properly-signed test request rather than guessing:

```js
import twilio from 'twilio';
const signature = twilio.getExpectedTwilioSignature(authToken, url, params); // same authToken as .env.local
// POST to the production URL with X-Twilio-Signature: signature, then compare:
```
- If a request signed with the **real** Auth Token still gets `403`: the deployed app doesn't have a matching `TWILIO_AUTH_TOKEN` — check Vercel's environment variables are actually set (this exact scenario happened during Phase 38's production rollout: webhook configured correctly, code deployed correctly, but Vercel env vars weren't set yet, so every signature check failed closed).
- If it succeeds: the problem is upstream — the URL configured in Twilio's console doesn't exactly match the deployed URL (trailing slash, protocol, wrong path), so Twilio itself is signing against a different string than the app expects.

**Call connects but nothing appears in `telephony_events`.** The endpoint always answers the call first and logs second — a caller hearing the greeting doesn't guarantee the log write succeeded (deliberate: a DB hiccup shouldn't mean a caller hears dead air). Check Vercel's Function Logs for `Failed to log telephony event` — the error object printed there (Postgres error code + message) is the same shape used everywhere else in this app's logging (see `docs/operations/BACKUP_RECOVERY.md` on where those logs live and how long they're retained). If the error is `PGRST205: Could not find the table ... in the schema cache`, that's not actually a cache problem most of the time — check whether the table genuinely exists in **production** (not local) first; this happened during Phase 38's own rollout and the real cause was that the table had never been created in production at all (see "Production schema drift" above), not a stale cache.

**Local `curl` test returns `403`.** Shouldn't happen — signature validation only runs when `NODE_ENV === 'production'`, and `next dev` never sets that. If it does happen, something's setting `NODE_ENV=production` locally; check your shell environment before assuming the code is broken.

**A real call doesn't show up on the operator dashboard.** Expected — see "What this phase does and doesn't do" above. `telephony_events` is intentionally invisible to the dashboard; wiring calls into the AI-analysis pipeline is Phase 39.
