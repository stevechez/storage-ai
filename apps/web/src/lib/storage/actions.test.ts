import { describe, expect, it } from 'vitest';
import { getTodaysActions } from './actions';
import type { FollowUp } from '@/types/leasing';

function followUp(overrides: Partial<FollowUp> & Pick<FollowUp, 'callId' | 'status'>): FollowUp {
	return {
		callerPhone: null,
		createdAt: '2026-07-23T12:00:00.000Z',
		opportunity: {
			intent: 'general',
			priority: 'low',
			recommendedAction: 'Follow up with renter',
		},
		...overrides,
	};
}

describe('getTodaysActions', () => {
	it('excludes opportunities that are already converted or lost', () => {
		const followUps: FollowUp[] = [
			followUp({ callId: 'new-1', status: 'new' }),
			followUp({ callId: 'converted-1', status: 'converted' }),
			followUp({ callId: 'lost-1', status: 'lost' }),
			followUp({ callId: 'contacted-1', status: 'contacted' }),
		];

		const actions = getTodaysActions(followUps);

		expect(actions.map(action => action.callId)).toEqual(['new-1', 'contacted-1']);
	});

	it('sorts remaining opportunities by priority, high first', () => {
		const followUps: FollowUp[] = [
			followUp({
				callId: 'medium-1',
				status: 'new',
				opportunity: { intent: 'general', priority: 'medium', recommendedAction: 'Follow up with renter' },
			}),
			followUp({
				callId: 'high-1',
				status: 'new',
				opportunity: { intent: 'general', priority: 'high', recommendedAction: 'Follow up with renter' },
			}),
			followUp({
				callId: 'low-1',
				status: 'contacted',
				opportunity: { intent: 'general', priority: 'low', recommendedAction: 'Follow up with renter' },
			}),
		];

		const actions = getTodaysActions(followUps);

		expect(actions.map(action => action.callId)).toEqual(['high-1', 'medium-1', 'low-1']);
	});

	it('overrides the action with an urgency phrase based on priority', () => {
		const followUps: FollowUp[] = [
			followUp({
				callId: 'high-1',
				status: 'new',
				opportunity: {
					intent: 'rental',
					unitSize: '10x10',
					priority: 'high',
					recommendedAction: 'Send pricing and availability',
				},
			}),
		];

		const actions = getTodaysActions(followUps);

		expect(actions[0].opportunity.recommendedAction).toBe('Call customer immediately.');
		expect(actions[0].opportunity.unitSize).toBe('10x10');
	});

	it('returns an empty list when nothing needs attention', () => {
		expect(getTodaysActions([])).toEqual([]);
	});
});
