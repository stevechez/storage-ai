# StorageAI

AI-powered virtual leasing manager for independent self-storage facilities.

## Mission

StorageAI helps self-storage operators capture missed rental opportunities by automating the after-hours leasing process.

Instead of paying a front desk employee to answer repetitive questions, verify customers, and process basic rentals, StorageAI provides an AI leasing assistant available 24/7.

---

# Current Status

🚧 Prototype Development

Current capabilities:

- Next.js application foundation
- Supabase database
- Multi-tenant data model
- Call ingestion API
- Operator dashboard
- Call activity reporting

---

# Product Vision

A customer calls a storage facility.

StorageAI:

1. Answers the phone
2. Understands the customer's needs
3. Checks available units
4. Sends a rental link
5. Verifies identity
6. Processes payment
7. Creates tenant access

---

# Architecture

Customer Phone Call

    |
    v

AI Voice Agent

    |
    v

StorageAI Platform

    |
    +---- Storage PMS
    |
    +---- Twilio SMS
    |
    +---- Stripe
    |
    +---- Supabase

---

# Technology Stack

## Application

- Next.js App Router
- TypeScript
- Tailwind CSS

## Database

- Supabase PostgreSQL

## Package Management

- pnpm

---

# Development

Install:

````bash
pnpm install

Run:

pnpm dev

Start Supabase:

supabase start

Reset database:

supabase db reset
Testing

Test call ingestion:

node scripts/test-call.js

Expected:

{
  "success": true
}
Project Philosophy

StorageAI follows a simple rule:

Every feature should directly help a storage operator capture more rentals or reduce operating costs.

Avoid unnecessary complexity.

Build customer value first.


---

# CLAUDE.md

This one is the important one.

```markdown
# StorageAI Claude Context


## Project Overview

StorageAI is an AI-powered virtual leasing manager for independent self-storage facilities.

The product replaces repetitive front-desk leasing tasks by answering calls, handling renter questions, and guiding customers through rental completion.


## Current Development Phase

Prototype / MVP foundation.


## Completed Features

### Sprint 1
- Next.js application created
- Supabase configured
- Project structure established


### Sprint 2
- Database schema created
- Facility model created
- Call ingestion API created
- Calls stored successfully


### Sprint 3
- Operator dashboard created
- Live call activity displayed


## Current Database

Tables:

organizations

Represents StorageAI customers.


facilities

Represents storage locations.


calls

Represents inbound customer interactions.


## Demo Facility

UUID:

11111111-1111-1111-1111-111111111111


## Technology Rules

Use:

- Next.js App Router
- TypeScript
- pnpm
- Supabase
- Tailwind CSS


## Architecture Rules

1. Keep business logic separated from UI.

2. Database is the source of truth.

3. External integrations should use service abstractions.

4. Avoid premature abstraction.

5. Prefer working vertical slices over large frameworks.


## Product Priority

Optimize for:

- clear customer value
- demo capability
- simple sales story


Do not prioritize:

- unnecessary dashboards
- complex permissions
- advanced infrastructure
- premature scaling


## Current Goal

Build the first complete StorageAI customer workflow:

Inbound call
→ AI response
→ renter qualification
→ availability lookup
→ lease checkout
→ completed rental


## Development Style

Make small changes.

Test immediately.

Commit working milestones.

Document important decisions.
````
