# Pilot Success Criteria

Phase 40. Answers a different question than `SUCCESS_METRICS.md` does. That file maps every number to the exact function that computes it — this file says what has to actually be true for the first real pilot to count as a success. Read them together; don't duplicate one into the other.

## Operational

The plumbing works under real, unscripted use — not just verified calls from the founder.

- Real inbound calls are answered and produce a transcript, with no manual intervention
- Leads (renter contact info + what they need) are captured on calls where the renter provides them
- Every captured call gets a `analyzeTranscript()` read (intent, unit size if mentioned, priority, recommended action) — see `SUCCESS_METRICS.md`'s "Calls processed" / "Calls requiring follow-up" rows for where these numbers live

**Bar:** a real caller who isn't the founder testing it produces a working end-to-end record, at least once, without anyone needing to intervene.

## Business

The thing IntelliLease exists to prevent — a missed call becoming a missed rental — measurably didn't happen at least once.

- At least one qualified renter opportunity (a real person who wanted a unit, not a wrong number or spam call) was captured that the operator confirms they would have otherwise missed
- The operator actually completed at least one follow-up prompted by the dashboard (see `SUCCESS_METRICS.md`'s "Follow-ups completed" row)
- Ideally, at least one unit rented that the operator attributes at least partly to a call IntelliLease captured — this is the real bar, but it's the operator's word that counts here, not a formula. `estimateRevenueImpact()`'s numbers are an estimate at an assumed rate, explicitly not proof of real revenue (see the disclosure already on the dashboard's Revenue Impact card) — don't treat the dashboard's dollar figure as evidence on its own.

**Bar:** the operator can point to one specific real interaction and say "that would have been missed."

## Product

Whether the operator actually trusts and uses it, not just whether it technically functioned.

- The operator looks at their dashboard without being prompted to — not just when the founder asks them to check it
- When asked directly, the operator says the AI's read of a call (intent, priority, recommended action) matched what actually happened — this is `SUCCESS_METRICS.md`'s own stated definition of success, worth restating here because it's the criterion that actually matters most: "the number that matters is whether the operator, looking at their own dashboard, says the analysis matched what actually happened on the call"
- The operator doesn't need the founder to explain what a dashboard element means a second time

**Bar:** the operator would be annoyed, not indifferent, if the pilot ended and they lost access.

## What this is not

Not a launch gate for opening up beyond one pilot facility — that's a separate decision requiring its own evidence, not a checkbox here. Not a scorecard to hit every box on before calling the pilot worthwhile; a strong "yes" on Product with a weak Business result (e.g., no real rental yet, but the operator genuinely trusts what they're seeing) is still a real, useful signal, just an earlier-stage one. Log the actual outcome — whichever it is — in `docs/operations/PILOT_LOG.md`, not just the parts that look good.
