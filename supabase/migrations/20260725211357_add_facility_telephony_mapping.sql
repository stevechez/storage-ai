-- Phase 41: multi-tenant call routing needs a way to map an inbound phone
-- number to the facility it belongs to, instead of hardcoding one facility
-- ID in application code (lib/vapi/transcripts.ts used a PILOT_FACILITY_ID
-- constant). vapi_assistant_id is stored alongside for operational
-- reference (which Vapi assistant serves this facility) — not used for
-- routing itself, since routing only needs the phone number Vapi reports
-- as called.

alter table facilities
	add column twilio_phone_number text unique,
	add column vapi_assistant_id text;

-- Data migration: the existing Founder Pilot Facility already has a real
-- Twilio/Vapi number in production (+18314329642, see
-- docs/telephony/TWILIO_SETUP.md) that was previously resolved via the
-- hardcoded constant above. Recording it here removes that hardcoding
-- without losing the mapping — this is a one-time data fixup for a
-- specific known production facility, not application logic.
update facilities
	set twilio_phone_number = '+18314329642'
	where id = '7f35d8c8-deeb-40aa-b778-1981085cc0e8';
