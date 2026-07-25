# Launch Checklist

Run this before onboarding each new founder facility — not just once. Should take under 15 minutes; every item has a fast, concrete way to check it.

## Technical

- [ ] `https://storage-ai-sigma.vercel.app/` returns `200` and the homepage renders (`curl -o /dev/null -w "%{http_code}"`)
- [ ] `https://storage-ai-sigma.vercel.app/dashboard` returns `200` and shows real data, not an error page
- [ ] `apps/web/.env.production.local` exists and its `NEXT_PUBLIC_SUPABASE_URL` does **not** contain `localhost`/`127.0.0.1` (the onboarding script checks this automatically and refuses to run otherwise — but worth eyeballing before you need it)
- [ ] `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint` all pass clean
- [ ] No new items silently added to `TECH_DEBT_REGISTER.md` without being triaged

## Product

- [ ] Founder Program pricing on the live homepage matches what you'd actually charge someone today
- [ ] The demo facility's dashboard (`?facility=11111111-1111-1111-1111-111111111111`) still shows the Demo Banner
- [ ] A brand-new facility's dashboard does **not** show the Demo Banner (regression-check for the Phase 30 fix — view any real facility and confirm)
- [ ] Log a Call → produces a correctly analyzed opportunity within the same page load

## Operations

- [ ] You know where to check for new signups (`early_access_signups` in Supabase Studio — no automated alert exists yet, by design at this scale)
- [ ] You can run `node apps/web/scripts/onboard-facility.mjs --name ... --address ... --city ... --state ...` from memory or from `docs/operations/ONBOARDING_RUNBOOK.md` without re-deriving the SQL
- [ ] `docs/operations/PILOT_LOG.md` is open and ready to fill in after the first real interaction
- [ ] You've re-read `docs/operations/ONBOARDING_RUNBOOK.md`'s troubleshooting section once, recently enough to remember it exists when something looks wrong

## Not on this checklist, on purpose

Signup notification automation, a pilot health dashboard, and founder administration (pause/pricing/status) are deliberately not here — they were evaluated in Phase 28 and rejected as premature, since they'd be built against zero real customers. Revisit only once real usage says they're needed.
