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
