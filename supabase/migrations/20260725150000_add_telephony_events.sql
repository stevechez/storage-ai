-- Phase 38: the first telephony event model. Deliberately decoupled from
-- `calls` — this only proves an inbound call reached the platform. No
-- facility_id (a single pilot number isn't yet mapped to a facility), no
-- transcript, nothing that would make it appear as a leasing opportunity
-- on any dashboard. That integration is explicitly Phase 39's job.

create table telephony_events (
	id uuid primary key default extensions.uuid_generate_v4(),

	call_sid text not null unique,

	from_number text,
	to_number text,
	direction text,
	call_status text,

	received_at timestamptz default now()
);

alter table telephony_events enable row level security;

grant all privileges on telephony_events to service_role;
