-- Phase 39 Task 3: raw conversation storage, deliberately separate from
-- `calls`. This is the unprocessed artifact from Vapi (full transcript,
-- call metadata, the raw webhook payload) — `calls.transcript` still holds
-- the version that actually feeds analysis, kept identical to what a
-- manually-logged call looks like (Task 4). Keeping the raw artifact
-- separately means a parsing bug or a Vapi schema change never loses data
-- that can't be reprocessed later.

create table conversation_transcripts (
	id uuid primary key default extensions.uuid_generate_v4(),

	vapi_call_id text not null unique,
	facility_id uuid references facilities(id),

	caller_phone text,
	transcript text,
	duration_seconds integer,
	ended_reason text,

	raw_payload jsonb not null,

	received_at timestamptz default now()
);

alter table conversation_transcripts enable row level security;

grant all privileges on conversation_transcripts to service_role;
