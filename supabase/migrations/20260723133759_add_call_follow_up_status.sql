-- Sprint 8: follow-up lifecycle status for leasing opportunities

alter table calls
	add column status text not null default 'new'
		check (status in ('new', 'contacted', 'converted', 'lost'));
