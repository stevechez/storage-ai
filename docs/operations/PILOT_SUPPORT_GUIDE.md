# Pilot Support Guide

Phase 45. Written so supporting a real pilot customer through their first week doesn't depend on
remembering everything from the phases that built the platform. If you're reading this because a
real facility just said yes, start here — it links out to the detailed docs rather than
duplicating them, but this is the one page that should get you through day one without needing to
already know the project's history.

## First-day checklist

1. **Onboard the facility** — follow `docs/operations/CUSTOMER_IMPLEMENTATION_RUNBOOK.md` phases
   1–5 exactly (facility record, Twilio number, Vapi assistant, database mapping, verification
   call). Don't skip Phase 5 — it's the one that catches a call that *sounds* fine while
   silently going nowhere.
2. **Run the status check** before telling the customer they're live:
   ```bash
   cd apps/web
   node scripts/onboarding-status.mjs --facility-id "<id>"
   ```
   Don't proceed until it says `READY`.
3. **Classify the workspace correctly.** A brand-new real customer should be
   `workspace_type = 'customer'` (not `internal` — that's for founder testing/dogfooding only,
   see `docs/architecture/WORKSPACE_ARCHITECTURE.md`). Getting this right is what makes the
   dashboard show the customer-facing readiness experience (Phase 44b/45) instead of the
   internal/developer one.
4. **Show them their dashboard**, and specifically point out the "AI Leasing Assistant" status
   card at the top (Phase 45) — phone number, connection status, recent calls, active
   opportunities. That's the thing they should check themselves when they want to know if
   everything's working, not something they need to ask you about.
5. **Tell them how to reach you.** The dashboard itself now has a small "Questions? Email..."
   line at the bottom, but say it out loud too on day one.

## Common questions (and honest answers)

**"Where do I log in?"** There's no login yet — the dashboard link is their whole access
(`docs/operations/ONBOARDING_RUNBOOK.md`'s documented trust model: an unguessable link is the
credential). Tell them to bookmark it and treat it like a password. If they lose it, they contact
you directly — there's no self-service recovery.

**"Can I set my own hours / have it transfer to my cell / change the greeting?"** Not yet. None
of these have anywhere to be stored today (`docs/operations/FRICTION_LOG.md`), and there's no live
transfer capability. Be upfront about this rather than let them assume it works — it's a real,
known gap, not a bug.

**"The AI got something wrong on a call."** `analyzeTranscript()` is rule-based keyword matching,
not a language model — it looks for specific phrases (`this weekend`, `asap`, `rent`, `unit`,
etc.). Unusual phrasing can genuinely be missed. Ask what was actually said, compare it to what
the dashboard shows, and log a real mismatch as product feedback
(`docs/customer-validation/OPERATOR_FEEDBACK.md`), not just something to apologize for.

**"Does this connect to [their PMS software]?"** Not yet — deliberately not built without real
demand (`docs/architecture/SELF_SERVICE_ROADMAP.md`). If they ask for this specifically, that's
real signal worth recording, not something to promise.

**"Is my data safe? What happens to my calls?"** Point them at `/privacy` and `/terms` on the
marketing site — both already describe this honestly (early-stage, founder-run, real third
parties named).

## Known limitations (be upfront about these, don't let the customer discover them)

- No settings storage for office hours, a transfer number, or a custom greeting
  (`FRICTION_LOG.md`).
- No live call transfer — the assistant's fallback for anything it can't answer is "someone will
  follow up," not a handoff to a real person.
- Intent/priority detection is rule-based, not a language model — real but unusual phrasing can
  be missed (see "Common questions" above).
- No dashboard-link recovery if they lose it — you resend it manually.
- No authentication — the dashboard link itself is the access control
  (`docs/operations/TECH_DEBT_REGISTER.md`).

None of these are secret — if a customer asks, say so plainly rather than deflect.

## Recovery procedures

**A call sounded fine but nothing shows up on the dashboard.** This is the single most important
failure mode found so far (Phase 42, and again while building the tool below) — it's silent, and
it's exactly what Phase 5 verification and the daily health check exist to catch before a
customer notices it themselves.

1. Run `node scripts/onboarding-status.mjs --facility-id "<id>"` first. It checks the database
   *and* calls Vapi's own API to confirm the assistant exists and its webhook secret actually
   matches — the exact thing that took three manual retry cycles to diagnose the first time it
   happened.
2. If it reports `Webhook authenticated: Needs attention`, don't assume the worst immediately —
   check whether `.env.production.local` itself might be the problem before assuming Vapi's
   config regressed. See "Local Environment Verification" in `CUSTOMER_IMPLEMENTATION_RUNBOOK.md`
   — `[SENSITIVE]` placeholder values from `vercel env pull` have caused this exact false alarm
   more than once already.
3. If the tool itself can't run (missing/broken `.env.production.local`), that's a real,
   recurring problem, not a new one — same doc, same section.

**A real call didn't get analyzed correctly.** Not a "recovery" situation — this is product
feedback. Log it, don't just quietly fix it in conversation with the customer.

## Escalation steps

There is currently no team beyond the founder — say this plainly rather than imply a support tier
that doesn't exist. If the founder is unavailable, there is no fallback right now. That's a real
constraint of running a founder-led pilot, not an oversight to paper over with invented process.

## Daily health check

While a real pilot is active, once a day:

```bash
cd apps/web
node scripts/onboarding-status.mjs --facility-id "<id>"
```

Takes a few seconds, confirms nothing has silently drifted (a wrong env value, a Vapi-side
change, a missing webhook match). This is the same read-only tool from onboarding — running it
regularly during an active pilot is exactly what "daily health check" means; nothing new to
build.

## First week monitoring

Not automated — a cadence to actually follow, matching this phase's own instruction not to build
monitoring infrastructure.

**Day 0 — onboarding day.** Complete the first-day checklist above. Confirm `READY`. Place the
verification call yourself before the customer's first real one.

**Day 1.** Review every real call that came in. For each one, compare what the dashboard says
against what you know (or can confirm with the customer) actually happened on the call. Run the
daily health check.

**Day 3 — check in directly.** Call or message the customer. Ask what's working, what's
confusing, and whether anything got mishandled. This conversation is worth more than any metric
on the dashboard — it's the same discipline `PILOT_SUCCESS_CRITERIA.md` and the Phase 39 founder
verification calls were built around: a real, pointed question beats a synthetic test every time.

**Day 7 — retrospective.** Run the daily health check one more time. Ask honestly: did anything
happen this week that belongs in `FRICTION_LOG.md`? Did the customer ask for anything specific
enough to move an item in `SELF_SERVICE_ROADMAP.md` from "no evidence yet" to "here's the
evidence"? Decide whether the pilot continues as-is, and write down what you'd tell the next
engineer who onboards facility #3 that you didn't know before this one.

## Related documents

- `docs/operations/CUSTOMER_IMPLEMENTATION_RUNBOOK.md` — the actual onboarding steps this guide
  assumes are already done.
- `docs/operations/FRICTION_LOG.md` — every real gap found so far, ranked by whether it blocks
  go-live.
- `docs/operations/TECH_DEBT_REGISTER.md` — the full standing list, including items not specific
  to onboarding.
- `docs/architecture/SELF_SERVICE_ROADMAP.md` — what's deliberately not built yet, and the real
  evidence that would justify building it.
