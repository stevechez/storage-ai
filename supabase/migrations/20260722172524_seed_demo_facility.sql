insert into organizations (
    id,
    name
)
values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'StorageAI Demo Organization'
);



insert into facilities (
    id,
    organization_id,
    name,
    address,
    city,
    state,
    timezone,
    pms_provider,
    pms_facility_id
)
values (
    '11111111-1111-1111-1111-111111111111',

    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',

    'StorageAI Demo Facility',

    '123 Demo Storage Way',

    'Austin',

    'TX',

    'America/Chicago',

    'mock',

    'demo-facility-001'
);