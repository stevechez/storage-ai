# AI Virtual Leasing Manager for Self-Storage

Version: 1.0
Date: July 2026
Status: Active Development
Audience: Claude Code / Senior Engineer / Future Developers

---

# Mission

IntelliLease is an AI Virtual Leasing Manager built specifically for independent self-storage operators.

The product mission:

> Never lose another storage rental opportunity because nobody answered the phone.

IntelliLease answers inbound calls, understands renter needs, captures leasing opportunities, and helps convert inquiries into tenants.

---

# Critical Product Positioning

IntelliLease IS NOT:

- an AI chatbot
- an AI assistant
- a generic AI agent
- a voice automation platform

Those are implementation details.

IntelliLease IS:

> A digital leasing employee for self-storage facilities.

The customer does not buy AI.

The customer buys:

- fewer missed calls
- more rentals
- less repetitive staff workload
- faster renter response

Always make product decisions through this lens.

---

# Founder Thesis

Small businesses will adopt AI when it replaces or enhances a specific business responsibility.

IntelliLease is the first example:

- AI Employee: Leasing Manager
- Industry: Self-storage
- Responsibility: Capture and convert rental inquiries.

---

# Long-Term Vision (Everest)

The complete vision:

```
Customer Phone Call
    |
    v
AI Leasing Manager
    |
    +---- Understand renter needs
    |
    +---- Answer pricing questions
    |
    +---- Check unit availability
    |
    +---- Send rental link
    |
    +---- Verify identity
    |
    +---- Sign lease
    |
    +---- Process payment
    |
    +---- Create tenant
    |
    +---- Generate gate access
```

However:

DO NOT build Everest first.

The first mountain camp is proving:

"Can IntelliLease recover missed rental opportunities?"

---

# Current Product Strategy

The wedge:

After-hours and missed-call leasing.

Example customer pain:

A storage facility receives:

- evening calls
- weekend calls
- calls while employees are busy

Nobody answers.

The renter calls another facility.

IntelliLease prevents that loss.

---

# Current Technology Stack

## Application

- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm monorepo

## Database

- Supabase PostgreSQL

## UI

- Tailwind
- Shadcn UI
- Lucide Icons

## Future Integrations

- Voice: Vapi / Retell
- Telephony: Twilio
- Payments: Stripe
- Identity: Stripe Identity
- PMS: Storable, SiteLink, StorEdge

---

# Repository Structure

Expected:

```
storage-ai/
  apps/
    web/
      src/
        app/
        components/
        lib/
        types/
  supabase/
  docs/
  CLAUDE.md
  CLAUDE_HANDOFF_EVEREST.md
```

---

# Current Completed Milestones

## Sprint 1 — Foundation

Completed:

- Next.js application
- TypeScript setup
- Supabase connection
- initial schema

## Sprint 2 — Storage Operations Core

Completed:

Database:

- organizations
- profiles
- facilities
- calls

Call ingestion API:

- POST /api/events/call

## Sprint 3 — Operator Dashboard

Completed:

Operator dashboard

Shows:

- facility
- calls answered
- recent calls
- transcripts

## Sprint 4 — Documentation Foundation

Completed:

- Engineering documentation
- Architecture notes
- Claude instructions

## Sprint 5 — Facility Context

Completed:

- Facility abstraction
- Storage domain services

## Sprint 6 — The First Decision

CURRENT TARGET

IntelliLease moves from:

Call Recording

to:

Leasing Intelligence

---

# Sprint 6 Objective

Given:

```
Customer:

"I need a 10x10 unit this weekend.
How much does it cost?"
```

IntelliLease should produce:

```
Rental Opportunity

Intent:
Rental Inquiry

Unit:
10x10

Timeline:
This weekend

Priority:
High

Recommended Action:

Send pricing and availability.
```

---

# Sprint 6 Implementation Plan

## Create Business Types

File:

`src/types/leasing.ts`

Contains:

```typescript
OpportunityIntent

OpportunityPriority

LeasingOpportunity
```

Important:

These are business concepts.

Do not create AI-specific types.

## Create Intelligence Service

File:

`src/lib/storage/intelligence.ts`

Function:

`analyzeTranscript(transcript)`

Initial implementation:

Rule based.

Examples:

- "10x10" returns: `unitSize = "10x10"`
- "today" returns: `priority = "high"`
- "price" returns: `intent = "pricing"`

Do not add LLMs yet.

## Create Opportunity Component

File:

`src/components/storage/opportunity-card.tsx`

Display:

```
Rental Opportunity

Need:
10x10

Priority:
High

Recommended Action:

Send availability link
```

---

# Engineering Principles

## Principle 1

Business first.

AI second.

Do not build AI features because they are interesting.

Build business outcomes.

## Principle 2

Avoid premature complexity.

No:

- embeddings
- vector databases
- autonomous agents
- complex orchestration

until customer value requires them.

## Principle 3

The UI should hide AI complexity.

Bad:

"Model confidence: 94%"

Good:

"Customer appears ready to rent."

---

# Development Workflow

Every sprint:

1. Create sprint document
2. Implement one vertical slice
3. Test
4. Screenshot
5. Update milestones
6. Commit

Git example:

```
git add .
git commit -m "feat: sprint 6 leasing intelligence"
git tag sprint-06-first-decision
```

---

# Rules For Claude

Before writing code:

1. Read this document.
2. Read CLAUDE.md.
3. Understand current architecture.
4. Do not expand scope.

If you see opportunities:

Document them.

Do not build them.

---

# Definition Of Success

IntelliLease succeeds when a storage operator says:

"I don't care how it works. It just saved me a rental."

---

# Final Founder Note

IntelliLease is not being built to demonstrate AI.

It is being built to create a practical AI employee.

The technology changes.

The responsibility remains.

Build the employee.
