# Workspace Architecture & Customer Lifecycle

Phase 43. Documentation and planning only — nothing in this document has been implemented, and
per the phase's own constraint, nothing here required touching the database schema, auth,
routing, the dashboard, or either existing facility to write. Where an example needed real
numbers, it uses the two facilities that actually exist (Founder Pilot Facility, Harbor Self
Storage) rather than invented ones.

## Workspace principles

The constitution the rest of this document — and every future workspace decision — should be
evaluated against:

1. **Demo data must never appear in a customer workspace.** Not "shouldn't," must not. The demo
   workspace's entire value is that it's safe to show a prospect; the moment it can leak into
   what a real operator sees, the trust that Phase 40's marketing site is built on is broken.
2. **Internal workspaces may contain unstable or experimental data.** They are explicitly *not*
   held to the demo workspace's presentability bar, and not held to the customer workspace's
   real-usage integrity bar either. Messy is acceptable here by design.
3. **Customer workspaces begin empty by default.** No seeded data, no fake opportunities, ever,
   unless a human deliberately opts in (see principle 4).
4. **Sample data is optional and removable.** If a customer workspace ever shows sample data, it
   must be clearly marked as sample and it must be possible to remove it without a code change —
   the opposite of today's dashboard, which has no way to distinguish sample from real at all.
5. **Workspace classification is metadata, not infrastructure.** This is the direct justification
   for section 2's rejection of a separate `workspaces` table: classification is a column value
   that changes what the UI shows, not a structural boundary that changes how data is stored,
   queried, or owned. If a future decision ever needs classification to *become* infrastructure
   (separate databases, separate deployments, hard isolation), that's a different, much larger
   problem than this document is solving, and should be named as such rather than smuggled in
   under "workspace architecture."
6. **Every roadmap phase must leave production deployable.** Not "the roadmap, taken as a whole,
   eventually gets there" — each individual phase in section 7, on its own, with nothing after it
   ever built, must leave the system fully working. This is why 44a (schema + classification)
   and 44b (customer empty-state) are separate phases rather than one, and why 44d/44e are
   explicitly gated on real evidence rather than scheduled by default.

## 1. Current architecture (verified against the real system, not recalled)

**There is no workspace concept today.** `facilities` is a flat table; every row is treated
identically by every code path except one hardcoded special case:

```
dashboard/page.tsx:
  facility.id === DEMO_FACILITY_ID ? <DemoBanner /> : null
```

That single equality check is the *entire* current mechanism for distinguishing "this is demo
data" from anything else. There is no `workspace_type`, no tenant classification, no concept of
"internal" vs. "customer" anywhere in the schema or code.

**What actually exists right now, concretely:**

| Facility | `facilities.id` | What it actually is today |
|---|---|---|
| Lonestar Self Storage | `11111111-1111-1111-1111-111111111111` (`DEMO_FACILITY_ID`) | The one facility with special-cased code treatment — shows `DemoBanner`, is the dashboard's default when no `?facility=` param is given. Public marketing-site demo. |
| Founder Pilot Facility | `7f35d8c8-deeb-40aa-b778-1981085cc0e8` | A real facility row with real telephony (Phase 38/39), used for founder testing. No code treats it specially — the `PILOT_FACILITY_ID` constant that once referenced it was deleted in Phase 41. |
| Harbor Self Storage | `d483ca9f-b87b-4d05-9fd8-b9bda83862b3` | A real facility row with real telephony (Phase 42), created as a dry run to prove second-facility onboarding. Not a real paying customer, despite having entirely real infrastructure. No code treats it specially either. |

All three are structurally identical rows. The only thing separating "demo," "internal
dogfooding," and "would-be customer" is which UUID a human currently has in mind — not anything
the system itself knows or enforces. That's the actual problem this phase exists to solve.

**Access model:** no authentication exists. `/dashboard?facility=<uuid>` is the entire access
control mechanism — an unguessable link is the credential (deliberate, documented trust model,
`docs/operations/ONBOARDING_RUNBOOK.md`). There is no concept of a user, a session, or a role.
The `profiles` table exists in the schema but is fully unreferenced
(`docs/operations/TECH_DEBT_REGISTER.md`) — scaffolding for an auth system that was never built.

**Routing:** tenant resolution for phone calls works correctly and is unaffected by anything in
this document — `getFacilityByPhoneNumber()` (Phase 41) resolves a call to a facility by its
`twilio_phone_number`. That mechanism is sound regardless of whether a facility is later
classified as demo, internal, or customer; this phase adds a classification on top, it doesn't
change routing.

## 2. Desired architecture

Introduce one new idea: a **workspace type**, as a property of a facility (not a new table above
it — see "Why not a separate `workspaces` table" below). Three values:

### Demo Workspace
**Purpose:** sales and marketing. **Characteristics:** exactly one, permanent, seeded with
realistic-but-fake data curated for good screenshots, never touched by development or testing,
never linked to any real facility. This is what `DEMO_FACILITY_ID` already is in practice — this
phase gives it a real, declared type instead of being one hardcoded ID equality check.

### Internal Workspace
**Purpose:** development, regression testing, dogfooding, dry runs. **Characteristics:** can and
will contain messy data — half-finished test calls, fictional operators, debugging artifacts.
Both Founder Pilot Facility and Harbor Self Storage belong here. Explicitly *not* held to a "looks
presentable" bar the way the demo workspace is.

### Customer Workspace
**Purpose:** a real, paying (or piloting) operator. **Characteristics:** starts genuinely empty —
no seeded data, no fake opportunities. The dashboard's empty state for a brand-new customer
workspace should read as an onboarding moment, not an absence:

```
Phone Connected ✓
AI Online ✓
Today's Calls: 0
Ready for your first customer.
```

versus today's generic "No rental opportunities need attention right now" — which reads
identically whether telephony was never configured, is broken, or is working perfectly and simply
hasn't received a call yet. That ambiguity is itself a real gap (related to Phase 42's Friction
Log finding that a customer has no way to see their own connection status) but implementing the
new empty state is Phase 44+ work, not this one.

**No customer workspace exists yet.** Neither Founder Pilot Facility nor Harbor Self Storage
qualifies — both are internal, by their own nature (testing and a dry run, respectively). The
customer workspace type is being designed ahead of having one, which is exactly right for a
one-page classification scheme; it would be wrong for anything heavier.

### Why not a separate `workspaces` table

The obvious-looking alternative — a new `workspaces` table, with `facilities.workspace_id`
pointing into it — was considered and rejected for now. `organizations` already sits above
`facilities` in the schema and has always been 1:1 with them in practice; adding a second
containing table on top would introduce a real layer of indirection (a new join, a new foreign
key, a new thing that can be inconsistent with the facility it describes) to express something a
single enum column says just as well today. Revisit this only if a real need for many facilities
under one workspace, or one facility spanning workspace boundaries, ever actually appears — there
is no evidence of that today, and building for it now would be exactly the kind of premature
structure this project has consistently avoided.

## 3. Workspace lifecycle

The real, current, already-proven mechanics (Phase 41/42), with the one new step
(workspace-type assignment) added at the point it naturally belongs:

```
Signup (early-access form, or a direct founder conversation)
        │
        ▼
Facility + organization created  (scripts/onboard-facility.mjs)
        │   workspace_type assigned here: 'customer' for a real signup,
        │   'internal' for anything founder-created for testing/dogfooding
        ▼
Phone number purchased + Vapi assistant created
        │   (docs/operations/CUSTOMER_IMPLEMENTATION_RUNBOOK.md, unchanged by this phase)
        ▼
Dashboard becomes viewable
        │   empty state rendering depends on workspace_type:
        │     'demo'     → permanent seeded data, never empty
        │     'internal' → today's generic empty state is fine, no promises made to anyone
        │     'customer' → the "Phone Connected / AI Online / Ready for your first
        │                   customer" state described above (Phase 44+, not built yet)
        ▼
Optional sample data, for a 'customer' workspace only, if a facility wants to see the
product "populated" before their first real call
        │   must be clearly marked as sample and removable — never silently mixed with
        │   real data the way today's dashboard has no way to distinguish them at all
        ▼
First real call → real opportunities appear, sample data (if any) removed
```

Nothing about the *technical* provisioning steps changes — this lifecycle sits on top of the
already-working process, it doesn't replace any part of it.

## 4. Data ownership

| Level | Owns | Examples today |
|---|---|---|
| **Platform** | Anything shared across every facility regardless of type | `VAPI_WEBHOOK_SECRET`, the shared Vapi system prompt template, the webhook routes themselves, the Twilio account |
| **Workspace** (= facility, per section 2) | Everything specific to one tenant | `facilities` row itself, `organizations` row, `twilio_phone_number`, `vapi_assistant_id`, its own `calls` and `conversation_transcripts` |
| **User** | Nothing yet — no user-level data exists | N/A. `profiles` exists in schema, unreferenced. This row is intentionally empty; see Roles below. |

Facility-scoped data ownership already works correctly and is unaffected by this document —
`facility_id` foreign keys already partition `calls`/`conversation_transcripts` correctly (Phase
41). What's missing is a *workspace-level* property (the type itself) and, eventually, a
user-level layer that doesn't exist at all yet.

## 5. Roles (documentation only — no auth system exists to attach these to)

Naming a target, not describing something implementable today. All four require real
authentication to mean anything, which doesn't exist (`docs/operations/TECH_DEBT_REGISTER.md`'s
"no server-side check that a submitted `facilityId` matches an authenticated identity" is the
same gap, from a different angle).

- **Founder** — today, this is "has direct Supabase/Vercel/Twilio/Vapi access." Full access to
  everything, across every workspace type. Not an in-app role at all currently — it's literally
  Steve's own infrastructure credentials.
- **Internal Admin** — a hypothetical future teammate with Founder-level access to internal and
  demo workspaces, without necessarily needing raw database credentials. No evidence this is
  needed yet (there is no team beyond the founder).
- **Customer Admin** — today, this is "holds the private dashboard link" for exactly one
  workspace. The operator (Joe, in the Phase 42 exercise).
  This does not exist. Full stop.

**Why this section stays this thin:** inventing a permissions matrix for roles with no
authentication system to enforce them would be designing controls for a door that isn't built
yet. The moment real auth work starts, this section is where that work should begin from — not
before.

## 6. Migration strategy

Fully additive, zero behavior change until deliberately turned on, and reversible at every step:

1. **Add `facilities.workspace_type`** (nullable, or defaulted to `'internal'`) via a normal
   migration — the same kind of additive `alter table` already used for `twilio_phone_number`/
   `vapi_assistant_id` in Phase 41. No application code reads it yet; nothing changes.
2. **Backfill the three existing rows**, as one-time data (in the same migration, same pattern as
   Phase 41's pilot-number backfill):
   - Lonestar Self Storage (`DEMO_FACILITY_ID`) → `'demo'`
   - Founder Pilot Facility → `'internal'`
   - Harbor Self Storage → `'internal'` (it is a dry run, not a real customer, regardless of how
     complete its infrastructure is — this classification matters and is easy to get wrong by
     assuming "has a real phone number" implies "is a real customer")
3. **Only after that,** teach the dashboard to branch on `workspace_type` for its empty state —
   a small, isolated, purely additive UI change with no effect on any facility already receiving
   real calls (their dashboards aren't empty, so the new empty-state branch never triggers for
   them).
4. Every step above can be deployed alone, and the system is fully working production software
   after each one — steps 1–2 alone accomplish the *classification*, which is most of this
   phase's actual value, before any UI work happens at all.

At no point does an existing facility's behavior change unless a human deliberately reclassifies
it — reclassification is a data update, not a code deploy.

## 7. Implementation roadmap (Phase 44+, not this phase)

Ordered so production is fully working and deployable after any single phase — none require
rewriting existing code, only additive work:

**Phase 44a — Schema + classification.** Add `workspace_type`, backfill the three real rows as
described above. Zero visible change to anyone. Smallest possible unit of real value: the system
now *knows* what each facility is, even before anything acts on that knowledge.

**Phase 44b — Customer empty-state.** Dashboard renders the "Phone Connected / AI Online / Ready
for your first customer" state specifically for `workspace_type = 'customer'` facilities with zero
calls. Isolated, additive, doesn't touch the demo or internal experience at all. Deploy alone.

**Phase 44c — Removable sample data for customer workspaces** (only build if a real operator asks
for a populated-looking dashboard before their first real call — no evidence this is needed yet;
don't build ahead of that signal, matching this project's standing discipline).

**Phase 44d — Internal-facing workspace listing** (only build once there are enough facilities
that "which ones are real customers" stops being obvious from memory — not true today, with three
total facilities).

**Phase 44e (much later, separately gated) — Real authentication and the Roles section above.**
Deliberately the last item and deliberately not bundled with the rest of this roadmap — it's a
materially larger initiative (session management, login, per-role authorization checks
everywhere `facilityId` is currently trusted blindly) that deserves its own phase and its own real
trigger condition, not a rider on workspace classification.

## What this phase deliberately did not do

No schema changed. No code changed. No facility was reclassified. The three real facilities keep
behaving exactly as they do today. This document exists so that when Phase 44 starts, it begins
from a decision that's already been made carefully, instead of being designed under the time
pressure of also shipping something.
