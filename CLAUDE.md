# StorageAI Claude Instructions

You are working on StorageAI.

Before modifying code:

Read:

- CLAUDE_HANDOFF_EVEREST.md
- docs/CLAUDE.md

StorageAI is an AI Virtual Leasing Manager for independent self-storage facilities.

Product positioning:

NOT:

- AI chatbot
- generic AI agent
- voice automation platform

YES:

- digital leasing employee
- captures rental opportunities
- reduces missed calls
- helps operators convert renters

Engineering rules:

1. Build one sprint at a time.
2. Do not expand scope.
3. Prefer simple business logic over premature AI complexity.
4. Do not introduce dependencies without justification.
5. Update documentation after meaningful milestones.

Current phase:

See the most recent `##` entry in `docs/BUILD_LOG.md` for the current phase, its goal, and full sprint/phase history — don't trust a phase number hardcoded here, it will drift the moment the next phase starts. (This file previously said "Sprint 14" long after the project had moved past Phase 30+; that staleness is exactly what this note exists to prevent from happening again.)

Do not implement future integrations yet:

- Vapi
- Stripe
- PMS APIs

until their sprint begins. (Twilio's sprint began Phase 38 — inbound voice webhook only, no AI/recording/routing yet; see `docs/telephony/TWILIO_SETUP.md`. Vapi is explicitly Phase 39, not sooner.)
