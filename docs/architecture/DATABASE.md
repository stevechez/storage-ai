# Database Architecture

## organizations

Represents a StorageAI customer company.

## facilities

Represents an individual storage facility.

Relationship:

organization
|
|
facilities

## calls

Represents inbound customer interactions.

Current fields:

id
facility_id
caller_phone
transcript
outcome
created_at

Future:

recording_url
intent
lead_id
reservation_id
