# StorageAI — Sprint 9 Claude Handoff

## The Customer Response Assistant

**Status:** Approved — Awaiting Sprint 8 Completion

**Sprint Type:** Operator Productivity Capability

**Implementation Owner:** Claude Code (Sonnet 5)

**Product Owner:** Founder

---

# StorageAI North Star

Every sprint must earn the right to exist by moving us one step closer to the first paying storage operator.

StorageAI is not an AI demo.

StorageAI is a digital leasing manager for independent self-storage facilities.

Every feature must improve one or more of:

- capturing more rental opportunities,
- responding faster,
- reducing operator workload,
- improving leasing conversion,
- making StorageAI easier to sell.

If a feature does not support these outcomes, it does not belong in the MVP.

---

# Sprint Goal

Help a storage operator respond faster to identified leasing opportunities.

After Sprint 9, StorageAI should not only answer:

> "Who needs attention?"

It should also answer:

> "What should I say next?"

The operator remains in control.

StorageAI assists. It does not replace human judgment.

---

# Customer Problem

Storage operators frequently lose rental opportunities because:

- calls happen after hours,
- follow-up is delayed,
- responses are inconsistent,
- owners are busy running the facility.

Once StorageAI identifies a promising renter, the next operational bottleneck is response quality and speed.

---

# Current State Before Sprint 9

After Sprint 8:

```text
Call

↓

Transcript

↓

Leasing Opportunity

↓

Priority

↓

Follow-Up Status

↓

Outcome Tracking
```

StorageAI understands opportunities and tracks what happens.

---

# Sprint 9 Capability

Add a response assistance layer.

New workflow:

```text
Leasing Opportunity

↓

Suggested Response

↓

Operator Review

↓

Human Sends Response

↓

Customer Conversation
```

---

# Product Boundary

This sprint is:

✅ Response assistance

This sprint is not:

❌ AI chatbot
❌ Voice agent
❌ Automated outreach
❌ SMS platform
❌ Email platform

The operator remains the sender.

---

# Functional Requirements

Given a LeasingOpportunity, StorageAI should generate a useful suggested response.

The response should consider:

- customer intent,
- unit size,
- timeline,
- priority,
- recommended action.

Example:

Input:

```text
Customer wants a 10x10 unit this weekend.
```

Output:

```text
Hi John,

Thanks for reaching out about a 10x10 storage unit.

We would be happy to help you find the right option
for your move this weekend.

I can provide pricing and availability details.

How can we help?
```

The goal is not perfect copywriting.

The goal is reducing operator effort.

---

# Domain Model

Introduce a response concept.

Possible shape:

```ts
type ResponseDraft = {
	opportunityId: string;

	channel: 'phone' | 'sms' | 'email';

	message: string;
};
```

The exact implementation may evolve.

Avoid over-modeling.

---

# Architecture Requirements

The response generation layer must remain replaceable.

Initial implementation:

```text
Business Rules / Templates

↓

Response Generator

↓

Response Draft
```

Future possibility:

```text
LLM Extraction / Generation

↓

Response Generator

↓

Response Draft
```

The rest of StorageAI must not depend on how responses are generated.

---

# Implementation Guidance

Prefer:

- deterministic templates,
- reusable business rules,
- simple functions,
- testable behavior.

Do not introduce:

- AI SDK,
- external APIs,
- prompt infrastructure,
- vector databases,
- third-party messaging providers.

The first version should prove workflow value.

---

# UI Requirements

Add a response display component.

The operator should see:

```text
Customer Need

10x10 Unit


Timeline

This Weekend


Suggested Response

"Thanks for reaching out..."


[Copy Response]
```

Maintain existing StorageAI design language:

- clean cards,
- clear labels,
- simple hierarchy,
- professional operations software feel.

---

# Avoid AI Theater

Do not display:

- confidence scores,
- model information,
- AI-generated badges,
- probabilities,
- technical explanations.

The operator does not care how it was generated.

They care whether it helps them rent units.

---

# Expected Files

Likely areas:

```text
apps/web/src/types/leasing.ts

apps/web/src/lib/storage/responses.ts

apps/web/src/components/storage/response-draft.tsx
```

Additional supporting files are acceptable if necessary.

Do not refactor unrelated areas.

---

# Out of Scope

Do not build:

- automated SMS sending,
- automated email sending,
- phone automation,
- Twilio integration,
- Vapi integration,
- PMS integrations,
- payment workflows,
- tenant portals,
- CRM pipeline features.

Those require separate validation.

---

# Testing Requirements

Before completion:

- Add tests for response generation behavior.
- Run Vitest.
- Run TypeScript.
- Run ESLint.
- Verify UI rendering.

Document:

- design decisions,
- changed files,
- any tradeoffs.

---

# Definition of Done

Sprint 9 is complete when:

- StorageAI generates useful leasing responses.
- Responses are tied to real opportunities.
- Operators can review responses before sending.
- The workflow reduces response friction.
- No unnecessary automation complexity is introduced.
- Tests pass.
- Documentation is updated.

---

# Sprint Completion Checklist

Before closing Sprint 9:

☐ Git commit created
☐ Milestone recorded in BUILD_LOG.md
☐ Screenshot captured
☐ Design decisions documented

---

# Founder Validation

Before Sprint 10 begins:

Ask:

> Does this implementation move StorageAI closer to the first paying storage operator?

A sprint earns the right to exist only when it solves a real operational problem.

Every sprint must earn its place.
