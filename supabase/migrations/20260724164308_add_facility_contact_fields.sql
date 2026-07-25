-- Phase 28 Task 2: minimum contact info needed to onboard a real facility
-- without depending on developer memory. Deliberately does not add a
-- "founder pricing status" field or any pause/administration columns —
-- that's Task 4, explicitly deferred until there's a real facility to
-- design it against.

alter table facilities
	add column phone text,
	add column contact_name text,
	add column contact_email text;
