# Production Readiness Review

Phase 30. Every finding below was verified directly — against the live production URL where relevant, not just local — not assumed.

## Task 1 — Production readiness audit

**Links:** Every internal anchor on the marketing page (`#how-it-works`, `#early-stage`, `#pricing`, `#early-access`) has a matching `id` target — checked by cross-referencing every `href="#..."` against every `id="..."` in the marketing components. No broken anchors.

**Routes:** `/`, `/dashboard`, `/leads`, `/facilities` all return `200` on the live production URL.

**Placeholder content:** None found — searched for TODO/FIXME/lorem ipsum/"coming soon" across the entire source tree, zero matches.

**Unfinished screens:** `/leads` and `/facilities` are still the original static placeholder pages ("No leads yet" / "No facilities connected") from before the current product model existed. Not linked from anywhere in the app (nav, dashboard, footer) — only reachable if someone types the URL directly. Low severity: the copy is honest, not confusing, and not discoverable, but they are pre-real-model scaffolding. **Punch list item, not launch-blocking.**

## Task 2 — First customer journey audit

Walked the actual journey end-to-end against the local database, standing in for a real signup: created an organization + facility (same shape the onboarding script produces) → viewed its dashboard via `?facility=<id>` → logged a real call through the Log a Call form's underlying path → confirmed full analysis appeared (intent, unit size, timeline, priority, suggested response, status actions) → cleaned up all test data.

**Finding (fixed): the Demo Banner was hardcoded to show on every facility, not just the actual demo one.** A brand-new, genuinely empty real facility's dashboard said *"This is a live demonstration using sample leasing activity"* — which is actively wrong for a real paying customer looking at their own real (if empty) data. This directly undercuts the trust work from Sprint 20. Confirmed via the production URL that this hadn't yet affected anyone (only the demo facility has ever been viewed in production) — caught before Customer #1, which is exactly what this review exists to do.

**Fix:** `app/dashboard/page.tsx` now only renders `DemoBanner` when `facility.id === DEMO_FACILITY_ID`. Verified live: the real test facility's dashboard no longer shows it, the actual demo facility still does.

No other friction found in the journey — the mechanics (facility creation → dashboard → call logging → analysis → follow-up) all worked correctly on the first real end-to-end run.

## Task 3 — Security & configuration review

- All 8 tables have RLS enabled; only `conversations` (unused, dead table) has explicit policies. Every other table has zero policies, meaning zero access for `anon`/`authenticated` by default — correct, since the entire app exclusively uses the `service_role` admin client
- Confirmed `service_role` has full grants (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) on all 8 tables, including `facilities` and `organizations` — the onboarding script will actually work against production when it's used
- `.env.local` confirmed local-only (no production block) — the fix from the reliability audit is holding
- Zero hardcoded secrets/keys anywhere in application source — searched explicitly for key-shaped strings
- `.gitignore` correctly covers `.env.production.local` via its existing `.env.*.local` pattern, confirmed before that file was ever created
- No new development shortcuts found

## Task 4 — Dependency & repository cleanup

- No unused npm dependencies found beyond what's already logged: `@supabase/ssr` is only used by the two intentionally-kept-but-unused anon-key client files (already in the Tech Debt Register as low-priority scaffolding for future auth work) — not a new finding, just confirming the connection
- No commented-out code blocks, no `.bak`/`.orig`/`.old` files, no duplicate function names across `lib/storage/`
- Root `scripts/test-call.js` (a dependency-free smoke test against a running local dev server) and `apps/web/scripts/onboard-facility.mjs` (the real onboarding tool) serve different purposes and aren't duplicates, despite both being "scripts that create a call" adjacent — worth knowing they coexist intentionally
- Did not touch migrations — they're an append-only historical record by design, not cleanup targets

## Summary punch list

| Finding | Severity | Status |
|---|---|---|
| Demo Banner shown on every facility, not just the demo one | High | **Fixed and verified** |
| `/leads`, `/facilities` are unlinked pre-model placeholder pages | Low | Open — not launch-blocking |
| (Everything else already in `TECH_DEBT_REGISTER.md`) | — | Tracked there, not duplicated here |
