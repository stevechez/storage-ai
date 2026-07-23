-- Demo data to exercise the Sprint 8 leasing queue locally

insert into calls (facility_id, caller_phone, transcript, outcome, status)
values
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550110',
		'Customer wants a 10x10 unit this weekend. What is the price?',
		'interested',
		'new'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550111',
		'Customer asked about a 5x10 unit. Called back and sent availability.',
		'pricing',
		'contacted'
	),
	(
		'11111111-1111-1111-1111-111111111111',
		'+15125550112',
		'Customer rented a 10x20 unit today.',
		'interested',
		'converted'
	);
