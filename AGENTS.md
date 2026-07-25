# IntelliLease Development Guidelines

## General Rules

- Keep changes focused.
- Do not introduce unnecessary dependencies.
- Prefer simple implementations.
- Maintain TypeScript correctness.

## Before Coding

Understand:

- current architecture
- existing database schema
- existing patterns

Do not create new patterns without a reason.

## Database Changes

All schema changes must use Supabase migrations.

Never modify production data directly.

Document significant schema decisions.

## API Routes

API routes should:

- validate input
- return predictable JSON
- handle errors explicitly

## Components

Avoid creating components until reuse is clear.

Prefer simple pages during MVP development.

## Testing

Before completing work:

1. Run application
2. Test affected feature
3. Verify database changes

## Git

Every completed sprint should include:

- screenshot
- documentation update
- commit
- tag

## Product Principle

The question for every feature:

"Does this help a storage operator rent more units or save money?"

If no, reconsider.
