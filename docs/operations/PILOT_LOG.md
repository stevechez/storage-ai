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

## Founder Pilot Facility — 2026-07-25 (founder verification session)

**What happened:**
Four more real calls to the pilot number, working through Phase 39's Task 5 checklist: a rental+timing question (12x12, next month), a direct pricing question ("How much do you charge for a 10 by 10?"), an office hours question, and — within that same office-hours call — an abrupt hangup right after the assistant asked for a callback number.

**Customer questions:**
Unit size + timing (twice, 12x12 and 14x14), direct pricing, office hours.

**Customer confusion:**
None observed.

**Requested improvements:**
None.

**Bugs discovered:**
None new — the `duration_seconds` bug from the first call (see the entry above and `BUILD_LOG.md`) was already fixed before these calls happened.

**Follow-up required:**
None. Two checklist scenarios remain genuinely untested (a bare unit-availability question, and call-length extremes) — see `docs/telephony/VAPI_SETUP.md` §8 for why that was judged sufficient to stop on rather than mechanically completing every box.

### Retrospective

- **What worked?** The assistant held its constraints across every scenario, not just once: never quoted a price, never stated office hours it didn't have, always deferred to a human follow-up while still collecting useful contact/timing info. The hangup didn't lose data — the partial transcript still landed correctly on the dashboard as a real, if incomplete, opportunity.
- **What surprised us?** How consistently the deferral language stayed close to the system prompt's own wording across independent calls — "I don't have pricing details on hand right now, but I can have someone from the facility call you back" showed up almost verbatim more than once, without being scripted turn-by-turn.
- **What confused the operator?** N/A — founder testing, not a real operator/customer.
- **What created excitement?** Confirming the assistant doesn't just avoid mistakes on easy questions — it held the same line under a direct, pointed pricing ask, which is the scenario most likely to tempt a bad answer.
- **What should change?** Nothing yet. The intent classifier labeling a pure pricing question as "rental" (because "storage unit" contains the word "unit," which the rule-based classifier checks first) is worth knowing about, not fixing — the *recommended action* comes out correct regardless, which is what actually matters operationally.
- **What should remain unchanged?** Stopping the checklist once the real question ("does it stay in bounds under pressure, across varied real calls?") was answered, instead of treating the checklist as a mechanical gate. Four varied real calls were better evidence than four more of the same.

---

_(add the next entry above this line, most recent first)_
