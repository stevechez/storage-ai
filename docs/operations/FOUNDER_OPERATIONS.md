# Founder Operations Playbook

Phase 35. A practical routine for running IntelliLease day to day — not a reference manual. Where a topic already has a dedicated doc, this points there instead of duplicating it, per the same "single source of truth" discipline `BUILD_LOG.md` already follows.

## Daily review

Takes under 5 minutes with zero or few real facilities; grows naturally as the pilot cohort does.

1. Check `early_access_signups` in Supabase Studio (production project) for new signups — no automated alert exists yet, by design at this scale (`LAUNCH_CHECKLIST.md`).
2. For each active pilot facility, open their dashboard link (`?facility=<id>`) and glance at Today's Actions — not to act on their behalf, just to notice if anything looks structurally wrong (an opportunity that clearly mis-analyzed a transcript, a stuck "new" call from days ago).
3. Check the Vercel dashboard for any failed deployments if you pushed code today.

## Weekly review

1. Re-read `docs/operations/PILOT_LOG.md` — is there a pending "Follow-up required" item that's overdue?
2. Skim `docs/operations/TECH_DEBT_REGISTER.md` — anything that was "Low priority, revisit if X happens" where X has now happened?
3. Confirm `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint` still pass clean on `main` (they should always pass — this is a regression check, not routine maintenance).
4. If real usage has produced enough data, sanity-check the numbers in `docs/operations/SUCCESS_METRICS.md` against what you'd expect.

## Before onboarding a facility

Run the full `docs/operations/LAUNCH_CHECKLIST.md` — don't skip it because "it was fine last time." It's under 15 minutes and exists specifically because a passing check today doesn't guarantee one tomorrow (a dependency update, a Vercel env var that got edited, etc.).

Specifically confirm `apps/web/.env.production.local` exists and points at the real project before running `scripts/onboard-facility.mjs` — see `docs/operations/BACKUP_RECOVERY.md` §2 if it doesn't.

## After onboarding a facility

Follow `docs/operations/ONBOARDING_RUNBOOK.md` §3 (the founder onboarding checklist) exactly — send the dashboard link, walk them through logging their first call together, check in after their first few real calls. The comparison that matters ("did the analysis match what actually happened on the call?") only comes from that conversation, not from usage numbers.

Open a new entry in `docs/operations/PILOT_LOG.md` the same day, even if there's not much to say yet — a thin entry is easier to add to later than a memory to reconstruct later.

## Responding to bugs

0. **Confirm which URL you're actually testing against before assuming something's broken.** This happened for real (2026-07-25): a real early-access signup showed the correct success message but never appeared in production's `early_access_signups` table — looked exactly like a broken insert or a masked error. It was neither. The submission had gone to `localhost:3000` (a local dev server, quietly still running), not `https://storage-ai-sigma.vercel.app` — so it landed correctly in the local Docker database, not production. The system was never broken; the browser tab was just pointed at the wrong place. This is the exact inverse of the project's original, better-known incident (local dev silently writing to *production*) — so don't assume that fix means this class of mix-up can't happen again in the other direction. Check the address bar first, before reproducing anything.
1. **Reproduce it first**, using the actual facility/call ID if it came from a real pilot interaction — don't fix from a description alone.
2. Check `docs/operations/ONBOARDING_RUNBOOK.md` §5 (Recovery procedures) and `docs/operations/BACKUP_RECOVERY.md` — is this a known, already-documented failure mode?
3. If it's new: fix it with the same discipline every phase in `BUILD_LOG.md` has used — a real test or a live-verified fix, not an assumed one.
4. Log it in `docs/operations/PILOT_LOG.md` if a real customer hit it, referencing the specific call/facility ID so it's reproducible later.
5. Update `docs/BUILD_LOG.md` (see below) regardless of whether a customer saw it.

## Recording product feedback

Feedback about *how the product behaves* (wrong-sounding response drafts, a confusing label, a request for something new) goes in `docs/operations/PILOT_LOG.md` under "Requested improvements" / "Customer confusion" — tied to the specific interaction, not paraphrased into a generic backlog item. Don't build from a single request; wait for a pattern across real conversations, consistent with how every phase from 21 onward has treated evidence over assumption.

If feedback reveals a genuinely wrong assumption in how the product was designed (not just a missing feature), that's worth its own line in `docs/customer-validation/ASSUMPTION_LOG.md` if that file's convention fits, or a `BUILD_LOG.md` entry if it changes something concrete.

## Updating `docs/BUILD_LOG.md`

This is the single authoritative engineering/decision history — every phase in this project's history has ended with an entry here, and that discipline is what makes phases 21 through 35 legible as a continuous record instead of scattered memory. When you (or a future Claude session) finish a body of work:

- One entry per phase/sprint, dated, under a `##` heading matching the pattern already established
- State the goal, what was actually found (not assumed), what was fixed and how it was verified, and the outcome
- Don't create a second file for this purpose — Phase 29 explicitly evaluated and rejected a separate "Product Decision Register" because this file already does the job

## Updating `docs/operations/TECH_DEBT_REGISTER.md`

Add an item the moment something is found, whether or not it gets fixed immediately — capturing it beats fixing it immediately or forgetting it. Every entry needs the same four fields (Risk / User Impact / Estimated Effort / Priority) and a note on how it was actually verified. When something gets fixed, don't delete the entry — strike it through with a "Fixed Phase N" note and a one-line summary of the fix and how it was verified (see the Phase 34 index entry for the pattern), so the register stays a real history, not just a current-state snapshot.

## What this playbook deliberately doesn't cover

Signup notification automation, a pilot health dashboard, and founder administration tooling (pause/pricing/status) — evaluated and rejected in Phase 28 as premature against zero-to-few real customers, reconfirmed as out of scope by Phase 35's own Non-Goals. Revisit only once real usage volume says otherwise, and only as its own scoped phase.
