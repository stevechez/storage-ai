# Development Guide

## Local Setup

Install:

pnpm install

Run:

pnpm dev

Database:

supabase start

Reset database:

supabase db reset

---

## Testing

Test call ingestion:

node scripts/test-call.js

Expected:

{
success:true
}

---

## Project Structure

apps/web

Main Next.js application

scripts

Developer testing scripts

supabase

Database migrations
