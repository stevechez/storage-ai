-- Sprint 13: a facility named "StorageAI Demo Facility" undercuts the demo —
-- a prospect should see a facility that looks like it could be theirs.

update facilities
set
	name = 'Lonestar Self Storage',
	address = '4200 Riverside Drive'
where id = '11111111-1111-1111-1111-111111111111';
