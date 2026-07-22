# StorageAI System Architecture

## Current Architecture

Customer Event

      |
      v

Next.js API

/api/events/call

      |
      v

Supabase

      |
      v

calls table

      |
      v

Operator Dashboard

---

## Future Architecture

Inbound Phone Call

      |
      v

Voice AI Agent

      |
      v

StorageAI Orchestrator

      |
      +---- PMS API
      |
      +---- Twilio SMS
      |
      +---- Stripe
      |
      +---- Supabase

---

## Design Principles

1. Keep business logic server-side

2. Integrations behind service interfaces

3. Database is source of truth

4. Build vertical slices over infrastructure
