# Signup-to-First-Value: Audit, Runbook, Troubleshooting

Phase 26 Workstream 1 + Phase 28 Tasks 2 & 5. Every claim below was verified against the actual codebase and database, not assumed.

---

## 1. Signup flow audit — what actually happens today

A visitor fills out the Early Access form (`components/marketing/early-access.tsx`) with name, email, facility name, and an optional message. On submit, `app/actions.ts`'s `submitEarlyAccessSignup`:

1. Validates name and email are non-empty (facility name and message are optional).
2. Inserts one row into `early_access_signups`.
3. Returns a success message to the visitor.

**That's the entire flow.** Nothing else happens automatically — no notification reaches the founder, and nothing connects `early_access_signups` to `facilities`. They are two fully disconnected tables. (Signup notification is Phase 28 Task 1 — deliberately not built yet; see "Status" below.)

## 2. Gap analysis — signup to first value

| Step | Status |
|---|---|
| Prospect signs up via Early Access form | **Works** |
| Founder learns a signup happened | **Gap** — no notification, manual table check only. Sufficient at pilot scale; deferred (Task 1) until real signup volume says otherwise |
| A facility record is created for them | **Fixed** — `apps/web/scripts/onboard-facility.mjs` (Phase 28 Task 2) |
| Their dashboard is viewable | **Fixed** — `/dashboard?facility=<id>`, no auth needed (Phase 26 Task 1) |
| Their real phone calls enter the system | **Fixed, manually** — `LogCallForm` on the dashboard (Phase 26 Task 2). Still no telephony integration (by design, still out of scope) |
| They log in to see their own data | **Not applicable yet** — no authentication anywhere in the app. Private dashboard links are the current trust model |

**Where this leaves things:** a real customer can now be onboarded and get real value the same day — by hand, with the founder doing the facility creation and, for now, the call logging too (or teaching the operator to do it themselves). Nothing here required customer conversations to be worth fixing; these were structural gaps, not speculative features.

## 3. Founder onboarding checklist

Walk through in order for a real signup:

1. **Notice the signup.** Check `early_access_signups` in Supabase Studio (production project). No automated alert yet — see Task 1 above.
2. **Create their organization and facility:**
   ```bash
   cd apps/web
   node scripts/onboard-facility.mjs \
     --name "Their Facility Name" \
     --address "123 Main St" --city "Their City" --state XX \
     --timezone "America/Chicago" \
     --phone "+1..." --contact-name "..." --contact-email "..."
   ```
   Requires `apps/web/.env.production.local` to exist first, with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the real production project. This file is intentionally separate from `.env.local` — see the script's own header comment for why, and don't merge them back together.
3. **Send them their dashboard link.** The script prints it: `https://storage-ai-sigma.vercel.app/dashboard?facility=<id>`. This link is their whole login for now — treat it as a credential, send it privately, don't post it anywhere public.
4. **Walk them through logging their first call.** Point them at "Log a Call" at the top of their dashboard. Have them do one together on the first call so they see the analysis appear.
5. **Check in after their first few real calls.** Look at their dashboard yourself (same link) to see what the product surfaced, and ask them directly whether it matched what actually happened on the call — that comparison is the actual pilot evidence, more valuable than any usage metric.

## 4. Pilot support — common situations

- **"I don't see my dashboard / it shows the wrong facility."** Confirm they're using the exact link the script printed, including the `?facility=` param. If they bookmarked `/dashboard` with no param, they're looking at the demo facility.
- **"The suggested response doesn't sound right."** `buildResponseMessage()` (`lib/storage/responses.ts`) is a deterministic template, not a live AI call — there's no per-customer tuning yet. If the phrasing is systematically off for how they talk to renters, that's real product feedback worth logging in `docs/customer-validation/OPERATOR_FEEDBACK.md`, not a bug.
- **"The priority/timeline looks wrong for a call."** `analyzeTranscript()` (`lib/storage/intelligence.ts`) is rule-based keyword matching, not a model — it's looking for specific words (`this weekend`, `today`, `tomorrow`, `asap` for timeline; `rent`/`unit`/`want a` for rental intent, etc.). If a real transcript doesn't use those words, it won't extract correctly. This is the single most likely source of "that's not right" from a real customer, and the most valuable thing to learn from Mission 22A-style conversations.

## 5. Recovery procedures

**"AI processing failed."** This can't happen in the sense of an API outage or timeout — `analyzeTranscript()` has no external dependency, no network call, nothing to be "down." If a call's analysis looks wrong, it's a rule-matching gap (see above), not a failure to recover from — it's a `lib/storage/intelligence.ts` code change, and worth a test case once you know the real phrasing that didn't match.

**"A call insert failed."** Both paths — the API route and the manual `LogCallForm` — have real error handling as of the reliability audit: the API route returns a clean `400`/`500` with a message instead of crashing, and the form shows the error inline via `useActionState`. First step: read the actual error message shown. If it's a Supabase error, check `apps/web/.env.production.local`'s credentials are current, and check the `calls_status_check` constraint isn't being violated (status must be one of `new`/`contacted`/`converted`/`lost`).

**"Dashboard data looks wrong or stale."** In order:
1. Confirm the `?facility=` param matches the customer you think you're looking at.
2. Query `calls` directly in Supabase Studio for that `facility_id` and compare against what's rendered — the dashboard has no caching beyond Next.js's own per-request fetch, so a mismatch usually means either you're looking at the wrong facility or a specific call's `analyzeTranscript()` output doesn't match what you'd expect from its transcript.
3. If the whole dashboard is erroring rather than just looking wrong, `app/dashboard/error.tsx` should catch it and show a "Try again" button rather than a raw crash — if you're instead seeing Next.js's raw default error screen, that's itself a bug worth reporting.
