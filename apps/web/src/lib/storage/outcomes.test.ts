import { describe, expect, it } from 'vitest';
import { deriveOutcome, summarizeOutcomes } from './outcomes';
import type { FollowUp } from '@/types/leasing';

describe('deriveOutcome', () => {
	it('treats a new opportunity as pending', () => {
		expect(deriveOutcome('new')).toBe('pending');
	});

	it('treats a contacted opportunity as still pending', () => {
		expect(deriveOutcome('contacted')).toBe('pending');
	});

	it('treats a converted opportunity as converted', () => {
		expect(deriveOutcome('converted')).toBe('converted');
	});

	it('treats a lost opportunity as lost', () => {
		expect(deriveOutcome('lost')).toBe('lost');
	});
});

function followUp(status: FollowUp['status']): FollowUp {
	return {
		callId: `call-${status}`,
		callerPhone: null,
		status,
		opportunity: {
			intent: 'general',
			priority: 'low',
			recommendedAction: 'Follow up with renter',
		},
	};
}

describe('summarizeOutcomes', () => {
	it('counts opportunities by derived outcome', () => {
		const followUps = [
			followUp('new'),
			followUp('contacted'),
			followUp('converted'),
			followUp('converted'),
			followUp('lost'),
		];

		expect(summarizeOutcomes(followUps)).toEqual({
			pending: 2,
			converted: 2,
			lost: 1,
		});
	});

	it('returns all zeros for an empty list', () => {
		expect(summarizeOutcomes([])).toEqual({ pending: 0, converted: 0, lost: 0 });
	});
});
