-- Leads generated from calls

create table leads (

    id uuid primary key default extensions.uuid_generate_v4(),

    facility_id uuid
        references facilities(id)
        on delete cascade,

    name text,

    phone text not null,

    email text,

    unit_interest text,

    status text default 'new',

    source text default 'phone',

    created_at timestamptz default now()

);



-- AI / phone conversations

create table conversations (

    id uuid primary key default extensions.uuid_generate_v4(),

    facility_id uuid
        references facilities(id)
        on delete cascade,

    lead_id uuid
        references leads(id)
        on delete set null,


    external_call_id text,

    caller_phone text,


    transcript text,

    duration_seconds integer,


    outcome text,


    created_at timestamptz default now()

);



-- Units (future PMS abstraction)

create table units (

    id uuid primary key default extensions.uuid_generate_v4(),

    facility_id uuid
        references facilities(id)
        on delete cascade,


    unit_number text,

    size text,

    monthly_rate integer,


    status text default 'available',

    created_at timestamptz default now()

);



alter table leads enable row level security;
alter table conversations enable row level security;
alter table units enable row level security;