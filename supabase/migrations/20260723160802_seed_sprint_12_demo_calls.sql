-- Sprint 12: a richer, more realistic demo dataset covering the core
-- "missed calls become recovered rentals" story — after-hours calls,
-- varied intents/timelines/priorities, and every follow-up status
-- including a lost opportunity (previously untested in the demo data).

insert into calls (facility_id, caller_phone, transcript, outcome, status, created_at)
values
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550120',
		'Customer called at 9pm asking about a 10x15 unit. Needs it ASAP.',
		'interested',
		'new',
		now() - interval '30 hours'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550121',
		'Customer wants a 10x10 unit this weekend for a move.',
		'interested',
		'new',
		now() - interval '18 hours'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550122',
		'Customer asked how much storage costs per month.',
		'pricing',
		'contacted',
		now() - interval '10 hours'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550123',
		'Customer called to ask if anything is available tomorrow.',
		'pricing',
		'contacted',
		now() - interval '6 hours'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550124',
		'Customer rented a 5x5 unit last month for winter storage.',
		'interested',
		'converted',
		now() - interval '3 days'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550125',
		'Customer wanted a 10x20 unit today but chose another facility.',
		'interested',
		'lost',
		now() - interval '5 hours'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550126',
		'Customer called asking general questions about storage options.',
		'interested',
		'new',
		now() - interval '2 hours'
	);
