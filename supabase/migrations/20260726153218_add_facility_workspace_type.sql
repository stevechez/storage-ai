-- Phase 44a: minimum infrastructure for workspace classification (see
-- docs/architecture/WORKSPACE_ARCHITECTURE.md). Metadata only — nothing
-- in application code branches on this yet. Behavior changes begin in
-- Phase 44b.

alter table facilities
	add column if not exists workspace_type text not null default 'customer';

alter table facilities
	drop constraint if exists facilities_workspace_type_check;

alter table facilities
	add constraint facilities_workspace_type_check
	check (workspace_type in ('demo', 'internal', 'customer'));

-- Backfill the real, known facilities. Idempotent — re-running sets the
-- same value again, not an error. Harbor Self Storage is classified
-- 'internal', not 'customer': it's a Phase 42 dry run with real
-- infrastructure, not an actual paying operator — see
-- WORKSPACE_ARCHITECTURE.md's migration strategy section for why this
-- distinction matters.
update facilities set workspace_type = 'demo'
	where id = '11111111-1111-1111-1111-111111111111';

update facilities set workspace_type = 'internal'
	where id = '7f35d8c8-deeb-40aa-b778-1981085cc0e8';

update facilities set workspace_type = 'internal'
	where id = 'd483ca9f-b87b-4d05-9fd8-b9bda83862b3';
