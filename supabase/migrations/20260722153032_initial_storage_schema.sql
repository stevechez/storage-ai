create extension if not exists "uuid-ossp" with schema extensions;

create extension if not exists "uuid-ossp";


create table organizations (
    id uuid primary key default extensions.uuid_generate_v4(),

    name text not null,

    created_at timestamptz default now()
);


create table profiles (

    id uuid primary key references auth.users(id)
        on delete cascade,

    organization_id uuid
        references organizations(id)
        on delete cascade,

    email text,

    role text default 'owner',

    created_at timestamptz default now()
);



create table facilities (

    id uuid primary key default extensions.uuid_generate_v4(),

    organization_id uuid
        references organizations(id)
        on delete cascade,

    name text not null,

    address text,

    city text,

    state text,

    timezone text default 'America/New_York',

    pms_provider text,

    pms_facility_id text,

    created_at timestamptz default now()
);



create table calls (

    id uuid primary key default extensions.uuid_generate_v4(),

    facility_id uuid
        references facilities(id)
        on delete cascade,

    caller_phone text,

    duration_seconds integer,

    transcript text,

    outcome text,

    created_at timestamptz default now()
);



alter table organizations enable row level security;

alter table profiles enable row level security;

alter table facilities enable row level security;

alter table calls enable row level security;