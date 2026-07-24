import type { FollowUp, OperatorAction, OpportunityPriority } from '@/types/leasing';

const PRIORITY_RANK: Record<OpportunityPriority, number> = { high: 0, medium: 1, low: 2 };

const ACTION_LABEL: Record<OpportunityPriority, string> = {
	high: 'Call customer immediately.',
	medium: 'Follow up today.',
	low: 'Follow up when convenient.',
};

export function getTodaysActions(followUps: FollowUp[]): OperatorAction[] {
	return followUps
		.filter(followUp => followUp.status === 'new' || followUp.status === 'contacted')
		.sort((a, b) => PRIORITY_RANK[a.opportunity.priority] - PRIORITY_RANK[b.opportunity.priority])
		.map(followUp => ({
			callId: followUp.callId,
			callerPhone: followUp.callerPhone,
			opportunity: {
				...followUp.opportunity,
				recommendedAction: ACTION_LABEL[followUp.opportunity.priority],
			},
		}));
}
