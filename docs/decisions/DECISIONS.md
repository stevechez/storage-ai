# Architecture Decisions

## ADR-001

Date:
2026-07-22

Decision:

Use Supabase PostgreSQL as system database.

Reason:

Fast development, relational model, good fit for multi-tenant SaaS.

---

## ADR-002

Decision:

Use calls table instead of conversations.

Reason:

Storage operators think in terms of phone calls and rental opportunities.
