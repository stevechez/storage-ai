-- Phase 34 Task 2: every dashboard load filters `calls` by facility_id and
-- sorts by created_at. Postgres does not automatically index foreign key
-- columns, so this was a full table scan. Negligible at today's row counts
-- (confirmed via EXPLAIN ANALYZE — see PERFORMANCE_BASELINE.md), added now
-- so it isn't a surprise once real facilities have real call volume.

create index calls_facility_id_created_at_idx on calls (facility_id, created_at desc);
