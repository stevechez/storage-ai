-- Phase 37: closes a Tech Debt Register item. `leads`, `units`, and
-- `conversations` predate the calls-based model established in Sprint 6
-- and have been fully unreferenced by application code ever since
-- (confirmed again immediately before this migration: 0 rows in all
-- three tables, zero code references anywhere in apps/web/src).
-- `conversations` depends on `leads` via a foreign key, so it's dropped
-- first; its two RLS policies (the only explicit policies anywhere in
-- the schema, on a table nothing queries) go with it.

drop table if exists conversations;
drop table if exists leads;
drop table if exists units;
