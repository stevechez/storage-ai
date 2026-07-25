# Vapi Setup

Phase 39. Written the same way `TWILIO_SETUP.md` was — so a future Steve (or this Claude, cold) can recreate this from nothing, and so what's actually done vs. still pending is never ambiguous.

## What this phase does and doesn't do

A real phone call to the pilot number is now answered by a Vapi AI assistant instead of Phase 38's static "under founder testing" greeting. When the call ends, Vapi sends a webhook with the full transcript; StorageAI stores the raw conversation, then feeds the transcript through the *exact same* `logCall()` → `analyzeTranscript()` → dashboard pipeline that manual call logging has always used. A Vapi-sourced call and a manually-typed call are indistinguishable once they hit the dashboard — that's deliberate (Task 4's whole point).

This phase does **not**: build outbound calling, SMS, PMS integration, payment processing, autonomous leasing, multilingual support, or a tuned/optimized prompt. See the handoff's own Non-Goals — all still apply.

## Architecture

```
Phone Call → Twilio → Vapi Assistant → end-of-call webhook → StorageAI
                                              │
                                              ├─ conversation_transcripts (raw, Task 3)
                                              └─ logCall() → analyzeTranscript() → dashboard (Task 4, reused unchanged)
```

**The Twilio number no longer routes to `/api/twilio/voice`.** Once imported into Vapi (see below), Vapi takes over the number's voice webhook configuration directly — that's how Vapi's Twilio integration works, confirmed against Vapi's own API docs before building this, not assumed. `/api/twilio/voice` and its tests are untouched and still correct; they'd matter again if a number were ever removed from Vapi.

## 1. Vapi account

- Console: [dashboard.vapi.ai](https://dashboard.vapi.ai)
- Account ownership: founder's own account, same pattern as Twilio and Supabase
- Generate a private API key: Dashboard → API Keys

This Claude cannot create the account — same limitation as Twilio's Task 1 in Phase 38. Everything downstream (assistant creation, Twilio number import, webhook wiring) is scripted and only needs the API key once the account exists.

## 2. Environment variables

| Variable | Where it comes from | Used by |
|---|---|---|
| `VAPI_API_KEY` | Vapi Dashboard → API Keys | `scripts/setup-vapi-assistant.mjs` only — never read by the deployed app |
| `VAPI_WEBHOOK_SECRET` | Generated automatically by the setup script | `/api/vapi/webhook` (production only — skipped when `NODE_ENV` isn't `"production"`, same pattern as Twilio's signature check) |
| `VAPI_ASSISTANT_ID` | Printed by the setup script after it creates the assistant | Not currently read by any code path; kept for reference/future re-runs |

`turbo.json`'s `build.env` only declares `VAPI_WEBHOOK_SECRET` — that's the only one the deployed app actually reads at runtime. `VAPI_API_KEY` belongs in `apps/web/.env.production.local` (same file, same reasoning as Twilio's credentials in `TWILIO_SETUP.md` — a script-only credential, never auto-loaded by `next dev`).

## 3. Run the setup script

```bash
cd apps/web
# apps/web/.env.production.local must define:
#   VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
node scripts/setup-vapi-assistant.mjs
```

This does two things, in order (confirmed against Vapi's API reference before writing, not guessed):
1. `POST https://api.vapi.ai/assistant` — creates the assistant with the system prompt below, and configures its Server URL (`server.url` + a custom `X-Vapi-Webhook-Secret` header, generated fresh each run) to point at `/api/vapi/webhook`.
2. `POST https://api.vapi.ai/phone-number` — imports the existing Twilio pilot number into Vapi using the same Twilio credentials already in production, with `assistantId` set so inbound calls route straight to the new assistant.

The script prints the generated `VAPI_WEBHOOK_SECRET` and the new `VAPI_ASSISTANT_ID` — add both to Vercel's environment variables, then redeploy (env var changes don't apply retroactively — same gotcha as Twilio's rollout).

**Not idempotent on purpose.** Running it twice creates a second assistant and re-imports the number onto it. Fine if that's deliberate (e.g., recreating after deleting the old one); don't run it twice by accident.

## 4. System prompt

Deliberately narrow, matching the handoff's explicit constraints (greet professionally, collect renter info, never invent pricing or availability, defer to a human when uncertain). Full text is in `scripts/setup-vapi-assistant.mjs`'s `SYSTEM_PROMPT` constant — kept in code rather than duplicated here, so there's exactly one place to edit it. Model: `openai` / `gpt-4o-mini` — a reasonable default for a scoped pilot assistant, not a considered choice beyond that; change it in the script if a different model is wanted.

Voice (TTS) and transcriber (STT) config were deliberately left unset in the assistant creation request — Vapi's own account-default fallback chain handles it, rather than this Claude guessing at a specific provider/voiceId without being able to verify one actually works. Customize via the Vapi dashboard once the assistant exists, if the default doesn't sound right.

## 5. Data model

Two tables, deliberately separate (Task 3's explicit instruction):
- **`conversation_transcripts`** — the raw artifact: full transcript, Vapi call ID (unique — doubles as the idempotency guard against webhook retries), caller number, duration, ended reason, and the *entire raw webhook payload* as `jsonb`. Nothing here is processed or analyzed.
- **`calls`** — the existing table. A Vapi call populates this exactly the way a manually-logged call does, via the same `logCall()` function, so `analyzeTranscript()` and the dashboard need zero changes to handle either source.

**Every Vapi call is logged against `PILOT_FACILITY_ID`** (`lib/storage/constants.ts`), a dedicated "Founder Pilot Facility" created this phase — kept separate from `DEMO_FACILITY_ID`'s seeded sample data. The one pilot Twilio number isn't mapped to a specific real customer facility yet; that mapping is a real design decision for whenever there's more than one number, not built here.

## 6. Local testing

No Vapi account needed to verify the webhook handler itself — signature checking is skipped outside production, so a plain `curl` simulating Vapi's payload shape is enough:

```bash
curl -i -X POST http://localhost:3000/api/vapi/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "endedReason": "customer-ended-call",
      "call": {
        "id": "test-call-001",
        "customer": {"number": "+15125550110"},
        "phoneNumber": {"number": "+18314329642"},
        "startedAt": "2026-07-25T10:00:00.000Z",
        "endedAt": "2026-07-25T10:02:30.000Z"
      },
      "artifact": {"transcript": "AI: Hi there.\nUser: I need a 10x10 unit this weekend."}
    }
  }'
```

Verified during Phase 39 development: this produces a `conversation_transcripts` row, a matching `calls` row with the correct `analyzeTranscript()` output (confirmed live on the dashboard — intent, unit size, timeline, priority, and recommended action all matched exactly what the same transcript would produce via manual entry), and — sent twice in a row — the second request correctly reports `"result":"duplicate"` with no second `calls` row created.

## 7. Production status

- [x] `/api/vapi/webhook` deployed and verified locally against a realistic payload
- [x] `conversation_transcripts` table exists in both local and production
- [x] `PILOT_FACILITY_ID` facility created in both local and production
- [ ] **Vapi account, assistant, and Twilio number import — pending Steve running the setup script** (needs a Vapi account and API key first)
- [ ] **`VAPI_WEBHOOK_SECRET` / `VAPI_ASSISTANT_ID` in Vercel — pending**, printed by the setup script once run
- [ ] **Founder verification (Task 5) — pending**, see test scenarios below

## 8. Founder verification checklist

Once the assistant is live, place real calls covering (per the handoff's Task 5):

- [ ] Unit availability question
- [ ] Pricing question
- [ ] Office hours question
- [ ] Move-in timing question
- [ ] A question the assistant genuinely can't answer
- [ ] Caller hangs up mid-conversation
- [ ] Very short call (a few seconds)
- [ ] Longer, multi-topic call

For each, check: did the transcript look accurate, did `analyzeTranscript()` produce a sensible read, did it appear correctly on `Founder Pilot Facility`'s dashboard, and did the recommended action make sense. Log findings in `docs/operations/PILOT_LOG.md`, same as any other real pilot interaction — this is exactly what that file exists for.

## Troubleshooting

**Vapi answers, but the call never appears in `conversation_transcripts` or the dashboard.** Check Vercel's Function Logs for `/api/vapi/webhook` — `Failed to process Vapi end-of-call report` means it reached the route but hit an error downstream (check the logged error object). If nothing logged at all, confirm the assistant's `server.url` actually points at `https://storage-ai-sigma.vercel.app/api/vapi/webhook` (Vapi dashboard → the assistant → Server URL) and that `VAPI_WEBHOOK_SECRET` in Vercel matches the header the assistant sends (`X-Vapi-Webhook-Secret`).

**A retried webhook silently drops a call.** Known, narrow edge case: idempotency is keyed off the `conversation_transcripts` insert succeeding *before* `logCall()` runs. If the transcript insert succeeds but `logCall()` itself then fails (e.g., a transient DB error), a retry of the same webhook will see "already have this transcript" and correctly skip re-inserting the transcript — but will also skip the `calls` insert that never actually happened. Not fixed this phase; the fix would be tracking a separate "fully processed" flag rather than relying on one insert's uniqueness for both purposes. Logged in `TECH_DEBT_REGISTER.md` if it ever actually happens — no evidence yet that it has.

**The old "under founder testing" greeting still plays instead of the Vapi assistant.** The Twilio number's webhook wasn't actually handed to Vapi — either the setup script wasn't run, or it failed partway. Check the Twilio console's number configuration page directly; it should show Vapi's webhook URL, not `https://storage-ai-sigma.vercel.app/api/twilio/voice`.

**A real call doesn't show up on the operator dashboard at all.** Confirm you're viewing `Founder Pilot Facility`'s dashboard (`?facility=<PILOT_FACILITY_ID>`), not `DEMO_FACILITY_ID`'s — every Vapi call is logged against the pilot facility specifically, per "Data model" above.
