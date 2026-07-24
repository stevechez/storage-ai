-- Sprint 19: capture real interest from the public marketing site

create table early_access_signups (
	id uuid primary key default extensions.uuid_generate_v4(),

	name text not null,

	email text not null,

	facility_name text,

	message text,

	created_at timestamptz default now()
);

alter table early_access_signups enable row level security;

grant all privileges on early_access_signups to service_role;
