# Outreach Message & Discovery Questions — Sprint 17 / Sprint 21 / Sprint 22

Goal: start conversations and learn. Not close deals. As of Sprint 22, this is still the goal — no real operator conversation has happened yet across four sprints aimed at exactly this (17, 18, 21, 22). More document refinement won't substitute for actually having one; this file is as ready as it needs to be.

## The live conversation script

Sprint 17's email template below still works for getting the 15 minutes. But for the actual conversation, use this sharper framing (refined across Sprints 21 and 22) — it's a genuine improvement, not just an alternative:

**Rule #1: you are not selling IntelliLease. You are investigating storage operations.** If they ask what you're building, show them. If they don't ask, that's fine — the conversation was still a success.

**Opening** (said out loud, in person or on the phone — more authentic than reading a script):

> Hi, my name is Steve. I'm a software engineer researching how independent self-storage facilities handle after-hours rental calls. I'm not selling anything today — I was hoping to ask a few questions about how your operation works. Would you have five minutes?

**Discovery questions** — conversational, not a checklist to read verbatim:

1. How many locations do you operate?
2. Who normally answers the phone?
3. What happens after hours?
4. Do renters leave voicemails?
5. How quickly do you usually return those calls?
6. What's the biggest headache around phone calls?
7. Have you ever wondered how many rentals you lose after closing?
8. If you could magically automate one part of handling calls, what would it be?
9. What software do you currently use? (added in Sprint 22 — reveals their PMS and how automated their world already is)
10. Have you ever looked for a solution to this problem before? (added in Sprint 22 — tells you if this is a felt problem or a hypothetical one)

Ask naturally, don't rush, and follow whatever's actually interesting rather than marching through the list. Then stop talking.

**Only if they ask "why are you asking?"**, answer:

> I'm building software to help independent storage operators understand and prioritize renter calls. I'm still validating whether I'm solving the right problem.

No pitch. No mention of AI. No dashboard. No pricing.

**Optional demo — only if they ask.** Then, and only then:

> Would you mind if I showed you something I've been working on?

That question, asked after they've asked first, is a completely different psychological moment than leading with a demo.

**The question to hold in your head throughout:** "What does this operator know that I don't?" That's the job this sprint — curious, not persuasive.

**Ask yourself after every conversation** (Sprint 22):

- What surprised me?
- What assumption was wrong?
- What language did they naturally use?
- What words did they never use?
- What problem felt emotional?
- Would I change the homepage because of this conversation?

**When 5 conversations are done**, the deliverable isn't more templates — it's a synthesis: a summary of all conversations, the top five insights, the top three product changes operators actually suggested, and a recommendation for the next sprint based entirely on this evidence, logged in `OPERATOR_FEEDBACK.md`'s Sprint 21 summary section. No feature work should start until that review happens.

## Outreach message (email or LinkedIn DM)

Keep it short — this is a template, adjust the specifics (their facility name, how you found them) before sending:

> Subject: Quick question about after-hours calls at [Facility Name]
>
> Hi [Name],
>
> I'm building software for independent self-storage operators and I'm trying to understand a specific problem before I build more of it: what happens at facilities like yours when a rental call comes in after hours, or while whoever's on desk is already helping someone.
>
> I'm not trying to sell you anything on this email — I'd genuinely like 15 minutes to ask a few questions about how you handle it today. If it's useful, I'll show you what I've built; if not, no pressure either way.
>
> Would you have 15 minutes this week or next?
>
> [Your name]

Notes:
- The subject line names their specific pain, not the product.
- "Not trying to sell you anything" is doing real work here — it lowers the reply bar significantly for a cold message to a busy owner-operator.
- If they ask what it is before agreeing to talk, one line is enough: "It answers and understands rental calls you'd otherwise miss, and tells you what to do next." Don't demo in the outreach message.

## Discovery questions

Ask in roughly this order — each one earns the right to ask the next:

1. **Current process** — "How do you handle calls after hours today?"
2. **Lost revenue** — "How often do you think you miss rental opportunities because nobody picked up?"
3. **Staffing** — "Who handles inbound calls day to day?"
4. **Existing tools** — "What software do you currently use to manage rentals?" (this tells you their PMS, and how automated their world already is)
5. **Pain** — "What's the most frustrating part of handling new rental inquiries?"

Follow-ups worth having ready, depending on their answers:

- If they say they rarely miss calls: "How would you know if you did?" (Most operators genuinely don't know — that's the gap.)
- If they mention a PMS: "Does it do anything with a call once it comes in, or is that all still manual?"
- If they seem engaged: "If a call comes in tonight after you've gone home, what happens to it right now?"

## After the call

Record, per conversation, in `PROSPECT_LIST.md`:
- What they said their current process actually is (not what you assumed)
- Any objection, in their words, not paraphrased into your own framing
- Whether the pain they described matches the Ideal Customer Profile's assumption, or contradicts it

The founder validation question for this sprint is specifically: *did something here change what you should build next?* Objections and surprises are the valuable output, not agreement.
