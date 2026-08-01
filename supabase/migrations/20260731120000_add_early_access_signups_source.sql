-- flow-b: tag early_access_signups with which landing-page variant produced them, so Founder
-- Pilot conversion can be compared between the control homepage (source: null) and the
-- /flow-b variant (source: 'flow-b-founder-pilot' / 'flow-b-calculator'). Additive only —
-- nullable, no default, no change to existing rows or to submitEarlyAccessSignup's behavior.

alter table early_access_signups
	add column source text;
