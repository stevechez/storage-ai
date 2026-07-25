# StorageAI Claude Context

You are working on StorageAI.

StorageAI is an AI virtual leasing manager for self-storage facilities.

## Current Phase

See the most recent `##` entry in `docs/BUILD_LOG.md` — this file previously said "Prototype development" long after the product had shipped a marketing site, pricing, AI call analysis, revenue tracking, response drafting, and a full operations documentation suite (`docs/operations/`). Don't hand-maintain a phase/completed-work summary here again; it will drift the same way. `BUILD_LOG.md` is the single source of truth for what's been built and why.

## Current Database

Tables in active use: `organizations`, `facilities`, `calls`, `early_access_signups`. `leads`, `units`, `conversations` exist in the schema but are unreferenced by any code — see `docs/operations/TECH_DEBT_REGISTER.md` rather than assuming they're relevant. Full schema is in `supabase/migrations/` (append-only, real source of truth for structure).

## Current Demo Facility

ID:

11111111-1111-1111-1111-111111111111

## Coding Rules

- Use TypeScript
- Use Next.js App Router
- Use Supabase
- Keep integrations abstract
- Avoid unnecessary complexity
- Build vertical slices

## Current Priority

Create customer-visible value quickly.

Avoid:

- premature abstraction
- unnecessary frameworks
- over-engineering

storage-ai/
│
├── CLAUDE.md ← here
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
│
├── apps/
├── packages/
└── supabase/
