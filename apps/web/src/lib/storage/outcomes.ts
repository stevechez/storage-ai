import type { FollowUp, OpportunityOutcome, OpportunityStatus, OutcomeSummary } from '@/types/leasing';

export function deriveOutcome(status: OpportunityStatus): OpportunityOutcome {
	if (status === 'converted') return 'converted';
	if (status === 'lost') return 'lost';
	return 'pending';
}

export function summarizeOutcomes(followUps: FollowUp[]): OutcomeSummary {
	const summary: OutcomeSummary = { pending: 0, converted: 0, lost: 0 };

	for (const followUp of followUps) {
		summary[deriveOutcome(followUp.status)] += 1;
	}

	return summary;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function summarizeRecentOutcomes(
	followUps: FollowUp[],
	now: Date = new Date(),
	windowMs: number = ONE_DAY_MS,
): OutcomeSummary {
	const cutoff = now.getTime() - windowMs;

	const recent = followUps.filter(followUp => new Date(followUp.createdAt).getTime() >= cutoff);

	return summarizeOutcomes(recent);
}
