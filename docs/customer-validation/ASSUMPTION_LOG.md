# Assumption Log

Every sprint from 1 through 17 was built on assumptions, not evidence — that's exactly the gap Sprint 18 exists to close. Listed below are the actual load-bearing assumptions behind what's been built so far, pulled from the real product decisions in each sprint (not invented for this file). Evidence and Decision columns are blank until a real operator conversation fills them in.

| Assumption | Where it came from | Evidence | Decision |
|---|---|---|---|
| Operators miss after-hours/inbound rental calls often enough that it materially hurts revenue | Founding thesis (`CLAUDE_HANDOFF_EVEREST.md`), the entire "missed call" wedge | | |
| A deterministic, rule-based follow-up recommendation creates enough value without a real conversational AI or voice agent | Sprint 6 architecture boundary — explicitly no LLM, no voice AI | | |
| The daily workflow shape (Good Morning → Today's Actions → Active Opportunities → Recent Results → Revenue Impact) matches how an operator actually wants to work each day | Sprints 11–13, Operator Command Center | | |
| Operators will trust and use a suggested response draft rather than writing their own from scratch | Sprint 9, Customer Response Assistant | | |
| A single flat assumed monthly unit rate is a credible enough stand-in for real revenue impact, without PMS pricing data | Sprint 15, Revenue Impact | | |
| Independent / family-owned operators (not enterprise REITs) are the right initial customer, not just an easier one to reach | Sprint 17, Ideal Customer Profile | | |
| Operators don't need PMS integration to get real value from StorageAI in its current form | Standing "no PMS integration" boundary repeated in every sprint's Out of Scope | | |
| The follow-up lifecycle (new → contacted → converted → lost) matches how an operator actually thinks about a lead, rather than a model imposed on them | Sprint 8, Follow-Up Engine | | |

## How to use this

After each operator conversation (logged in `OPERATOR_FEEDBACK.md`), come back here and fill in:

- **Evidence** — what they actually said or did that bears on this assumption, quoted or closely paraphrased
- **Decision** — one of: `Confirmed`, `Challenged`, `Partially confirmed`, or `Needs more data` — plus what that means for what gets built next

An assumption with no rows filled in after several conversations is itself a signal — it may mean the conversations aren't surfacing it, or that it's not actually decision-relevant and can be dropped from this list.
