# Performance Baseline

Established Phase 34, 2026-07-24. Answers one question: can today's architecture comfortably support the first 20 founder facilities? Based on real measurements, not assumptions — every number below was captured directly (`curl` timing, `EXPLAIN ANALYZE`, Node timers), not estimated.

## Environment

- **Local:** production build (`next build` + `next start`) against local Supabase (`supabase_db_storage-ai`, Docker), on localhost — isolates app/DB performance from network latency
- **Live:** the deployed app at `https://storage-ai-sigma.vercel.app` against hosted Supabase — includes real network latency, at the time of measurement still running pre-Phase-34 code (the query fix below hadn't been deployed yet)
- Demo facility had 11 real call rows at measurement time

## Metrics collected

### Page load (local production build, warm — first request after server start excluded as cold-start noise)

| Route | Type | Time |
|---|---|---|
| `/` (landing) | static | ~5–13ms |
| `/facilities`, `/leads` | static | ~3–20ms |
| `/dashboard` — **before** query fix | dynamic | ~62–92ms |
| `/dashboard` — **after** query fix | dynamic | ~17–44ms |

### Page load (live production, real network + hosted DB, pre-fix code)

| Route | Time |
|---|---|
| `/` | 0.19–0.43s |
| `/dashboard` | 0.58–2.27s |

The gap between local (tens of ms) and live (hundreds of ms to low seconds) is network and cold-start, not app logic — see Observations.

### AI analysis (`analyzeTranscript()`)

10,000 calls in 5.12ms → **~0.5 microseconds per call**. This confirms what earlier phases already documented: this is rule-based regex matching, not a model call — it was never going to be the bottleneck, and measuring it directly rules it out with certainty instead of assumption.

### Manual call logging (`POST /api/events/call`, full round trip incl. DB insert)

~36–48ms warm (local), one-time ~740ms on the first request after server start (route compilation).

### Database query (`calls` filtered by `facility_id`, sorted by `created_at`)

- At 11 rows (today's real scale): **0.117ms**, sequential scan — the missing index (already known, see Tech Debt Register) makes zero measurable difference at this row count
- At 50,000 synthetic rows (inserted and cleaned up for this test, not left in the database): **158ms without an index** (sort spills to disk — `Sort Method: external merge`) vs **65ms with the index** added this phase — about 2.4x faster, and avoids the disk spill entirely

### Bundle size (landing page, production build)

~618KB uncompressed / ~184KB gzip of JS. Framework runtime (React 19 + Next.js 16) dominates this, not application code — normal for this stack, not a red flag.

## Observations

- **The app itself is fast.** Every local, warm measurement is under 100ms. Nothing in this codebase is doing slow work.
- **The gap between local and live numbers is network latency to hosted Supabase plus Vercel cold starts**, not application inefficiency. This is the actual lever for "the dashboard feels slow" if that's ever reported by a real operator — not application code changes.
- **The clearest real inefficiency found was a duplicate database query**, not a missing index (see Task 2 below) — the dashboard was fetching the exact same rows twice on every load.

## Known bottlenecks (fixed this phase)

1. **Duplicate query.** `getMorningReport()` and `getFollowUps()` issued byte-for-byte identical queries against `calls` for the same facility on every dashboard load, and `getMorningReport()`'s result was mostly dead code — of the 5 fields it computed, only `rentalRequests`/`pricingQuestions`/`availabilityRequests` were ever read; `highPriorityCount` was recomputed separately from already-fetched data, and `mediumPriorityCount`/`recommendedFollowUp`/`totalCalls`/`recentCalls` were read nowhere. Fixed: removed `getMorningReport()`, derived the same report synchronously from data `getFollowUps()` already fetched, via the existing pure `summarizeOpportunities()`. Also parallelized the (now single) calls query with the facility lookup, since neither depends on the other. Measured effect: ~81ms → ~34ms average warm dashboard load locally (~2.4x).
2. **Missing index on `calls.facility_id`.** Already known (Tech Debt Register, Phase 24B). Postgres doesn't auto-index foreign key columns. Added `calls_facility_id_created_at_idx (facility_id, created_at desc)` — matches the exact filter+sort shape every call site uses. No measurable effect at today's 11-row scale (confirmed, not assumed); confirmed real effect (~2.4x, avoids disk-based sort) at 50k-row synthetic scale.

## Deferred optimization opportunities (not built — no current evidence justifies them)

- **No generated Supabase `Database` types**, so most queries return implicitly-`any` rows. Real (see `TECH_DEBT_REGISTER.md`), but it's a type-safety issue, not a measured performance one — no evidence it costs anything at runtime.
- **Live dashboard latency (0.58–2.27s)** is dominated by network/cold-start, not app logic. No fix attempted this phase — Non-Goals explicitly exclude caching layers, Redis, and queues, which are the only things that would meaningfully change this, and there's no evidence yet (zero real pilot facilities) that it's actually a problem for an operator rather than a number that looks large in isolation.
- **`calls.select('*')`** fetches every column including `transcript` (potentially the largest column) even where only a few fields are used downstream. Not changed — no measured cost at today's scale, and selecting specific columns is a one-line change to make later if a real facility's data volume ever makes it worth doing.

## How to use this document

Re-run these same measurements (`curl -w "%{time_total}"` against warm requests, `EXPLAIN ANALYZE` on the real query shape, direct Node timing for pure functions) the next time performance is in question, and compare against the numbers above — that comparison, not a fresh guess, is what should drive any future optimization decision.
