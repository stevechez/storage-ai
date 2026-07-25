# Pilot Log

One structured place for every meaningful interaction with a real founder facility — combines what would otherwise have been two overlapping files (an observation log and a retrospective template): both are "what happened with a real pilot," just at different points in the same interaction.

This is chronological and per-entry, not a CRM. No entries exist yet — none are invented here; copy the template below the first time there's a real pilot interaction to log.

---

## [Facility name] — [Date]

**What happened:**
(Plain description — a call reviewed together, a question they asked, a bug they hit, a check-in call)

**Customer questions:**

**Customer confusion:**
(Where the product didn't explain itself — this is more valuable than a feature request)

**Requested improvements:**
(What they specifically asked for, unprompted)

**Bugs discovered:**
(Reference the specific call/facility ID if relevant, so it's reproducible)

**Follow-up required:**
(What you owe them, and by when)

### Retrospective (fill in after the interaction, not during)

- What worked?
- What surprised us?
- What confused the operator?
- What created excitement?
- What should change?
- What should remain unchanged?

---

## Founder Pilot Facility — 2026-07-25

**What happened:**
First real end-to-end voice call through the Phase 39 Vapi integration. Steve called the pilot number (+18314329642) and asked about a 10x10 storage unit for next month. The Vapi assistant handled the conversation, and the transcript flowed through the existing analysis pipeline (`logCall()` → `analyzeTranscript()`) exactly like a manually-logged call.

**Customer questions:**
Asked about a 10x10 unit, timing "next month."

**Customer confusion:**
None observed — single, clear question.

**Requested improvements:**
None from this call.

**Bugs discovered:**
`duration_seconds` on the `conversation_transcripts` row (`vapi_call_id: 019f98fe-5c6c-744f-bcf0-e69d14289dd4`) came back `null`. Root cause: Vapi's real webhook payload puts `startedAt`/`endedAt`/`durationSeconds`/`phoneNumber` directly on `message`, not nested under `message.call` as Vapi's own docs suggested. Fixed in `lib/vapi/webhook.ts`, backfilled this row's duration from its stored `raw_payload`, added a regression test from the real payload. Full writeup in `docs/BUILD_LOG.md`'s "Phase 39 follow-up #2."

**Follow-up required:**
None — continue working through the remaining founder verification scenarios in `docs/telephony/VAPI_SETUP.md` §8 (availability question, pricing question, office hours, an unanswerable question, a hangup, a very short call).

### Retrospective

- **What worked?** The whole pipeline, end to end, on the first real call — transcript capture, analysis, dashboard rendering all correct. The assistant itself stayed on-script (didn't quote pricing or confirm availability, per its system prompt).
- **What surprised us?** Vapi's actual webhook payload shape didn't match its own documentation closely enough to trust without verifying against a real delivery — worth remembering for any future Vapi API work, not just this one field.
- **What confused the operator?** N/A — this was founder testing, not a real operator/customer interaction yet.
- **What created excitement?** Watching a real phone call turn into a correctly-analyzed dashboard entry with zero manual data entry, for the first time in the product's history.
- **What should change?** Nothing about the pipeline itself yet — one real call isn't enough evidence. Keep working through the remaining test scenarios before drawing conclusions.
- **What should remain unchanged?** The decision to store `raw_payload` as `jsonb` from the start — it's the only reason today's bug was a fast, confident fix instead of a guess.

---

_(add the next entry above this line, most recent first)_
