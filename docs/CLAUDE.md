# CLAUDE.md

# StorageAI MVP → Aureva Vertical Platform Migration

## Mission

Transform the existing StorageAI MVP into the foundation of the Aureva vertical SaaS platform.

The current StorageAI application is working and represents the first validated vertical implementation.

The goal is NOT to rebuild StorageAI.

The goal is to carefully evolve the existing codebase so future vertical products (example: IntelliLease for apartment leasing) can share the same platform foundation while preserving current functionality.

---

# Core Principle

## Do not rewrite working software.

StorageAI MVP is a functioning product.

Before changing architecture:

1. Understand current behavior.
2. Preserve existing workflows.
3. Make incremental changes.
4. Commit frequently.
5. Verify functionality after each migration step.

A smaller working system is more valuable than a cleaner incomplete rewrite.

---

# Product Vision

## Aureva

Aureva is the parent platform.

Aureva builds AI-powered systems that recover missed opportunities for real-world businesses.

The first product:

## StorageAI

AI-powered missed-call recovery for self-storage operators.

Future vertical example:

## IntelliLease

AI-powered missed-call recovery and leasing automation for apartment communities.

The underlying platform remains the same.

Only these should change:

- terminology
- marketing copy
- workflows
- vertical-specific intelligence
- UI emphasis

---

# Current State

StorageAI MVP already includes:

- Marketing landing page
- Authentication
- Organizations/facilities
- Call ingestion
- Call records
- Operator dashboard
- Opportunity detection
- Storage-specific intelligence
- Supabase database
- Vercel deployment

Treat all existing functionality as production valuable.

---

# Migration Strategy

Migration happens in phases.

Do not attempt all phases simultaneously.

---

# Phase 1 — Introduce Aureva Concepts

Goal:

Add platform awareness without breaking StorageAI.

Create:

lib/
verticals/
index.ts
storage.ts

Move StorageAI-specific configuration into the vertical layer.

Examples:

- product name
- terminology
- landing page copy
- labels
- customer terminology

Example:

````typescript
{
  id: "storage",

  name: "StorageAI",

  customerLabel: "renter",

  locationLabel: "facility",

  opportunityLabel: "rental"
}
Phase 2 — Generalize Domain Language Carefully

Current concepts may be storage-specific.

Evaluate:

Current:

Facility
Lead
LeasingOpportunity

Potential future:

Location
Contact
Opportunity

Important:

Do NOT perform mass renaming immediately.

Use compatibility layers where possible.

Example:

Avoid:

Rename every Facility reference

Prefer:

Introduce Location abstraction
Keep Facility working until migration is complete
Phase 3 — Database Evolution

Current database is valuable.

Do not redesign the schema.

Prefer additive changes.

Example:

Add:

vertical

to relevant entities.

Example:

locations:

id
organization_id
name
vertical

Storage:

vertical = storage

Apartment:

vertical = leasing

Avoid destructive migrations.

Phase 4 — Marketing Architecture

Move from:

storageai landing page

toward:

Aureva
 |
 ├── /storage
 |
 └── /leasing

The parent Aureva site explains the platform.

Vertical pages explain specific solutions.

Example:

Aureva:

"AI systems that help businesses capture lost opportunities."

StorageAI:

"Never lose another storage rental because you missed a call."

IntelliLease:

"Never lose another renter because nobody answered."

Architecture Goal

Target structure:

Aureva Platform

├── Core
│   ├── authentication
│   ├── organizations
│   ├── users
│   ├── locations
│   ├── calls
│   ├── opportunities
│   ├── billing
│
├── Verticals
│
│   ├── StorageAI
│   │    ├── terminology
│   │    ├── rules
│   │    ├── marketing
│   │
│   └── IntelliLease
│        ├── terminology
│        ├── rules
│        ├── marketing
Do Not Build Yet

Avoid:

generic AI agent framework
workflow builder
plugin architecture
enterprise customization system
complex tenant abstraction
multiple repositories
separate cloned products

These are future problems.

Current priority:

Get StorageAI customers.

Engineering Rules
Before modifying code:

Explain:

What problem is being solved?
Why is this needed now?
What existing behavior could be affected?
Prefer:

Small commits.

Example:

feat: add vertical configuration system

refactor: move storage copy into vertical config

feat: add leasing vertical placeholder

Avoid:

rewrite: convert entire app architecture
Testing Requirement

After every migration step verify:

Landing page loads
Authentication works
Dashboard loads
Calls appear
Opportunity detection works
Existing StorageAI flows remain unchanged
Product Decision Rules

When deciding whether to abstract:

Ask:

"Does this help close the first paying StorageAI customer?"

If no:

Defer.

Current Priority

The order of importance:

Preserve working StorageAI MVP
Close first StorageAI customer
Extract Aureva platform patterns
Add second vertical

Revenue before elegance.

Context for Claude

You are not starting a new application.

You are helping evolve a working MVP into a reusable vertical SaaS platform.

The correct approach is controlled extraction, not reconstruction.

Protect what already works.


---

One additional recommendation before giving this to Claude: **tag your current working state in Git first.**

Something like:

```bash
git add .
git commit -m "StorageAI MVP stable before Aureva migration"
git tag storageai-mvp-v1
````
