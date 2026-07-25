# StorageAI

A digital leasing manager for independent self-storage facilities — it captures rental opportunities from missed and after-hours calls, prioritizes them, and helps the operator convert them. It is **not** an AI chatbot, a generic AI agent, or a voice automation platform (see `CLAUDE.md` for the full product positioning) — today, calls are logged (manually, or via a simple ingestion API) and analyzed; nothing is answered or automated end-to-end.

## Current status

Don't trust a status line in this file — it will go stale the same way an earlier version of this README did. The current phase, and the full history of what's been built and why, lives in [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md). As a rough orientation: the product has a marketing site with pricing, a working operator dashboard, rule-based call analysis, revenue-impact tracking, response drafting, manual call logging, and per-facility dashboards — plus a full operations documentation suite in `docs/operations/` (onboarding, launch checklist, performance baseline, backup/recovery, founder operations playbook).

## Where to start

- [`CLAUDE.md`](CLAUDE.md) — product positioning and engineering rules (read this first)
- [`docs/CLAUDE.md`](docs/CLAUDE.md) — technical context (schema, coding rules)
- [`CLAUDE_HANDOFF_EVEREST.md`](CLAUDE_HANDOFF_EVEREST.md) — the original product mission/vision doc
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) — the single authoritative history of every engineering decision, dated and in order
- [`docs/operations/`](docs/operations/) — onboarding, launch checklist, performance baseline, backup & recovery, founder operations playbook, tech debt register, pilot log, success metrics

## Technology stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase (Postgres)
- pnpm (Turborepo monorepo — `apps/web`, `packages/database`)

## Development

```bash
pnpm install
supabase start          # local Supabase (Docker)
pnpm dev                 # apps/web on localhost:3000
```

Reset the local database from migrations:
```bash
supabase db reset --local
```

Smoke-test call ingestion against a running dev server:
```bash
node scripts/test-call.js
# Expected: { "success": true, ... }
```

Run checks:
```bash
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm test
```

## Project philosophy

Every feature should directly help a storage operator capture more rentals or reduce missed-call losses. Avoid unnecessary complexity; build customer value first. See `CLAUDE.md` for the full engineering rules this project follows.
